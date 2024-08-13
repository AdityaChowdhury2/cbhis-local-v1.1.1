import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { HivPreventativeService, PostNatalPreventativeService } from '../../models/service-models/postnatal';

@Injectable({
  providedIn: 'root',
})
export class PostnatalPreventiveStorageService {
  public hivPreventativeServiceList: BehaviorSubject<HivPreventativeService[]> = new BehaviorSubject<
    HivPreventativeService[]
  >([]);
  private db!: SQLiteDBConnection;
  private isHivPreventativeServiceReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public postNatalPreventativeServiceList: BehaviorSubject<PostNatalPreventativeService[]> = new BehaviorSubject<
    PostNatalPreventativeService[]
  >([]);
  private isPostNatalPreventativeServiceReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('PreventativeServiceStorageService initialized');
      this.loadHivPreventativeServices();
      this.loadPostNatalPreventativeServices();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getHivPreventativeServices();
      await this.getPostNatalPreventativeServices();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // HivPreventativeService state
  hivPreventativeServiceState(): Observable<boolean> {
    return this.isHivPreventativeServiceReady.asObservable();
  }

  // PostNatalPreventativeService state
  postNatalPreventativeServiceState(): Observable<boolean> {
    return this.isPostNatalPreventativeServiceReady.asObservable();
  }

  fetchHivPreventativeServices(): Observable<HivPreventativeService[]> {
    return this.hivPreventativeServiceList.asObservable();
  }

  fetchPostNatalPreventativeServices(): Observable<PostNatalPreventativeService[]> {
    return this.postNatalPreventativeServiceList.asObservable();
  }

  async loadHivPreventativeServices() {
    const hivPreventativeServices: HivPreventativeService[] = (
      await this.db.query('SELECT * FROM HivPreventativeService;')
    ).values as HivPreventativeService[];
    this.hivPreventativeServiceList.next(hivPreventativeServices);
  }

  async loadPostNatalPreventativeServices() {
    const postNatalPreventativeServices: PostNatalPreventativeService[] = (
      await this.db.query('SELECT * FROM PostNatalPreventativeService;')
    ).values as PostNatalPreventativeService[];
    this.postNatalPreventativeServiceList.next(postNatalPreventativeServices);
  }

  async getHivPreventativeServices() {
    await this.loadHivPreventativeServices();
    this.isHivPreventativeServiceReady.next(true);
  }

  async getPostNatalPreventativeServices() {
    await this.loadPostNatalPreventativeServices();
    this.isPostNatalPreventativeServiceReady.next(true);
  }

