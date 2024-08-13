import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { NCDScreening } from '../../models/service-models/ncd';

@Injectable({
  providedIn: 'root',
})
export class NCDScreeningStorageService {
  public ncdScreeningList: BehaviorSubject<NCDScreening[]> = new BehaviorSubject<NCDScreening[]>([]);
  private db!: SQLiteDBConnection;
  private isNCDScreeningReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('NCDScreeningService initialized');
      this.loadNCDScreenings();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getNCDScreenings();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the NCDScreenings as observable
  ncdScreeningState(): Observable<boolean> {
    return this.isNCDScreeningReady.asObservable();
  }

  // Send all the NCDScreenings List as observable
  fetchNCDScreenings(): Observable<NCDScreening[]> {
    return this.ncdScreeningList.asObservable();
  }

  // Load all the NCDScreenings records from the database
  async loadNCDScreenings() {
    const ncdScreenings: NCDScreening[] = (await this.db.query('SELECT * FROM NCDScreening;')).values as NCDScreening[];
    this.ncdScreeningList.next(ncdScreenings);
  }

  async getNCDScreenings() {
    await this.loadNCDScreenings();
    this.isNCDScreeningReady.next(true);
  }

  async addNCDScreening(ncdScreenings: NCDScreening[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      if (ncdScreenings?.length > 0) {
        for (const item of ncdScreenings) {
          if (!!item.OnlineDbOid && !!item.TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('NCDScreening', item.OnlineDbOid);
            await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
            return await this.updateNCDScreeningItemWithOnlineDbId(item);
          } else if (!item.OnlineDbOid && !!item.TransactionId) {
            return await this.updateNCDScreeningItem(item);
          } else {
            return await this.insertNCDScreeningItems([item]);
          }
        }
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  private async updateNCDScreeningItemWithOnlineDbId(item: NCDScreening): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE NCDScreening SET
      WaterIntake = ?,
      IsClientSmoking = ?,
      BreathingDifficulty = ?,
      Exercise = ?,
      HeartRateRaisingActivity = ?,
      VegetableConsumption = ?,
      FruitConsumption = ?,
      IsSweetenedFoodConsumed = ?,
      IsRefinedWheatConsumed = ?,
      SaltIntake = ?,
      AlcoholConsumption = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.WaterIntake ?? 0,
      item.IsClientSmoking ?? 0,
      item.BreathingDifficulty ?? 0,
      item.Exercise ?? 0,
      item.HeartRateRaisingActivity ?? 0,
      item.VegetableConsumption,
      item.FruitConsumption,
      item.IsSweetenedFoodConsumed ?? 0,
      item.IsRefinedWheatConsumed ?? 0,
      item.SaltIntake ?? 0,
      item.AlcoholConsumption ?? 0,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateNCDScreeningItem(item: NCDScreening): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE NCDScreening SET
      WaterIntake = ?,
      IsClientSmoking = ?,
      BreathingDifficulty = ?,
      Exercise = ?,
      HeartRateRaisingActivity = ?,
      VegetableConsumption = ?,
      FruitConsumption = ?,
      IsSweetenedFoodConsumed = ?,
      IsRefinedWheatConsumed = ?,
      SaltIntake = ?,
      AlcoholConsumption = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
      WHERE
      TransactionId = ?
    `;
    const params = [
      item.WaterIntake ?? 0,
      item.IsClientSmoking ?? 0,
      item.BreathingDifficulty ?? 0,
      item.Exercise ?? 0,
      item.HeartRateRaisingActivity ?? 0,
      item.VegetableConsumption,
      item.FruitConsumption,
      item.IsSweetenedFoodConsumed ?? 0,
      item.IsRefinedWheatConsumed ?? 0,
      item.SaltIntake ?? 0,
      item.AlcoholConsumption ?? 0,
      item.IsDeleted ?? 0,
      item.IsSynced ?? 0,
      item.OnlineDbOid,
      item.TransactionId,
    ];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertNCDScreeningItems(ncdScreeningItems: NCDScreening[]): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO NCDScreening (
      TransactionId,
      ClientId,
      WaterIntake,
      IsClientSmoking,
      BreathingDifficulty,
      Exercise,
      HeartRateRaisingActivity,
      VegetableConsumption,
      FruitConsumption,
      IsSweetenedFoodConsumed,
      IsRefinedWheatConsumed,
      SaltIntake,
      AlcoholConsumption,
      IsDeleted,
      IsSynced,
      OnlineDbOid,
      CreatedBy
    ) VALUES `;
    const placeholders = ncdScreeningItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | null | undefined)[] = [];
    for (const item of ncdScreeningItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.WaterIntake,
        item.IsClientSmoking ?? 0,
        item.BreathingDifficulty ?? 0,
        item.Exercise ?? 0,
        item.HeartRateRaisingActivity ?? 0,
        item.VegetableConsumption,
        item.FruitConsumption,
        item.IsSweetenedFoodConsumed ?? 0,
        item.IsRefinedWheatConsumed ?? 0,
        item.SaltIntake ?? 0,
        item.AlcoholConsumption ?? 0,
        item.IsDeleted ?? 0,
        item.IsSynced,
        item.OnlineDbOid,
        item.CreatedBy
      );
    }
    console.log('Inserted query for NCDScreening item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadNCDScreenings();
      return response;
    } catch (error) {
      console.error('Error in insertNCDScreeningItems: ', error);
      return null;
    }
  }

