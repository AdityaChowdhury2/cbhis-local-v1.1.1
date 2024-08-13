import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { GivenHBCService, HBCService } from '../../models/service-models/hbc';

@Injectable({
  providedIn: 'root',
})
export class GivenHBCServiceStorageService {
  public givenHBCServiceList: BehaviorSubject<GivenHBCService[]> = new BehaviorSubject<GivenHBCService[]>([]);
  private db!: SQLiteDBConnection;
  private isGivenHBCServiceReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private isHBCServiceReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public HBCServiceList: BehaviorSubject<HBCService[]> = new BehaviorSubject<HBCService[]>([]);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('GivenHBCServiceService initialized');
      this.loadGivenHBCServices();
      this.loadHBCServices();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getGivenHBCServices();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // HBC service state
  HBCServiceState(): Observable<boolean> {
    return this.isHBCServiceReady.asObservable();
  }

  givenHBCServiceState(): Observable<boolean> {
    return this.isGivenHBCServiceReady.asObservable();
  }

  fetchHBCServices(): Observable<HBCService[]> {
    return this.HBCServiceList.asObservable();
  }

  fetchGivenHBCServices(): Observable<GivenHBCService[]> {
    return this.givenHBCServiceList.asObservable();
  }

  async loadHBCServices() {
    const HBCServices: HBCService[] = (await this.db.query('SELECT * FROM HBCService;')).values as HBCService[];
    this.HBCServiceList.next(HBCServices);
  }

  async loadGivenHBCServices() {
    const givenHBCServices: GivenHBCService[] = (await this.db.query('SELECT * FROM GivenHBCService;'))
      .values as GivenHBCService[];
    this.givenHBCServiceList.next(givenHBCServices);
  }

  async getGivenHBCServices() {
    await this.loadGivenHBCServices();
    this.isGivenHBCServiceReady.next(true);
  }

  // async addGivenHBCService(givenHBCServices: GivenHBCService[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO GivenHBCService (
  //     TransactionId,
  //     ClientId,
  //     HBCServiceId,
  //     IsDeleted,
  //     IsSynced,
  //     OnlineDbOid,
  //     CreatedBy,
  //     ModifiedBy
  //   ) VALUES `;
  //   const placeholders = givenHBCServices.map(() => `(?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];
  //   const generatedGuids: string[] = [];

  //   for (const item of givenHBCServices) {
  //     const newGuid = generateGUID();
  //     generatedGuids.push(newGuid);
  //     const { ClientId, HBCServiceId, IsDeleted, IsSynced, OnlineDbOid, CreatedBy, ModifiedBy } = item;
  //     params.push(newGuid, ClientId, HBCServiceId, IsDeleted ? 1 : 0, IsSynced, OnlineDbOid, CreatedBy, ModifiedBy);
  //   }

  //   try {
  //     for (const items of givenHBCServices) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM GivenHBCService WHERE ClientId = ?;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('GivenHBCService', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM GivenHBCService WHERE ClientId = ?', [items.ClientId]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }
  //     console.log(params);
  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = await this.db
  //       .query(
  //         `SELECT TransactionId FROM GivenHBCService WHERE TransactionId IN (${generatedGuids
  //           .map(() => '?')
  //           .join(', ')})`,
  //         generatedGuids
  //       )
  //       ?.values?.map((oid) => oid.TransactionId);

  //     if (newInsertedOidArr?.length) {
  //       for (const insertedOid of newInsertedOidArr) {
  //         await this.syncQueueService.addTransactionInQueue({
  //           id: 0,
  //           operation: 'INSERT',
  //           tableName: 'GivenHBCService',
  //           transactionId: insertedOid,
  //           dateCreated: dayjs().format(),
  //           createdBy: 1, // or use actual user ID if available
  //           dateModified: dayjs().format(),
  //           modifiedBy: 1, // or use actual user ID if available
  //         });
  //       }
  //     }