  async addPostNatalPreventativeService(
    postNatalPreventativeServices: PostNatalPreventativeService[]
  ): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(postNatalPreventativeServices);
      const uniquePostNatalIds = [...new Set(postNatalPreventativeServices.map((item) => item.PostNatalId))];
      await this.deletePreviousTransactions(uniquePostNatalIds);
      const response = await this.executeInsertQuery(query, params);
      // if
      await this.addToSyncQueue(generatedGUIDs);
      await this.getPostNatalPreventativeServices();
      return response;
    } catch (error) {
      console.error('Error adding post-natal preventative services:', error);
      this.toast.openToast({
        message: 'Error adding post-natal preventative services',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the post-natal preventative services
  generateInsertQueryAndParams(postNatalPreventativeServices: PostNatalPreventativeService[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO PostNatalPreventativeService (
        TransactionId,
        PostNatalId,
        PreventativeServiceId,
        IsDeleted,
        CreatedBy
      ) VALUES `;
    const placeholders = postNatalPreventativeServices.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    postNatalPreventativeServices.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.PostNatalId, item.PreventativeServiceId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the post-natal preventative services and sync queue
  async deletePreviousTransactions(uniquePostNatalIds: string[]) {
    for (const postNatalId of uniquePostNatalIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM PostNatalPreventativeService WHERE PostNatalId = ?', [
          postNatalId,
        ])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM PostNatalPreventativeService WHERE TransactionId IN (${previousTransactionIds
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
        tableName: 'PostNatalPreventativeService',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addPostNatalPreventativeService(
  //   postNatalPreventativeServices: PostNatalPreventativeService[]
  // ): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO PostNatalPreventativeService (
  //     PostNatalId,
  //     PreventativeServiceId,
  //     IsDeleted,
  //     IsSynced,
  //     OnlineDbOid
  //   ) VALUES `;
  //   const placeholders = postNatalPreventativeServices.map(() => `(?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of postNatalPreventativeServices) {
  //     const { PostNatalId, PreventativeServiceId, IsDeleted, IsSynced, OnlineDbOid } = item;
  //     params.push(PostNatalId, PreventativeServiceId, String(IsDeleted), IsSynced, OnlineDbOid);
  //   }
  //   console.log('post natal preventative service', query, params);
  //   try {
  //     for (const items of postNatalPreventativeServices) {
  //       console.log('PostNatalId: ', items.PostNatalId);
  //       const OidForPostNatal = (
  //         await this.db.query('SELECT Oid FROM PostNatalPreventativeService WHERE PostNatalId = ?;', [
  //           items.PostNatalId,
  //         ])
  //       ).values?.map((oid) => oid.Oid);

  //       if (OidForPostNatal?.length) {
  //         console.log('OidForPostNatal for delete operation: ', OidForPostNatal);
  //         for (const oid of OidForPostNatal) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('PostNatalPreventativeService', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM PostNatalPreventativeService WHERE PostNatalId = ?', [
  //         items.PostNatalId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     console.log('Response', response);
  //     await this.getPostNatalPreventativeServices();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding post-natal preventative service:', error);
  //     this.toast.openToast({
  //       message: 'Error adding post-natal preventative service',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updatePostNatalPreventativeServiceById(
    Oid: string,
    postNatalPreventativeService: PostNatalPreventativeService
  ) {
    const sql = `
    UPDATE PostNatalPreventativeService
    SET
      PostNatalId = ?,
      PreventativeServiceId = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE Oid = ?;
    `;
    const params = [
      postNatalPreventativeService.PostNatalId,
      postNatalPreventativeService.PreventativeServiceId,
      postNatalPreventativeService.IsDeleted ?? 0,
      postNatalPreventativeService.IsSynced,
      postNatalPreventativeService.OnlineDbOid,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'PostNatalPreventativeService',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getPostNatalPreventativeServices();
      console.log('Post-natal preventative service updated successfully');
      this.toast.openToast({
        message: 'Post-natal preventative service updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating post-natal preventative service:', error);
      this.toast.openToast({
        message: 'Error updating post-natal preventative service',
        color: 'error',
      });
    }
  }

  async getPostNatalPreventativeServiceByPostNatalId(postNatalId: string): Promise<PostNatalPreventativeService[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      `SELECT * FROM PostNatalPreventativeService WHERE PostNatalId = ? AND IsDeleted = 0;`,
      [postNatalId]
    );

    console.log(result.values);
    return result.values as PostNatalPreventativeService[];
  }

  async getPostNatalPreventativeServiceById(Oid: string): Promise<PostNatalPreventativeService | null> {
    const sql = `
      SELECT *
      FROM PostNatalPreventativeService
      WHERE Oid = ?;
    `;
    const params = [Oid];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as PostNatalPreventativeService;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching post-natal preventative service by id:', error);
        return null;
      });
  }

  async deletePostNatalPreventativeServiceById(Oid: string) {
    const sql = `DELETE FROM PostNatalPreventativeService WHERE Oid = ?`;
    const params = [Oid];

    try {
      await this.db.run(sql, params);
      await this.getPostNatalPreventativeServices();
    } catch (error) {
      console.error('Error deleting post-natal preventative service:', error);
    }
  }

  async deletePostNatalPreventativeServiceByClientId(clientId: string) {
    const sql = `DELETE FROM PostNatalPreventativeService WHERE PostNatalId IN (SELECT TransactionId FROM PostNatal WHERE ClientId = ?)`;
    const params = [clientId];

    try {
      await this.db.run(sql, params);
      await this.getPostNatalPreventativeServices();
      console.log('Deleted post-natal preventative services for client', clientId);
    } catch (error) {
      console.error('Error deleting post-natal preventative services by client id:', error);
    }
  }
}
