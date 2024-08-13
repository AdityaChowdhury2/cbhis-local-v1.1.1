import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ANCTopic } from '../models/anc-topics';
import { ANCDiscussedTopics } from '../models/discussed-anc-topics';

@Injectable({
  providedIn: 'root',
})
export class DiscussedANCTopicsStorageService {
  public discussedANCTopicList: BehaviorSubject<ANCDiscussedTopics[]> = new BehaviorSubject<ANCDiscussedTopics[]>([]);
  private db!: SQLiteDBConnection;
  private isDiscussedANCTopicsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public ANCTopicsList: BehaviorSubject<ANCTopic[]> = new BehaviorSubject<ANCTopic[]>([]);
  private isANCTopicsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    // Initialize the database connection
    this.initializeDatabase().then(() => {
      console.log('DiscussedANCTopicsStorageService initialized');
      this.loadANCTopics();
      this.loadDiscussedANCTopics();
    });
  }

  async initializeDatabase() {
    try {
      // Retrieve the database connection
      this.db = await this.sqliteService.retrieveConnection();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the ANCTopics as observable
  ANCTopicsState(): Observable<boolean> {
    return this.isANCTopicsReady.asObservable();
  }

  // the state of the discussed ANCTopics as observable
  discussedANCTopicsState(): Observable<boolean> {
    return this.isDiscussedANCTopicsReady.asObservable();
  }

  // Send all the ANCTopics List as observable
  fetchANCTopics(): Observable<ANCTopic[]> {
    return this.ANCTopicsList.asObservable();
  }

  // Send all the discussed ANCTopics List as observable
  fetchDiscussedANCTopics(): Observable<ANCDiscussedTopics[]> {
    return this.discussedANCTopicList.asObservable();
  }

  // Load all the ANCTopics from the database
  async loadANCTopics() {
    const ANCTopics: ANCTopic[] = (await this.db.query('SELECT * FROM ANCTopic;')).values as ANCTopic[];
    console.log(ANCTopics);
    this.ANCTopicsList.next(ANCTopics);
  }

  // Load all the discussed ANCTopics from the database
  async loadDiscussedANCTopics() {
    const discussedANCTopics: ANCDiscussedTopics[] = (await this.db.query('SELECT * FROM DiscussedANCTopic;'))
      .values as ANCDiscussedTopics[];
    this.discussedANCTopicList.next(discussedANCTopics);
  }

  // Get all the ANCTopics from the database and set the isANCTopicsReady to true
  async getANCTopics() {
    await this.loadANCTopics();
    this.isANCTopicsReady.next(true);
  }

  // Get all the discussed ANCTopics from the database and set the isDiscussedANCTopicsReady to true
  async getDiscussedANCTopics() {
    await this.loadDiscussedANCTopics();
    this.isDiscussedANCTopicsReady.next(true);
  }

  // Add a new discussed ANCTopic to the database
  async addDiscussedANCTopic(discussedANCTopic: ANCDiscussedTopics[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(discussedANCTopic);
      const uniqueClientIds = [...new Set(discussedANCTopic.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getDiscussedANCTopics();
      return response;
    } catch (error) {
      console.error('Error adding discussed ANC topics:', error);
      this.toast.openToast({
        message: 'Error adding discussed ANC topics',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the discussed ANC topics
  generateInsertQueryAndParams(discussedANCTopic: ANCDiscussedTopics[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO DiscussedANCTopic (
      TransactionId,
      ANCTopicId,
      ClientId,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = discussedANCTopic.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    discussedANCTopic.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.ANCTopicId, item.ClientId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the discussed ANC topics and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM DiscussedANCTopic WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM DiscussedANCTopic WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
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
        tableName: 'DiscussedANCTopic',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addDiscussedANCTopic(discussedANCTopic: ANCDiscussedTopics[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO DiscussedANCTopic (
  //     TransactionId,
  //     ANCTopicId,
  //     ClientId,
  //     IsDeleted,
  //     CreatedBy
  //   ) VALUES `;

  //   const placeholders = discussedANCTopic.map(() => `(?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (string | number | boolean)[] = [];

  //   for (const item of discussedANCTopic) {
  //     params.push(generateGUID(), item.ANCTopicId, item.ClientId, item.IsDeleted ? 1 : 0, item.CreatedBy);
  //   }

  //   console.log(params);

  //   try {
  //     console.log('client id: ', discussedANCTopic[0]?.ClientId);
  //     const OidForClient = (
  //       await this.db.query('SELECT Oid FROM DiscussedANCTopic WHERE ClientId = ?;', [discussedANCTopic[0]?.ClientId])
  //     ).values?.map((oid) => oid.Oid);

  //     // delete the data from sync queue
  //     if (OidForClient?.length) {
  //       console.log('OidForClient for delete operation : ', OidForClient);
  //       for (const oid of OidForClient) {
  //         await this.syncQueueService.deleteQueueByTableAndTransactionId('DiscussedANCTopics', oid);
  //       }
  //     }
  //     // Delete the existing items
  //     const deleteResponse = await this.db.run('DELETE FROM DiscussedANCTopic WHERE ClientId = ?', [
  //       discussedANCTopic[0]?.ClientId,
  //     ]);

  //     console.log('Deleted Response: ', deleteResponse);

  //     // Execute the query with the parameters
  //     const response = await this.db.run(query, params);

  //     // get the Oid of the inserted item
  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM DiscussedANCTopic;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     // Add the transaction to the sync queue for all new InsertedOid
  //     if (newInsertedOidArr?.length) {
  //       for (const insertedOid of newInsertedOidArr) {
  //         await this.syncQueueService.addTransactionInQueue({
  //           id: 0,
  //           operation: 'INSERT',
  //           tableName: 'DiscussedANCTopic',
  //           transactionId: insertedOid,
  //           dateCreated: dayjs().format(),
  //           createdBy: 1,
  //           dateModified: dayjs().format(),
  //           modifiedBy: 1,
  //         });
  //       }
  //     }

  //     await this.getDiscussedANCTopics();
  //     // this.toast.openToast({
  //     //   message: JSON.stringify(response),
  //     //   color: 'error',
  //     // });
  //     // console.log(response);

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding discussed ANCTopic:', error);
  //     this.toast.openToast({
  //       message: JSON.stringify(error),
  //       color: 'error',
  //     });

  //     return null;
  //   }
  // }

  async updateDiscussedANCTopicById(Oid: number, discussedANCTopic: ANCDiscussedTopics) {
    const sql = `
    UPDATE DiscussedANCTopic
    SET
      ANCTopicId = ?,
      ClientId = ?,
      IsDeleted = ?
    WHERE Oid = ?;
    `;
    const params = [discussedANCTopic.ANCTopicId, discussedANCTopic.ClientId, discussedANCTopic.IsDeleted ?? 0, Oid];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'DiscussedANCTopic',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getDiscussedANCTopics();
      console.log('Discussed ANCTopic updated successfully');
      this.toast.openToast({
        message: 'Discussed ANCTopic updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating discussed ANCTopic:', error);
      this.toast.openToast({
        message: 'Error updating discussed ANCTopic',
        color: 'error',
      });
    }
  }

  async getANCDiscussedTopicsByClientId(clientId: string): Promise<ANCDiscussedTopics[]> {
    const result = await this.db.query('SELECT * FROM DiscussedANCTopic WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result);
    return result.values as ANCDiscussedTopics[];
  }

  async getDiscussedANCTopicById(Oid: number): Promise<ANCDiscussedTopics | null> {
    const sql = `
      SELECT *
      FROM DiscussedANCTopic
      WHERE Oid = ?;
    `;
    const params = [Oid];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ANCDiscussedTopics;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching discussed ANCTopic by id:', error);
        return null;
      });
  }

  async deleteDiscussedANCTopicById(Oid: number) {
    const sql = `DELETE FROM DiscussedANCTopic WHERE Oid = ?`;
    const params = [Oid];

    try {
      await this.db.run(sql, params);
      await this.getDiscussedANCTopics();
    } catch (error) {
      console.error('Error deleting discussed ANCTopic:', error);
    }
  }
}
