import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { WaterSource } from '../models/water-source';

@Injectable({
  providedIn: 'root',
})
export class SourceOfWaterStorageService {
  public sourceOfWaterList: BehaviorSubject<WaterSource[]> = new BehaviorSubject<WaterSource[]>([]);
  private db!: SQLiteDBConnection;
  private isSourceOfWaterReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    // this.initializeDatabase().then(() => {
    //   console.log('Source of water StorageService initialized');
    // });
  }

  async initializeDatabase() {
    try {
      // retrieve the database connection
      this.db = await this.sqliteService.retrieveConnection();
      await this.getSourcesOfWater();
    } catch (error) {
      console.log('database init', error);
    }
  }

  sourceOfWaterState() {
    return this.isSourceOfWaterReady.asObservable();
  }

  fetchSourcesOfWater(): Observable<WaterSource[]> {
    return this.sourceOfWaterList.asObservable();
  }

  async loadSourcesOfWater() {
    const sourcesOfWater: WaterSource[] = (await this.db.query('SELECT * FROM drinkingwatersources;'))
      .values as WaterSource[];
    console.log('loadProducts', sourcesOfWater);
    this.sourceOfWaterList.next(sourcesOfWater);
  }

  async getSourcesOfWater() {
    await this.loadSourcesOfWater();
    this.isSourceOfWaterReady.next(true);
  }

  async addSourceOfWater(sourceOfWater: WaterSource) {
    const sql = `INSERT INTO drinkingwatersources (
      pipedtoyardplot,
      publictapstandpipe,
      borehole,
      protectedwell,
      unprotectedwell,
      rainwater,
      tankertruck,
      surfacewater,
      bottledwater,
      other,
      identifiedfamilyid,
      createdby,
      datecreated,
      modifiedby,
      datemodified,
      isdeleted,
      issynced,
      onlinedboid
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    );
    `;
    const params = [
      sourceOfWater.pipedtoyardplot,
      sourceOfWater.publictapstandpipe,
      sourceOfWater.borehole,
      sourceOfWater.protectedwell,
      sourceOfWater.unprotectedwell,
      sourceOfWater.rainwater,
      sourceOfWater.tankertruck,
      sourceOfWater.surfacewater,
      sourceOfWater.bottledwater,
      sourceOfWater.other,
      sourceOfWater.identifiedfamilyid,
      sourceOfWater.createdby,
      sourceOfWater.datecreated,
      sourceOfWater.modifiedby,
      sourceOfWater.datemodified,
      sourceOfWater.isdeleted,
      sourceOfWater.issynced,
      sourceOfWater.onlinedboid,
    ];

    try {
      await this.db.run(sql, params);
      console.log('source of water added successfully');
      this.toast.openToast({
        message: 'Source of water Create successfully',
        color: 'success',
      });
      let transactionId: number = 0;

      let data = await this.db.query('SELECT id from drinkingwatersources order by id DESC limit 1');

      if (data && data.values && data.values.length > 0) {
        transactionId = data.values[0].id;
      }
      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'INSERT',
        tableName: 'drinkingwatersources',
        transactionId: transactionId,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: new Date().toISOString(),
        modifiedBy: 1,
      });
      this.getSourcesOfWater();
    } catch (error) {
      console.error('Error adding source of water:', error);
      this.toast.openToast({
        message: 'Error',
        color: 'error',
      });
    }
  }

  async updateSourceOfWaterById(id: number, waterSource: WaterSource) {
    const sql = `
        UPDATE drinkingwatersources
        SET
            pipedtoyardplot = ?,
            publictapstandpipe = ?,
            borehole = ?,
            protectedwell = ?,
            unprotectedwell = ?,
            rainwater = ?,
            tankertruck = ?,
            surfacewater = ?,
            bottledwater = ?,
            other = ?,
            identifiedfamilyid = ?,
            createdby = ?,
            datecreated = ?,
            modifiedby = ?,
            datemodified = ?,
            isdeleted = ?,
            issynced = ?,
            onlinedboid = ?
        WHERE id = ?;
      `;
    const params = [
      waterSource.pipedtoyardplot,
      waterSource.publictapstandpipe,
      waterSource.borehole,
      waterSource.protectedwell,
      waterSource.unprotectedwell,
      waterSource.rainwater,
      waterSource.tankertruck,
      waterSource.surfacewater,
      waterSource.bottledwater,
      waterSource.other,
      waterSource.identifiedfamilyid,
      waterSource.createdby,
      waterSource.datecreated,
      waterSource.modifiedby,
      waterSource.datemodified,
      waterSource.isdeleted,
      waterSource.issynced,
      waterSource.onlinedboid,
      id,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'drinkingwatersources',
        transactionId: id,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: new Date().toISOString(),
        modifiedBy: 1,
      });
      await this.getSourcesOfWater();
      console.log('sources of water updated successfully');
      this.toast.openToast({
        message: 'sources of water updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating source of water:', error);
      this.toast.openToast({
        message: 'Source of water updated successfully',
        color: 'error',
      });
    }
  }

  async getSourceOfWaterById(id: number): Promise<WaterSource | null> {
    const sql = `
        SELECT *
        FROM drinkingwatersources
        WHERE id = ?;
      `;
    const params = [id];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as WaterSource;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error searching source of water by id:', error);
        return null;
      });
  }

  async getSourceOfWaterByFamilyId(id: number): Promise<WaterSource | null> {
    // if no id is provided, return null
    if (!id) return null;

    // if database is not initialized, initialize it
    if (!this.db) await this.initializeDatabase();

    // search for the source of water by family id
    const sql = `
        SELECT *
        FROM drinkingwatersources
        WHERE identifiedfamilyid = ?;
      `;
    const params = [id];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as WaterSource;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error searching source of water by family id:', error);
        return null;
      });
  }

  async deleteSourceOfWaterById(id: string) {
    const sql = `DELETE FROM drinkingwatersources WHERE id=?`;
    const params = [id];

    try {
      await this.db.run(sql, params);
      await this.getSourcesOfWater();
    } catch (error) {
      console.error('Error deleting source of water:', error);
    }
  }
}
