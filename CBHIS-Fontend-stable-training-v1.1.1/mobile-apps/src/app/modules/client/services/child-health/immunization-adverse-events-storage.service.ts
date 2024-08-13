import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';

import * as dayjs from 'dayjs';
import { generateGUID } from 'src/app/shared/utils/common';
import { AdverseEvent, ImmunizationAdverseEvent } from '../../models/service-models/child-health';

@Injectable({
  providedIn: 'root',
})
export class AdverseEventStorageService {
  public adverseEventList: BehaviorSubject<AdverseEvent[]> = new BehaviorSubject<AdverseEvent[]>([]);
  private db!: SQLiteDBConnection;
  private isAdverseEventReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public immunizationAdverseEventList: BehaviorSubject<ImmunizationAdverseEvent[]> = new BehaviorSubject<
    ImmunizationAdverseEvent[]
  >([]);
  private isImmunizationAdverseEventReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('AdverseEventService initialized');
      this.loadAdverseEvents();
      this.loadImmunizationAdverseEvents();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getAdverseEvents();
      await this.getImmunizationAdverseEvents();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // AdverseEvent state
  adverseEventState(): Observable<boolean> {
    return this.isAdverseEventReady.asObservable();
  }

  // ImmunizationAdverseEvent state
  immunizationAdverseEventState(): Observable<boolean> {
    return this.isImmunizationAdverseEventReady.asObservable();
  }

  fetchAdverseEvents(): Observable<AdverseEvent[]> {
    return this.adverseEventList.asObservable();
  }

  fetchImmunizationAdverseEvents(): Observable<ImmunizationAdverseEvent[]> {
    return this.immunizationAdverseEventList.asObservable();
  }

  async loadAdverseEvents() {
    const adverseEvents: AdverseEvent[] = (await this.db.query('SELECT * FROM AdverseEvent;')).values as AdverseEvent[];
    this.adverseEventList.next(adverseEvents);
  }

  async loadImmunizationAdverseEvents() {
    const immunizationAdverseEvents: ImmunizationAdverseEvent[] = (
      await this.db.query('SELECT * FROM ImmunizationAdverseEvent;')
    ).values as ImmunizationAdverseEvent[];
    this.immunizationAdverseEventList.next(immunizationAdverseEvents);
  }

  async getAdverseEvents() {
    await this.loadAdverseEvents();
    this.isAdverseEventReady.next(true);
  }

  async getImmunizationAdverseEvents() {
    await this.loadImmunizationAdverseEvents();
    this.isImmunizationAdverseEventReady.next(true);
  }

