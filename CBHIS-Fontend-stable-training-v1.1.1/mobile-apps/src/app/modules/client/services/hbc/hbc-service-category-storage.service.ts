import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { HBCServiceCategory, ServiceCategory } from '../../models/service-models/hbc';

@Injectable({
  providedIn: 'root',
})
export class HBCServiceCategoryStorageService {
  public hbcServiceCategoryList: BehaviorSubject<HBCServiceCategory[]> = new BehaviorSubject<HBCServiceCategory[]>([]);
  private db!: SQLiteDBConnection;
  private isHBCServiceCategoryReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public serviceCategoryList: BehaviorSubject<ServiceCategory[]> = new BehaviorSubject<ServiceCategory[]>([]);
  private isServiceCategoryReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('HBCServiceCategoryService initialized');
      this.loadHBCServiceCategories();
      this.loadServiceCategories();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getHBCServiceCategories();
    } catch (error) {
      console.log('database init', error);
    }
  }

  serviceCategoryState(): Observable<boolean> {
    return this.isServiceCategoryReady.asObservable();
  }

  hbcServiceCategoryState(): Observable<boolean> {
    return this.isHBCServiceCategoryReady.asObservable();
  }

  fetchServiceCategories(): Observable<ServiceCategory[]> {
    return this.serviceCategoryList.asObservable();
  }

  fetchHBCServiceCategories(): Observable<HBCServiceCategory[]> {
    return this.hbcServiceCategoryList.asObservable();
  }

  async loadServiceCategories() {
    const serviceCategories: ServiceCategory[] = (await this.db.query('SELECT * FROM ServiceCategory;'))
      .values as ServiceCategory[];
    this.serviceCategoryList.next(serviceCategories);
  }

  async loadHBCServiceCategories() {
    const hbcServiceCategories: HBCServiceCategory[] = (await this.db.query('SELECT * FROM HBCServiceCategory;'))
      .values as HBCServiceCategory[];
    this.hbcServiceCategoryList.next(hbcServiceCategories);
  }

  async getHBCServiceCategories() {
    await this.loadHBCServiceCategories();
    this.isHBCServiceCategoryReady.next(true);
  }

  async addHBCServiceCategory(hbcServiceCategories: HBCServiceCategory[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    const baseQuery = `INSERT INTO HBCServiceCategory (
      ClientId,
      ServiceCategoryId,
      IsDeleted,
      IsSynced,
      OnlineDbOid
    ) VALUES `;
    const placeholders = hbcServiceCategories.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (number | string | undefined)[] = [];

    for (const item of hbcServiceCategories) {
      const { ClientId, ServiceCategoryId, IsDeleted, IsSynced, OnlineDbOid } = item;
      params.push(ClientId, ServiceCategoryId, IsDeleted ? 1 : 0, IsSynced, OnlineDbOid);
    }

    try {
      for (const items of hbcServiceCategories) {
        console.log('ClientId: ', items.ClientId);
        const OidForClient = (
          await this.db.query('SELECT Oid FROM HBCServiceCategory WHERE ClientId = ?;', [items.ClientId])
        ).values?.map((oid) => oid.Oid);

        if (OidForClient?.length) {
          console.log('OidForClient for delete operation: ', OidForClient);
          for (const oid of OidForClient) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('HBCServiceCategory', oid);
          }
        }

        const deleteResponse = await this.db.run('DELETE FROM HBCServiceCategory WHERE ClientId = ?', [items.ClientId]);
        console.log('Deleted Response: ', deleteResponse);
      }

      const response = await this.db.run(query, params);

      const newInsertedOidArr = (await this.db.query('SELECT Oid FROM HBCServiceCategory;')).values?.map(
        (oid) => oid.Oid
      );

      if (newInsertedOidArr?.length) {
        for (const insertedOid of newInsertedOidArr) {
          await this.syncQueueService.addTransactionInQueue({
            id: 0,
            operation: 'INSERT',
            tableName: 'HBCServiceCategory',
            transactionId: insertedOid,
            dateCreated: dayjs().format(),
            createdBy: 1,
            dateModified: dayjs().format(),
            modifiedBy: 1,
          });
        }
      }

      await this.getHBCServiceCategories();

      return response;
    } catch (error) {
      console.error('Error adding HBC service category:', error);
      this.toast.openToast({
        message: 'Error adding HBC service category',
        color: 'error',
      });
      return null;
    }
  }

  async updateHBCServiceCategoryById(Oid: number, hbcServiceCategory: HBCServiceCategory) {
    const sql = `
    UPDATE HBCServiceCategory
    SET
      ClientId = ?,
      ServiceCategoryId = ?,
      IsDeleted = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE Oid = ?;
    `;
    const params = [
      hbcServiceCategory.ClientId,
      hbcServiceCategory.ServiceCategoryId,
      hbcServiceCategory.IsDeleted ?? 0,
      hbcServiceCategory.IsSynced,
      hbcServiceCategory.OnlineDbOid,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'HBCServiceCategory',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getHBCServiceCategories();
      console.log('HBC service category updated successfully');
      this.toast.openToast({
        message: 'HBC service category updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating HBC service category:', error);
      this.toast.openToast({
        message: 'Error updating HBC service category',
        color: 'error',
      });
    }
  }

  async getHBCServiceCategoryByClientId(clientId: string): Promise<HBCServiceCategory[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM HBCServiceCategory WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as HBCServiceCategory[];
  }

  async getHBCServiceCategoryById(Oid: string): Promise<HBCServiceCategory | null> {
    const sql = `
      SELECT *
      FROM HBCServiceCategory
      WHERE Oid = ?;
    `;
    const params = [Oid];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as HBCServiceCategory;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching HBC service category by id:', error);
        return null;
      });
  }

  async deleteHBCServiceCategoryById(Oid: string) {
    const sql = `DELETE FROM HBCServiceCategory WHERE Oid = ?`;
    const params = [Oid];

    try {
      await this.db.run(sql, params);
      await this.getHBCServiceCategories();
    } catch (error) {
      console.error('Error deleting HBC service category:', error);
    }
  }

  // delete HBCServiceCategory by client id for all client
  async deleteHBCServiceCategoryByClientId(clientIds: string[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    try {
      // Step 1: Generate and execute the delete query for bulk deletion
      const placeholders = clientIds.map(() => '?').join(', ');
      const deleteSql = `DELETE FROM HBCServiceCategory WHERE ClientId IN (${placeholders})`;
      const response = await this.db.run(deleteSql, clientIds);

      // Step 2: For each clientId, find the corresponding Oid(s) for adding to the sync queue
      // for (const clientId of clientIds) {
      //   const selectSql = `SELECT Oid FROM HBCServiceCategory WHERE ClientId = ?`;
      //   const result = await this.db.query(selectSql, [clientId]);
      //   const oids = result.values?.map((row) => row.Oid) || [];

      //   // Step 3: For each Oid, add a delete operation to the sync queue
      //   for (const oid of oids) {
      //     await this.syncQueueService.addTransactionInQueue({
      //       id: 0,
      //       operation: 'DELETE',
      //       tableName: 'HBCServiceCategory',
      //       transactionId: oid,
      //       dateCreated: dayjs().format(),
      //       createdBy: 1,
      //       dateModified: dayjs().format(),
      //       modifiedBy: 1,
      //     });
      //   }
      // }

      // Refresh the list after deletion
      await this.getHBCServiceCategories();
      return response;
    } catch (error) {
      console.error('Error deleting HBC service category by client ID:', error);
      return null;
    }
  }
}
