import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { PostNatalDepression, PostPartumDepression } from '../../models/service-models/postnatal';

@Injectable({
  providedIn: 'root',
})
export class PostnatalDepressionsStorageService {
  public postNatalDepressionList: BehaviorSubject<PostNatalDepression[]> = new BehaviorSubject<PostNatalDepression[]>(
    []
  );
  private db!: SQLiteDBConnection;
  private isPostNatalDepressionReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public postPartumDepressionList: BehaviorSubject<PostPartumDepression[]> = new BehaviorSubject<
    PostPartumDepression[]
  >([]);
  private isPostPartumDepressionReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('PostnatalDepressionsStorageService initialized');
      this.loadPostNatalDepressions();
      this.loadPostPartumDepressions();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getPostNatalDepressions();
    } catch (error) {
      console.log('database init', error);
    }
  }

  postPartumDepressionState(): Observable<boolean> {
    return this.isPostPartumDepressionReady.asObservable();
  }

  postNatalDepressionState(): Observable<boolean> {
    return this.isPostNatalDepressionReady.asObservable();
  }

  fetchPostPartumDepressions(): Observable<PostPartumDepression[]> {
    return this.postPartumDepressionList.asObservable();
  }

  fetchPostNatalDepressions(): Observable<PostNatalDepression[]> {
    return this.postNatalDepressionList.asObservable();
  }

  async loadPostPartumDepressions() {
    const postPartumDepressions: PostPartumDepression[] = (await this.db.query('SELECT * FROM PostPartumDepression;'))
      .values as PostPartumDepression[];
    this.postPartumDepressionList.next(postPartumDepressions);
  }

  async loadPostNatalDepressions() {
    const postNatalDepressions: PostNatalDepression[] = (await this.db.query('SELECT * FROM PostNatalDepression;'))
      .values as PostNatalDepression[];
    this.postNatalDepressionList.next(postNatalDepressions);
  }

  async getPostNatalDepressions() {
    await this.loadPostNatalDepressions();
    this.isPostNatalDepressionReady.next(true);
  }

  async addPostNatalDepression(postNatalDepressions: PostNatalDepression[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(postNatalDepressions);
      const uniquePostNatalIds = [...new Set(postNatalDepressions.map((item) => item.PostNatalId))];
      await this.deletePreviousTransactions(uniquePostNatalIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getPostNatalDepressions();
      return response;
    } catch (error) {
      console.error('Error adding post-natal depressions:', error);
      this.toast.openToast({
        message: 'Error adding post-natal depressions',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the post-natal depressions
  generateInsertQueryAndParams(postNatalDepressions: PostNatalDepression[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO PostNatalDepression (
        TransactionId,
        PostNatalId,
        PostPartumDepressionId,
        IsDeleted,
        CreatedBy
      ) VALUES `;
    const placeholders = postNatalDepressions.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    postNatalDepressions.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.PostNatalId, item.PostPartumDepressionId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the post-natal depressions and sync queue
  async deletePreviousTransactions(uniquePostNatalIds: string[]) {
    for (const postNatalId of uniquePostNatalIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM PostNatalDepression WHERE PostNatalId = ?', [postNatalId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM PostNatalDepression WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
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
        tableName: 'PostNatalDepression',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addPostNatalDepression(postNatalDepressions: PostNatalDepression[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO PostNatalDepression (
  //     PostNatalId,
  //     PostPartumDepressionId,
  //     IsDeleted,
  //     IsSynced,
  //     OnlineDbOid
  //   ) VALUES `;
  //   const placeholders = postNatalDepressions.map(() => `(?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of postNatalDepressions) {
  //     const { PostNatalId, PostPartumDepressionId, IsDeleted, IsSynced, OnlineDbOid } = item;
  //     params.push(PostNatalId, PostPartumDepressionId, String(IsDeleted), IsSynced, OnlineDbOid);
  //   }
  //   console.log('post natal depression', query, params);
  //   try {
  //     for (const items of postNatalDepressions) {
  //       console.log('PostNatalId: ', items.PostNatalId);
  //       const OidForPostNatal = (
  //         await this.db.query('SELECT Oid FROM PostNatalDepression WHERE PostNatalId = ?;', [items.PostNatalId])
  //       ).values?.map((oid) => oid.Oid);

  //       if (OidForPostNatal?.length) {
  //         console.log('OidForPostNatal for delete operation: ', OidForPostNatal);
  //         for (const oid of OidForPostNatal) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('PostNatalDepression', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM PostNatalDepression WHERE PostNatalId = ?', [
  //         items.PostNatalId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     // const newInsertedOidArr = (await this.db.query('SELECT Oid FROM PostNatalDepression;')).values?.map(
  //     //   (oid) => oid.Oid
  //     // );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'PostNatalDepression',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getPostNatalDepressions();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding post-natal depression:', error);
  //     this.toast.openToast({
  //       message: 'Error adding post-natal depression',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updatePostNatalDepressionById(Oid: string, postNatalDepression: PostNatalDepression) {
    const sql = `
    UPDATE PostNatalDepression
    SET
      PostNatalId = ?,
      PostPartumDepressionId = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE Oid = ?;
    `;
    const params = [
      postNatalDepression.PostNatalId,
      postNatalDepression.PostPartumDepressionId,
      postNatalDepression.IsDeleted ?? 0,
      postNatalDepression.IsSynced,
      postNatalDepression.OnlineDbOid,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'PostNatalDepression',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getPostNatalDepressions();
      console.log('Post-natal depression updated successfully');
      this.toast.openToast({
        message: 'Post-natal depression updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating post-natal depression:', error);
      this.toast.openToast({
        message: 'Error updating post-natal depression',
        color: 'error',
      });
    }
  }

  async getPostNatalDepressionByPostNatalId(postNatalId: string): Promise<PostNatalDepression[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM PostNatalDepression WHERE PostNatalId = ? AND IsDeleted = 0;', [
      postNatalId,
    ]);
    console.log(result.values);
    return result.values as PostNatalDepression[];
  }

  async getPostNatalDepressionById(Oid: string): Promise<PostNatalDepression | null> {
    const sql = `
      SELECT *
      FROM PostNatalDepression
      WHERE Oid = ?;
    `;
    const params = [Oid];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as PostNatalDepression;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching post-natal depression by id:', error);
        return null;
      });
  }

  async deletePostNatalDepressionByPostNatalId(postNatalId: string) {
    const sql = `DELETE FROM PostNatalDepression WHERE PostNatalId = ?`;
    const params = [postNatalId];

    try {
      await this.db.run(sql, params);
      await this.getPostNatalDepressions();
    } catch (error) {
      console.error('Error deleting post-natal depression:', error);
    }
  }
}
