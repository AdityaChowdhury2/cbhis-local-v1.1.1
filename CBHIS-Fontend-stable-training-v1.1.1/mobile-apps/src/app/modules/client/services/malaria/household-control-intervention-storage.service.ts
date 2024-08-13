import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { HouseholdControlIntervention, MalariaControlIntervention } from '../../models/service-models/malaria';

@Injectable({
  providedIn: 'root',
})
export class HouseholdControlInterventionStorageService {
  public householdControlInterventionList: BehaviorSubject<HouseholdControlIntervention[]> = new BehaviorSubject<
    HouseholdControlIntervention[]
  >([]);
  private db!: SQLiteDBConnection;
  private isHouseholdControlInterventionReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public malariaControlInterventionList: BehaviorSubject<MalariaControlIntervention[]> = new BehaviorSubject<
    MalariaControlIntervention[]
  >([]);

  private isMalariaControlInterventionReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('HouseholdControlInterventionService initialized');
      this.loadHouseholdControlInterventions();
      this.loadMalariaControlInterventions();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getHouseholdControlInterventions();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the MalariaControlIntervention as observable
  malariaControlInterventionState(): Observable<boolean> {
    return this.isMalariaControlInterventionReady.asObservable();
  }

  householdControlInterventionState(): Observable<boolean> {
    return this.isHouseholdControlInterventionReady.asObservable();
  }

  // Send all the MalariaControlIntervention List as observable
  fetchMalariaControlInterventions(): Observable<MalariaControlIntervention[]> {
    return this.malariaControlInterventionList.asObservable();
  }

  fetchHouseholdControlInterventions(): Observable<HouseholdControlIntervention[]> {
    return this.householdControlInterventionList.asObservable();
  }

  // Load all the MalariaControlIntervention from the database
  async loadMalariaControlInterventions() {
    const malariaControlInterventions: MalariaControlIntervention[] = (
      await this.db.query('SELECT * FROM MalariaControlIntervention;')
    ).values as MalariaControlIntervention[];
    this.malariaControlInterventionList.next(malariaControlInterventions);
  }

  async loadHouseholdControlInterventions() {
    const householdControlInterventions: HouseholdControlIntervention[] = (
      await this.db.query('SELECT * FROM HouseholdControlIntervention;')
    ).values as HouseholdControlIntervention[];
    this.householdControlInterventionList.next(householdControlInterventions);
  }

  async getHouseholdControlInterventions() {
    await this.loadHouseholdControlInterventions();
    this.isHouseholdControlInterventionReady.next(true);
  }
  async addHouseholdControlIntervention(
    householdControlIntervention: HouseholdControlIntervention[]
  ): Promise<(capSQLiteChanges | null)[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      const responses: (capSQLiteChanges | null)[] = [];
      if (householdControlIntervention?.length > 0) {
        for (const item of householdControlIntervention) {
          const { OnlineDbOid, TransactionId } = item;
          // If OnlineDbOid and TransactionId is not null
          if (!!OnlineDbOid && !!TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('HouseholdControlIntervention', OnlineDbOid);
            await this.addTransactionToQueue('UPDATE', OnlineDbOid);
            responses.push(await this.updateHouseholdControlInterventionItemWithOnlineDbId(item));
          }
          // If OnlineDbOid is null but TransactionId is not null
          else if (!OnlineDbOid && !!TransactionId) {
            responses.push(await this.updateHouseholdControlInterventionItem(item));
          }
          // If OnlineDbOid and TransactionId is null
          else {
            responses.push(await this.insertHouseholdControlInterventionItems([item]));
          }
        }
        return responses;
      } else return [null];
    } catch (error) {
      return [null];
    }
  }

  private async updateHouseholdControlInterventionItemWithOnlineDbId(
    item: HouseholdControlIntervention
  ): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE HouseholdControlIntervention SET
      ControlInterventionId = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [item.ControlInterventionId, item.ModifiedBy, item.TransactionId, item.OnlineDbOid];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateHouseholdControlInterventionItem(item: HouseholdControlIntervention): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE HouseholdControlIntervention SET
      ControlInterventionId = ?
      WHERE
      TransactionId = ?
    `;
    const params = [item.ControlInterventionId, item.TransactionId];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertHouseholdControlInterventionItems(
    householdControlInterventionItems: HouseholdControlIntervention[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO HouseholdControlIntervention (
      TransactionId,
      ClientId,
      ControlInterventionId,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = householdControlInterventionItems.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';
    const params: (string | number | boolean | undefined | null)[] = [];
    for (const item of householdControlInterventionItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.ControlInterventionId,
        item.IsDeleted ?? 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt as string
      );
    }
    console.log('Inserted query for HouseholdControlIntervention item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadHouseholdControlInterventions();
      return response;
    } catch (error) {
      console.error('Error in insertHouseholdControlInterventionItems: ', error);
      return null;
    }
  }

  private async deleteExistingHouseholdControlInterventionItems(
    householdControlInterventionItems: HouseholdControlIntervention[]
  ): Promise<void> {
    console.log('Deleting existing items in HouseholdControlIntervention');
    for (const item of householdControlInterventionItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM HouseholdControlIntervention WHERE ClientId = ?;', [
          item.ClientId,
        ])
      ).values?.map((oid) => oid.TransactionId);
      console.log('oid for client', OidForClient);
      await this.db.run('DELETE FROM HouseholdControlIntervention WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'HouseholdControlIntervention',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateHouseholdControlInterventionById(
    TransactionId: string,
    householdControlIntervention: HouseholdControlIntervention
  ) {
    const sql = `
    UPDATE HouseholdControlIntervention
    SET
      ClientId = ?,
      ControlInterventionId = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      householdControlIntervention.ClientId,
      householdControlIntervention.ControlInterventionId,
      householdControlIntervention.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'HouseholdControlIntervention',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getHouseholdControlInterventions();
      console.log('Household control intervention updated successfully');
      this.toast.openToast({
        message: 'Household control intervention updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating household control intervention:', error);
      this.toast.openToast({
        message: 'Error updating household control intervention',
        color: 'error',
      });
    }
  }

  async getHouseholdControlInterventionByClientId(clientId: string): Promise<HouseholdControlIntervention> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      'SELECT * FROM HouseholdControlIntervention WHERE ClientId = ? AND IsDeleted = 0;',
      [clientId]
    );
    console.log(result.values);
    return result.values?.[0] as HouseholdControlIntervention;
  }

  // for multiple clients
  async getHouseholdControlInterventionByClientIds(clientIds: string[]): Promise<HouseholdControlIntervention[]> {
    if (!this.db) await this.initializeDatabase();
    const placeholders = clientIds.map(() => '?').join(', ');
    const query = `SELECT * FROM HouseholdControlIntervention WHERE ClientId IN (${placeholders}) AND IsDeleted = 0;`;
    const result = await this.db.query(query, clientIds);
    console.log(result.values);
    return result.values as HouseholdControlIntervention[];
  }

  async getHouseholdControlInterventionById(TransactionId: string): Promise<HouseholdControlIntervention | null> {
    const sql = `
      SELECT *
      FROM HouseholdControlIntervention
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as HouseholdControlIntervention;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching household control intervention by id:', error);
        return null;
      });
  }

  async deleteHouseholdControlInterventionById(TransactionId: string) {
    const sql = `DELETE FROM HouseholdControlIntervention WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getHouseholdControlInterventions();
    } catch (error) {
      console.error('Error deleting household control intervention:', error);
    }
  }
}
