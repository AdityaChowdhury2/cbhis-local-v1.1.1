import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { FamilyPlanningMethod, UsedFamilyPlanMethod } from '../../models/service-models/family-planning';

@Injectable({
  providedIn: 'root',
})
export class UsedFamilyPlanningStorageService {
  public UsedFamilyPlanMethodList: BehaviorSubject<UsedFamilyPlanMethod[]> = new BehaviorSubject<
    UsedFamilyPlanMethod[]
  >([]);
  private db!: SQLiteDBConnection;
  private isUsedFamilyPlanMethodReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private isFamilyPlanMethodsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public familyPlanMethodsList: BehaviorSubject<FamilyPlanningMethod[]> = new BehaviorSubject<FamilyPlanningMethod[]>(
    []
  );

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('UsedFamilyPlanMethodService initialized');
      this.loadUsedFamilyPlanMethods();
      this.loadFamilyPlanMethods();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getUsedFamilyPlanMethods();
    } catch (error) {
      console.log('database init', error);
    }
  }

  familyPlanMethodsState(): Observable<boolean> {
    return this.isFamilyPlanMethodsReady.asObservable();
  }

  UsedFamilyPlanMethodState(): Observable<boolean> {
    return this.isUsedFamilyPlanMethodReady.asObservable();
  }

  fetchFamilyPlanMethods(): Observable<FamilyPlanningMethod[]> {
    return this.familyPlanMethodsList.asObservable();
  }

  fetchUsedFamilyPlanMethods(): Observable<UsedFamilyPlanMethod[]> {
    return this.UsedFamilyPlanMethodList.asObservable();
  }

  async loadFamilyPlanMethods() {
    const familyPlanMethods: FamilyPlanningMethod[] = (await this.db.query('SELECT * FROM FamilyPlanningMethod;'))
      .values as FamilyPlanningMethod[];
    this.familyPlanMethodsList.next(familyPlanMethods);
  }

  async loadUsedFamilyPlanMethods() {
    const UsedFamilyPlanMethods: UsedFamilyPlanMethod[] = (await this.db.query('SELECT * FROM UsedFamilyPlanMethod;'))
      .values as UsedFamilyPlanMethod[];
    this.UsedFamilyPlanMethodList.next(UsedFamilyPlanMethods);
  }

  async getUsedFamilyPlanMethods() {
    await this.loadUsedFamilyPlanMethods();
    this.isUsedFamilyPlanMethodReady.next(true);
  }

  async addUsedFamilyPlanMethod(UsedFamilyPlanMethods: UsedFamilyPlanMethod[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(UsedFamilyPlanMethods);
      const uniqueClientIds = [...new Set(UsedFamilyPlanMethods.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getUsedFamilyPlanMethods();
      return response;
    } catch (error) {
      console.error('Error adding used family plan methods:', error);
      this.toast.openToast({
        message: 'Error adding used family plan methods',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the used family plan methods
  generateInsertQueryAndParams(usedFamilyPlanMethod: UsedFamilyPlanMethod[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO UsedFamilyPlanMethod (
      TransactionId,
      ClientId,
      FPMethodId,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = usedFamilyPlanMethod.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    usedFamilyPlanMethod.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.ClientId, item.FPMethodId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the used family plan methods and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM UsedFamilyPlanMethod WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM UsedFamilyPlanMethod WHERE TransactionId IN (${previousTransactionIds
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
        tableName: 'UsedFamilyPlanMethod',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  // async addUsedFamilyPlanMethod(UsedFamilyPlanMethods: UsedFamilyPlanMethod[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO UsedFamilyPlanMethod (
  //     TransactionId,
  //     ClientId,
  //     FPMethodId,
  //     IsDeleted,
  //     IsSynced,
  //     CreatedBy
  //   ) VALUES `;
  //   const placeholders = UsedFamilyPlanMethods.map(() => `( ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of UsedFamilyPlanMethods) {
  //     const { ClientId, FPMethodId, IsDeleted, IsSynced, CreatedBy } = item;
  //     params.push(generateGUID(), ClientId, FPMethodId, IsDeleted ? 1 : 0, IsSynced ?? 0, CreatedBy);
  //   }
  //   console.log(query, params);
  //   try {
  //     for (const items of UsedFamilyPlanMethods) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM UsedFamilyPlanMethod WHERE ClientId = ?;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('UsedFamilyPlanMethod', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM UsedFamilyPlanMethod WHERE ClientId = ?', [
  //         items.ClientId,
  //       ]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM UsedFamilyPlanMethod;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     if (newInsertedOidArr?.length) {
  //       for (const insertedOid of newInsertedOidArr) {
  //         await this.syncQueueService.addTransactionInQueue({
  //           id: 0,
  //           operation: 'INSERT',
  //           tableName: 'UsedFamilyPlanMethod',
  //           transactionId: insertedOid,
  //           dateCreated: dayjs().format(),
  //           createdBy: 1,
  //           dateModified: dayjs().format(),
  //           modifiedBy: 1,
  //         });
  //       }
  //     }

  //     await this.getUsedFamilyPlanMethods();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding used family planning method:', error);
  //     this.toast.openToast({
  //       message: 'Error adding used family planning method',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateUsedFamilyPlanMethodById(TransactionId: string, UsedFamilyPlanMethod: UsedFamilyPlanMethod) {
    const sql = `
    UPDATE UsedFamilyPlanMethod
    SET
      ClientId = ?,
      FPMethodId = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      UsedFamilyPlanMethod.ClientId,
      UsedFamilyPlanMethod.FPMethodId,
      UsedFamilyPlanMethod.IsDeleted ?? 0,
      UsedFamilyPlanMethod.IsSynced,
      UsedFamilyPlanMethod.OnlineDbOid,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'UsedFamilyPlanMethod',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getUsedFamilyPlanMethods();
      console.log('Used family planning method updated successfully');
      this.toast.openToast({
        message: 'Used family planning method updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating used family planning method:', error);
      this.toast.openToast({
        message: 'Error updating used family planning method',
        color: 'error',
      });
    }
  }

  async getUsedFamilyPlanMethodByClientId(clientId: string): Promise<UsedFamilyPlanMethod[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM UsedFamilyPlanMethod WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as UsedFamilyPlanMethod[];
  }

  async getUsedFamilyPlanMethodById(TransactionId: string): Promise<UsedFamilyPlanMethod | null> {
    const sql = `
      SELECT *
      FROM UsedFamilyPlanMethod
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as UsedFamilyPlanMethod;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching used family planning method by id:', error);
        return null;
      });
  }

  async deleteUsedFamilyPlanMethodById(TransactionId: string) {
    const sql = `DELETE FROM UsedFamilyPlanMethod WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getUsedFamilyPlanMethods();
    } catch (error) {
      console.error('Error deleting used family planning method:', error);
    }
  }
}
