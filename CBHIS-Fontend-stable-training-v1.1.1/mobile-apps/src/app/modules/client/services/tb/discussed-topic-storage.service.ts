import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { TBDiscussedTopic, TBEducationTopic } from '../../models/service-models/tb';

@Injectable({
  providedIn: 'root',
})
export class DiscussedTopicStorageService {
  public tbDiscussedTopicList: BehaviorSubject<TBDiscussedTopic[]> = new BehaviorSubject<TBDiscussedTopic[]>([]);
  private db!: SQLiteDBConnection;
  private isTBDiscussedTopicReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public TBTopicList: BehaviorSubject<TBEducationTopic[]> = new BehaviorSubject<TBEducationTopic[]>([]);
  private isTBTopicReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('TBDiscussedTopicService initialized');
      this.loadTBTopics();
      this.loadTBDiscussedTopics();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getTBDiscussedTopics();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the TBEducationTopics as observable
  TBTopicState(): Observable<boolean> {
    return this.isTBTopicReady.asObservable();
  }

  // the state of the TBDiscussedTopics as observable
  tbDiscussedTopicState(): Observable<boolean> {
    return this.isTBDiscussedTopicReady.asObservable();
  }

  // Send all the TBEducationTopics List as observable
  fetchTBTopics(): Observable<TBEducationTopic[]> {
    return this.TBTopicList.asObservable();
  }

  // Send all the TBDiscussedTopics List as observable
  fetchTBDiscussedTopics(): Observable<TBDiscussedTopic[]> {
    return this.tbDiscussedTopicList.asObservable();
  }

  // Load all the TBEducationTopics
  async loadTBTopics() {
    const tbTopics: TBEducationTopic[] = (await this.db.query('SELECT * FROM TBEducationTopic;'))
      .values as TBEducationTopic[];
    this.TBTopicList.next(tbTopics);
  }

  // Load all the TBDiscussedTopics
  async loadTBDiscussedTopics() {
    const tbDiscussedTopics: TBDiscussedTopic[] = (await this.db.query('SELECT * FROM TBDiscussedTopic;'))
      .values as TBDiscussedTopic[];
    this.tbDiscussedTopicList.next(tbDiscussedTopics);
  }

  // Get all the TBEducationTopics
  async getTBTopics() {
    await this.loadTBTopics();
    this.isTBTopicReady.next(true);
  }

  // Get all the TBDiscussedTopics
  async getTBDiscussedTopics() {
    await this.loadTBDiscussedTopics();
    this.isTBDiscussedTopicReady.next(true);
  }

  async addTBDiscussedTopic(tbDiscussedTopics: TBDiscussedTopic[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(tbDiscussedTopics);
      const uniqueClientIds = [...new Set(tbDiscussedTopics.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getTBDiscussedTopics();
      return response;
    } catch (error) {
      console.error('Error adding TB discussed topic:', error);
      this.toast.openToast({
        message: 'Error adding TB discussed topic',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the TB discussed topic
  generateInsertQueryAndParams(tbDiscussedTopic: TBDiscussedTopic[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO TBDiscussedTopic (
      TransactionId,
      ClientId,
      TBTopicId,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = tbDiscussedTopic.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    tbDiscussedTopic.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.ClientId, item.TBTopicId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the TB discussed topic and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM TBDiscussedTopic WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM TBDiscussedTopic WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
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
        tableName: 'TBDiscussedTopic',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }
  // async addTBDiscussedTopic(tbDiscussedTopics: TBDiscussedTopic[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO TBDiscussedTopic (
  //     TransactionId,
  //     ClientId,
  //     TBTopicId,
  //     IsDeleted
  //   ) VALUES `;
  //   const placeholders = tbDiscussedTopics.map(() => `( ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of tbDiscussedTopics) {
  //     const { ClientId, TBTopicId, IsDeleted } = item;
  //     params.push(generateGUID(), ClientId, TBTopicId, IsDeleted ? 1 : 0);
  //   }

  //   try {
  //     for (const items of tbDiscussedTopics) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM TBDiscussedTopic WHERE ClientId = ?;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('TBDiscussedTopic', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM TBDiscussedTopic WHERE ClientId = ?', [items.ClientId]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM TBDiscussedTopic;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'TBDiscussedTopic',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getTBDiscussedTopics();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding TB discussed topic:', error);
  //     this.toast.openToast({
  //       message: 'Error adding TB discussed topic',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateTBDiscussedTopicById(TransactionId: string, tbDiscussedTopic: TBDiscussedTopic) {
    const sql = `
    UPDATE TBDiscussedTopic
    SET
      ClientId = ?,
      TBTopicId = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      tbDiscussedTopic.ClientId,
      tbDiscussedTopic.TBTopicId,
      tbDiscussedTopic.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'TBDiscussedTopic',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getTBDiscussedTopics();
      console.log('TB discussed topic updated successfully');
      this.toast.openToast({
        message: 'TB discussed topic updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating TB discussed topic:', error);
      this.toast.openToast({
        message: 'Error updating TB discussed topic',
        color: 'error',
      });
    }
  }

  async getTBDiscussedTopicByClientId(clientId: string): Promise<TBDiscussedTopic[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM TBDiscussedTopic WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as TBDiscussedTopic[];
  }

  async getTBDiscussedTopicById(TransactionId: string): Promise<TBDiscussedTopic | null> {
    const sql = `
      SELECT *
      FROM TBDiscussedTopic
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as TBDiscussedTopic;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching TB discussed topic by id:', error);
        return null;
      });
  }

  async deleteTBDiscussedTopicById(TransactionId: string) {
    const sql = `DELETE FROM TBDiscussedTopic WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getTBDiscussedTopics();
    } catch (error) {
      console.error('Error deleting TB discussed topic:', error);
    }
  }
}
