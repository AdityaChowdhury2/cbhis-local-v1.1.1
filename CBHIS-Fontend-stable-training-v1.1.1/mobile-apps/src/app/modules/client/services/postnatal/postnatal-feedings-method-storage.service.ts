import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { FeedingMethod, PostNatalFeedingMethod } from '../../models/service-models/postnatal';

@Injectable({
  providedIn: 'root',
})
export class PostnatalFeedingsMethodStorageService {
  public postNatalFeedingMethodList: BehaviorSubject<PostNatalFeedingMethod[]> = new BehaviorSubject<
    PostNatalFeedingMethod[]
  >([]);
  private db!: SQLiteDBConnection;
  private isPostNatalFeedingMethodReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public feedingMethodList: BehaviorSubject<FeedingMethod[]> = new BehaviorSubject<FeedingMethod[]>([]);
  private isFeedingMethodReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('PostNatalFeedingMethodService initialized');
      this.loadPostNatalFeedingMethods();
      this.loadFeedingMethods();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getPostNatalFeedingMethods();
    } catch (error) {
      console.log('database init', error);
    }
  }

  feedingMethodState(): Observable<boolean> {
    return this.isFeedingMethodReady.asObservable();
  }

  postNatalFeedingMethodState(): Observable<boolean> {
    return this.isPostNatalFeedingMethodReady.asObservable();
  }

  fetchFeedingMethods(): Observable<FeedingMethod[]> {
    return this.feedingMethodList.asObservable();
  }

  fetchPostNatalFeedingMethods(): Observable<PostNatalFeedingMethod[]> {
    return this.postNatalFeedingMethodList.asObservable();
  }

  async loadFeedingMethods() {
    const feedingMethods: FeedingMethod[] = (await this.db.query('SELECT * FROM FeedingMethod;'))
      .values as FeedingMethod[];
    this.feedingMethodList.next(feedingMethods);
  }

  async loadPostNatalFeedingMethods() {
    const postNatalFeedingMethods: PostNatalFeedingMethod[] = (
      await this.db.query('SELECT * FROM PostNatalFeedingMethod;')
    ).values as PostNatalFeedingMethod[];
    this.postNatalFeedingMethodList.next(postNatalFeedingMethods);
  }

  async getPostNatalFeedingMethods() {
    await this.loadPostNatalFeedingMethods();
    this.isPostNatalFeedingMethodReady.next(true);
  }

  async addPostNatalFeedingMethod(postNatalFeedingMethods: PostNatalFeedingMethod[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(postNatalFeedingMethods);
      const uniquePostNatalIds = [...new Set(postNatalFeedingMethods.map((item) => item.PostNatalId))];
      await this.deletePreviousTransactions(uniquePostNatalIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getPostNatalFeedingMethods();
      return response;
    } catch (error) {
      console.error('Error adding post-natal feeding methods:', error);
      this.toast.openToast({
        message: 'Error adding post-natal feeding methods',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the post-natal feeding methods
  generateInsertQueryAndParams(postNatalFeedingMethods: PostNatalFeedingMethod[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO PostNatalFeedingMethod (
        TransactionId,
        PostNatalId,
        FeedingMethodId,
        IsDeleted,
        CreatedBy
      ) VALUES `;
    const placeholders = postNatalFeedingMethods.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    postNatalFeedingMethods.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.PostNatalId, item.FeedingMethodId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the post-natal feeding methods and sync queue
  async deletePreviousTransactions(uniquePostNatalIds: string[]) {
    for (const postNatalId of uniquePostNatalIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM PostNatalFeedingMethod WHERE PostNatalId = ?', [postNatalId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM PostNatalFeedingMethod WHERE TransactionId IN (${previousTransactionIds
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
        tableName: 'PostNatalFeedingMethod',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addPostNatalFeedingMethod(postNatalFeedingMethods: PostNatalFeedingMethod[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO PostNatalFeedingMethod (

  //     PostNatalId,
  //     FeedingMethodId,
  //     IsDeleted,
  //     IsSynced,
  //     OnlineDbOid
  //   ) VALUES `;
  //   const placeholders = postNatalFeedingMethods.map(() => `(?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of postNatalFeedingMethods) {
  //     const { PostNatalId, FeedingMethodId, IsDeleted, IsSynced, OnlineDbOid } = item;
  //     params.push(PostNatalId, FeedingMethodId, IsDeleted ? 1 : 0, IsSynced, OnlineDbOid);
  //   }

  //   try {
  //     for (const items of postNatalFeedingMethods) {
  //       console.log('PostNatalId: ', items.PostNatalId);
  //       const OidForClient = (
  //         await this.db.query('SELECT Oid FROM PostNatalFeedingMethod WHERE PostNatalId = ?;', [items.PostNatalId])
  //       ).values?.map((oid) => oid.Oid);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('PostNatalFeedingMethod', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM PostNatalFeedingMethod WHERE PostNatalId = ?', [
  //         items.PostNatalId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     // const newInsertedOidArr = (await this.db.query('SELECT Oid FROM PostNatalFeedingMethod;')).values?.map(
  //     //   (oid) => oid.Oid
  //     // );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'PostNatalFeedingMethod',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getPostNatalFeedingMethods();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding post-natal feeding method:', error);
  //     this.toast.openToast({
  //       message: 'Error adding post-natal feeding method',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updatePostNatalFeedingMethodById(Oid: string, postNatalFeedingMethod: PostNatalFeedingMethod) {
    const sql = `
    UPDATE PostNatalFeedingMethod
    SET
      PostNatalId = ?,
      FeedingMethodId = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE Oid = ?;
    `;
    const params = [
      postNatalFeedingMethod.PostNatalId,
      postNatalFeedingMethod.FeedingMethodId,
      postNatalFeedingMethod.IsDeleted ?? 0,
      postNatalFeedingMethod.IsSynced,
      postNatalFeedingMethod.OnlineDbOid,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'PostNatalFeedingMethod',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getPostNatalFeedingMethods();
      console.log('Post-natal feeding method updated successfully');
      this.toast.openToast({
        message: 'Post-natal feeding method updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating post-natal feeding method:', error);
      this.toast.openToast({
        message: 'Error updating post-natal feeding method',
        color: 'error',
      });
    }
  }

  async getPostNatalFeedingMethodByPostNatalId(postNatalId: string): Promise<PostNatalFeedingMethod[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM PostNatalFeedingMethod WHERE PostNatalId = ?;', [postNatalId]);
    console.log(result.values);
    return result.values as PostNatalFeedingMethod[];
  }

  async getPostNatalFeedingMethodByClientId(clientId: string): Promise<PostNatalFeedingMethod[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      'SELECT * FROM PostNatalFeedingMethod WHERE PostNatalId IN (SELECT TransactionId FROM PostNatal WHERE ClientId = ?) AND IsDeleted = 0;',
      [clientId]
    );
    console.log(result.values);
    return result.values as PostNatalFeedingMethod[];
  }

  async getPostNatalFeedingMethodById(Oid: string): Promise<PostNatalFeedingMethod | null> {
    const sql = `
      SELECT *
      FROM PostNatalFeedingMethod
      WHERE Oid = ?;
    `;
    const params = [Oid];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as PostNatalFeedingMethod;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching post-natal feeding method by id:', error);
        return null;
      });
  }

  async deletePostNatalFeedingMethodById(Oid: string) {
    const sql = `DELETE FROM PostNatalFeedingMethod WHERE Oid = ?`;
    const params = [Oid];

    try {
      await this.db.run(sql, params);
      await this.getPostNatalFeedingMethods();
    } catch (error) {
      console.error('Error deleting post-natal feeding method:', error);
    }
  }

  async deletePostNatalFeedingMethodByClientId(clientId: string) {
    const sql = `DELETE FROM PostNatalFeedingMethod WHERE PostNatalId IN (SELECT TransactionId FROM PostNatal WHERE ClientId = ?)`;
    const params = [clientId];

    try {
      await this.db.run(sql, params);
      await this.getPostNatalFeedingMethods();
      console.log('Deleted post-natal feeding method records for client', clientId);
    } catch (error) {
      console.error('Error deleting post-natal feeding method records by client id:', error);
    }
  }
}
