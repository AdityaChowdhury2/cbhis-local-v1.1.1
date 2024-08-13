import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { BreastFeedingAndComplementaryFeeding, ClientBCF } from '../../models/service-models/household-nutrition';

@Injectable({
  providedIn: 'root',
})
export class BreastfeedingAndComplimentaryStorageService {
  public clientBCFList: BehaviorSubject<ClientBCF[]> = new BehaviorSubject<ClientBCF[]>([]);
  private db!: SQLiteDBConnection;
  private isClientBCFReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public BCFList: BehaviorSubject<BreastFeedingAndComplementaryFeeding[]> = new BehaviorSubject<
    BreastFeedingAndComplementaryFeeding[]
  >([]);
  private isBCFReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ClientBCFService initialized');
      this.loadClientBCF();

      this.loadBCF();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getClientBCF();
    } catch (error) {
      console.log('database init', error);
    }
  }

  BCFState(): Observable<boolean> {
    return this.isBCFReady.asObservable();
  }

  fetchBCF(): Observable<BreastFeedingAndComplementaryFeeding[]> {
    return this.BCFList.asObservable();
  }

  async loadBCF() {
    const BCF: BreastFeedingAndComplementaryFeeding[] = (
      await this.db.query('SELECT * FROM BreastFeedingAndComplementaryFeeding;')
    ).values as BreastFeedingAndComplementaryFeeding[];
    this.BCFList.next(BCF);
  }

  // the state of the ClientBCF as observable
  clientBCFState(): Observable<boolean> {
    return this.isClientBCFReady.asObservable();
  }

  // Send all the ClientBCF List as observable
  fetchClientBCF(): Observable<ClientBCF[]> {
    return this.clientBCFList.asObservable();
  }

  // Load all the ClientBCF records from the database
  async loadClientBCF() {
    const clientBCF: ClientBCF[] = (await this.db.query('SELECT * FROM ClientBCF;')).values as ClientBCF[];
    this.clientBCFList.next(clientBCF);
  }

  async getClientBCF() {
    await this.loadClientBCF();
    this.isClientBCFReady.next(true);
  }

  async addClientBCF(clientBCF: ClientBCF[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(clientBCF);
      const uniqueClientIds = [...new Set(clientBCF.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getClientBCF();
      return response;
    } catch (error) {
      console.error('Error adding client BCF:', error);
      this.toast.openToast({
        message: 'Error adding client BCF',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the client BCF
  generateInsertQueryAndParams(clientBCF: ClientBCF[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ClientBCF (
      TransactionId,
      ClientId,
      BCFId,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = clientBCF.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    clientBCF.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(
        guid,
        item.ClientId,
        item.BCFId,
        item.IsDeleted ? 1 : 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt as string
      );
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the client BCF and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM ClientBCF WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM ClientBCF WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
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
        tableName: 'ClientBCF',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  async updateClientBCFById(TransactionId: string, clientBCF: ClientBCF) {
    const sql = `
    UPDATE ClientBCF
    SET
      ClientId = ?,
      BCFId = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [clientBCF.ClientId, clientBCF.BCFId, clientBCF.IsDeleted ?? 0, TransactionId];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'ClientBCF',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getClientBCF();
      console.log('Client BCF updated successfully');
      this.toast.openToast({
        message: 'Client BCF updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating client BCF:', error);
      this.toast.openToast({
        message: 'Error updating client BCF',
        color: 'error',
      });
    }
  }

  async getClientBCFByClientId(clientId: string): Promise<ClientBCF[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM ClientBCF WHERE ClientId = ? AND IsDeleted = 0;', [clientId]);
    console.log(result.values);
    return result.values as ClientBCF[];
  }

  // for multiple Clients
  async getClientBCFByClientIds(clientIds: string[]): Promise<ClientBCF[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      `SELECT * FROM ClientBCF WHERE ClientId IN (${clientIds.map(() => '?').join(',')}) AND IsDeleted = 0;`,
      clientIds
    );
    console.log(result.values);
    return result.values as ClientBCF[];
  }

  async getClientBCFById(TransactionId: string): Promise<ClientBCF | null> {
    const sql = `
      SELECT *
      FROM ClientBCF
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ClientBCF;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching client BCF by id:', error);
        return null;
      });
  }

  async deleteClientBCFById(TransactionId: string) {
    const sql = `DELETE FROM ClientBCF WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getClientBCF();
    } catch (error) {
      console.error('Error deleting client BCF:', error);
    }
  }
}
