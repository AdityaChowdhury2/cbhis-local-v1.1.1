import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ClientTBEnvironmentalAssessment, TBEnvironmentalAssessment } from '../../models/service-models/tb';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentAssessmentStorageService {
  public clientTBEnvironmentalAssessmentList: BehaviorSubject<ClientTBEnvironmentalAssessment[]> = new BehaviorSubject<
    ClientTBEnvironmentalAssessment[]
  >([]);
  private db!: SQLiteDBConnection;
  private isClientTBEnvironmentalAssessmentReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public tbEnvironmentAssessmentList: BehaviorSubject<TBEnvironmentalAssessment[]> = new BehaviorSubject<
    TBEnvironmentalAssessment[]
  >([]);
  private isTBEnvironmentalAssessmentReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ClientTBEnvironmentalAssessmentService initialized');
      this.loadClientTBEnvironmentalAssessments();
      this.loadTBEnvironmentalAssessment();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getClientTBEnvironmentalAssessments();
    } catch (error) {
      console.log('database init', error);
    }
  }

  tbEnvironmentAssessmentState(): Observable<boolean> {
    return this.isTBEnvironmentalAssessmentReady.asObservable();
  }

  async loadTBEnvironmentalAssessment() {
    const tbEnvironmentAssessment: TBEnvironmentalAssessment[] = (
      await this.db.query('SELECT * FROM TBEnvironmentalAssessment;')
    ).values as TBEnvironmentalAssessment[];
    this.tbEnvironmentAssessmentList.next(tbEnvironmentAssessment);
  }

  fetchTBEnvironmentalAssessment(): Observable<TBEnvironmentalAssessment[]> {
    return this.tbEnvironmentAssessmentList.asObservable();
  }

  clientTBEnvironmentalAssessmentState(): Observable<boolean> {
    return this.isClientTBEnvironmentalAssessmentReady.asObservable();
  }

  fetchClientTBEnvironmentalAssessments(): Observable<ClientTBEnvironmentalAssessment[]> {
    return this.clientTBEnvironmentalAssessmentList.asObservable();
  }

  async loadClientTBEnvironmentalAssessments() {
    const clientTBEnvironmentalAssessments: ClientTBEnvironmentalAssessment[] = (
      await this.db.query('SELECT * FROM ClientTBEnvironmentalAssessment;')
    ).values as ClientTBEnvironmentalAssessment[];
    this.clientTBEnvironmentalAssessmentList.next(clientTBEnvironmentalAssessments);
  }

  async getClientTBEnvironmentalAssessments() {
    await this.loadClientTBEnvironmentalAssessments();
    this.isClientTBEnvironmentalAssessmentReady.next(true);
  }

  async addClientTBEnvironmentalAssessment(
    clientTBEnvironmentalAssessments: ClientTBEnvironmentalAssessment[]
  ): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    if (clientTBEnvironmentalAssessments?.length > 0) {
      for (const item of clientTBEnvironmentalAssessments) {
        if (!!item.OnlineDbOid && !!item.TransactionId) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId(
            'ClientTBEnvironmentalAssessment',
            item.OnlineDbOid
          );
          await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
          return await this.updateClientTBEnvironmentalAssessmentItemWithOnlineDbId(item);
        } else if (item.OnlineDbOid == null && !!item.TransactionId) {
          return await this.updateClientTBEnvironmentalAssessmentItem(item);
        } else {
          return await this.insertClientTBEnvironmentalAssessmentItems([item]);
        }
      }
    }

    return null;
  }

  private async updateClientTBEnvironmentalAssessmentItemWithOnlineDbId(
    item: ClientTBEnvironmentalAssessment
  ): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ClientTBEnvironmentalAssessment SET
      TBEnvironmentalAssessmentId = ?,
      OthersObserved = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.TBEnvironmentalAssessmentId,
      item.OthersObserved,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateClientTBEnvironmentalAssessmentItem(
    item: ClientTBEnvironmentalAssessment
  ): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ClientTBEnvironmentalAssessment SET
      TBEnvironmentalAssessmentId = ?,
      OthersObserved = ?
      WHERE
      TransactionId = ?
    `;
    const params = [item.TBEnvironmentalAssessmentId, item.OthersObserved, item.TransactionId];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertClientTBEnvironmentalAssessmentItems(
    clientTBEnvironmentalAssessmentItems: ClientTBEnvironmentalAssessment[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ClientTBEnvironmentalAssessment (
      TransactionId,
      ClientId,
      TBEnvironmentalAssessmentId,
      OthersObserved,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = clientTBEnvironmentalAssessmentItems.map(() => `(?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | undefined | null)[] = [];
    for (const item of clientTBEnvironmentalAssessmentItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.TBEnvironmentalAssessmentId,
        item.OthersObserved,
        item.IsDeleted ?? 0,
        item.CreatedBy
      );
    }
    console.log('Inserted query for ClientTBEnvironmentalAssessment item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadClientTBEnvironmentalAssessments();
      return response;
    } catch (error) {
      console.error('Error in insertClientTBEnvironmentalAssessmentItems: ', error);
      return null;
    }
  }

  private async deleteExistingClientTBEnvironmentalAssessmentItems(
    clientTBEnvironmentalAssessmentItems: ClientTBEnvironmentalAssessment[]
  ): Promise<void> {
    for (const item of clientTBEnvironmentalAssessmentItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM ClientTBEnvironmentalAssessment WHERE ClientId = ?;', [
          item.ClientId,
        ])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientTBEnvironmentalAssessment', oid);
        }
      }

      await this.db.run('DELETE FROM ClientTBEnvironmentalAssessment WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'ClientTBEnvironmentalAssessment',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  // async addClientTBEnvironmentalAssessment(
  //   clientTBEnvironmentalAssessments: ClientTBEnvironmentalAssessment[]
  // ): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO ClientTBEnvironmentalAssessment (
  //     TransactionId,
  //     ClientId,
  //     TBEnvironmentalAssessmentId,
  //     OthersObserved,
  //     IsDeleted
  //   ) VALUES `;
  //   const placeholders = clientTBEnvironmentalAssessments.map(() => `( ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of clientTBEnvironmentalAssessments) {
  //     const { ClientId, TBEnvironmentalAssessmentId, OthersObserved, IsDeleted } = item;
  //     params.push(generateGUID(), ClientId, TBEnvironmentalAssessmentId, OthersObserved, IsDeleted ? 1 : 0);
  //   }

  //   try {
  //     for (const items of clientTBEnvironmentalAssessments) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM ClientTBEnvironmentalAssessment WHERE ClientId = ?;', [
  //           items.ClientId,
  //         ])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientTBEnvironmentalAssessment', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM ClientTBEnvironmentalAssessment WHERE ClientId = ?', [
  //         items.ClientId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (
  //       await this.db.query('SELECT TransactionId FROM ClientTBEnvironmentalAssessment;')
  //     ).values?.map((oid) => oid.TransactionId);

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'ClientTBEnvironmentalAssessment',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getClientTBEnvironmentalAssessments();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding client TB environmental assessment:', error);
  //     this.toast.openToast({
  //       message: 'Error adding client TB environmental assessment',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateClientTBEnvironmentalAssessmentById(
    TransactionId: string,
    clientTBEnvironmentalAssessment: ClientTBEnvironmentalAssessment
  ) {
    const sql = `
    UPDATE ClientTBEnvironmentalAssessment
    SET
      ClientId = ?,
      TBEnvironmentalAssessmentId = ?,
      OthersObserved = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      clientTBEnvironmentalAssessment.ClientId,
      clientTBEnvironmentalAssessment.TBEnvironmentalAssessmentId,
      clientTBEnvironmentalAssessment.OthersObserved,
      clientTBEnvironmentalAssessment.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'ClientTBEnvironmentalAssessment',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getClientTBEnvironmentalAssessments();
      console.log('Client TB environmental assessment updated successfully');
      this.toast.openToast({
        message: 'Client TB environmental assessment updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating client TB environmental assessment:', error);
      this.toast.openToast({
        message: 'Error updating client TB environmental assessment',
        color: 'error',
      });
    }
  }

  async getClientTBEnvironmentalAssessmentByClientId(clientId: string): Promise<ClientTBEnvironmentalAssessment> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      'SELECT * FROM ClientTBEnvironmentalAssessment WHERE ClientId = ? AND IsDeleted = 0;',
      [clientId]
    );
    console.log(result.values);
    return result.values?.[0] as ClientTBEnvironmentalAssessment;
  }

  async getClientTBEnvironmentalAssessmentById(TransactionId: string): Promise<ClientTBEnvironmentalAssessment | null> {
    const sql = `
      SELECT *
      FROM ClientTBEnvironmentalAssessment
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ClientTBEnvironmentalAssessment;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching client TB environmental assessment by id:', error);
        return null;
      });
  }

  async deleteClientTBEnvironmentalAssessmentById(TransactionId: string) {
    const sql = `DELETE FROM ClientTBEnvironmentalAssessment WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getClientTBEnvironmentalAssessments();
    } catch (error) {
      console.error('Error deleting client TB environmental assessment:', error);
    }
  }
}
