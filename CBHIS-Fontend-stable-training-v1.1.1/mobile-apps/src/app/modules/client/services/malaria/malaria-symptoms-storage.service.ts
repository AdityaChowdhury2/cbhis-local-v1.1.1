import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ClientMalariaSymptom, MalariaSymptom } from '../../models/service-models/malaria';

@Injectable({
  providedIn: 'root',
})
export class MalariaSymptomsStorageService {
  public clientMalariaSymptomsList: BehaviorSubject<ClientMalariaSymptom[]> = new BehaviorSubject<
    ClientMalariaSymptom[]
  >([]);
  private db!: SQLiteDBConnection;
  private isClientMalariaSymptomsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public malariaSymptomsList: BehaviorSubject<MalariaSymptom[]> = new BehaviorSubject<MalariaSymptom[]>([]);

  private isMalariaSymptomsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ClientMalariaSymptomsService initialized');
      this.loadClientMalariaSymptoms();
      this.loadMalariaSymptoms();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getClientMalariaSymptoms();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the MalariaSymptoms as observable
  malariaSymptomsState(): Observable<boolean> {
    return this.isMalariaSymptomsReady.asObservable();
  }

  clientMalariaSymptomsState(): Observable<boolean> {
    return this.isClientMalariaSymptomsReady.asObservable();
  }

  // Send all the MalariaSymptoms List as observable
  fetchMalariaSymptoms(): Observable<MalariaSymptom[]> {
    return this.malariaSymptomsList.asObservable();
  }

  fetchClientMalariaSymptoms(): Observable<ClientMalariaSymptom[]> {
    return this.clientMalariaSymptomsList.asObservable();
  }

  // Load MalariaSymptoms
  async loadMalariaSymptoms() {
    const malariaSymptoms: MalariaSymptom[] = (await this.db.query('SELECT * FROM MalariaSymptom;'))
      .values as MalariaSymptom[];
    this.malariaSymptomsList.next(malariaSymptoms);
  }

  async loadClientMalariaSymptoms() {
    const clientMalariaSymptoms: ClientMalariaSymptom[] = (await this.db.query('SELECT * FROM ClientMalariaSymptom;'))
      .values as ClientMalariaSymptom[];
    this.clientMalariaSymptomsList.next(clientMalariaSymptoms);
  }

  async getClientMalariaSymptoms() {
    await this.loadClientMalariaSymptoms();
    this.isClientMalariaSymptomsReady.next(true);
  }

  async addClientMalariaSymptoms(clientMalariaSymptoms: ClientMalariaSymptom[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(clientMalariaSymptoms);
      const uniqueClientIds = [...new Set(clientMalariaSymptoms.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getClientMalariaSymptoms();
      return response;
    } catch (error) {
      console.error('Error adding client malaria symptom:', error);
      this.toast.openToast({
        message: 'Error adding client malaria symptom',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the client malaria symptom
  generateInsertQueryAndParams(clientMalariaSymptoms: ClientMalariaSymptom[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ClientMalariaSymptom (
      TransactionId,
      ClientId,
      MalariaSymptomId,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = clientMalariaSymptoms.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    clientMalariaSymptoms.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(
        guid,
        item.ClientId,
        item.MalariaSymptomId,
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

  // Delete the previous transactions for the client malaria symptom and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM ClientMalariaSymptom WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM ClientMalariaSymptom WHERE TransactionId IN (${previousTransactionIds
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
        tableName: 'ClientMalariaSymptom',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  async updateClientMalariaSymptomsById(TransactionId: string, clientMalariaSymptoms: ClientMalariaSymptom) {
    const sql = `
    UPDATE ClientMalariaSymptom
    SET
      ClientId = ?,
      MalariaSymptomId = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      clientMalariaSymptoms.ClientId,
      clientMalariaSymptoms.MalariaSymptomId,
      clientMalariaSymptoms.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'ClientMalariaSymptom',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getClientMalariaSymptoms();
      console.log('Client malaria symptoms updated successfully');
      this.toast.openToast({
        message: 'Client malaria symptoms updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating client malaria symptoms:', error);
      this.toast.openToast({
        message: 'Error updating client malaria symptoms',
        color: 'error',
      });
    }
  }

  async getClientMalariaSymptomsByClientId(clientId: string): Promise<ClientMalariaSymptom[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM ClientMalariaSymptom WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as ClientMalariaSymptom[];
  }

  // for multiple clients
  async getClientMalariaSymptomsByClientIds(clientIds: string[]): Promise<ClientMalariaSymptom[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      `SELECT * FROM ClientMalariaSymptom WHERE ClientId IN (${clientIds.map(() => '?').join(',')}) AND IsDeleted = 0;`,
      clientIds
    );
    console.log(result.values);
    return result.values as ClientMalariaSymptom[];
  }

  async getClientMalariaSymptomsById(TransactionId: string): Promise<ClientMalariaSymptom | null> {
    const sql = `
      SELECT *
      FROM ClientMalariaSymptom
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ClientMalariaSymptom;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching client malaria symptoms by id:', error);
        return null;
      });
  }

  async deleteClientMalariaSymptomsById(TransactionId: string) {
    const sql = `DELETE FROM ClientMalariaSymptom WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getClientMalariaSymptoms();
    } catch (error) {
      console.error('Error deleting client malaria symptoms:', error);
    }
  }
}
