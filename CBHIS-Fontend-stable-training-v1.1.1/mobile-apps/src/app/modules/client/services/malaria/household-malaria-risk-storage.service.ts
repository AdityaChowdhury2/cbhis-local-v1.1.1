import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { HouseholdMalariaRisk, MalariaRisk } from '../../models/service-models/malaria';

@Injectable({
  providedIn: 'root',
})
export class HouseholdMalariaRiskStorageService {
  public householdMalariaRiskList: BehaviorSubject<HouseholdMalariaRisk[]> = new BehaviorSubject<
    HouseholdMalariaRisk[]
  >([]);
  private db!: SQLiteDBConnection;
  private isHouseholdMalariaRiskReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public malariaRiskList: BehaviorSubject<MalariaRisk[]> = new BehaviorSubject<MalariaRisk[]>([]);

  private isMalariaRiskReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('HouseholdMalariaRiskService initialized');
      this.loadHouseholdMalariaRisks();
      this.loadMalariaRisks();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getHouseholdMalariaRisks();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // * the state of the MalariaRisk as observable
  malariaRiskState(): Observable<boolean> {
    return this.isMalariaRiskReady.asObservable();
  }

  householdMalariaRiskState(): Observable<boolean> {
    return this.isHouseholdMalariaRiskReady.asObservable();
  }

  // send all the malaria risk list as observable
  fetchMalariaRisks(): Observable<MalariaRisk[]> {
    return this.malariaRiskList.asObservable();
  }

  // Send all the HouseholdMalariaRisk List as observable
  fetchHouseholdMalariaRisks(): Observable<HouseholdMalariaRisk[]> {
    return this.householdMalariaRiskList.asObservable();
  }

  // Load all the MalariaRisk records from the database
  async loadMalariaRisks() {
    const malariaRisks: MalariaRisk[] = (await this.db.query('SELECT * FROM MalariaRisk;')).values as MalariaRisk[];

    this.malariaRiskList.next(malariaRisks);
  }

  // Load all the HouseholdMalariaRisk records from the database
  async loadHouseholdMalariaRisks() {
    const householdMalariaRisks: HouseholdMalariaRisk[] = (await this.db.query('SELECT * FROM HouseholdMalariaRisk;'))
      .values as HouseholdMalariaRisk[];
    this.householdMalariaRiskList.next(householdMalariaRisks);
  }

  async getHouseholdMalariaRisks() {
    await this.loadHouseholdMalariaRisks();
    this.isHouseholdMalariaRiskReady.next(true);
  }

  async addHouseholdMalariaRisk(householdMalariaRisks: HouseholdMalariaRisk[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(householdMalariaRisks);
      const uniqueClientIds = [...new Set(householdMalariaRisks.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getHouseholdMalariaRisks();
      return response;
    } catch (error) {
      console.error('Error adding household malaria risk:', error);
      this.toast.openToast({
        message: 'Error adding household malaria risk',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the household malaria risk
  generateInsertQueryAndParams(householdMalariaRisk: HouseholdMalariaRisk[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO HouseholdMalariaRisk (
      TransactionId,
      ClientId,
      MalariaRiskId,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = householdMalariaRisk.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    householdMalariaRisk.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(
        guid,
        item.ClientId,
        item.MalariaRiskId,
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

  // Delete the previous transactions for the household malaria risk and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM HouseholdMalariaRisk WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM HouseholdMalariaRisk WHERE TransactionId IN (${previousTransactionIds
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
        tableName: 'HouseholdMalariaRisk',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  async updateHouseholdMalariaRiskById(TransactionId: string, householdMalariaRisk: HouseholdMalariaRisk) {
    const sql = `
    UPDATE HouseholdMalariaRisk
    SET
      ClientId = ?,
      MalariaRiskId = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      householdMalariaRisk.ClientId,
      householdMalariaRisk.MalariaRiskId,
      householdMalariaRisk.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'HouseholdMalariaRisk',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getHouseholdMalariaRisks();
      console.log('Household malaria risk updated successfully');
      this.toast.openToast({
        message: 'Household malaria risk updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating household malaria risk:', error);
      this.toast.openToast({
        message: 'Error updating household malaria risk',
        color: 'error',
      });
    }
  }

  async getHouseholdMalariaRiskByClientId(clientId: string): Promise<HouseholdMalariaRisk[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM HouseholdMalariaRisk WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as HouseholdMalariaRisk[];
  }

  // for multiple clients
  async getHouseholdMalariaRiskByClientIds(clientIds: string[]): Promise<HouseholdMalariaRisk[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      `SELECT * FROM HouseholdMalariaRisk WHERE ClientId IN (${clientIds.map(() => '?').join(',')}) AND IsDeleted = 0;`,
      clientIds
    );
    return result.values as HouseholdMalariaRisk[];
  }

  async getHouseholdMalariaRiskById(TransactionId: string): Promise<HouseholdMalariaRisk | null> {
    const sql = `
      SELECT *
      FROM HouseholdMalariaRisk
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as HouseholdMalariaRisk;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching household malaria risk by id:', error);
        return null;
      });
  }

  async deleteHouseholdMalariaRiskById(TransactionId: string) {
    const sql = `DELETE FROM HouseholdMalariaRisk WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getHouseholdMalariaRisks();
    } catch (error) {
      console.error('Error deleting household malaria risk:', error);
    }
  }
}
