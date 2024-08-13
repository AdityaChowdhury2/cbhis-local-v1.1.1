import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { HBCClientAssessment } from '../../models/service-models/hbc';

@Injectable({
  providedIn: 'root',
})
export class HbcClientAssessmentStorageService {
  public hbcClientAssessmentList: BehaviorSubject<HBCClientAssessment[]> = new BehaviorSubject<HBCClientAssessment[]>(
    []
  );
  private db!: SQLiteDBConnection;
  private isHBCClientAssessmentReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('HBCClientAssessmentService initialized');
      this.loadHBCClientAssessments();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getHBCClientAssessments();
    } catch (error) {
      console.log('database init', error);
    }
  }

  hbcClientAssessmentState(): Observable<boolean> {
    return this.isHBCClientAssessmentReady.asObservable();
  }

  fetchHBCClientAssessments(): Observable<HBCClientAssessment[]> {
    return this.hbcClientAssessmentList.asObservable();
  }

  async loadHBCClientAssessments() {
    const hbcClientAssessments: HBCClientAssessment[] = (await this.db.query('SELECT * FROM HBCClientAssessment;'))
      .values as HBCClientAssessment[];
    this.hbcClientAssessmentList.next(hbcClientAssessments);
  }

  async getHBCClientAssessments() {
    await this.loadHBCClientAssessments();
    this.isHBCClientAssessmentReady.next(true);
  }

  async addHBCClientAssessment(hbcClientAssessmentItems: HBCClientAssessment[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    if (hbcClientAssessmentItems?.length > 0) {
      for (const item of hbcClientAssessmentItems) {
        if (!!item.OnlineDbOid && !!item.TransactionId) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('HBCClientAssessment', item.OnlineDbOid);
          await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
          return await this.updateHBCClientAssessmentItemWithOnlineDbId(item);
        } else if (!item.OnlineDbOid && !!item.TransactionId) {
          return await this.updateHBCClientAssessmentItem(item);
        } else {
          return await this.insertHBCClientAssessmentItems([item]);
        }
      }
    }

    return null;
  }

  private async updateHBCClientAssessmentItemWithOnlineDbId(item: HBCClientAssessment): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE HBCClientAssessment SET
      Condition = ?,
      IsDischargedFromHBC = ?,
      ReasonForDischarge = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.Condition ?? 0,
      item.IsDischargedFromHBC ?? 0,
      item.ReasonForDischarge ?? 0,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateHBCClientAssessmentItem(item: HBCClientAssessment): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE HBCClientAssessment SET
      Condition = ?,
      IsDischargedFromHBC = ?,
      ReasonForDischarge = ?
      WHERE
      TransactionId = ?
    `;
    const params = [item.Condition, item.IsDischargedFromHBC ?? 0, item.ReasonForDischarge, item.TransactionId];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertHBCClientAssessmentItems(
    hbcClientAssessmentItems: HBCClientAssessment[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO HBCClientAssessment (
      TransactionId,
      ClientId,
      Condition,
      IsDischargedFromHBC,
      ReasonForDischarge,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = hbcClientAssessmentItems.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | undefined | null)[] = [];
    for (const item of hbcClientAssessmentItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.Condition,
        item.IsDischargedFromHBC ?? 0,
        item.ReasonForDischarge,
        item.IsDeleted ?? 0,
        item.CreatedBy
      );
    }
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadHBCClientAssessments();
      return response;
    } catch (error) {
      console.error('Error in insertHBCClientAssessmentItems: ', error);
      return null;
    }
  }

  private async deleteExistingHBCClientAssessmentItems(hbcClientAssessmentItems: HBCClientAssessment[]): Promise<void> {
    for (const item of hbcClientAssessmentItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM HBCClientAssessment WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('HBCClientAssessment', oid);
        }
      }

      await this.db.run('DELETE FROM HBCClientAssessment WHERE ClientId = ?', [item.ClientId]);
    }
  }

  private async addNewTransactionsToQueue(newGUIds: string[]): Promise<void> {
    if (newGUIds?.length) {
      for (const insertedOid of newGUIds) {
        await this.addTransactionToQueue('INSERT', insertedOid);
      }
    }
  }

  private async addTransactionToQueue(operation: 'INSERT' | 'UPDATE', transactionId: string): Promise<void> {
    await this.syncQueueService.addTransactionInQueue({
      id: 0,
      operation,
      tableName: 'HBCClientAssessment',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  // async addHBCClientAssessment(hbcClientAssessments: HBCClientAssessment[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO HBCClientAssessment (
  //     TransactionId,
  //     ClientId,
  //     Condition,
  //     IsDischargedFromHBC,
  //     ReasonForDischarge,
  //     IsDeleted
  //   ) VALUES `;
  //   const placeholders = hbcClientAssessments.map(() => `( ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of hbcClientAssessments) {
  //     const { ClientId, Condition, IsDischargedFromHBC, ReasonForDischarge, IsDeleted } = item;
  //     params.push(generateGUID(), ClientId, Condition, IsDischargedFromHBC, ReasonForDischarge, IsDeleted ? 1 : 0);
  //   }

  //   try {
  //     for (const items of hbcClientAssessments) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM HBCClientAssessment WHERE ClientId = ?;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('HBCClientAssessment', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM HBCClientAssessment WHERE ClientId = ?', [
  //         items.ClientId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM HBCClientAssessment;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'HBCClientAssessment',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getHBCClientAssessments();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding HBC client assessment:', error);
  //     this.toast.openToast({
  //       message: 'Error adding HBC client assessment',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateHBCClientAssessmentById(TransactionId: string, hbcClientAssessment: HBCClientAssessment) {
    const sql = `
    UPDATE HBCClientAssessment
    SET
      ClientId = ?,
      Condition = ?,
      IsDischargedFromHBC = ?,
      ReasonForDischarge = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      hbcClientAssessment.ClientId,
      hbcClientAssessment.Condition,
      hbcClientAssessment.IsDischargedFromHBC,
      hbcClientAssessment.ReasonForDischarge,
      hbcClientAssessment.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'HBCClientAssessment',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getHBCClientAssessments();
      console.log('HBC client assessment updated successfully');
      this.toast.openToast({
        message: 'HBC client assessment updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating HBC client assessment:', error);
      this.toast.openToast({
        message: 'Error updating HBC client assessment',
        color: 'error',
      });
    }
  }

  async getHBCClientAssessmentByClientId(clientId: string): Promise<HBCClientAssessment> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM HBCClientAssessment WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values?.[0] as HBCClientAssessment;
  }

  async getHBCClientAssessmentById(TransactionId: string): Promise<HBCClientAssessment | null> {
    const sql = `
      SELECT *
      FROM HBCClientAssessment
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as HBCClientAssessment;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching HBC client assessment by id:', error);
        return null;
      });
  }

  async deleteHBCClientAssessmentById(TransactionId: string) {
    const sql = `DELETE FROM HBCClientAssessment WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getHBCClientAssessments();
    } catch (error) {
      console.error('Error deleting HBC client assessment:', error);
    }
  }
}
