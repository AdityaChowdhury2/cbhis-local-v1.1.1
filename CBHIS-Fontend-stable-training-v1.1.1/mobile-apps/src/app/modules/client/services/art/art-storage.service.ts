import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ARTClient } from '../../models/service-models/art';

@Injectable({
  providedIn: 'root',
})
export class ArtStorageService {
  public artClientList: BehaviorSubject<ARTClient[]> = new BehaviorSubject<ARTClient[]>([]);
  private db!: SQLiteDBConnection;
  private isARTClientReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ARTClientService initialized');
      this.loadARTClients();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getARTClients();
    } catch (error) {
      console.log('database init', error);
    }
  }

  artClientState(): Observable<boolean> {
    return this.isARTClientReady.asObservable();
  }

  fetchARTClients(): Observable<ARTClient[]> {
    return this.artClientList.asObservable();
  }

  async loadARTClients() {
    const artClients: ARTClient[] = (await this.db.query('SELECT * FROM ARTClient;')).values as ARTClient[];
    this.artClientList.next(artClients);
  }

  async getARTClients() {
    await this.loadARTClients();
    this.isARTClientReady.next(true);
  }
  async addARTClient(artClient: ARTClient[]): Promise<(capSQLiteChanges | null)[]> {
    try {
      if (!this.db) await this.initializeDatabase();
      const responses: (capSQLiteChanges | null)[] = [];
      if (artClient?.length > 0) {
        for (const item of artClient) {
          const { OnlineDbOid, TransactionId } = item;
          if (!!OnlineDbOid && !!TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('ARTClient', OnlineDbOid);
            console.log("object doesn't have onlineDbOid1");
            await this.addTransactionToQueue('UPDATE', OnlineDbOid);
            responses.push(await this.updateARTClientItemWithOnlineDbId(item));
          } else if (!OnlineDbOid && !!TransactionId) {
            console.log("object doesn't have onlineDbOid2");
            responses.push(await this.updateARTClientItem(item));
          } else {
            console.log("object doesn't have onlineDbOid3");
            responses.push(await this.insertARTClientItems([item]));
          }
        }
        return responses;
      } else return [null];
    } catch (error) {
      return [null];
    }
  }

  private async updateARTClientItemWithOnlineDbId(item: ARTClient): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ARTClient SET
      MedicationSideEffect = ?,
      IsOnTBPrevention = ?,
      WellbeingIssues = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [
      item.MedicationSideEffect ?? 0,
      item.IsOnTBPrevention ?? 0,
      item.WellbeingIssues,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateARTClientItem(item: ARTClient): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ARTClient SET
      MedicationSideEffect = ?,
      IsOnTBPrevention = ?,
      WellbeingIssues = ?
      WHERE
      TransactionId = ?
    `;
    const params = [
      item.MedicationSideEffect ?? 0,
      item.IsOnTBPrevention ?? 0,
      item.WellbeingIssues,
      item.TransactionId,
    ];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertARTClientItems(artClientItems: ARTClient[]): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ARTClient (
      TransactionId,
      ClientId,
      MedicationSideEffect,
      IsOnTBPrevention,
      WellbeingIssues,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = artClientItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | null | undefined)[] = [];
    for (const item of artClientItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.MedicationSideEffect,
        item.IsOnTBPrevention ?? 0,
        item.WellbeingIssues,
        item.IsDeleted ?? 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreateAt
      );
    }
    console.log('Inserted query for ARTClient item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadARTClients();
      return response;
    } catch (error) {
      console.error('Error in insertArtClientItems: ', error);
      return null;
    }
  }

  private async deleteExistingArtClientItems(artClientItems: ARTClient[]): Promise<void> {
    for (const item of artClientItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM ARTClient WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ARTClient', oid);
        }
      }

      await this.db.run('DELETE FROM ARTClient WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'ARTClient',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  // for multiple client
  async getARTClientsByClientIds(clientIds: string[]): Promise<ARTClient[]> {
    if (!this.db) await this.initializeDatabase();
    const placeholders = clientIds.map(() => '?').join(', ');
    const query = `SELECT * FROM ARTClient WHERE ClientId IN (${placeholders}) AND IsDeleted = 0;`;
    const result = await this.db.query(query, clientIds);
    console.log(result.values);
    return result.values as ARTClient[];
  }
  // async addARTClient(artClients: ARTClient[]): Promise<capSQLiteChanges | null> {

  //   if (!this.db) await this.initializeDatabase();

  //   const baseQuery = `INSERT INTO ARTClient (
  //     TransactionId,
  //     ClientId,
  //     MedicationSideEffect,
  //     IsOnTBPrevention,
  //     WellbeingIssues,
  //     IsDeleted
  //   ) VALUES `;
  //   const placeholders = artClients.map(() => `( ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';
  //   console.log(query);
  //   const params: (number | string | undefined)[] = [];

  //   for (const item of artClients) {
  //     const { ClientId, MedicationSideEffect, IsOnTBPrevention, WellbeingIssues, IsDeleted } = item;
  //     params.push(generateGUID(), ClientId, MedicationSideEffect, IsOnTBPrevention, WellbeingIssues, IsDeleted ? 1 : 0);
  //   }

  //   try {
  //     for (const items of artClients) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM ARTClient WHERE ClientId = ? ;', [items.ClientId])
  //       ).values?.map((oid) => oid.TransactionId);

  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('ARTClients', oid);
  //         }
  //       }

  //       const deleteResponse = await this.db.run('DELETE FROM ARTClient WHERE ClientId = ?', [items.ClientId]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     const response = await this.db.run(query, params);

  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM ARTClient;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     // if (newInsertedOidArr?.length) {
  //     //   for (const insertedOid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'ARTClients',
  //     //       transactionId: insertedOid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getARTClients();

  //     return response;
  //   } catch (error) {
  //     console.error('Error adding ART client:', error);
  //     this.toast.openToast({
  //       message: 'Error adding ART client',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateARTClientById(TransactionId: string, artClient: ARTClient) {
    const sql = `
    UPDATE ARTClient
    SET
      ClientId = ?,
      MedicationSideEffect = ?,
      IsOnTBPrevention = ?,
      WellbeingIssues = ?,
      IsDeleted = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      artClient.ClientId,
      artClient.MedicationSideEffect,
      artClient.IsOnTBPrevention,
      artClient.WellbeingIssues,
      artClient.IsDeleted ?? 0,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);

      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'ARTClients',
      //   transactionId: TransactionId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getARTClients();
      console.log('ART client updated successfully');
      this.toast.openToast({
        message: 'ART client updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating ART client:', error);
      this.toast.openToast({
        message: 'Error updating ART client',
        color: 'error',
      });
    }
  }

  async getARTClientByClientId(clientId: string): Promise<ARTClient> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM ARTClient WHERE ClientId = ? AND IsDeleted = 0;', [clientId]);
    console.log(result.values);
    return result.values?.[0] as ARTClient;
  }

  async getARTClientById(TransactionId: string): Promise<ARTClient | null> {
    const sql = `
      SELECT *
      FROM ARTClients
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ARTClient;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching ART client by id:', error);
        return null;
      });
  }

  async deleteARTClientById(TransactionId: string) {
    const sql = `DELETE FROM ARTClient WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getARTClients();
    } catch (error) {
      console.error('Error deleting ART client:', error);
    }
  }
}
