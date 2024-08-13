import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ClientNCDHistory, NCDCondition } from '../../models/service-models/ncd';

@Injectable({
  providedIn: 'root',
})
export class ClientNcdHistoryStorageService {
  public clientNCDHistoryList: BehaviorSubject<ClientNCDHistory[]> = new BehaviorSubject<ClientNCDHistory[]>([]);
  private db!: SQLiteDBConnection;
  private isClientNCDHistoryReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public ncdConditionList: BehaviorSubject<NCDCondition[]> = new BehaviorSubject<NCDCondition[]>([]);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ClientNCDHistoryService initialized');
      this.loadClientNCDHistories();
      this.loadNCDConditions();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getClientNCDHistories();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the NCDCondition as observable
  NCDConditionState(): Observable<boolean> {
    return this.isClientNCDHistoryReady.asObservable();
  }

  // the state of the ClientNCDHistory as observable
  clientNCDHistoryState(): Observable<boolean> {
    return this.isClientNCDHistoryReady.asObservable();
  }

  // Send all the NCDCondition List as observable
  fetchNCDConditions(): Observable<NCDCondition[]> {
    return this.ncdConditionList.asObservable();
  }

  // Load all the NCDCondition List
  async loadNCDConditions() {
    const ncdConditions: NCDCondition[] = (await this.db.query('SELECT * FROM NCDCondition;')).values as NCDCondition[];
    this.ncdConditionList.next(ncdConditions);
  }

  fetchClientNCDHistories(): Observable<ClientNCDHistory[]> {
    return this.clientNCDHistoryList.asObservable();
  }

  async loadClientNCDHistories() {
    const clientNCDHistories: ClientNCDHistory[] = (await this.db.query('SELECT * FROM ClientNCDHistory;'))
      .values as ClientNCDHistory[];
    this.clientNCDHistoryList.next(clientNCDHistories);
  }

  async getClientNCDHistories() {
    await this.loadClientNCDHistories();
    this.isClientNCDHistoryReady.next(true);
  }

  async addClientNCDHistory(clientNCDHistoryItems: ClientNCDHistory[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    if (clientNCDHistoryItems?.length > 0) {
      for (const item of clientNCDHistoryItems) {
        if (!!item.OnlineDbOid && !!item.TransactionId) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientNCDHistory', item.OnlineDbOid);
          await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
          return await this.updateClientNCDHistoryItemWithOnlineDbId(item);
        } else if (!item.OnlineDbOid && !!item.TransactionId) {
          return await this.updateClientNCDHistoryItem(item);
        } else {
          return await this.insertClientNCDHistoryItems([item]);
        }
      }
    }

    return null;
  }