  private async deleteExistingNCDScreeningItems(ncdScreeningItems: NCDScreening[]): Promise<void> {
    for (const item of ncdScreeningItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM NCDScreening WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('NCDScreening', oid);
        }
      }

      await this.db.run('DELETE FROM NCDScreening WHERE ClientId = ?', [item.ClientId]);
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
    console.log('operation ==>', operation, transactionId);
    await this.syncQueueService.addTransactionInQueue({
      id: 0,
      operation,
      tableName: 'NCDScreening',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateNCDScreeningById(TransactionId: string, ncdScreening: NCDScreening) {
    const sql = `
    UPDATE NCDScreening
    SET
      ClientId = ?,
      WaterIntake = ?,
      IsClientSmoking = ?,
      BreathingDifficulty = ?,
      Exercise = ?,
      HeartRateRaisingActivity = ?,
      VegetableConsumption = ?,
      FruitConsumption = ?,
      IsSweetenedFoodConsumed = ?,
      IsRefinedWheatConsumed = ?,
      SaltIntake = ?,
      AlcoholConsumption = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      ncdScreening.ClientId,
      ncdScreening.WaterIntake,
      ncdScreening.IsClientSmoking ?? 0,
      ncdScreening.BreathingDifficulty ?? 0,
      ncdScreening.Exercise ?? 0,
      ncdScreening.HeartRateRaisingActivity ?? 0,
      ncdScreening.VegetableConsumption,
      ncdScreening.FruitConsumption,
      ncdScreening.IsSweetenedFoodConsumed ?? 0,
      ncdScreening.IsRefinedWheatConsumed ?? 0,
      ncdScreening.SaltIntake ?? 0,
      ncdScreening.AlcoholConsumption ?? 0,
      ncdScreening.IsDeleted ?? 0,
      ncdScreening.IsSynced,
      ncdScreening.OnlineDbOid,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);
      await this.getNCDScreenings();
      console.log('NCD screening updated successfully');
      this.toast.openToast({
        message: 'NCD screening updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating NCD screening:', error);
      this.toast.openToast({
        message: 'Error updating NCD screening',
        color: 'error',
      });
    }
  }

  async getNCDScreeningByClientId(clientId: string): Promise<NCDScreening[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(`SELECT * FROM NCDScreening WHERE ClientId = ? AND IsDeleted = 0;`, [clientId]);
    return result.values as NCDScreening[];
  }

  async getNCDScreeningById(TransactionId: string): Promise<NCDScreening | null> {
    const sql = `
      SELECT *
      FROM NCDScreening
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as NCDScreening;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching NCD screening by id:', error);
        return null;
      });
  }

  async deleteNCDScreeningById(TransactionId: string) {
    const sql = `DELETE FROM NCDScreening WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getNCDScreenings();
    } catch (error) {
      console.error('Error deleting NCD screening:', error);
    }
  }
}
