import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { ANC } from '../models/anc';

@Injectable({
  providedIn: 'root',
})
export class AncStorageService {
  // * Local variables
  public ANCDataList: BehaviorSubject<ANC[]> = new BehaviorSubject<ANC[]>([]);
  private isDataReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  db!: SQLiteDBConnection;

  constructor(private sqliteService: SQLiteService, private syncQueueService: SyncStorageService) {
    this.initializeDatabase().then(() => {
      console.log('ANC StorageService initialized');
    });
  }

  async initializeDatabase() {
    this.db = await this.sqliteService.retrieveConnection();
    await this.loadANC();
    this.isDataReady.next(true);
  }

  async loadANC() {
    const result = await this.db.query('SELECT * FROM ANC WHERE IsDeleted = 0;');
    this.ANCDataList.next(result.values as []);
  }

  fetchData() {
    return this.ANCDataList.asObservable();
  }

  // * Add a new item to the ANC table
  // async addItems(ancItems: ANC[]): Promise<capSQLiteChanges | null> {

  //   if (!this.db) await this.initializeDatabase();

  //   if(ancItems?.length>0){
  //     ancItems.forEach(element => {
  //       if(element.OnlineDbOid != null){
  //           const baseUpdateQuery = `
  //           UPDATE ANC SET
  //           IsCounselled = ?,
  //           IsANCInitiated = ?,
  //           IsMalariaDrugTaken = ?,
  //           FrequencyOfMalariaTherapy = ?,
  //           ModifiedBy = ?
  //           WHERE
  //           TransactionId = ?
  //           AND
  //           OnlineDbOid = ?
  //           `

  //         // Execute the query with the parameters
  //         const response = await this.db.run(query, params);
  //       }
  //       else{

  //       }
  //     });
  //   }

  //   const baseQuery = `INSERT INTO ANC (
  //     TransactionId,
  //     ClientId,
  //     IsCounselled,
  //     IsANCInitiated,
  //     IsMalariaDrugTaken,
  //     FrequencyOfMalariaTherapy,
  //     IsDeleted,
  //     CreatedBy
  //   ) VALUES `;
  //   const placeholders = ancItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   console.log(query);

  //   const params: (string | number | boolean)[] = [];
  //   for (const item of ancItems) {
  //     params.push(
  //       generateGUID(),
  //       item.ClientId,
  //       item.IsCounselled,
  //       item.IsANCInitiated,
  //       item.IsMalariaDrugTaken,
  //       item.FrequencyOfMalariaTherapy,
  //       item.IsDeleted ?? 0,
  //       item.CreatedBy
  //     );
  //   }

  //   try {
  //     for (const items of ancItems) {
  //       console.log('ClientId: ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT TransactionId FROM ANC WHERE ClientId = ?;', [items.ClientId])
  //       ).values?.map((oid) => oid.Oid);

  //       // Delete the data from sync queue
  //       if (OidForClient?.length) {
  //         console.log('OidForClient for delete operation: ', OidForClient);
  //         for (const oid of OidForClient) {
  //           await this.syncQueueService.deleteQueueByTableAndTransactionId('ANC', oid);
  //         }
  //       }

  //       // Delete the existing items
  //       const deleteResponse = await this.db.run('DELETE FROM ANC WHERE ClientId = ?', [items.ClientId]);
  //       console.log('Deleted Response: ', deleteResponse);
  //     }

  //     // Execute the query with the parameters
  //     const response = await this.db.run(query, params);

  //     // Get the Oid of the inserted item
  //     const newInsertedOidArr = (await this.db.query('SELECT TransactionId FROM ANC;')).values?.map(
  //       (oid) => oid.TransactionId
  //     );

  //     // Add the transaction to the sync queue for all new InsertedOid
  //     if (newInsertedOidArr?.length) {
  //       for (const insertedOid of newInsertedOidArr) {
  //         await this.syncQueueService.addTransactionInQueue({
  //           id: 0,
  //           operation: 'INSERT',
  //           tableName: 'ANC',
  //           transactionId: insertedOid,
  //           dateCreated: dayjs().format(),
  //           createdBy: 1,
  //           dateModified: dayjs().format(),
  //           modifiedBy: 1,
  //         });
  //       }
  //     }

  //     // Reload the data
  //     await this.loadANC();

  //     return response;
  //   } catch (error) {
  //     console.error('Error in addItems: ', error);
  //     return null;
  //   }
  // }

