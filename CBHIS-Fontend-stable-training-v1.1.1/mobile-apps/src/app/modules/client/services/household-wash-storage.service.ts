import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { HouseholdWASHs } from '../models/household-wash';
import { WASH } from '../models/wash';

@Injectable({
  providedIn: 'root',
})
export class HouseholdWASHStorageService {
  db!: SQLiteDBConnection;
  private isHouseholdWASHReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public householdWASHList: BehaviorSubject<HouseholdWASHs[]> = new BehaviorSubject<HouseholdWASHs[]>([]);
  private isWASHReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public washList: BehaviorSubject<WASH[]> = new BehaviorSubject<WASH[]>([]);

  constructor(
    private sqliteService: SQLiteService,
    private syncQueueService: SyncStorageService,
    private authService: AuthStorageService,
    private toast: ToastService
  ) {
    this.initializeDatabase();
  }

  async initializeDatabase() {
    this.db = await this.sqliteService.retrieveConnection();
    await this.loadHouseholdWASH();
    await this.loadWASHData();
    this.isHouseholdWASHReady.next(true);
    this.isWASHReady.next(true);
  }

  async loadWASHData() {
    const result = await this.db.query('SELECT * FROM WASH WHERE IsDeleted = 0;');
    this.washList.next(result.values as WASH[]);
  }

  async loadHouseholdWASH() {
    const householdWASH: HouseholdWASHs[] = (await this.db.query('SELECT * FROM HouseholdWASH WHERE IsDeleted = 0;'))
      .values as HouseholdWASHs[];
    this.householdWASHList.next(householdWASH);
  }

  async getHouseholdWASH() {
    await this.loadHouseholdWASH();
    this.isHouseholdWASHReady.next(true);
  }

  fetchWASHData() {
    return this.washList.asObservable();
  }

  fetchData() {
    return this.householdWASHList.asObservable();
  }

  // * Add a new item to the HouseholdWASH table
  async addItems(householdWASH: HouseholdWASHs[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(householdWASH);
      const uniqueFamilyHeadIds = [...new Set(householdWASH.map((item) => item.FamilyHeadId))];
      await this.deletePreviousTransactions(uniqueFamilyHeadIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getHouseholdWASH();
      return response;
    } catch (error) {
      console.error('Error adding household WASH:', error);
      this.toast.openToast({
        message: 'Error adding household WASH',
        color: 'error',
      });
      return null;
    }
  }

  generateInsertQueryAndParams(householdWASH: HouseholdWASHs[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO HouseholdWASH (
      TransactionId,
      FamilyHeadId,
      WASHId,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = householdWASH.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    householdWASH.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.FamilyHeadId, item.WASHId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    return { query, params, generatedGUIDs };
  }

  async deletePreviousTransactions(uniqueFamilyHeadIds: string[]) {
    for (const familyHeadId of uniqueFamilyHeadIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM HouseholdWASH WHERE FamilyHeadId = ?', [familyHeadId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM HouseholdWASH WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
          previousTransactionIds
        );
        await this.db.run(
          `DELETE FROM sync_queue WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
          previousTransactionIds
        );
      }
    }
  }

  async executeInsertQuery(query: string, params: (string | number)[]) {
    return await this.db.run(query, params);
  }

  async addToSyncQueue(generatedGUIDs: string[]) {
    for (const guid of generatedGUIDs) {
      await this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'INSERT',
        tableName: 'HouseholdWASH',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addWASHAndHouseholdWASH(description: string, familyHeadId: string) {
  //   const insertWASHQuery = `
  //     INSERT INTO WASH (Description, IsDeleted) VALUES (?, ?);
  //   `;
  //   const insertHouseholdWASHQuery = `
  //     INSERT INTO HouseholdWASH (FamilyHeadId, WASHId, IsDeleted) VALUES (?, ?, ?, ?);
  //   `;

  //   try {
  //     // Begin the transaction
  //     await this.db.execute('BEGIN TRANSACTION;');

  //     // Insert into WASH
  //     const washResult = await this.db.run(insertWASHQuery, [description, 0]);
  //     const washId = washResult.changes?.lastId;

  //     // Insert into HouseholdWASH using the newly inserted WASHId
  //     if (washId !== undefined) {
  //       await this.db.run(insertHouseholdWASHQuery, [familyHeadId, washId, 0]);
  //     } else {
  //       throw new Error('Failed to retrieve WASHId');
  //     }

  //     // Commit the transaction
  //     await this.db.execute('COMMIT;');

  //     // Reload the data
  //     await this.loadHouseholdWASH();
  //   } catch (error) {
  //     // Rollback the transaction in case of error
  //     await this.db.execute('ROLLBACK;');
  //     throw new Error('Error inserting items: ' + error);
  //   }
  // }

  async updateItem(item: HouseholdWASHs) {
    const query = `UPDATE HouseholdWASH SET FamilyHeadId = ?, WASHId = ?, IsDeleted = ? WHERE TransactionId = ?;`;
    const params = [item.FamilyHeadId, item.WASHId, item.IsDeleted, item.TransactionId];
    await this.db.run(query, params);
    await this.loadHouseholdWASH();
  }

  async deleteItem(id: string) {
    const query = `UPDATE HouseholdWASH SET IsDeleted = 1 WHERE TransactionId = ?;`;
    await this.db.run(query, [id]);
    await this.loadHouseholdWASH();
  }

  async deleteItemByFamilyHeadId(familyHeadId: string) {
    const query = `DELETE FROM HouseholdWASH WHERE FamilyHeadId = ?`;
    const response = await this.db.run(query, [familyHeadId]);
    await this.loadHouseholdWASH();
    return response;
  }

  async getHouseholdWASHByFamilyHeadId(familyHeadId: string) {
    const query = `
      SELECT h.*, w.Description
      FROM HouseholdWASH h
      JOIN WASH w ON h.WASHId = w.Oid
      WHERE h.FamilyHeadId = ? AND h.IsDeleted = 0;
    `;
    const result = await this.db.query(query, [familyHeadId]);
    return result.values;
  }
}
