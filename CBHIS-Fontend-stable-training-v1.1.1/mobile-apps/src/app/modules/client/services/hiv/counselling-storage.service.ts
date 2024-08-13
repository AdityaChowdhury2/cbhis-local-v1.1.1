import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { Counseling } from '../../models/service-models/hiv';

@Injectable({
  providedIn: 'root',
})
export class CounsellingStorageService {
  public counselingList: BehaviorSubject<Counseling[]> = new BehaviorSubject<Counseling[]>([]);
  private db!: SQLiteDBConnection;
  private isCounselingReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('CounselingStorageService initialized');
      this.loadCounseling();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getCounseling();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the Counseling as observable
  counselingState(): Observable<boolean> {
    return this.isCounselingReady.asObservable();
  }

  // Send all the Counseling List as observable
  fetchCounseling(): Observable<Counseling[]> {
    return this.counselingList.asObservable();
  }

  // Load all the Counseling from the database
  async loadCounseling() {
    const counseling: Counseling[] = (await this.db.query('SELECT * FROM Counseling;')).values as Counseling[];
    console.log('Counseling', counseling);
    this.counselingList.next(counseling);
  }

  async getCounseling() {
    await this.loadCounseling();
    this.isCounselingReady.next(true);
  }

  async addCounseling(counseling: Counseling[]): Promise<(capSQLiteChanges | null)[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      const responses: (capSQLiteChanges | null)[] = [];
      if (counseling?.length > 0) {
        for (const item of counseling) {
          const { OnlineDbOid, TransactionId } = item;
          // If OnlineDbOid and TransactionId is not null
          if (!!OnlineDbOid && !!TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('Counseling', OnlineDbOid);
            await this.addTransactionToQueue('UPDATE', OnlineDbOid);
            responses.push(await this.updateCounselingItemWithOnlineDbId(item));
          }
          // If OnlineDbOid is null but TransactionId is not null
          else if (!OnlineDbOid && !!TransactionId) {
            responses.push(await this.updateCounselingItem(item));
          }
          // If OnlineDbOid and TransactionId is null
          else {
            responses.push(await this.insertCounselingItems([item]));
          }
        }
        return responses;
      } else return [null];
    } catch (error) {
      return [null];
    }
  }

  private async updateCounselingItemWithOnlineDbId(item: Counseling): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE Counseling SET
      CounselingType = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [item.CounselingType, item.ModifiedBy, item.TransactionId, item.OnlineDbOid];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateCounselingItem(item: Counseling): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE Counseling SET
      CounselingType = ?
      WHERE
      TransactionId = ?
    `;
    const params = [item.CounselingType, item.TransactionId];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertCounselingItems(counselingItems: Counseling[]): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO Counseling (
      TransactionId,
      ClientId,
      CounselingType,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = counselingItems.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';
    const params: (string | number | boolean | undefined | null)[] = [];
    for (const item of counselingItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.CounselingType,
        item.IsDeleted ?? 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt
      );
    }
    console.log('Inserted query for Counseling item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadCounseling();
      return response;
    } catch (error) {
      console.error('Error in insertCounselingItems: ', error);
      return null;
    }
  }

  private async deleteExistingCounselingItems(counselingItems: Counseling[]): Promise<void> {
    console.log('Deleting existing items in counseling');
    for (const item of counselingItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM Counseling WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);
      console.log('oid for client', OidForClient);
      await this.db.run('DELETE FROM Counseling WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'Counseling',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateCounselingById(TransactionId: string, counseling: Counseling) {
    const sql = `
    UPDATE Counseling
    SET
      ClientId = ?,
      CounselingType = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [counseling.ClientId, counseling.CounselingType, counseling.IsDeleted ?? 0, TransactionId];
    try {
      await this.db.run(sql, params);
      await this.getCounseling();
      console.log('Counseling updated successfully');
      this.toast.openToast({
        message: 'Counseling updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating counseling:', error);
      this.toast.openToast({
        message: 'Error updating counseling',
        color: 'error',
      });
    }
  }

  async getCounselingByClientId(clientId: string): Promise<Counseling> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM Counseling WHERE ClientId = ? AND IsDeleted = 0;', [clientId]);
    console.log(result.values);
    return result.values?.[0] as Counseling;
  }

  async getClientsCounselingByClientIds(clientIds: string[]): Promise<Counseling[]> {
    if (!this.db) await this.initializeDatabase();
    const placeholders = clientIds.map(() => '?').join(', ');
    const query = `SELECT * FROM Counseling WHERE ClientId IN (${placeholders}) AND IsDeleted = 0;`;
    const result = await this.db.query(query, clientIds);
    return result.values as Counseling[];
  }

  async getCounselingById(TransactionId: string): Promise<Counseling | null> {
    const sql = `
      SELECT *
      FROM Counseling
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];
    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as Counseling;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching counseling by id:', error);
        return null;
      });
  }

  async deleteCounselingById(TransactionId: string) {
    const sql = `DELETE FROM Counseling WHERE TransactionId = ?`;
    const params = [TransactionId];
    try {
      await this.db.run(sql, params);
      await this.getCounseling();
    } catch (error) {
      console.error('Error deleting counseling:', error);
    }
  }
}
