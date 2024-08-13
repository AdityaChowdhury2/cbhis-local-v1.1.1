import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ClientTBSymptom, TBSymptom } from '../../models/service-models/tb';

@Injectable({
  providedIn: 'root',
})
export class ClientTbSymptomsStorageService {
  public clientTBSymptomsList: BehaviorSubject<ClientTBSymptom[]> = new BehaviorSubject<ClientTBSymptom[]>([]);
  private db!: SQLiteDBConnection;
  private isClientTBSymptomsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private isTBSymptomsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private tbSymptomsList: BehaviorSubject<TBSymptom[]> = new BehaviorSubject<TBSymptom[]>([]);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ClientTBSymptomsService initialized');
      this.loadClientTBSymptoms();
      this.loadTBSymptoms();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getClientTBSymptoms();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the ClientTBSymptoms as observable
  tbSymptomsState(): Observable<boolean> {
    return this.isTBSymptomsReady.asObservable();
  }

  clientTBSymptomsState(): Observable<boolean> {
    return this.isClientTBSymptomsReady.asObservable();
  }

  // Send all the TBSymptoms List as observable
  fetchTBSymptoms(): Observable<TBSymptom[]> {
    return this.tbSymptomsList.asObservable();
  }

  fetchClientTBSymptoms(): Observable<ClientTBSymptom[]> {
    return this.clientTBSymptomsList.asObservable();
  }

  // Load TBSymptoms
  async loadTBSymptoms() {
    const TBSymptoms: TBSymptom[] = (await this.db.query('SELECT * FROM TBSymptom;')).values as TBSymptom[];

    this.tbSymptomsList.next(TBSymptoms);
  }

  async loadClientTBSymptoms() {
    const clientTBSymptoms: ClientTBSymptom[] = (await this.db.query('SELECT * FROM ClientTBSymptom;'))
      .values as ClientTBSymptom[];

    this.clientTBSymptomsList.next(clientTBSymptoms);
  }

  async getClientTBSymptoms() {
    await this.loadClientTBSymptoms();
    this.isClientTBSymptomsReady.next(true);
  }

  async addClientTBSymptoms(clientTBSymptoms: ClientTBSymptom[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    if (clientTBSymptoms?.length > 0) {
      for (const item of clientTBSymptoms) {
        if (!!item.OnlineDbOid && !!item.TransactionId) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientTBSymptom', item.OnlineDbOid);
          await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
          return await this.updateClientTBSymptomItemWithOnlineDbId(item);
        } else if (!item.OnlineDbOid && !!item.TransactionId) {
          return await this.updateClientTBSymptomItem(item);
        } else {
          return await this.insertClientTBSymptomItems([item]);
        }
      }
    }

    return null;
  }

