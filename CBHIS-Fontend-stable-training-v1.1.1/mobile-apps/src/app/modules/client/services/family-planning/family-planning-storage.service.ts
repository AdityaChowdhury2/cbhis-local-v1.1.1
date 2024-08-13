import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { FamilyPlan } from '../../models/service-models/family-planning';

@Injectable({
  providedIn: 'root',
})
export class FamilyPlanningStorageService {
  public familyPlanningList: BehaviorSubject<FamilyPlan[]> = new BehaviorSubject<FamilyPlan[]>([]);
  private db!: SQLiteDBConnection;
  private isFamilyPlanningReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('FamilyPlanningService initialized');
      this.loadFamilyPlanning();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getFamilyPlanning();
    } catch (error) {
      console.log('database init', error);
    }
  }

  familyPlanningState(): Observable<boolean> {
    return this.isFamilyPlanningReady.asObservable();
  }

  fetchFamilyPlanning(): Observable<FamilyPlan[]> {
    return this.familyPlanningList.asObservable();
  }

  async loadFamilyPlanning() {
    const familyPlanning: FamilyPlan[] = (await this.db.query('SELECT * FROM FamilyPlan;')).values as FamilyPlan[];
    this.familyPlanningList.next(familyPlanning);
  }

  async getFamilyPlanning() {
    await this.loadFamilyPlanning();
    this.isFamilyPlanningReady.next(true);
  }

  async addItems(familyPlanItems: FamilyPlan[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    console.log('this. family plan items ', familyPlanItems);

    if (familyPlanItems?.length > 0) {
      for (const item of familyPlanItems) {
        if (!!item.OnlineDbOid && !!item.TransactionId) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('FamilyPlan', item.OnlineDbOid);
          console.log('Family plan update');
          await this.addTransactionToQueue('UPDATE', item?.OnlineDbOid);
          return await this.updateFamilyPlanItemWithOnlineDbId(item);
        } else if (!item.OnlineDbOid && !!item.TransactionId) {
          return await this.updateFamilyPlanItem(item);
        } else {
          return await this.insertFamilyPlanItems([item]);
        }
      }
    }

    return null;
  }

  private async updateFamilyPlanItemWithOnlineDbId(item: FamilyPlan): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
        UPDATE FamilyPlan SET
        IsPlanningToBePregnant = ?,
        ModifiedBy = ?
        WHERE
        TransactionId = ?
        AND
        OnlineDbOid = ?
    `;
    const params = [item.IsPlanningToBePregnant ?? 0, item.ModifiedBy, item.TransactionId, item.OnlineDbOid];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateFamilyPlanItem(item: FamilyPlan): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE FamilyPlan SET
      IsPlanningToBePregnant = ?
      WHERE
      TransactionId = ?
  `;
    const params = [item.IsPlanningToBePregnant ?? 0, item.TransactionId];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertFamilyPlanItems(familyPlanItems: FamilyPlan[]): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO FamilyPlan (
        TransactionId,
        IsPlanningToBePregnant,
        ClientId,
        IsDeleted,
        CreatedBy
    ) VALUES `;
    const placeholders = familyPlanItems.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    console.log('Inserted query for family plan item', query);

    const params: (string | number | boolean)[] = [];
    for (const item of familyPlanItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(newGuid, item.IsPlanningToBePregnant ?? 0, item.ClientId, item.IsDeleted ?? 0, item.CreatedBy);
    }
    console.log('params', params);
    try {
      // Execute the query with the parameters
      const response = await this.db.run(query, params);

      // Add the transaction to the sync queue for all new InsertedOid
      await this.addNewTransactionsToQueue(generateGUIDs);

      // Reload the data
      await this.loadFamilyPlanning();

      return response;
    } catch (error) {
      console.error('Error in insertFamilyPlanItems: ', error);
      return null;
    }
  }

  private async addNewTransactionsToQueue(newGUIDs: string[]): Promise<void> {
    if (newGUIDs?.length) {
      for (const insertedOid of newGUIDs) {
        await this.addTransactionToQueue('INSERT', insertedOid);
      }
    }
  }

  private async addTransactionToQueue(operation: 'INSERT' | 'UPDATE', transactionId: string): Promise<void> {
    console.log('transaction operation ', operation);
    await this.syncQueueService.addTransactionInQueue({
      id: 0,
      operation,
      tableName: 'FamilyPlan',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateFamilyPlanningById(TransactionId: string, familyPlanning: FamilyPlan) {
    const sql = `
    UPDATE FamilyPlan
    SET
      ClientId = ?,
      IsPlanningToBePregnant = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      familyPlanning.ClientId,
      familyPlanning.IsPlanningToBePregnant,
      familyPlanning.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'FamilyPlan',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getFamilyPlanning();
      console.log('Family planning updated successfully');
      this.toast.openToast({
        message: 'Family planning updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating family planning:', error);
      this.toast.openToast({
        message: 'Error updating family planning',
        color: 'error',
      });
    }
  }

  async getFamilyPlanningByClientId(clientId: string): Promise<FamilyPlan[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM FamilyPlan WHERE ClientId = ? AND IsDeleted = 0;', [clientId]);
    console.log(result.values);
    return result.values as FamilyPlan[];
  }

  async getFamilyPlanningById(TransactionId: string): Promise<FamilyPlan | null> {
    const sql = `
      SELECT *
      FROM FamilyPlan
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as FamilyPlan;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching family planning by id:', error);
        return null;
      });
  }

  async deleteFamilyPlanningById(TransactionId: string) {
    const sql = `DELETE FROM FamilyPlan WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getFamilyPlanning();
    } catch (error) {
      console.error('Error deleting family planning:', error);
    }
  }
}