  async addItems(ancItems: ANC[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    if (ancItems?.length > 0) {
      for (const item of ancItems) {
        if (!!item.OnlineDbOid && !!item.TransactionId) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ANC', item.OnlineDbOid);
          await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
          return await this.updateANCItemWithOnlineDbId(item);
        } else if (!item.OnlineDbOid && !!item.TransactionId) {
          return await this.updateANCItem(item);
        } else {
          //await this.deleteExistingANCItems([item]);
          return await this.insertANCItems([item]);
        }
      }
    }

    return null;
  }

  private async updateANCItemWithOnlineDbId(item: ANC): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
        UPDATE ANC SET
        IsCounselled = ?,
        IsANCInitiated = ?,
        IsMalariaDrugTaken = ?,
        FrequencyOfMalariaTherapy = ?,
        ModifiedBy = ?
        WHERE
        TransactionId = ?
        AND
        OnlineDbOid = ?
    `;
    const params = [
      item.IsCounselled ?? 0,
      item.IsANCInitiated ?? 0,
      item.IsMalariaDrugTaken ?? 0,
      item.FrequencyOfMalariaTherapy,
      item.ModifiedBy,
      item.TransactionId,
      item.OnlineDbOid,
    ];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }
  private async updateANCItem(item: ANC): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ANC SET
      IsCounselled = ?,
      IsANCInitiated = ?,
      IsMalariaDrugTaken = ?,
      FrequencyOfMalariaTherapy = ?
      WHERE
      TransactionId = ?
  `;
    const params = [
      item.IsCounselled ?? 0,
      item.IsANCInitiated ?? 0,
      item.IsMalariaDrugTaken ?? 0,
      item.FrequencyOfMalariaTherapy,
      item.TransactionId,
    ];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertANCItems(ancItems: ANC[]): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ANC (
        TransactionId,
        ClientId,
        IsCounselled,
        IsANCInitiated,
        IsMalariaDrugTaken,
        FrequencyOfMalariaTherapy,
        IsDeleted,
        CreatedBy
    ) VALUES `;
    const placeholders = ancItems.map(() => `(?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean)[] = [];
    for (const item of ancItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(
        newGuid,
        item.ClientId,
        item.IsCounselled ?? 0,
        item.IsANCInitiated ?? 0,
        item.IsMalariaDrugTaken ?? 0,
        item.FrequencyOfMalariaTherapy,
        item.IsDeleted ?? 0,
        item.CreatedBy
      );
    }
    console.log('Inserted query for anc item', query, params);
    try {
      // Execute the query with the parameters
      const response = await this.db.run(query, params);

      console.log(
        'selected data',
        await this.db.query('SELECT * FROM ANC WHERE TransactionId = ?;', [generateGUIDs[0]])
      );

      // Add the transaction to the sync queue for all new InsertedOid
      await this.addNewTransactionsToQueue(generateGUIDs);

      // Reload the data
      await this.loadANC();

      return response;
    } catch (error) {
      console.error('Error in insertANCItems: ', error);
      return null;
    }
  }

  private async deleteExistingANCItems(ancItems: ANC[]): Promise<void> {
    for (const item of ancItems) {
      console.log('ClientId: ', item.ClientId);
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM ANC WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      // Delete the data from sync queue
      if (OidForClient?.length) {
        console.log('OidForClient for delete operation: ', OidForClient);
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ANC', oid);
        }
      }

      // Delete the existing items
      const deleteResponse = await this.db.run('DELETE FROM ANC WHERE ClientId = ?', [item.ClientId]);
      console.log('Deleted Response: ', deleteResponse);
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
    console.log('anc operation', operation);
    await this.syncQueueService.addTransactionInQueue({
      id: 0,
      operation,
      tableName: 'ANC',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  // * Update an existing item in the ANC table
  async updateItemById(Oid: number, ancItem: ANC): Promise<capSQLiteChanges | null> {
    const sql = `
      UPDATE ANC
      SET
        ClientId = ?,
        IsCounselled = ?,
        IsANCInitiated = ?,
        IsMalariaDrugTaken = ?,
        FrequencyOfMalariaTherapy = ?,
        IsDeleted = ?
      WHERE TransactionId = ?;
    `;
    const params = [
      ancItem.ClientId,
      ancItem.IsCounselled,
      ancItem.IsANCInitiated,
      ancItem.IsMalariaDrugTaken,
      ancItem.FrequencyOfMalariaTherapy,
      ancItem.IsDeleted ?? 0,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'ANC',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });

      await this.loadANC();
      console.log('ANC updated successfully');

      return null;
    } catch (error) {
      console.error('Error updating ANC:', error);
      return null;
    }
  }

  async getANCByClientId(clientId: string): Promise<ANC> {
    const result = (await this.db.query('SELECT * FROM ANC WHERE ClientId = ? AND IsDeleted = 0;', [clientId]))
      ?.values?.[0];
    console.log(result);
    return result;
  }
}
