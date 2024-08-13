import { generateGUID } from './../../../shared/utils/common';
// src/app/services/household-drinking-water.service.ts
import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { DrinkingWaterSource } from '../models/drinking-water-source';
import { HouseholdDrinkingWater } from '../models/household-drinking-water';

@Injectable({
  providedIn: 'root',
})
export class HouseholdDrinkingWaterSourceStorageService {
  // private db!: SQLiteDBConnection;
  public db!: SQLiteDBConnection;
  private isReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataList: BehaviorSubject<HouseholdDrinkingWater[]> = new BehaviorSubject<HouseholdDrinkingWater[]>([]);

  private isHouseholdDrinkingWaterReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public drinkingWaterList: BehaviorSubject<DrinkingWaterSource[]> = new BehaviorSubject<DrinkingWaterSource[]>([]);

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
    await this.loadHouseholdDrinkingWater();
    await this.loadDrinkingWaterSources();
    this.isHouseholdDrinkingWaterReady.next(true);
    this.isReady.next(true);
  }

  async loadDrinkingWaterSources() {
    const result = await this.db.query('SELECT * FROM DrinkingWaterSource WHERE IsDeleted = 0;');
    this.drinkingWaterList.next(result.values as DrinkingWaterSource[]);
  }

  fetchDrinkingWaterSources() {
    return this.drinkingWaterList.asObservable();
  }

  async loadHouseholdDrinkingWater() {
    const result = await this.db.query('SELECT * FROM HouseholdDrinkingWater WHERE IsDeleted = 0;');
    console.log('this. db.query result', result.values);
    this.dataList.next(result.values as HouseholdDrinkingWater[]);
  }

  fetchData() {
    return this.dataList.asObservable();
  }

  async getHouseholdDrinkingWater() {
    await this.loadHouseholdDrinkingWater();
    this.isHouseholdDrinkingWaterReady.next(true);
  }

  // * Add a new item to the HouseholdDrinkingWaters table
  async addItem(householdDrinkingWater: HouseholdDrinkingWater[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(householdDrinkingWater);
      const uniqueFamilyHeadIds = [...new Set(householdDrinkingWater.map((item) => item.FamilyHeadId))];
      await this.deletePreviousTransactions(uniqueFamilyHeadIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getHouseholdDrinkingWater();
      return response;
    } catch (error) {
      console.error('Error adding household drinking water:', error);
      this.toast.openToast({
        message: 'Error adding household drinking water',
        color: 'error',
      });
      return null;
    }
  }

  generateInsertQueryAndParams(householdDrinkingWater: HouseholdDrinkingWater[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO HouseholdDrinkingWater (
      TransactionId,
      FamilyHeadId,
      DrinkingWaterSourceId,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = householdDrinkingWater.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    householdDrinkingWater.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.FamilyHeadId, item.DrinkingWaterSourceId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    return { query, params, generatedGUIDs };
  }

  async deletePreviousTransactions(uniqueFamilyHeadIds: string[]) {
    for (const familyHeadId of uniqueFamilyHeadIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM HouseholdDrinkingWater WHERE FamilyHeadId = ?', [familyHeadId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM HouseholdDrinkingWater WHERE TransactionId IN (${previousTransactionIds
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
        tableName: 'HouseholdDrinkingWater',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }
  //   async addItem(items: HouseholdDrinkingWater[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const currentUser = await this.authService.getCurrentLoginStatus();

  //   console.log(currentUser?.Oid);

  //   if (currentUser) {
  //     const baseQuery = `INSERT INTO HouseholdDrinkingWater (
  //   TransactionId,
  //   FamilyHeadId,
  //   DrinkingWaterSourceId,
  //   IsDeleted,
  //   CreatedBy
  // ) VALUES `;

  //     const placeholders = items.map(() => `(?, ?, ?, ?, ?)`).join(', ');
  //     const query = baseQuery + placeholders + ';';

  //     const params: (string | number | boolean)[] = [];

  //     for (const item of items) {
  //       params.push(
  //         generateGUID(),
  //         item.FamilyHeadId,
  //         item.DrinkingWaterSourceId,
  //         item.IsDeleted ? 1 : 0,
  //         item.CreatedBy
  //       );
  //     }

  //     console.log(query, params);

  //     try {
  //       console.log('FamilyHeadId: ', items[0]?.FamilyHeadId);
  //       const OidForFamilyHead = (
  //         await this.db.query('SELECT TransactionId FROM HouseholdDrinkingWater WHERE FamilyHeadId = ?;', [
  //           items[0]?.FamilyHeadId,
  //         ])
  //       ).values?.map((source) => source.TransactionId);

  //       // delete the data from sync queue
  //       if (OidForFamilyHead?.length) {
  //         console.log('OidForFamilyHead for delete operation : ', OidForFamilyHead);
  //         for (const oid of OidForFamilyHead) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('HouseholdDrinkingWaters', oid);
  //         }
  //       }

  //       // Delete the existing items
  //       const deleteResponse = await this.db.run('DELETE FROM HouseholdDrinkingWater WHERE FamilyHeadId = ?', [
  //         items[0]?.FamilyHeadId,
  //       ]);

  //       console.log('Deleted Response: ', deleteResponse);

  //       // Execute the query with the parameters
  //       const response = await this.db.run(query, params);

  //       // get the Oid of the inserted items
  //       const newInsertedOidArr = (
  //         await this.db.query('SELECT TransactionId FROM HouseholdDrinkingWater;')
  //       ).values?.map((oid) => oid.TransactionId);

  //       // Add the transaction to the sync queue for all new InsertedOid
  //       if (newInsertedOidArr?.length) {
  //         for (const insertedOid of newInsertedOidArr) {
  //           await this.syncQueueService.addTransactionInQueue({
  //             id: 0,
  //             operation: 'INSERT',
  //             tableName: 'HouseholdDrinkingWater',
  //             transactionId: insertedOid,
  //             dateCreated: dayjs().format(),
  //             createdBy: 1,
  //             dateModified: dayjs().format(),
  //             modifiedBy: 1,
  //           });
  //         }
  //       }

  //       // Reload the data
  //       await this.loadData();

  //       return response;
  //     } catch (error) {
  //       console.error('Error in addItem: ', error);
  //       return null;
  //     }
  //   } else {
  //     console.log('Current user not found', currentUser);
  //     return null;
  //   }
  // }

  // async addItem(items: HouseholdDrinkingWater[]): Promise<capSQLiteChanges> {
  //   console.log('HouseholdDrinkingWaterSourceStorageService -> addItem -> items', items);
  //   // Prepare the base query with placeholders for each item
  //   const baseQuery = `INSERT INTO HouseholdDrinkingWaters (FamilyHeadId, DrinkingWaterSourceId, IsDeleted) VALUES `;
  //   const placeholders = items.map(() => `(?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   // Prepare the parameters for each item
  //   const params: (string | number)[] = [];
  //   for (const item of items) {
  //     params.push(item.FamilyHeadId, item.DrinkingWaterSourceId, item.IsDeleted);
  //   }
  //   console.log(params);
  //   console.log(query);

  //   // Delete the existing items
  //   await this.db.run('DELETE FROM HouseholdDrinkingWaters WHERE FamilyHeadId = ?', [items[0].FamilyHeadId]);

  //   // Execute the query with the parameters
  //   const response = await this.db.run(query, params);

  //   // Reload the data
  //   await this.loadData();

  //   return response;
  // }

  async updateItem(item: HouseholdDrinkingWater) {
    const query = `UPDATE HouseholdDrinkingWater SET FamilyHeadId = ?, DrinkingWaterSourceId = ?, IsDeleted = ? WHERE Oid = ?;`;
    const params = [item.FamilyHeadId, item.DrinkingWaterSourceId, item.IsDeleted, item.TransactionId];
    await this.db.run(query, params);
    await this.loadHouseholdDrinkingWater();
  }

  async deleteItem(id: number) {
    const query = `UPDATE HouseholdDrinkingWater SET IsDeleted = 1 WHERE Oid = ?;`;
    await this.db.run(query, [id]);
    await this.loadHouseholdDrinkingWater();
  }
  async deleteItemByFamilyHeadId(familyHeadId: string) {
    const query = `DELETE FROM HouseholdDrinkingWater WHERE FamilyHeadId = ?`;
    const response = await this.db.run(query, [familyHeadId]);
    await this.loadHouseholdDrinkingWater();
    return response;
  }

  async addDrinkingWaterSourceAndHouseholdWater(description: string, familyHeadId: string) {
    const insertDrinkingWaterSourceQuery = `
        INSERT INTO DrinkingWaterSource (Description, IsDeleted) VALUES (?, ?);
      `;
    const insertHouseholdDrinkingWaterQuery = `
        INSERT INTO HouseholdDrinkingWater (FamilyHeadId, DrinkingWaterSourceId, IsDeleted) VALUES (?, ?, ?);
      `;

    try {
      // Begin the transaction
      // await this.db.execute('BEGIN TRANSACTION;');

      // Insert into DrinkingWaterSource
      const drinkingWaterSourceResult = await this.db.run(insertDrinkingWaterSourceQuery, [description, 0]);
      const drinkingWaterSourceId = drinkingWaterSourceResult.changes?.lastId;

      // Insert into HouseholdDrinkingWaters using the newly inserted DrinkingWaterSourceId
      if (drinkingWaterSourceId !== undefined) {
        await this.db.run(insertHouseholdDrinkingWaterQuery, [familyHeadId, drinkingWaterSourceId, 0]);
      } else {
        throw new Error('Failed to retrieve DrinkingWaterSourceId');
      }

      // Commit the transaction
      // await this.db.execute('COMMIT;');

      // Reload the data
      await this.loadHouseholdDrinkingWater();
    } catch (error) {
      // Rollback the transaction in case of error
      // await this.db.execute('ROLLBACK;');
      throw new Error('Error inserting items: ' + error);
    }
  }

  async getHouseholdDrinkingWaterByFamilyHeadId(familyHeadId: string) {
    const query = `
        SELECT h.*, d.Description
        FROM HouseholdDrinkingWater as h
        JOIN DrinkingWaterSource d ON h.DrinkingWaterSourceId = d.Oid
        WHERE h.FamilyHeadId = ? AND h.IsDeleted = 0;
      `;
    const result = await this.db.query(query, [familyHeadId]);
    return result.values;
  }
}
