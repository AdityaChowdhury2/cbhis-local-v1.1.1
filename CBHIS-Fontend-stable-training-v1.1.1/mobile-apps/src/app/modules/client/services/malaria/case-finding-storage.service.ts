import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { MalariaCaseFinding } from '../../models/service-models/malaria';

@Injectable({
  providedIn: 'root',
})
export class CaseFindingStorageService {
  public malariaCaseFindingList: BehaviorSubject<MalariaCaseFinding[]> = new BehaviorSubject<MalariaCaseFinding[]>([]);
  private db!: SQLiteDBConnection;
  private isMalariaCaseFindingReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('MalariaCaseFindingStorageService initialized');
      this.loadMalariaCaseFinding();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getMalariaCaseFinding();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the MalariaCaseFinding as observable
  malariaCaseFindingState(): Observable<boolean> {
    return this.isMalariaCaseFindingReady.asObservable();
  }

  // Send all the MalariaCaseFinding List as observable
  fetchMalariaCaseFinding(): Observable<MalariaCaseFinding[]> {
    return this.malariaCaseFindingList.asObservable();
  }

  // Load all the MalariaCaseFinding from the database
  async loadMalariaCaseFinding() {
    const malariaCaseFinding: MalariaCaseFinding[] = (await this.db.query('SELECT * FROM MalariaCaseFinding;'))
      .values as MalariaCaseFinding[];
    console.log('Malaria Case Finding', malariaCaseFinding);
    this.malariaCaseFindingList.next(malariaCaseFinding);
  }

  async getMalariaCaseFinding() {
    await this.loadMalariaCaseFinding();
    this.isMalariaCaseFindingReady.next(true);
  }

  async addMalariaCaseFinding(malariaCaseFinding: MalariaCaseFinding[]): Promise<(capSQLiteChanges | null)[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      const responses: (capSQLiteChanges | null)[] = [];
      if (malariaCaseFinding?.length > 0) {
        for (const item of malariaCaseFinding) {
          const { OnlineDbOid, TransactionId } = item;
          // If OnlineDbOid and TransactionId is not null
          if (!!OnlineDbOid && !!TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('MalariaCaseFinding', OnlineDbOid);
            await this.addTransactionToQueue('UPDATE', OnlineDbOid);
            responses.push(await this.updateMalariaCaseFindingItemWithOnlineDbId(item));
          }
          // If OnlineDbOid is null but TransactionId is not null
          else if (!OnlineDbOid && !!TransactionId) {
            responses.push(await this.updateMalariaCaseFindingItem(item));
          }
          // If OnlineDbOid and TransactionId is null
          else {
            responses.push(await this.insertMalariaCaseFindingItems([item]));
          }
        }
        return responses;
      } else return [null];
    } catch (error) {
      return [null];
    }
  }

  private async updateMalariaCaseFindingItemWithOnlineDbId(item: MalariaCaseFinding): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE MalariaCaseFinding SET
      IsResidenceInMalariaEndemicArea = ?,
      IsMalariaExposed = ?,
      ExposedWhere = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.IsResidenceInMalariaEndemicArea,
      item.IsMalariaExposed,
      item.ExposedWhere,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateMalariaCaseFindingItem(item: MalariaCaseFinding): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE MalariaCaseFinding SET
      IsResidenceInMalariaEndemicArea = ?,
      IsMalariaExposed = ?,
      ExposedWhere = ?
      WHERE
      TransactionId = ?
    `;
    const params = [item.IsResidenceInMalariaEndemicArea, item.IsMalariaExposed, item.ExposedWhere, item.TransactionId];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertMalariaCaseFindingItems(
    malariaCaseFindingItems: MalariaCaseFinding[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO MalariaCaseFinding (
      TransactionId,
      ClientId,
      IsResidenceInMalariaEndemicArea,
      IsMalariaExposed,
      ExposedWhere,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = malariaCaseFindingItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';
    const params: (string | number | boolean | undefined | null)[] = [];
    for (const item of malariaCaseFindingItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.IsResidenceInMalariaEndemicArea,
        item.IsMalariaExposed,
        item.ExposedWhere,
        item.IsDeleted ?? 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt as string
      );
    }
    console.log('Inserted query for MalariaCaseFinding item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadMalariaCaseFinding();
      return response;
    } catch (error) {
      console.error('Error in insertMalariaCaseFindingItems: ', error);
      return null;
    }
  }

  private async deleteExistingMalariaCaseFindingItems(malariaCaseFindingItems: MalariaCaseFinding[]): Promise<void> {
    console.log('Deleting existing items in MalariaCaseFinding');
    for (const item of malariaCaseFindingItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM MalariaCaseFinding WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);
      console.log('oid for client', OidForClient);
      await this.db.run('DELETE FROM MalariaCaseFinding WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'MalariaCaseFinding',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateMalariaCaseFindingById(TransactionId: string, malariaCaseFinding: MalariaCaseFinding) {
    const sql = `
    UPDATE MalariaCaseFinding
    SET
      ClientId = ?,
      IsResidenceInMalariaEndemicArea = ?,
      IsMalariaExposed = ?,
      ExposedWhere = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      malariaCaseFinding.ClientId,
      malariaCaseFinding.IsResidenceInMalariaEndemicArea,
      malariaCaseFinding.IsMalariaExposed,
      malariaCaseFinding.ExposedWhere,
      malariaCaseFinding.IsDeleted ?? 0,
      TransactionId,
    ];
    try {
      await this.db.run(sql, params);
      await this.getMalariaCaseFinding();
      console.log('Malaria Case Finding updated successfully');
      this.toast.openToast({
        message: 'Malaria Case Finding updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating Malaria Case Finding:', error);
      this.toast.openToast({
        message: 'Error updating Malaria Case Finding',
        color: 'error',
      });
    }
  }

  async getClientsMalariaCaseFindingByClientIds(clientIds: string[]): Promise<MalariaCaseFinding[]> {
    if (!this.db) await this.initializeDatabase();
    const placeholders = clientIds.map(() => '?').join(', ');
    const query = `SELECT * FROM MalariaCaseFinding WHERE ClientId IN (${placeholders}) AND IsDeleted = 0;`;
    const result = await this.db.query(query, clientIds);
    console.log(result.values);
    return result.values as MalariaCaseFinding[];
  }

  async getMalariaCaseFindingByClientId(clientId: string): Promise<MalariaCaseFinding> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM MalariaCaseFinding WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values?.[0] as MalariaCaseFinding;
  }

  async getMalariaCaseFindingById(TransactionId: string): Promise<MalariaCaseFinding | null> {
    const sql = `
      SELECT *
      FROM MalariaCaseFinding
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];
    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as MalariaCaseFinding;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching Malaria Case Finding by id:', error);
        return null;
      });
  }

  async deleteMalariaCaseFindingById(TransactionId: string) {
    const sql = `DELETE FROM MalariaCaseFinding WHERE TransactionId = ?`;
    const params = [TransactionId];
    try {
      await this.db.run(sql, params);
      await this.getMalariaCaseFinding();
    } catch (error) {
      console.error('Error deleting Malaria Case Finding:', error);
    }
  }
}