  async addImmunizationAdverseEvent(
    immunizationAdverseEvents: ImmunizationAdverseEvent[]
  ): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(immunizationAdverseEvents);
      const uniqueImmunizationIds = [...new Set(immunizationAdverseEvents.map((item) => item.ImmunizationId))];
      await this.deletePreviousTransactions(uniqueImmunizationIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getImmunizationAdverseEvents();
      return response;
    } catch (error) {
      console.error('Error adding immunization adverse events:', error);
      this.toast.openToast({
        message: 'Error adding immunization adverse events',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the immunization adverse events
  generateInsertQueryAndParams(immunizationAdverseEvents: ImmunizationAdverseEvent[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ImmunizationAdverseEvent (
        TransactionId,
        ImmunizationId,
        AdverseEventId,
        IsDeleted,
        CreatedBy
      ) VALUES `;
    const placeholders = immunizationAdverseEvents.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    immunizationAdverseEvents.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.ImmunizationId, item.AdverseEventId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the immunization adverse events and sync queue
  async deletePreviousTransactions(uniqueImmunizationIds: string[]) {
    for (const immunizationId of uniqueImmunizationIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM ImmunizationAdverseEvent WHERE ImmunizationId = ?', [
          immunizationId,
        ])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM ImmunizationAdverseEvent WHERE TransactionId IN (${previousTransactionIds
            .map(() => '?')
            .join(',')})`,
          previousTransactionIds
        );
        await this.db.run(
          `DELETE FROM sync_queue WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
          previousTransactionIds
        );
      }
    }
  }

  // Execute the insert query with the parameters
  async executeInsertQuery(query: string, params: (string | number)[]) {
    return await this.db.run(query, params);
  }

  async addToSyncQueue(generatedGUIDs: string[]) {
    for (const guid of generatedGUIDs) {
      await this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'INSERT',
        tableName: 'ImmunizationAdverseEvent',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addImmunizationAdverseEvent(
  //   immunizationAdverseEvents: ImmunizationAdverseEvent[]
  // ): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO ImmunizationAdverseEvent (
  //     Oid,
  //     ImmunizationId,
  //     AdverseEventId,
  //     IsDeleted,
  //     IsSynced,
  //     OnlineDbOid
  //   ) VALUES `;
  //   const placeholders = immunizationAdverseEvents.map(() => `(?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of immunizationAdverseEvents) {
  //     const { ImmunizationId, AdverseEventId, IsDeleted, IsSynced, OnlineDbOid } = item;
  //     params.push(generateGUID(), ImmunizationId, AdverseEventId, IsDeleted ? 1 : 0, IsSynced, OnlineDbOid);
  //   }

  //   console.log(query, params);
  //   try {
  //     for (const items of immunizationAdverseEvents) {
  //       console.log('ImmunizationId: ', items.ImmunizationId);
  //       const OidForImmunization = (
  //         await this.db.query('SELECT Oid FROM ImmunizationAdverseEvent WHERE ImmunizationId = ?;', [
  //           items.ImmunizationId,
  //         ])
  //       ).values?.map((oid) => oid.Oid);

  //       if (OidForImmunization?.length) {
  //         console.log('OidForImmunization for delete operation: ', OidForImmunization);
  //         for (const oid of OidForImmunization) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('ImmunizationAdverseEvent', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM ImmunizationAdverseEvent WHERE ImmunizationId = ?', [
  //         items.ImmunizationId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT * FROM ImmunizationAdverseEvent;')).values?.map(
  //       (oid) => oid.Oid
  //     );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'ImmunizationAdverseEvent',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getImmunizationAdverseEvents();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding immunization adverse event:', error);
  //     this.toast.openToast({
  //       message: 'Error adding immunization adverse event',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateImmunizationAdverseEventById(Oid: string, immunizationAdverseEvent: ImmunizationAdverseEvent) {
    const sql = `
    UPDATE ImmunizationAdverseEvent
    SET
      ImmunizationId = ?,
      AdverseEventId = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE Oid = ?;
    `;
    const params = [
      immunizationAdverseEvent.ImmunizationId,
      immunizationAdverseEvent.AdverseEventId,
      immunizationAdverseEvent.IsDeleted ?? 0,
      immunizationAdverseEvent.IsSynced,
      immunizationAdverseEvent.OnlineDbOid,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'ImmunizationAdverseEvent',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getImmunizationAdverseEvents();
      console.log('Immunization adverse event updated successfully');
      this.toast.openToast({
        message: 'Immunization adverse event updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating immunization adverse event:', error);
      this.toast.openToast({
        message: 'Error updating immunization adverse event',
        color: 'error',
      });
    }
  }

  async getImmunizationAdverseEventByImmunizationId(immunizationId: string): Promise<ImmunizationAdverseEvent[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      `SELECT * FROM ImmunizationAdverseEvent WHERE ImmunizationId = ? AND IsDeleted = 0;`,
      [immunizationId]
    );
    return result.values as ImmunizationAdverseEvent[];
  }

  async getImmunizationAdverseEventById(Oid: string): Promise<ImmunizationAdverseEvent | null> {
    const sql = `
      SELECT *
      FROM ImmunizationAdverseEvent
      WHERE Oid = ?;
    `;
    const params = [Oid];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ImmunizationAdverseEvent;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching immunization adverse event by id:', error);
        return null;
      });
  }

  async deleteImmunizationAdverseEventById(Oid: string) {
    const sql = `DELETE FROM ImmunizationAdverseEvent WHERE Oid = ?`;
    const params = [Oid];

    try {
      await this.db.run(sql, params);
      await this.getImmunizationAdverseEvents();
    } catch (error) {
      console.error('Error deleting immunization adverse event:', error);
    }
  }
}
