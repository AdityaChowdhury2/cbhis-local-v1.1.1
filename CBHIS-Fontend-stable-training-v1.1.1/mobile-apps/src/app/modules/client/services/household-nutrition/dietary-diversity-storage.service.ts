import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { DietaryDiversity, HouseholdDietaryDiversity } from '../../models/service-models/household-nutrition';

@Injectable({
  providedIn: 'root',
})
export class DietaryDiversityStorageService {
  public householdDietaryDiversityList: BehaviorSubject<HouseholdDietaryDiversity[]> = new BehaviorSubject<
    HouseholdDietaryDiversity[]
  >([]);
  private db!: SQLiteDBConnection;
  private isHouseholdDietaryDiversityReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public dietaryDiversityList: BehaviorSubject<DietaryDiversity[]> = new BehaviorSubject<DietaryDiversity[]>([]);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('HouseholdDietaryDiversityService initialized');
      this.loadHouseholdDietaryDiversity();
      this.loadDietaryDiversity();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getHouseholdDietaryDiversity();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the DietaryDiversity as observable
  dietaryDiversityState(): Observable<boolean> {
    return this.isHouseholdDietaryDiversityReady.asObservable();
  }

  // the state of the HouseholdDietaryDiversity as observable
  householdDietaryDiversityState(): Observable<boolean> {
    return this.isHouseholdDietaryDiversityReady.asObservable();
  }

  // Send all the DietaryDiversity List as observable
  fetchDietaryDiversity(): Observable<DietaryDiversity[]> {
    return this.dietaryDiversityList.asObservable();
  }

  // Send all the HouseholdDietaryDiversity List as observable
  fetchHouseholdDietaryDiversity(): Observable<HouseholdDietaryDiversity[]> {
    return this.householdDietaryDiversityList.asObservable();
  }

  // Load all the DietaryDiversity records from the database
  async loadDietaryDiversity() {
    const dietaryDiversity: DietaryDiversity[] = (await this.db.query('SELECT * FROM DietaryDiversity;'))
      .values as DietaryDiversity[];
    this.dietaryDiversityList.next(dietaryDiversity);
  }

  // Load all the HouseholdDietaryDiversity records from the database
  async loadHouseholdDietaryDiversity() {
    const householdDietaryDiversity: HouseholdDietaryDiversity[] = (
      await this.db.query('SELECT * FROM HouseholdDietaryDiversity;')
    ).values as HouseholdDietaryDiversity[];
    this.householdDietaryDiversityList.next(householdDietaryDiversity);
  }

  async getHouseholdDietaryDiversity() {
    await this.loadHouseholdDietaryDiversity();
    this.isHouseholdDietaryDiversityReady.next(true);
  }

  async addHouseholdDietaryDiversity(
    householdDietaryDiversity: HouseholdDietaryDiversity[]
  ): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(householdDietaryDiversity);
      const uniqueClientIds = [...new Set(householdDietaryDiversity.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getHouseholdDietaryDiversity();
      return response;
    } catch (error) {
      console.error('Error adding household dietary diversity:', error);
      this.toast.openToast({
        message: 'Error adding household dietary diversity',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the household dietary diversity
  generateInsertQueryAndParams(householdDietaryDiversity: HouseholdDietaryDiversity[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO HouseholdDietaryDiversity (
      TransactionId,
      DietaryDiversityId,
      ClientId,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = householdDietaryDiversity.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    householdDietaryDiversity.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(
        guid,
        item.DietaryDiversityId,
        item.ClientId,
        item.IsDeleted ? 1 : 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt as string
      );
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the household dietary diversity and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM HouseholdDietaryDiversity WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM HouseholdDietaryDiversity WHERE TransactionId IN (${previousTransactionIds
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
  async executeInsertQuery(query: string, params: (string | number | undefined)[]) {
    return await this.db.run(query, params);
  }

  async addToSyncQueue(generatedGUIDs: string[]) {
    for (const guid of generatedGUIDs) {
      await this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'INSERT',
        tableName: 'HouseholdDietaryDiversity',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  async updateHouseholdDietaryDiversityById(
    TransactionId: string,
    householdDietaryDiversity: HouseholdDietaryDiversity
  ) {
    const sql = `
    UPDATE HouseholdDietaryDiversity
    SET
      DietaryDiversityId = ?,
      ClientId = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      householdDietaryDiversity.DietaryDiversityId,
      householdDietaryDiversity.ClientId,
      householdDietaryDiversity.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'HouseholdDietaryDiversity',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getHouseholdDietaryDiversity();
      console.log('Household dietary diversity updated successfully');
      this.toast.openToast({
        message: 'Household dietary diversity updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating household dietary diversity:', error);
      this.toast.openToast({
        message: 'Error updating household dietary diversity',
        color: 'error',
      });
    }
  }

  async getHouseholdDietaryDiversityByClientId(clientId: string): Promise<HouseholdDietaryDiversity[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      'SELECT * FROM HouseholdDietaryDiversity WHERE ClientId = ? AND IsDeleted = 0;',
      [clientId]
    );
    console.log(result.values);
    return result.values as HouseholdDietaryDiversity[];
  }

  async getHouseholdDietaryDiversityById(TransactionId: string): Promise<HouseholdDietaryDiversity | null> {
    const sql = `
      SELECT *
      FROM HouseholdDietaryDiversity
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as HouseholdDietaryDiversity;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching household dietary diversity by id:', error);
        return null;
      });
  }

  async getHouseholdDietaryDiversityByClientIds(clientIds: string[]): Promise<HouseholdDietaryDiversity[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      `SELECT * FROM HouseholdDietaryDiversity WHERE ClientId IN (${clientIds.map(() => '?').join(',')});`,
      clientIds
    );
    return result.values as HouseholdDietaryDiversity[];
  }

  async deleteHouseholdDietaryDiversityById(TransactionId: string) {
    const sql = `DELETE FROM HouseholdDietaryDiversity WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getHouseholdDietaryDiversity();
    } catch (error) {
      console.error('Error deleting household dietary diversity:', error);
    }
  }
}
