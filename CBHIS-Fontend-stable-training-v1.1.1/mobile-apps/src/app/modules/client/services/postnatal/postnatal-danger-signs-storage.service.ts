import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { DangerSign, PostNatalDangerSign } from '../../models/service-models/postnatal';

@Injectable({
  providedIn: 'root',
})
export class PostnatalDangerSignsStorageService {
  public postNatalDangerSignList: BehaviorSubject<PostNatalDangerSign[]> = new BehaviorSubject<PostNatalDangerSign[]>(
    []
  );
  private db!: SQLiteDBConnection;
  private isPostNatalDangerSignReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public dangerSignList: BehaviorSubject<DangerSign[]> = new BehaviorSubject<DangerSign[]>([]);
  private isDangerSignReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('PostNatalDangerSignService initialized');
      this.loadPostNatalDangerSigns();
      this.loadDangerSigns();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getPostNatalDangerSigns();
    } catch (error) {
      console.log('database init', error);
    }
  }

  dangerSignState(): Observable<boolean> {
    return this.isDangerSignReady.asObservable();
  }

  postNatalDangerSignState(): Observable<boolean> {
    return this.isPostNatalDangerSignReady.asObservable();
  }

  fetchDangerSigns(): Observable<DangerSign[]> {
    return this.dangerSignList.asObservable();
  }

  fetchPostNatalDangerSigns(): Observable<PostNatalDangerSign[]> {
    return this.postNatalDangerSignList.asObservable();
  }

  async loadDangerSigns() {
    const dangerSigns: DangerSign[] = (await this.db.query('SELECT * FROM DangerSign;')).values as DangerSign[];
    this.dangerSignList.next(dangerSigns);
  }

  async loadPostNatalDangerSigns() {
    const postNatalDangerSigns: PostNatalDangerSign[] = (await this.db.query('SELECT * FROM PostNatalDangerSign;'))
      .values as PostNatalDangerSign[];
    this.postNatalDangerSignList.next(postNatalDangerSigns);
  }

  async getPostNatalDangerSigns() {
    await this.loadPostNatalDangerSigns();
    this.isPostNatalDangerSignReady.next(true);
  }
  async addPostNatalDangerSign(postNatalDangerSigns: PostNatalDangerSign[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(postNatalDangerSigns);
      const uniquePostNatalIds = [...new Set(postNatalDangerSigns.map((item) => item.PostNatalId))];
      await this.deletePreviousTransactions(uniquePostNatalIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getPostNatalDangerSigns();
      return response;
    } catch (error) {
      console.error('Error adding post-natal danger signs:', error);
      this.toast.openToast({
        message: 'Error adding post-natal danger signs',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the post-natal danger signs
  generateInsertQueryAndParams(postNatalDangerSigns: PostNatalDangerSign[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO PostNatalDangerSign (
        TransactionId,
        PostNatalId,
        DangerSignId,
        IsDeleted,
        CreatedBy
      ) VALUES `;
    const placeholders = postNatalDangerSigns.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    postNatalDangerSigns.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.PostNatalId, item.DangerSignId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the post-natal danger signs and sync queue
  async deletePreviousTransactions(uniquePostNatalIds: string[]) {
    for (const postNatalId of uniquePostNatalIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM PostNatalDangerSign WHERE PostNatalId = ?', [postNatalId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM PostNatalDangerSign WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
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
        tableName: 'PostNatalDangerSign',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addPostNatalDangerSign(postNatalDangerSigns: PostNatalDangerSign[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO PostNatalDangerSign (
  //     PostNatalId,
  //     DangerSignId,
  //     IsDeleted,
  //     IsSynced,
  //     OnlineDbOid
  //   ) VALUES `;
  //   const placeholders = postNatalDangerSigns.map(() => `(?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of postNatalDangerSigns) {
  //     const { PostNatalId, DangerSignId, IsDeleted, IsSynced, OnlineDbOid } = item;
  //     params.push(PostNatalId, DangerSignId, String(IsDeleted), IsSynced, OnlineDbOid);
  //   }
  //   console.log('post natal add ', query, params);
  //   try {
  //     for (const items of postNatalDangerSigns) {
  //       console.log('PostNatalId: ', items.PostNatalId);
  //       const OidForPostNatal = (
  //         await this.db.query('SELECT Oid FROM PostNatalDangerSign WHERE PostNatalId = ?;', [items.PostNatalId])
  //       ).values?.map((oid) => oid.Oid);

  //       if (OidForPostNatal?.length) {
  //         console.log('OidForPostNatal for delete operation: ', OidForPostNatal);
  //         for (const oid of OidForPostNatal) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('PostNatalDepression', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM PostNatalDangerSign WHERE PostNatalId = ?', [
  //         items.PostNatalId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }
  //     const response = await this.db.run(query, params);
  //     // const newInsertedOidArr = (await this.db.query('SELECT Oid FROM PostNatalDangerSign;')).values?.map(
  //     //   (oid) => oid.Oid
  //     // );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'PostNatalDangerSign',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getPostNatalDangerSigns();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding post-natal danger sign:', error);
  //     this.toast.openToast({
  //       message: 'Error adding post-natal danger sign',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updatePostNatalDangerSignById(Oid: string, postNatalDangerSign: PostNatalDangerSign) {
    const sql = `
    UPDATE PostNatalDangerSign
    SET
      PostNatalId = ?,
      DangerSignId = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE Oid = ?;
    `;
    const params = [
      postNatalDangerSign.PostNatalId,
      postNatalDangerSign.DangerSignId,
      postNatalDangerSign.IsDeleted ?? 0,
      postNatalDangerSign.IsSynced,
      postNatalDangerSign.OnlineDbOid,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'PostNatalDangerSign',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getPostNatalDangerSigns();
      console.log('Post-natal danger sign updated successfully');
      this.toast.openToast({
        message: 'Post-natal danger sign updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating post-natal danger sign:', error);
      this.toast.openToast({
        message: 'Error updating post-natal danger sign',
        color: 'error',
      });
    }
  }

  async getPostNatalDangerSignByClientId(clientId: string): Promise<PostNatalDangerSign[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      'SELECT * FROM PostNatalDangerSign WHERE PostNatalId IN (SELECT TransactionId FROM PostNatal WHERE ClientId = ?) AND IsDeleted = 0;',
      [clientId]
    );
    console.log(result.values);
    return result.values as PostNatalDangerSign[];
  }

  async getPostNatalDangerSignByPostNatalId(postNatalId: string): Promise<PostNatalDangerSign[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM PostNatalDangerSign WHERE PostNatalId = ? AND IsDeleted = 0;', [
      postNatalId,
    ]);
    return result.values as PostNatalDangerSign[];
  }

  async getPostNatalDangerSignById(Oid: string): Promise<PostNatalDangerSign | null> {
    const sql = `
      SELECT *
      FROM PostNatalDangerSign
      WHERE Oid = ?;
    `;
    const params = [Oid];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as PostNatalDangerSign;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching post-natal danger sign by id:', error);
        return null;
      });
  }

  async deletePostNatalDangerSignById(Oid: string) {
    const sql = `DELETE FROM PostNatalDangerSign WHERE Oid = ?`;
    const params = [Oid];

    try {
      await this.db.run(sql, params);
      await this.getPostNatalDangerSigns();
    } catch (error) {
      console.error('Error deleting post-natal danger sign:', error);
    }
  }

  async deletePostNatalDangerSignByClientId(clientId: string) {
    const sql = `DELETE FROM PostNatalDangerSign WHERE PostNatalId IN (SELECT TransactionId FROM PostNatal WHERE ClientId = ?)`;
    const params = [clientId];

    try {
      await this.db.run(sql, params);
      await this.getPostNatalDangerSigns();
      console.log('Deleted post-natal danger sign records for client', clientId);
    } catch (error) {
      console.error('Error deleting post-natal danger sign records by client id:', error);
    }
  }
}
