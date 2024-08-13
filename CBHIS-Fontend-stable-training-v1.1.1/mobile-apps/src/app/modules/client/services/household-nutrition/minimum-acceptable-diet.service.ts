import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ClientMinimumAcceptableDiet, MinimumAcceptableDiet } from '../../models/service-models/household-nutrition';

@Injectable({
  providedIn: 'root',
})
export class MinimumAcceptableDietStorageService {
  public clientMinimumAcceptableDietList: BehaviorSubject<ClientMinimumAcceptableDiet[]> = new BehaviorSubject<
    ClientMinimumAcceptableDiet[]
  >([]);
  private db!: SQLiteDBConnection;
  private isClientMinimumAcceptableDietReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public minimumAcceptableDietList: BehaviorSubject<MinimumAcceptableDiet[]> = new BehaviorSubject<
    MinimumAcceptableDiet[]
  >([]);

  getDbConnection(): SQLiteDBConnection {
    return this.db;
  }

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ClientMinimumAcceptableDietService initialized');
      this.loadClientMinimumAcceptableDiet();
      this.loadMinimumAcceptableDiet();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getClientMinimumAcceptableDiet();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the MinimumAcceptableDiet as observable
  minimumAcceptableDietState(): Observable<boolean> {
    return this.isClientMinimumAcceptableDietReady.asObservable();
  }

  clientMinimumAcceptableDietState(): Observable<boolean> {
    return this.isClientMinimumAcceptableDietReady.asObservable();
  }

  // Send all the MinimumAcceptableDiet List as observable
  fetchMinimumAcceptableDiet(): Observable<MinimumAcceptableDiet[]> {
    return this.minimumAcceptableDietList.asObservable();
  }

  fetchClientMinimumAcceptableDiet(): Observable<ClientMinimumAcceptableDiet[]> {
    return this.clientMinimumAcceptableDietList.asObservable();
  }
  // Load all the MinimumAcceptableDiet from the database
  async loadMinimumAcceptableDiet() {
    const minimumAcceptableDiet: MinimumAcceptableDiet[] = (await this.db.query('SELECT * FROM MinimumAcceptableDiet;'))
      .values as MinimumAcceptableDiet[];
    console.log('Minimum acceptable DIet', minimumAcceptableDiet);
    this.minimumAcceptableDietList.next(minimumAcceptableDiet);
  }

  async loadClientMinimumAcceptableDiet() {
    const clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet[] = (
      await this.db.query('SELECT * FROM ClientMinimumAcceptableDiet;')
    ).values as ClientMinimumAcceptableDiet[];
    this.clientMinimumAcceptableDietList.next(clientMinimumAcceptableDiet);
  }

  async getClientMinimumAcceptableDiet() {
    await this.loadClientMinimumAcceptableDiet();
    this.isClientMinimumAcceptableDietReady.next(true);
  }