  private async updateClientNCDHistoryItemWithOnlineDbId(item: ClientNCDHistory): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ClientNCDHistory SET
      NCDConditionId = ?,
      ScreeningOutcome = ?,
      IsTestConducted = ?,
      TestOutcome = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.NCDConditionId,
      item.ScreeningOutcome ?? 0,
      item.IsTestConducted ?? 0,
      item.TestOutcome ?? 0,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateClientNCDHistoryItem(item: ClientNCDHistory): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ClientNCDHistory SET
      NCDConditionId = ?,
      ScreeningOutcome = ?,
      IsTestConducted = ?,
      TestOutcome = ?
      WHERE
      TransactionId = ?
    `;
    const params = [
      item.NCDConditionId,
      item.ScreeningOutcome ?? 0,
      item.IsTestConducted ?? 0,
      item.TestOutcome ?? 0,
      item.TransactionId,
    ];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertClientNCDHistoryItems(
    clientNCDHistoryItems: ClientNCDHistory[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ClientNCDHistory (
      TransactionId,
      ClientId,
      NCDConditionId,
      ScreeningOutcome,
      IsTestConducted,
      TestOutcome,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = clientNCDHistoryItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | null | undefined)[] = [];
    for (const item of clientNCDHistoryItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.NCDConditionId,
        item.ScreeningOutcome,
        item.IsTestConducted ?? 0,
        item.TestOutcome,
        item.IsDeleted ?? 0,
        item.CreatedBy
      );
    }
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadClientNCDHistories();
      return response;
    } catch (error) {
      console.error('Error in insertClientNCDHistoryItems: ', error);
      return null;
    }
  }

  private async deleteExistingClientNCDHistoryItems(clientNCDHistoryItems: ClientNCDHistory[]): Promise<void> {
    for (const item of clientNCDHistoryItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM ClientNCDHistory WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientNCDHistory', oid);
        }
      }

      await this.db.run('DELETE FROM ClientNCDHistory WHERE ClientId = ?', [item.ClientId]);
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
    console.log('operation ==>', operation, transactionId);
    await this.syncQueueService.addTransactionInQueue({
      id: 0,
      operation,
      tableName: 'ClientNCDHistory',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }
  // async addClientNCDHistory(clientNCDHistories: ClientNCDHistory[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO ClientNCDHistory (
  //     TransactionId,
  //     ClientId,
  //     NCDConditionId,
  //     ScreeningOutcome,
  //     IsTestConducted,
  //     TestOutcome,
  //     IsDeleted
  //   ) VALUES `;
  //   const placeholders = clientNCDHistories.map(() => `( ?, ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined | boolean | null)[] = [];

  //   for (const item of clientNCDHistories) {
  //     const { ClientId, NCDConditionId, ScreeningOutcome, IsTestConducted, TestOutcome, IsDeleted } = item;
  //     params.push(
  //       generateGUID(),
  //       ClientId,
  //       NCDConditionId,
  //       ScreeningOutcome,
  //       IsTestConducted,
  //       TestOutcome,
  //       IsDeleted ? 1 : 0
  //     );
  //   }

  //   try {
  //     for (const items of clientNCDHistories) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM ClientNCDHistory WHERE ClientId = ?;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientNCDHistory', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM ClientNCDHistory WHERE ClientId = ?', [items.ClientId]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM ClientNCDHistory;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'ClientNCDHistory',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getClientNCDHistories();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding client NCD history:', error);
  //     this.toast.openToast({
  //       message: 'Error adding client NCD history',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateClientNCDHistoryById(TransactionId: string, clientNCDHistory: ClientNCDHistory) {
    const sql = `
    UPDATE ClientNCDHistory
    SET
      ClientId = ?,
      NCDConditionId = ?,
      ScreeningOutcome = ?,
      IsTestConducted = ?,
      TestOutcome = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      clientNCDHistory.ClientId,
      clientNCDHistory.NCDConditionId,
      clientNCDHistory.ScreeningOutcome,
      clientNCDHistory.IsTestConducted,
      clientNCDHistory.TestOutcome,
      clientNCDHistory.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'ClientNCDHistory',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getClientNCDHistories();
      console.log('Client NCD history updated successfully');
      this.toast.openToast({
        message: 'Client NCD history updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating client NCD history:', error);
      this.toast.openToast({
        message: 'Error updating client NCD history',
        color: 'error',
      });
    }
  }

  async getClientNCDHistoryByClientId(clientId: string): Promise<ClientNCDHistory> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM ClientNCDHistory WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values?.[0] as ClientNCDHistory;
  }

  async getClientNCDHistoryById(TransactionId: string): Promise<ClientNCDHistory | null> {
    const sql = `
      SELECT *
      FROM ClientNCDHistory
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ClientNCDHistory;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching client NCD history by id:', error);
        return null;
      });
  }

  async deleteClientNCDHistoryById(TransactionId: string) {
    const sql = `DELETE FROM ClientNCDHistory WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getClientNCDHistories();
    } catch (error) {
      console.error('Error deleting client NCD history:', error);
    }
  }
}
