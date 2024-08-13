import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';

import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { HouseholdSafeWaterSource } from '../models/household-safe-water-source';
import { SafeWaterSource } from '../models/safe-water-source';

@Injectable({
  providedIn: 'root',
})
export class HouseholdSafeWaterStorageService {
  // private db!: SQLiteDBConnection;
  db!: SQLiteDBConnection;
  private isHouseholdSafeWaterSourceReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public householdSafeWaterSourceList: BehaviorSubject<HouseholdSafeWaterSource[]> = new BehaviorSubject<
    HouseholdSafeWaterSource[]
  >([]);

  private isHouseholdSafeWaterReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public safeWaterList: BehaviorSubject<SafeWaterSource[]> = new BehaviorSubject<SafeWaterSource[]>([]);

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
    await this.loadHouseholdSafeWaterSource();
    await this.loadSafeWaterData();
    this.isHouseholdSafeWaterReady.next(true);
    this.isHouseholdSafeWaterSourceReady.next(true);
  }

  async loadSafeWaterData() {
    const result = await this.db.query('SELECT * FROM SafeWaterSource WHERE IsDeleted = 0;');
    this.safeWaterList.next(result.values as SafeWaterSource[]);
  }

  async loadHouseholdSafeWaterSource() {
    const householdSafeWaterSource: HouseholdSafeWaterSource[] = (
      await this.db.query('SELECT * FROM HouseholdSafeWaterSource WHERE IsDeleted = 0;')
    ).values as HouseholdSafeWaterSource[];
    this.householdSafeWaterSourceList.next(householdSafeWaterSource);
  }

  async getHouseholdSafeWaterSource() {
    await this.loadHouseholdSafeWaterSource();
    this.isHouseholdSafeWaterSourceReady.next(true);
  }

  fetchSafeWaterData() {
    return this.safeWaterList.asObservable();
  }

  fetchData() {
    return this.householdSafeWaterSourceList.asObservable();
  }

  // * Add a new item to the HouseholdSafeWaterSources table
  async addItems(householdSafeWaterSource: HouseholdSafeWaterSource[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(householdSafeWaterSource);
      const uniqueFamilyHeadIds = [...new Set(householdSafeWaterSource.map((item) => item.FamilyHeadId))];
      await this.deletePreviousTransactions(uniqueFamilyHeadIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getHouseholdSafeWaterSource();
      return response;
    } catch (error) {
      console.error('Error adding household safe water source:', error);
      this.toast.openToast({
        message: 'Error adding household safe water source',
        color: 'error',
      });
      return null;
    }
  }

  generateInsertQueryAndParams(householdSafeWaterSource: HouseholdSafeWaterSource[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO HouseholdSafeWaterSource (
      TransactionId,
      FamilyHeadId,
      SafeWaterSourceId,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = householdSafeWaterSource.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    householdSafeWaterSource.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.FamilyHeadId, item.SafeWaterSourceId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    return { query, params, generatedGUIDs };
  }

  async deletePreviousTransactions(uniqueFamilyHeadIds: string[]) {
    for (const familyHeadId of uniqueFamilyHeadIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM HouseholdSafeWaterSource WHERE FamilyHeadId = ?', [familyHeadId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM HouseholdSafeWaterSource WHERE TransactionId IN (${previousTransactionIds
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

  async executeInsertQuery(query: string, params: (string | number)[]) {
    return await this.db.run(query, params);
  }

  async addToSyncQueue(generatedGUIDs: string[]) {
    for (const guid of generatedGUIDs) {
      await this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'INSERT',
        tableName: 'HouseholdSafeWaterSource',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }
  // async addItems(items: HouseholdSafeWaterSource[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO HouseholdSafeWaterSource (
  //       TransactionId,
  //       FamilyHeadId,
  //       SafeWaterSourceId,
  //       IsDeleted,
  //       CreatedBy
  //     ) VALUES `;

  //   const placeholders = items.map(() => `(?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (string | number | boolean)[] = [];

  //   for (const item of items) {
  //     params.push(generateGUID(), item.FamilyHeadId, item.SafeWaterSourceId, item.IsDeleted ?? 0, item.CreatedBy);
  //   }

  //   console.log(params);

  //   try {
  //     console.log('FamilyHeadId: ', items[0]?.FamilyHeadId);
  //     const OidForFamilyHead = (
  //       await this.db.query('SELECT TransactionId FROM HouseholdSafeWaterSource WHERE FamilyHeadId = ?;', [
  //         items[0]?.FamilyHeadId,
  //       ])
  //     ).values?.map((oid) => oid.TransactionId);

  //     // delete the data from sync queue
  //     if (OidForFamilyHead?.length) {
  //       console.log('OidForFamilyHead for delete operation : ', OidForFamilyHead);
  //       for (const oid of OidForFamilyHead) {
  //         await this.syncQueueService.deleteQueueByTableAndTransactionId('HouseholdSafeWaterSources', oid);
  //       }
  //     }

  //     // Delete the existing items
  //     const deleteResponse = await this.db.run('DELETE FROM HouseholdSafeWaterSource WHERE FamilyHeadId = ?', [
  //       items[0]?.FamilyHeadId,
  //     ]);

  //     console.log('Deleted Response: ', deleteResponse);

  //     // Execute the query with the parameters
  //     const response = await this.db.run(query, params);

  //     // get the Oid of the inserted items
  //     const newInsertedOidArr = (
  //       await this.db.query('SELECT TransactionId FROM HouseholdSafeWaterSource;')
  //     ).values?.map((oid) => oid.TransactionId);

  //     // Add the transaction to the sync queue for all new InsertedOid
  //     if (newInsertedOidArr?.length) {
  //       for (const insertedOid of newInsertedOidArr) {
  //         await this.syncQueueService.addTransactionInQueue({
  //           id: 0,
  //           operation: 'INSERT',
  //           tableName: 'HouseholdSafeWaterSource',
  //           transactionId: insertedOid,
  //           dateCreated: dayjs().format(),
  //           createdBy: 1,
  //           dateModified: dayjs().format(),
  //           modifiedBy: 1,
  //         });
  //       }
  //     }

  //     // Reload the data
  //     await this.loadHouseholdSafeWaterSource();

  //     return response;
  //   } catch (error) {
  //     console.error('Error in addItems: ', error);
  //     return null;
  //   }
  // }

  // async addItems(items: HouseholdSafeWaterSource[]): Promise<capSQLiteChanges> {
  //   console.log('HouseholdSafeWaterStorageService -> addItems -> items', items);
  //   // Prepare the base query with placeholders for each item
  //   const baseQuery = `INSERT INTO HouseholdSafeWaterSources (FamilyHeadId, SafeWaterSourceId, IsDeleted) VALUES `;
  //   const placeholders = items.map(() => `(?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   // Prepare the parameters for each item
  //   const params: (string | number)[] = [];
  //   for (const item of items) {
  //     params.push(item.FamilyHeadId, item.SafeWaterSourceId, item.IsDeleted);
  //   }
  //   console.log(params);
  //   console.log(query);

  //   // Delete the existing items
  //   await this.db.run('DELETE FROM HouseholdSafeWaterSources WHERE FamilyHeadId = ?', [items[0].FamilyHeadId]);

  //   // Execute the query with the parameters
  //   const response = await this.db.run(query, params);

  //   // Reload the data
  //   await this.loadHouseholdSafeWaterSource();

  //   return response;
  // }

  async addSafeWaterSourceAndHouseholdSafeWater(description: string, familyHeadId: string) {
    const insertSafeWaterSourceQuery = `
      INSERT INTO SafeWaterSource (Description, IsDeleted) VALUES (?, ?);
    `;
    const insertHouseholdSafeWaterSourceQuery = `
      INSERT INTO HouseholdSafeWaterSource (FamilyHeadId, SafeWaterSourceId, IsDeleted) VALUES (?, ?, ?, ?);
    `;

    try {
      // Begin the transaction
      await this.db.execute('BEGIN TRANSACTION;');

      // Insert into SafeWaterSources
      const safeWaterSourceResult = await this.db.run(insertSafeWaterSourceQuery, [description, 0]);
      const safeWaterSourceId = safeWaterSourceResult.changes?.lastId;

      // Insert into HouseholdSafeWaterSources using the newly inserted SafeWaterSourceId
      if (safeWaterSourceId !== undefined) {
        await this.db.run(insertHouseholdSafeWaterSourceQuery, [familyHeadId, safeWaterSourceId, 0]);
      } else {
        throw new Error('Failed to retrieve SafeWaterSourceId');
      }

      // Commit the transaction
      await this.db.execute('COMMIT;');

      // Reload the data
      await this.loadHouseholdSafeWaterSource();
    } catch (error) {
      // Rollback the transaction in case of error
      await this.db.execute('ROLLBACK;');
      throw new Error('Error inserting items: ' + error);
    }
  }

  async updateItem(item: HouseholdSafeWaterSource) {
    const query = `UPDATE HouseholdSafeWaterSource SET FamilyHeadId = ?, SafeWaterSourceId = ?, IsDeleted = ? WHERE Oid = ?;`;
    const params = [item.FamilyHeadId, item.SafeWaterSourceId, item.IsDeleted, item.TransactionId];
    await this.db.run(query, params);
    await this.loadHouseholdSafeWaterSource();
  }

  async deleteItem(id: string) {
    const query = `UPDATE HouseholdSafeWaterSource SET IsDeleted = 1 WHERE Oid = ?;`;
    await this.db.run(query, [id]);
    await this.loadHouseholdSafeWaterSource();
  }

  async deleteItemByFamilyHeadId(familyHeadId: string) {
    const query = `DELETE FROM HouseholdSafeWaterSource WHERE FamilyHeadId = ?`;
    const response = await this.db.run(query, [familyHeadId]);
    await this.loadHouseholdSafeWaterSource();
    return response;
  }

  async getHouseholdSafeWaterByFamilyHeadId(familyHeadId: string) {
    const query = `
      SELECT h.*, s.Description
      FROM HouseholdSafeWaterSource h
      JOIN SafeWaterSource s ON h.SafeWaterSourceId = s.Oid
      WHERE h.FamilyHeadId = ? AND h.IsDeleted = 0;
    `;
    const result = await this.db.query(query, [familyHeadId]);
    return result.values;
  }
}