  async addClientMinimumAcceptableDiet(
    clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet[]
  ): Promise<(capSQLiteChanges | null)[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      // await this.syncQueueService.deleteQueueByTableName('ClientMinimumAcceptableDiet');
      const responses: (capSQLiteChanges | null)[] = [];
      if (clientMinimumAcceptableDiet?.length > 0) {
        for (const item of clientMinimumAcceptableDiet) {
          const { OnlineDbOid, TransactionId } = item;
          // If OnlineDbOid and TransactionId is not null
          if (!!OnlineDbOid && !!TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientMinimumAcceptableDiet', OnlineDbOid);
            console.log("object doesn't have onlineDbOid1");
            await this.addTransactionToQueue('UPDATE', OnlineDbOid);
            responses.push(await this.updateClientMinimumAcceptableDietItemWithOnlineDbId(item));
          }
          // If OnlineDbOid is null but TransactionId is not null
          else if (!OnlineDbOid && !!TransactionId) {
            console.log("object doesn't have onlineDbOid2");
            responses.push(await this.updateClientMinimumAcceptableDietItem(item));
          }
          // If OnlineDbOid and TransactionId is null
          else {
            // await this.deleteExistingClientMinimumAcceptableDietItems([item]);
            console.log("object doesn't have onlineDbOid3");
            responses.push(await this.insertClientMinimumAcceptableDietItems([item]));
          }
        }
        return responses;
      } else return [null];
    } catch (error) {
      return [null];
    }
  }

  private async updateClientMinimumAcceptableDietItemWithOnlineDbId(
    item: ClientMinimumAcceptableDiet
  ): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ClientMinimumAcceptableDiet SET
      MinimumAcceptableDietId = ?,
      Frequency = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.MinimumAcceptableDietId,
      item.Frequency,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateClientMinimumAcceptableDietItem(item: ClientMinimumAcceptableDiet): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ClientMinimumAcceptableDiet SET
      MinimumAcceptableDietId = ?,
      Frequency = ?,
      MatchId = ?
      WHERE
      TransactionId = ?
    `;
    const params = [item.MinimumAcceptableDietId, item.Frequency, item.MatchId, item.TransactionId];
    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);
    const response = await this.db.run(baseUpdateQuery, params);
    return response;
  }

  private async insertClientMinimumAcceptableDietItems(
    clientMinimumAcceptableDietItems: ClientMinimumAcceptableDiet[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ClientMinimumAcceptableDiet (
      TransactionId,
      ClientId,
      MinimumAcceptableDietId,
      Frequency,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = clientMinimumAcceptableDietItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';
    const params: (string | number | boolean | undefined | null)[] = [];
    for (const item of clientMinimumAcceptableDietItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.MinimumAcceptableDietId,
        item.Frequency,
        item.IsDeleted ?? 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt as string
      );
    }

    console.log('Inserted query for ClientMinimumAcceptableDiet item', query, params);

    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadClientMinimumAcceptableDiet();
      return response;
    } catch (error) {
      console.error('Error in insertClientMinimumAcceptableDietItems: ', error);
      return null;
    }
  }

  private async deleteExistingClientMinimumAcceptableDietItems(
    clientMinimumAcceptableDietItems: ClientMinimumAcceptableDiet[]
  ): Promise<void> {
    console.log('Deleting existing item in client minimum acceptable diet');
    for (const item of clientMinimumAcceptableDietItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM ClientMinimumAcceptableDiet WHERE ClientId = ?;', [
          item.ClientId,
        ])
      ).values?.map((oid) => oid.TransactionId);
      console.log('oid for client', OidForClient);

      // if (OidForClient?.length) {
      //   for (const oid of OidForClient) {
      //     await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientMinimumAcceptableDiet', oid);
      //   }
      // }
      await this.db.run('DELETE FROM ClientMinimumAcceptableDiet WHERE ClientId = ?', [item.ClientId]);
    }
  }

  // private async deleteMinimumAccetable

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
      tableName: 'ClientMinimumAcceptableDiet',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  async updateClientMinimumAcceptableDietById(
    TransactionId: string,
    clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet
  ) {
    const sql = `
    UPDATE ClientMinimumAcceptableDiet
    SET
      ClientId = ?,
      MinimumAcceptableDietId = ?,
      Frequency = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      clientMinimumAcceptableDiet.ClientId,
      clientMinimumAcceptableDiet.MinimumAcceptableDietId,
      clientMinimumAcceptableDiet.Frequency,
      clientMinimumAcceptableDiet.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'ClientMinimumAcceptableDiet',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getClientMinimumAcceptableDiet();
      console.log('Client minimum acceptable diet updated successfully');
      this.toast.openToast({
        message: 'Client minimum acceptable diet updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating client minimum acceptable diet:', error);
      this.toast.openToast({
        message: 'Error updating client minimum acceptable diet',
        color: 'error',
      });
    }
  }

  // for multiple client
  async getClientsMinimumAcceptableDietByClientIds(clientIds: string[]): Promise<ClientMinimumAcceptableDiet[]> {
    if (!this.db) await this.initializeDatabase();
    // Create a placeholder string with the correct number of placeholders based on the clientIds array length
    const placeholders = clientIds.map(() => '?').join(', ');
    const query = `SELECT * FROM ClientMinimumAcceptableDiet WHERE ClientId IN (${placeholders}) AND IsDeleted = 0;`;
    const result = await this.db.query(query, clientIds);
    console.log(result.values);
    // Assuming result.values is an array of ClientMinimumAcceptableDiet
    return result.values as ClientMinimumAcceptableDiet[];
  }

  async getClientMinimumAcceptableDietByClientId(clientId: string): Promise<ClientMinimumAcceptableDiet> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      'SELECT * FROM ClientMinimumAcceptableDiet WHERE ClientId = ? AND IsDeleted = 0;',
      [clientId]
    );
    console.log(result.values);
    return result.values?.[0] as ClientMinimumAcceptableDiet;
  }

  async getClientMinimumAcceptableDietById(TransactionId: string): Promise<ClientMinimumAcceptableDiet | null> {
    const sql = `
      SELECT *
      FROM ClientMinimumAcceptableDiet
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ClientMinimumAcceptableDiet;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching client minimum acceptable diet by id:', error);
        return null;
      });
  }

  async deleteClientMinimumAcceptableDietById(TransactionId: string) {
    const sql = `DELETE FROM ClientMinimumAcceptableDiet WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getClientMinimumAcceptableDiet();
    } catch (error) {
      console.error('Error deleting client minimum acceptable diet:', error);
    }
  }
}
