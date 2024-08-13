import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ChildGrowthMonitoring } from '../../models/service-models/child-health';

@Injectable({
  providedIn: 'root',
})
export class ChildGrowthMonitoringStorageService {
  public childGrowthMonitoringDataList: BehaviorSubject<ChildGrowthMonitoring[]> = new BehaviorSubject<
    ChildGrowthMonitoring[]
  >([]);
  private isDataReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  db!: SQLiteDBConnection;

  constructor(private sqliteService: SQLiteService, private syncQueueService: SyncStorageService) {
    this.initializeDatabase().then(() => {
      console.log('Child Growth Monitoring Service initialized');
    });
  }

  async initializeDatabase() {
    this.db = await this.sqliteService.retrieveConnection();
    await this.loadChildGrowthMonitoring();
    this.isDataReady.next(true);
  }

  async loadChildGrowthMonitoring() {
    const result = await this.db.query('SELECT * FROM ChildGrowthMonitoring WHERE IsDeleted = 0;');
    this.childGrowthMonitoringDataList.next(result.values as []);
  }

  fetchData() {
    return this.childGrowthMonitoringDataList.asObservable();
  }

  async addItems(childGrowthMonitoringItems: ChildGrowthMonitoring[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();

      if (childGrowthMonitoringItems?.length > 0) {
        for (const item of childGrowthMonitoringItems) {
          if (!!item.OnlineDbOid && !!item.TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('ChildGrowthMonitoring', item.OnlineDbOid);
            await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
            return await this.updateChildGrowthMonitoringItemWithOnlineDbId(item);
          } else if (!item.OnlineDbOid && !!item.TransactionId) {
            return await this.updateChildGrowthMonitoringItem(item);
          } else {
            return await this.insertChildGrowthMonitoringItems([item]);
          }
        }
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  private async updateChildGrowthMonitoringItemWithOnlineDbId(item: ChildGrowthMonitoring): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ChildGrowthMonitoring SET
      MAUCStatus = ?,
      Weight = ?,
      Height = ?,
      WastingNutritionalOedem = ?,
      IsVitaminAGiven = ?,
      IsDewormingPillGiven = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.MAUCStatus,
      item.Weight,
      item.Height,
      item.WastingNutritionalOedem,
      item.IsVitaminAGiven,
      item.IsDewormingPillGiven,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateChildGrowthMonitoringItem(item: ChildGrowthMonitoring): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ChildGrowthMonitoring SET
      MAUCStatus = ?,
      Weight = ?,
      Height = ?,
      WastingNutritionalOedem = ?,
      IsVitaminAGiven = ?,
      IsDewormingPillGiven = ?
      WHERE
      TransactionId = ?
    `;
    const params = [
      item.MAUCStatus,
      item.Weight,
      item.Height,
      item.WastingNutritionalOedem,
      item.IsVitaminAGiven,
      item.IsDewormingPillGiven,
      item.TransactionId,
    ];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertChildGrowthMonitoringItems(
    childGrowthMonitoringItems: ChildGrowthMonitoring[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ChildGrowthMonitoring (
      TransactionId,
      ClientId,
      MAUCStatus,
      Weight,
      Height,
      WastingNutritionalOedem,
      IsVitaminAGiven,
      IsDewormingPillGiven,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = childGrowthMonitoringItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | undefined)[] = [];
    for (const item of childGrowthMonitoringItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.MAUCStatus,
        item.Weight ? item.Weight : undefined,
        item.Height ? item.Height : undefined,
        item.WastingNutritionalOedem,
        item.IsVitaminAGiven ?? 0,
        item.IsDewormingPillGiven ?? 0,
        item.IsDeleted ?? 0,
        item.CreatedBy
      );
    }
    console.log('Inserted query for child growth monitoring item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadChildGrowthMonitoring();
      return response;
    } catch (error) {
      console.error('Error in insertChildGrowthMonitoringItems: ', error);
      return null;
    }
  }

  private async deleteExistingChildGrowthMonitoringItems(
    childGrowthMonitoringItems: ChildGrowthMonitoring[]
  ): Promise<void> {
    for (const item of childGrowthMonitoringItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM ChildGrowthMonitoring WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ChildGrowthMonitoring', oid);
        }
      }

      await this.db.run('DELETE FROM ChildGrowthMonitoring WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'ChildGrowthMonitoring',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateItemById(
    Oid: string,
    childGrowthMonitoringItem: ChildGrowthMonitoring
  ): Promise<capSQLiteChanges | null> {
    const sql = `
      UPDATE ChildGrowthMonitoring
      SET
        ClientId = ?,
        MAUCStatus = ?,
        Weight = ?,
        Height = ?,
        WastingNutritionalOedem = ?,
        IsVitaminAGiven = ?,
        IsDewormingPillGiven = ?,
        IsDeleted = ?
      WHERE TransactionId = ?;
    `;
    const params = [
      childGrowthMonitoringItem.ClientId,
      childGrowthMonitoringItem.MAUCStatus,
      childGrowthMonitoringItem.Weight,
      childGrowthMonitoringItem.Height,
      childGrowthMonitoringItem.WastingNutritionalOedem,
      childGrowthMonitoringItem.IsVitaminAGiven ?? 0,
      childGrowthMonitoringItem.IsDewormingPillGiven ?? 0,
      childGrowthMonitoringItem.IsDeleted ?? 0,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      await this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'ChildGrowthMonitoring',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });

      await this.loadChildGrowthMonitoring();
      return null;
    } catch (error) {
      console.error('Error updating ChildGrowthMonitoring:', error);
      return null;
    }
  }

  async getChildGrowthMonitoringByClientId(clientId: string): Promise<ChildGrowthMonitoring> {
    const result = (
      await this.db.query('SELECT * FROM ChildGrowthMonitoring WHERE ClientId = ? AND IsDeleted = 0;', [clientId])
    )?.values?.[0];
    return result as ChildGrowthMonitoring;
  }
}