  private async updateClientTBSymptomItemWithOnlineDbId(item: ClientTBSymptom): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ClientTBSymptom SET
      TBSymptomId = ?,
      IsSputumCollected = ?,
      IsTBContact = ?,
      IsPresumptive = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.TBSymptomId,
      item.IsSputumCollected ?? 0,
      item.IsTBContact ?? 0,
      item.IsPresumptive ?? 0,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateClientTBSymptomItem(item: ClientTBSymptom): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ClientTBSymptom SET
      TBSymptomId = ?,
      IsSputumCollected = ?,
      IsTBContact = ?,
      IsPresumptive = ?
      WHERE
      TransactionId = ?
    `;
    const params = [
      item.TBSymptomId,
      item.IsSputumCollected ?? 0,
      item.IsTBContact ?? 0,
      item.IsPresumptive ?? 0,
      item.TransactionId,
    ];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertClientTBSymptomItems(clientTBSymptomItems: ClientTBSymptom[]): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ClientTBSymptom (
      TransactionId,
      ClientId,
      TBSymptomId,
      IsSputumCollected,
      IsTBContact,
      IsPresumptive,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = clientTBSymptomItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | null)[] = [];
    for (const item of clientTBSymptomItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.TBSymptomId,
        item.IsSputumCollected ?? 0,
        item.IsTBContact ?? 0,
        item.IsPresumptive ?? 0,
        item.IsDeleted ?? 0,
        item.CreatedBy
      );
    }
    console.log('Inserted query for ClientTBSymptom item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadClientTBSymptoms();
      return response;
    } catch (error) {
      console.error('Error in insertClientTBSymptomItems: ', error);
      return null;
    }
  }

  private async deleteExistingClientTBSymptomItems(clientTBSymptomItems: ClientTBSymptom[]): Promise<void> {
    for (const item of clientTBSymptomItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM ClientTBSymptom WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientTBSymptom', oid);
        }
      }

      await this.db.run('DELETE FROM ClientTBSymptom WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'ClientTBSymptom',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  // async addClientTBSymptoms(clientTBSymptoms: ClientTBSymptom[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();
  //   console.log('client ', clientTBSymptoms);

  //   const baseQuery = `INSERT INTO ClientTBSymptom (
  //     TransactionId,
  //     ClientId,
  //     TBSymptomId,
  //     IsSputumCollected,
  //     IsTBContact,
  //     IsPresumptive,
  //     IsDeleted
  //   ) VALUES `;
  //   const placeholders = clientTBSymptoms.map(() => `( ?, ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of clientTBSymptoms) {
  //     const { ClientId, TBSymptomId, IsSputumCollected, IsTBContact, IsPresumptive, IsDeleted } = item;
  //     params.push(
  //       generateGUID(),
  //       ClientId,
  //       TBSymptomId,
  //       IsSputumCollected,
  //       IsTBContact,
  //       IsPresumptive,
  //       IsDeleted ? 1 : 0
  //     );
  //   }

  //   try {
  //     for (const items of clientTBSymptoms) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM ClientTBSymptom WHERE ClientId = ?;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('ClientTBSymptoms', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM ClientTBSymptom WHERE ClientId = ?', [items.ClientId]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM ClientTBSymptom;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     console.log("new inserted Oid's: ", newInsertedOidArr);
  //     if (newInsertedOidArr?.length) {
  //       for (const insertedOid of newInsertedOidArr) {
  //         await this.syncQueueService.addTransactionInQueue({
  //           id: 0,
  //           operation: 'INSERT',
  //           tableName: 'ClientTBSymptom',
  //           transactionId: insertedOid,
  //           dateCreated: dayjs().format(),
  //           createdBy: 1,
  //           dateModified: dayjs().format(),
  //           modifiedBy: 1,
  //         });
  //       }
  //     } else {
  //       console.log('newInsertedOidArr is empty');
  //     }

  //     await this.getClientTBSymptoms();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding client TB symptoms:', error);
  //     this.toast.openToast({
  //       message: 'Error adding client TB symptoms',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateClientTBSymptomsById(TransactionId: string, clientTBSymptoms: ClientTBSymptom) {
    const sql = `
    UPDATE ClientTBSymptom
    SET
      ClientId = ?,
      TBSymptomId = ?,
      IsSputumCollected = ?,
      IsTBContact = ?,
      IsPresumptive = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      clientTBSymptoms.ClientId,
      clientTBSymptoms.TBSymptomId,
      clientTBSymptoms.IsSputumCollected,
      clientTBSymptoms.IsTBContact,
      clientTBSymptoms.IsPresumptive,
      clientTBSymptoms.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'ClientTBSymptoms',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getClientTBSymptoms();
      console.log('Client TB symptoms updated successfully');
      this.toast.openToast({
        message: 'Client TB symptoms updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating client TB symptoms:', error);
      this.toast.openToast({
        message: 'Error updating client TB symptoms',
        color: 'error',
      });
    }
  }

  async getClientTBSymptomsByClientId(clientId: string): Promise<ClientTBSymptom> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM ClientTBSymptom WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values?.[0] as ClientTBSymptom;
  }

  async getClientTBSymptomsById(TransactionId: string): Promise<ClientTBSymptom | null> {
    const sql = `
      SELECT *
      FROM ClientTBSymptom
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ClientTBSymptom;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching client TB symptoms by id:', error);
        return null;
      });
  }

  async deleteClientTBSymptomsById(TransactionId: string) {
    const sql = `DELETE FROM ClientTBSymptom WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getClientTBSymptoms();
    } catch (error) {
      console.error('Error deleting client TB symptoms:', error);
    }
  }
}
