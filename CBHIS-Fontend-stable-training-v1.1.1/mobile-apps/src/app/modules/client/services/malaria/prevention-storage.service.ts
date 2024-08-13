import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { MalariaPrevention } from '../../models/service-models/malaria';

@Injectable({
  providedIn: 'root',
})
export class PreventionStorageService {
  public malariaPreventionList: BehaviorSubject<MalariaPrevention[]> = new BehaviorSubject<MalariaPrevention[]>([]);
  private db!: SQLiteDBConnection;
  private isMalariaPreventionReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('MalariaPreventionService initialized');
      this.loadMalariaPreventions();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getMalariaPreventions();
    } catch (error) {
      console.log('database init', error);
    }
  }

  malariaPreventionState(): Observable<boolean> {
    return this.isMalariaPreventionReady.asObservable();
  }

  fetchMalariaPreventions(): Observable<MalariaPrevention[]> {
    return this.malariaPreventionList.asObservable();
  }

  async loadMalariaPreventions() {
    const malariaPreventions: MalariaPrevention[] = (await this.db.query('SELECT * FROM MalariaPrevention;'))
      .values as MalariaPrevention[];
    this.malariaPreventionList.next(malariaPreventions);
  }

  async getMalariaPreventions() {
    await this.loadMalariaPreventions();
    this.isMalariaPreventionReady.next(true);
  }
  async addMalariaPrevention(malariaPrevention: MalariaPrevention[]): Promise<(capSQLiteChanges | null)[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      const responses: (capSQLiteChanges | null)[] = [];
      if (malariaPrevention?.length > 0) {
        for (const item of malariaPrevention) {
          const { OnlineDbOid, TransactionId } = item;
          // If OnlineDbOid and TransactionId is not null
          if (!!OnlineDbOid && !!TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('MalariaPrevention', OnlineDbOid);
            await this.addTransactionToQueue('UPDATE', OnlineDbOid);
            responses.push(await this.updateMalariaPreventionItemWithOnlineDbId(item));
          }
          // If OnlineDbOid is null but TransactionId is not null
          else if (!OnlineDbOid && !!TransactionId) {
            responses.push(await this.updateMalariaPreventionItem(item));
          }
          // If OnlineDbOid and TransactionId is null
          else {
            responses.push(await this.insertMalariaPreventionItems([item]));
          }
        }
        return responses;
      } else return [null];
    } catch (error) {
      return [null];
    }
  }

  private async updateMalariaPreventionItemWithOnlineDbId(item: MalariaPrevention): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE MalariaPrevention SET
      ISR = ?,
      ISRProvider = ?,
      HASITN = ?,
      NumberOfITN = ?,
      IsITNObserved = ?,
      MaxAgeOfITN = ?,
      HasNetBeenTreated = ?,
      LastNetWasTreated = ?,
      MalariaCampaign = ?,
      MalariaCampaignMedium = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.ISR,
      item.ISRProvider,
      item.HASITN,
      item.NumberOfITN,
      item.IsITNObserved,
      item.MaxAgeOfITN,
      item.HasNetBeenTreated,
      item.LastNetWasTreated,
      item.MalariaCampaign,
      item.MalariaCampaignMedium,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateMalariaPreventionItem(item: MalariaPrevention): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE MalariaPrevention SET
      ISR = ?,
      ISRProvider = ?,
      HASITN = ?,
      NumberOfITN = ?,
      IsITNObserved = ?,
      MaxAgeOfITN = ?,
      HasNetBeenTreated = ?,
      LastNetWasTreated = ?,
      MalariaCampaign = ?,
      MalariaCampaignMedium = ?
      WHERE
      TransactionId = ?
    `;
    const params = [
      item.ISR,
      item.ISRProvider,
      item.HASITN,
      item.NumberOfITN,
      item.IsITNObserved,
      item.MaxAgeOfITN,
      item.HasNetBeenTreated,
      item.LastNetWasTreated,
      item.MalariaCampaign,
      item.MalariaCampaignMedium,
      item.TransactionId,
    ];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertMalariaPreventionItems(
    malariaPreventionItems: MalariaPrevention[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO MalariaPrevention (
      TransactionId,
      ClientId,
      ISR,
      ISRProvider,
      HASITN,
      NumberOfITN,
      IsITNObserved,
      MaxAgeOfITN,
      HasNetBeenTreated,
      LastNetWasTreated,
      MalariaCampaign,
      MalariaCampaignMedium,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = malariaPreventionItems
      .map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .join(', ');
    const query = baseQuery + placeholders + ';';
    const params: (string | number | boolean | undefined | null)[] = [];
    for (const item of malariaPreventionItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.ISR,
        item.ISRProvider,
        item.HASITN,
        item.NumberOfITN,
        item.IsITNObserved,
        item.MaxAgeOfITN,
        item.HasNetBeenTreated,
        item.LastNetWasTreated,
        item.MalariaCampaign,
        item.MalariaCampaignMedium,
        item.IsDeleted ?? 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt as string
      );
    }
    console.log('Inserted query for MalariaPrevention item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadMalariaPreventions();
      return response;
    } catch (error) {
      console.error('Error in insertMalariaPreventionItems: ', error);
      return null;
    }
  }

  private async deleteExistingMalariaPreventionItems(malariaPreventionItems: MalariaPrevention[]): Promise<void> {
    console.log('Deleting existing items in MalariaPrevention');
    for (const item of malariaPreventionItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM MalariaPrevention WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);
      console.log('oid for client', OidForClient);
      await this.db.run('DELETE FROM MalariaPrevention WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'MalariaPrevention',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateMalariaPreventionById(TransactionId: string, malariaPrevention: MalariaPrevention) {
    const sql = `
    UPDATE MalariaPrevention
    SET
      ClientId = ?,
      ISR = ?,
      ISRProvider = ?,
      HASITN = ?,
      NumberOfITN = ?,
      IsITNOberved = ?,
      MaxAgeOfITN = ?,
      HasNetBeenTreated = ?,
      LastNetWasTreated = ?,
      MalariaCampaign = ?,
      MalariaCampaignMedium = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      malariaPrevention.ClientId,
      malariaPrevention.ISR,
      malariaPrevention.ISRProvider,
      malariaPrevention.HASITN,
      malariaPrevention.NumberOfITN,
      malariaPrevention.IsITNObserved,
      malariaPrevention.MaxAgeOfITN,
      malariaPrevention.HasNetBeenTreated,
      malariaPrevention.LastNetWasTreated,
      malariaPrevention.MalariaCampaign,
      malariaPrevention.MalariaCampaignMedium,
      malariaPrevention.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'MalariaPrevention',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getMalariaPreventions();
      console.log('Malaria prevention updated successfully');
      this.toast.openToast({
        message: 'Malaria prevention updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating malaria prevention:', error);
      this.toast.openToast({
        message: 'Error updating malaria prevention',
        color: 'error',
      });
    }
  }

  async getMalariaPreventionByClientId(clientId: string): Promise<MalariaPrevention> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM MalariaPrevention WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values?.[0] as MalariaPrevention;
  }

  // * for multiple clients
  async getMalariaPreventionByClientIds(clientIds: string[]): Promise<MalariaPrevention[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      `SELECT * FROM MalariaPrevention WHERE ClientId IN (${clientIds.map(() => '?').join(', ')}) AND IsDeleted = 0;`,
      clientIds
    );
    console.log(result.values);
    return result.values as MalariaPrevention[];
  }

  async getMalariaPreventionById(TransactionId: string): Promise<MalariaPrevention | null> {
    const sql = `
      SELECT *
      FROM MalariaPrevention
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as MalariaPrevention;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching malaria prevention by id:', error);
        return null;
      });
  }

  async deleteMalariaPreventionById(TransactionId: string) {
    const sql = `DELETE FROM MalariaPrevention WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getMalariaPreventions();
    } catch (error) {
      console.error('Error deleting malaria prevention:', error);
    }
  }
}
