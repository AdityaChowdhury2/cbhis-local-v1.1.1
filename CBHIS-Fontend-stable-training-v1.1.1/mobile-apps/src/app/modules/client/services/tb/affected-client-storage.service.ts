import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { TBControlAssessment, TBKeyAffectedClient } from '../../models/service-models/tb';

@Injectable({
  providedIn: 'root',
})
export class AffectedClientStorageService {
  public tbKeyAffectedClientList: BehaviorSubject<TBKeyAffectedClient[]> = new BehaviorSubject<TBKeyAffectedClient[]>(
    []
  );
  private db!: SQLiteDBConnection;
  private isTBKeyAffectedClientReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public tbControlAssessmentList: BehaviorSubject<TBControlAssessment[]> = new BehaviorSubject<TBControlAssessment[]>(
    []
  );
  private isTBControlAssessmentReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('TBKeyAffectedClientService initialized');
      this.loadTBKeyAffectedClients();
      this.loadTBControlAssessment();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getTBKeyAffectedClients();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // tbControlAssessment state
  tbControlAssessmentState(): Observable<boolean> {
    return this.isTBControlAssessmentReady.asObservable();
  }

  tbKeyAffectedClientState(): Observable<boolean> {
    return this.isTBKeyAffectedClientReady.asObservable();
  }

  // fetch tbControlAssessment
  fetchTBControlAssessment(): Observable<TBControlAssessment[]> {
    return this.tbControlAssessmentList.asObservable();
  }

  fetchTBKeyAffectedClients(): Observable<TBKeyAffectedClient[]> {
    return this.tbKeyAffectedClientList.asObservable();
  }

  async loadTBControlAssessment() {
    const tbControlAssessment: TBControlAssessment[] = (await this.db.query('SELECT * FROM TBControlAssessment;'))
      .values as TBControlAssessment[];
    this.tbControlAssessmentList.next(tbControlAssessment);
  }

  async loadTBKeyAffectedClients() {
    const tbKeyAffectedClients: TBKeyAffectedClient[] = (await this.db.query('SELECT * FROM TBKeyAffectedClient;'))
      .values as TBKeyAffectedClient[];
    this.tbKeyAffectedClientList.next(tbKeyAffectedClients);
  }

  async getTBKeyAffectedClients() {
    await this.loadTBKeyAffectedClients();
    this.isTBKeyAffectedClientReady.next(true);
  }

  async addTBKeyAffectedClient(tbKeyAffectedClients: TBKeyAffectedClient[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(tbKeyAffectedClients);
      const uniqueClientIds = [...new Set(tbKeyAffectedClients.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getTBKeyAffectedClients();
      return response;
    } catch (error) {
      console.error('Error adding TB key affected client:', error);
      this.toast.openToast({
        message: 'Error adding TB key affected client',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the TB key affected client
  generateInsertQueryAndParams(tbKeyAffectedClient: TBKeyAffectedClient[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO TBKeyAffectedClient (
      TransactionId,
      ClientId,
      TBControlAssessmentId,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = tbKeyAffectedClient.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    tbKeyAffectedClient.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.ClientId, item.TBControlAssessmentId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the TB key affected client and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM TBKeyAffectedClient WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM TBKeyAffectedClient WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
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
        tableName: 'TBKeyAffectedClient',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addTBKeyAffectedClient(tbKeyAffectedClients: TBKeyAffectedClient[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO TBKeyAffectedClient (
  //     TransactionId,
  //     ClientId,
  //     TBControlAssessmentId,
  //     IsDeleted
  //   ) VALUES `;
  //   const placeholders = tbKeyAffectedClients.map(() => `( ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';
  //   console.log(query);

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of tbKeyAffectedClients) {
  //     const { ClientId, TBControlAssessmentId, IsDeleted } = item;
  //     params.push(generateGUID(), ClientId, TBControlAssessmentId, IsDeleted ? 1 : 0);
  //   }

  //   try {
  //     for (const items of tbKeyAffectedClients) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM TBKeyAffectedClient WHERE ClientId = ? ;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('TBKeyAffectedClient', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM TBKeyAffectedClient WHERE ClientId = ?', [
  //         items.ClientId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM TBKeyAffectedClient;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'TBKeyAffectedClient',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getTBKeyAffectedClients();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding TB key affected client:', error);
  //     this.toast.openToast({
  //       message: 'Error adding TB key affected client',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateTBKeyAffectedClientById(TransactionId: string, tbKeyAffectedClient: TBKeyAffectedClient) {
    const sql = `
    UPDATE TBKeyAffectedClient
    SET
      ClientId = ?,
      TBControlAssessmentId = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      tbKeyAffectedClient.ClientId,
      tbKeyAffectedClient.TBControlAssessmentId,
      tbKeyAffectedClient.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'TBKeyAffectedClient',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getTBKeyAffectedClients();
      console.log('TB key affected client updated successfully');
      this.toast.openToast({
        message: 'TB key affected client updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating TB key affected client:', error);
      this.toast.openToast({
        message: 'Error updating TB key affected client',
        color: 'error',
      });
    }
  }

  async getTBKeyAffectedClientByClientId(clientId: string): Promise<TBKeyAffectedClient[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM TBKeyAffectedClient WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as TBKeyAffectedClient[];
  }

  async getTBKeyAffectedClientById(TransactionId: string): Promise<TBKeyAffectedClient | null> {
    const sql = `
      SELECT *
      FROM TBKeyAffectedClient
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as TBKeyAffectedClient;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching TB key affected client by id:', error);
        return null;
      });
  }

  async deleteTBKeyAffectedClientById(TransactionId: string) {
    const sql = `DELETE FROM TBKeyAffectedClient WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getTBKeyAffectedClients();
    } catch (error) {
      console.error('Error deleting TB key affected client:', error);
    }
  }
}
