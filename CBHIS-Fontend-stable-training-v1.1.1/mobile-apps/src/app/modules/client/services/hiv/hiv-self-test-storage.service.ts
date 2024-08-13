import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { HIVSelfTest } from '../../models/service-models/hiv';

@Injectable({
  providedIn: 'root',
})
export class HIVSelfTestStorageService {
  public hivSelfTestList: BehaviorSubject<HIVSelfTest[]> = new BehaviorSubject<HIVSelfTest[]>([]);
  private db!: SQLiteDBConnection;
  private isHIVSelfTestReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('HIVSelfTestStorageService initialized');
      this.loadHIVSelfTest();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getHIVSelfTest();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the HIVSelfTest as observable
  hivSelfTestState(): Observable<boolean> {
    return this.isHIVSelfTestReady.asObservable();
  }

  // Send all the HIVSelfTest List as observable
  fetchHIVSelfTest(): Observable<HIVSelfTest[]> {
    return this.hivSelfTestList.asObservable();
  }

  // Load all the HIVSelfTest from the database
  async loadHIVSelfTest() {
    const hivSelfTest: HIVSelfTest[] = (await this.db.query('SELECT * FROM HIVSelfTest;')).values as HIVSelfTest[];
    console.log('HIV Self Test', hivSelfTest);
    this.hivSelfTestList.next(hivSelfTest);
  }

  async getHIVSelfTest() {
    await this.loadHIVSelfTest();
    this.isHIVSelfTestReady.next(true);
  }

  async addHIVSelfTest(hivSelfTest: HIVSelfTest[]): Promise<(capSQLiteChanges | null)[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      const responses: (capSQLiteChanges | null)[] = [];
      if (hivSelfTest?.length > 0) {
        for (const item of hivSelfTest) {
          const { OnlineDbOid, TransactionId } = item;
          // If OnlineDbOid and TransactionId is not null
          if (!!OnlineDbOid && !!TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('HIVSelfTest', OnlineDbOid);
            await this.addTransactionToQueue('UPDATE', OnlineDbOid);
            responses.push(await this.updateHIVSelfTestItemWithOnlineDbId(item));
          }
          // If OnlineDbOid is null but TransactionId is not null
          else if (!OnlineDbOid && !!TransactionId) {
            responses.push(await this.updateHIVSelfTestItem(item));
          }
          // If OnlineDbOid and TransactionId is null
          else {
            responses.push(await this.insertHIVSelfTestItems([item]));
          }
        }
        return responses;
      } else return [null];
    } catch (error) {
      return [null];
    }
  }

  private async updateHIVSelfTestItemWithOnlineDbId(item: HIVSelfTest): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE HIVSelfTest SET
      IsAcceptedHIVTest = ?,
      DistributionType = ?,
      UserProfile = ?,
      IsAssistedSelfTest = ?,
      TestResult = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.IsAcceptedHIVTest,
      item.DistributionType,
      item.UserProfile,
      item.IsAssistedSelfTest,
      item.TestResult,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateHIVSelfTestItem(item: HIVSelfTest): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE HIVSelfTest SET
      IsAcceptedHIVTest = ?,
      DistributionType = ?,
      UserProfile = ?,
      IsAssistedSelfTest = ?,
      TestResult = ?
      WHERE
      TransactionId = ?
    `;
    const params = [
      item.IsAcceptedHIVTest,
      item.DistributionType,
      item.UserProfile,
      item.IsAssistedSelfTest,
      item.TestResult,
      item.TransactionId,
    ];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertHIVSelfTestItems(hivSelfTestItems: HIVSelfTest[]): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO HIVSelfTest (
      TransactionId,
      ClientId,
      IsAcceptedHIVTest,
      DistributionType,
      UserProfile,
      IsAssistedSelfTest,
      TestResult,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = hivSelfTestItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';
    const params: (string | number | boolean | undefined | null)[] = [];
    for (const item of hivSelfTestItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.IsAcceptedHIVTest,
        item.DistributionType,
        item.UserProfile,
        item.IsAssistedSelfTest,
        item.TestResult,
        item.IsDeleted ?? 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt
      );
    }
    console.log('Inserted query for HIVSelfTest item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadHIVSelfTest();
      return response;
    } catch (error) {
      console.error('Error in insertHIVSelfTestItems: ', error);
      return null;
    }
  }

  private async deleteExistingHIVSelfTestItems(hivSelfTestItems: HIVSelfTest[]): Promise<void> {
    console.log('Deleting existing items in HIVSelfTest');
    for (const item of hivSelfTestItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM HIVSelfTest WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);
      console.log('oid for client', OidForClient);
      await this.db.run('DELETE FROM HIVSelfTest WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'HIVSelfTest',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateHIVSelfTestById(TransactionId: string, hivSelfTest: HIVSelfTest) {
    const sql = `
    UPDATE HIVSelfTest
    SET
      ClientId = ?,
      IsAcceptedHIVTest = ?,
      DistributionType = ?,
      UserProfile = ?,
      IsAssistedSelfTest = ?,
      TestResult = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      hivSelfTest.ClientId,
      hivSelfTest.IsAcceptedHIVTest,
      hivSelfTest.DistributionType,
      hivSelfTest.UserProfile,
      hivSelfTest.IsAssistedSelfTest,
      hivSelfTest.TestResult,
      hivSelfTest.IsDeleted ?? 0,
      TransactionId,
    ];
    try {
      await this.db.run(sql, params);
      await this.getHIVSelfTest();
      console.log('HIV Self Test updated successfully');
      this.toast.openToast({
        message: 'HIV Self Test updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating HIV Self Test:', error);
      this.toast.openToast({
        message: 'Error updating HIV Self Test',
        color: 'error',
      });
    }
  }

  async getClientsHIVSelfTestByClientIds(clientIds: string[]): Promise<HIVSelfTest[]> {
    if (!this.db) await this.initializeDatabase();
    const placeholders = clientIds.map(() => '?').join(', ');
    const query = `SELECT * FROM HIVSelfTest WHERE ClientId IN (${placeholders}) AND IsDeleted = 0;`;
    const result = await this.db.query(query, clientIds);
    return result.values as HIVSelfTest[];
  }

  async getHIVSelfTestByClientId(clientId: string): Promise<HIVSelfTest> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM HIVSelfTest WHERE ClientId = ? AND IsDeleted = 0;', [clientId]);
    console.log(result.values);
    return result.values?.[0] as HIVSelfTest;
  }

  async getHIVSelfTestById(TransactionId: string): Promise<HIVSelfTest | null> {
    const sql = `
      SELECT *
      FROM HIVSelfTest
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];
    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as HIVSelfTest;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching HIV Self Test by id:', error);
        return null;
      });
  }

  async deleteHIVSelfTestById(TransactionId: string) {
    const sql = `DELETE FROM HIVSelfTest WHERE TransactionId = ?`;
    const params = [TransactionId];
    try {
      await this.db.run(sql, params);
      await this.getHIVSelfTest();
    } catch (error) {
      console.error('Error deleting HIV Self Test:', error);
    }
  }
}