  //     await this.getGivenHBCServices();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding given HBC service:', error);
  //     this.toast.openToast({
  //       message: 'Error adding given HBC service',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async addGivenHBCService(givenHBCServices: GivenHBCService[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(givenHBCServices);
      const uniqueClientIds = [...new Set(givenHBCServices.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getGivenHBCServices();
      return response;
    } catch (error) {
      console.error('Error adding given HBC service:', error);
      this.toast.openToast({
        message: 'Error adding given HBC service',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the given HBC service
  generateInsertQueryAndParams(givenHBCServices: GivenHBCService[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO GivenHBCService (
      TransactionId,
      ClientId,
      HBCServiceId,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = givenHBCServices.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    givenHBCServices.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(guid, item.ClientId, item.HBCServiceId, item.IsDeleted ? 1 : 0, item.CreatedBy);
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the given HBC service and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM GivenHBCService WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM GivenHBCService WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
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
        tableName: 'GivenHBCService',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }
  // async addGivenHBCService(givenHBCServices: GivenHBCService[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO GivenHBCService (
  //     TransactionId,
  //     ClientId,
  //     HBCServiceId,
  //     IsDeleted,
  //     IsSynced,
  //     OnlineDbOid
  //   ) VALUES `;
  //   const placeholders = givenHBCServices.map(() => `( ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of givenHBCServices) {
  //     const { ClientId, HBCServiceId, IsDeleted, IsSynced, OnlineDbOid } = item;
  //     params.push(generateGUID(), ClientId, HBCServiceId, IsDeleted ? 1 : 0, IsSynced, OnlineDbOid);
  //   }

  //   try {
  //     for (const items of givenHBCServices) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM GivenHBCService WHERE ClientId = ?;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('GivenHBCService', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM GivenHBCService WHERE ClientId = ?', [items.ClientId]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }
  //     console.log(params);
  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM GivenHBCService;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     if (newInsertedOidArr?.length) {
  //       for (const insertedOid of newInsertedOidArr) {
  //         await this.syncQueueService.addTransactionInQueue({
  //           id: 0,
  //           operation: 'INSERT',
  //           tableName: 'GivenHBCService',
  //           transactionId: insertedOid,
  //           dateCreated: dayjs().format(),
  //           createdBy: 1,
  //           dateModified: dayjs().format(),
  //           modifiedBy: 1,
  //         });
  //       }
  //     }

  //     await this.getGivenHBCServices();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding given HBC service:', error);
  //     this.toast.openToast({
  //       message: 'Error adding given HBC service',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateGivenHBCServiceById(TransactionId: string, givenHBCService: GivenHBCService) {
    const sql = `
    UPDATE GivenHBCService
    SET
      ClientId = ?,
      HBCServiceId = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      givenHBCService.ClientId,
      givenHBCService.HBCServiceId,
      givenHBCService.IsDeleted ?? 0,
      givenHBCService.IsSynced,
      givenHBCService.OnlineDbOid,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'GivenHBCService',
        transactionId: TransactionId,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getGivenHBCServices();
      console.log('Given HBC service updated successfully');
      this.toast.openToast({
        message: 'Given HBC service updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating given HBC service:', error);
      this.toast.openToast({
        message: 'Error updating given HBC service',
        color: 'error',
      });
    }
  }

  async getGivenHBCServiceByClientId(clientId: string): Promise<GivenHBCService[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM GivenHBCService WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as GivenHBCService[];
  }

  async getGivenHBCServiceById(TransactionId: string): Promise<GivenHBCService | null> {
    const sql = `
      SELECT *
      FROM GivenHBCService
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as GivenHBCService;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching given HBC service by id:', error);
        return null;
      });
  }

  async deleteGivenHBCServiceById(TransactionId: string) {
    const sql = `DELETE FROM GivenHBCService WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getGivenHBCServices();
    } catch (error) {
      console.error('Error deleting given HBC service:', error);
    }
  }

  // delete GivenHBCService by client id for all client
  async deleteGivenHBCServiceByClientId(clientIds: string[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    try {
      const placeholders = clientIds.map(() => '?').join(', ');
      const deleteSql = `DELETE FROM GivenHBCService WHERE ClientId IN (${placeholders})`;
      const response = await this.db.run(deleteSql, clientIds);

      await this.getGivenHBCServices();
      return response;
      // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting HBC service category by client ID:', error);
      return null;
    }
  }
}
