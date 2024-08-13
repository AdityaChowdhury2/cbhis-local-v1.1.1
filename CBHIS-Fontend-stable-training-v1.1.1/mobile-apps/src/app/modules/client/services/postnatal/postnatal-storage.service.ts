import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { PostNatal } from '../../models/service-models/postnatal';

@Injectable({
  providedIn: 'root',
})
export class PostNatalStorageService {
  public postNatalList: BehaviorSubject<PostNatal[]> = new BehaviorSubject<PostNatal[]>([]);
  private db!: SQLiteDBConnection;
  private isPostNatalReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('PostNatalStorageService initialized');
      this.loadPostNatal();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getPostNatal();
    } catch (error) {
      console.log('database init', error);
    }
  }

  postNatalState(): Observable<boolean> {
    return this.isPostNatalReady.asObservable();
  }

  fetchPostNatal(): Observable<PostNatal[]> {
    return this.postNatalList.asObservable();
  }

  async loadPostNatal() {
    const postNatal: PostNatal[] = (await this.db.query('SELECT * FROM PostNatal;')).values as PostNatal[];
    this.postNatalList.next(postNatal);
  }

  async getPostNatal() {
    await this.loadPostNatal();
    this.isPostNatalReady.next(true);
  }

  async addPostNatal(postNatals: PostNatal[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      if (postNatals?.length > 0) {
        for (const item of postNatals) {
          if (!!item.OnlineDbOid && !!item.TransactionId) {
            await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
            return await this.updatePostNatalItemWithOnlineDbId(item);
          } else if (!item.OnlineDbOid && !!item.TransactionId) {
            return await this.updatePostNatalItem(item);
          } else {
            return await this.insertPostNatalItems([item]);
          }
        }
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  private async updatePostNatalItemWithOnlineDbId(item: PostNatal): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE PostNatal SET
      PlaceOfDelivery = ?,
      PostPartumLossOfBlood = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.PlaceOfDelivery ?? 0,
      item.PostPartumLossOfBlood ?? 0,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updatePostNatalItem(item: PostNatal): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE PostNatal SET
      PlaceOfDelivery = ?,
      PostPartumLossOfBlood = ?
      WHERE
      TransactionId = ?
    `;
    const params = [item.PlaceOfDelivery ?? 0, item.PostPartumLossOfBlood ?? 0, item.TransactionId];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertPostNatalItems(postNatalItems: PostNatal[]): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO PostNatal (
      TransactionId,
      ClientId,
      PlaceOfDelivery,
      PostPartumLossOfBlood,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = postNatalItems.map(() => `(?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | null | undefined)[] = [];
    for (const item of postNatalItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.PlaceOfDelivery,
        item.PostPartumLossOfBlood,
        item.IsDeleted ?? 0,
        item.CreatedBy
      );
    }
    console.log('Inserted query for PostNatal item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadPostNatal();
      return response;
    } catch (error) {
      console.error('Error in insertPostNatalItems: ', error);
      return null;
    }
  }

  private async deleteExistingPostNatalItems(postNatalItems: PostNatal[]): Promise<void> {
    for (const item of postNatalItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM PostNatal WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('PostNatal', oid);
        }
      }

      await this.db.run('DELETE FROM PostNatal WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'PostNatal',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  // async addPostNatal(postNatal: PostNatal[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO PostNatal (
  //     TransactionId,
  //     ClientId,
  //     PlaceOfDelivery,
  //     PostPartumLossOfBlood,
  //     IsDeleted,
  //     IsSynced,
  //     OnlineDbOid
  //   ) VALUES `;
  //   const placeholders = postNatal.map(() => `( ?, ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of postNatal) {
  //     const { ClientId, PlaceOfDelivery, PostPartumLossOfBlood, IsDeleted, IsSynced, OnlineDbOid } = item;
  //     params.push(
  //       generateGUID(),
  //       ClientId,
  //       PlaceOfDelivery,
  //       PostPartumLossOfBlood,
  //       IsDeleted ? 1 : 0,
  //       IsSynced,
  //       OnlineDbOid
  //     );
  //   }

  //   try {
  //     const response = await this.db.run(query, params);
  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM PostNatal;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'PostNatal',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getPostNatal();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding post-natal:', error);
  //     this.toast.openToast({
  //       message: 'Error adding post-natal',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updatePostNatalById(TransactionId: string, postNatal: PostNatal) {
    const sql = `
    UPDATE PostNatal
    SET
      ClientId = ?,
      PlaceOfDelivery = ?,
      PostPartumLossOfBlood = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      postNatal.ClientId,
      postNatal.PlaceOfDelivery,
      postNatal.PostPartumLossOfBlood,
      postNatal.IsDeleted ?? 0,
      postNatal.IsSynced,
      postNatal.OnlineDbOid,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'PostNatal',
        transactionId: TransactionId,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getPostNatal();
      console.log('Post-natal updated successfully');
      this.toast.openToast({
        message: 'Post-natal updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating post-natal:', error);
      this.toast.openToast({
        message: 'Error updating post-natal',
        color: 'error',
      });
    }
  }

  async getPostNatalByClientId(clientId: string): Promise<PostNatal[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM PostNatal WHERE ClientId = ? AND IsDeleted = 0;', [clientId]);
    return result.values as PostNatal[];
  }

  async getPostNatalById(TransactionId: string): Promise<PostNatal | null> {
    const sql = `
      SELECT *
      FROM PostNatal
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as PostNatal;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching post-natal by id:', error);
        return null;
      });
  }

  async deletePostNatalById(TransactionId: string) {
    const sql = `DELETE FROM PostNatal WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getPostNatal();
    } catch (error) {
      console.error('Error deleting post-natal:', error);
    }
  }

  async deletePostNatalByClientId(clientId: string) {
    const sql = `DELETE FROM PostNatal WHERE ClientId = ?`;
    const params = [clientId];

    try {
      await this.db.run(sql, params);
      await this.getPostNatal();
      console.log('Deleted post-natal records for client', clientId);
    } catch (error) {
      console.error('Error deleting post-natal records by client id:', error);
    }
  }
}
