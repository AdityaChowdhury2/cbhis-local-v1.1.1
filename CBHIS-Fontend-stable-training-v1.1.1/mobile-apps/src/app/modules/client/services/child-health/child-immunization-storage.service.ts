import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { generateGUID } from './../../../../shared/utils/common';

import * as dayjs from 'dayjs';
import { SQLiteService } from './../../../../shared/services/database/sqlite.service';
import { ToastService } from './../../../../shared/services/toast.service';
import { ChildImmunization } from './../../models/service-models/child-health';

@Injectable({
  providedIn: 'root',
})
export class ChildImmunizationStorageService {
  public childImmunizationList: BehaviorSubject<ChildImmunization[]> = new BehaviorSubject<ChildImmunization[]>([]);
  private db!: SQLiteDBConnection;
  private isChildImmunizationReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ChildImmunizationService initialized');
      this.loadChildImmunizations();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getChildImmunizations();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // The state of the ChildImmunizations as observable
  childImmunizationState(): Observable<boolean> {
    return this.isChildImmunizationReady.asObservable();
  }

  // Send all the ChildImmunizations List as observable
  fetchChildImmunizations(): Observable<ChildImmunization[]> {
    return this.childImmunizationList.asObservable();
  }

  // Load all the ChildImmunizations records from the database
  async loadChildImmunizations() {
    const childImmunizations: ChildImmunization[] = (await this.db.query('SELECT * FROM ChildImmunization;'))
      .values as ChildImmunization[];
    this.childImmunizationList.next(childImmunizations);
  }

  async getChildImmunizations() {
    await this.loadChildImmunizations();
    this.isChildImmunizationReady.next(true);
  }
  async addChildImmunization(childImmunizations: ChildImmunization[]): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      if (childImmunizations?.length > 0) {
        for (const item of childImmunizations) {
          if (!!item.OnlineDbOid && !!item.TransactionId) {
            await this.syncQueueService.deleteQueueByTableAndTransactionId('ChildImmunization', item.OnlineDbOid);
            await this.addTransactionToQueue('UPDATE', item.OnlineDbOid);
            return await this.updateChildImmunizationItemWithOnlineDbId(item);
          } else if (!item.OnlineDbOid && !!item.TransactionId) {
            return await this.updateChildImmunizationItem(item);
          } else {
            return await this.insertChildImmunizationItems([item]);
          }
        }
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  private async updateChildImmunizationItemWithOnlineDbId(item: ChildImmunization): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ChildImmunization SET
      ImmunizationStatus = ?,
      ModifiedBy = ?
      WHERE
      TransactionId = ?
      AND
      OnlineDbOid = ?
    `;
    const params = [item.ImmunizationStatus ?? 0, item.ModifiedBy, item.TransactionId, item.OnlineDbOid];

    console.log('query: ', baseUpdateQuery);
    console.log('params: ', params);

    return await this.db.run(baseUpdateQuery, params);
  }

  private async updateChildImmunizationItem(item: ChildImmunization): Promise<capSQLiteChanges> {
    const baseUpdateQuery = `
      UPDATE ChildImmunization SET
      ImmunizationStatus = ?
      WHERE
      TransactionId = ?
    `;
    const params = [item.ImmunizationStatus ?? 0, item.TransactionId];

    return await this.db.run(baseUpdateQuery, params);
  }

  private async insertChildImmunizationItems(
    childImmunizationItems: ChildImmunization[]
  ): Promise<capSQLiteChanges | null> {
    const generateGUIDs: string[] = [];
    const baseQuery = `INSERT INTO ChildImmunization (
      TransactionId,
      ClientId,
      ImmunizationStatus,
      IsDeleted,
      CreatedBy
    ) VALUES `;
    const placeholders = childImmunizationItems.map(() => `(?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number | boolean | null | undefined)[] = [];
    for (const item of childImmunizationItems) {
      const newGuid: string = generateGUID();
      generateGUIDs.push(newGuid);
      params.push(newGuid, item.ClientId, item.ImmunizationStatus, item.IsDeleted ?? 0, item.CreatedBy);
    }
    console.log('Inserted query for ChildImmunization item', query, params);
    try {
      const response = await this.db.run(query, params);
      await this.addNewTransactionsToQueue(generateGUIDs);
      await this.loadChildImmunizations();
      return response;
    } catch (error) {
      console.error('Error in insertChildImmunizationItems: ', error);
      return null;
    }
  }

  private async deleteExistingChildImmunizationItems(childImmunizationItems: ChildImmunization[]): Promise<void> {
    for (const item of childImmunizationItems) {
      const OidForClient = (
        await this.db.query('SELECT TransactionId FROM ChildImmunization WHERE ClientId = ?;', [item.ClientId])
      ).values?.map((oid) => oid.TransactionId);

      if (OidForClient?.length) {
        for (const oid of OidForClient) {
          await this.syncQueueService.deleteQueueByTableAndTransactionId('ChildImmunization', oid);
        }
      }

      await this.db.run('DELETE FROM ChildImmunization WHERE ClientId = ?', [item.ClientId]);
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
      tableName: 'ChildImmunization',
      transactionId,
      dateCreated: dayjs().format(),
      createdBy: 1,
      dateModified: dayjs().format(),
      modifiedBy: 1,
    });
  }

  // for multiple client
  async getChildImmunizationsByClientIds(clientIds: string[]): Promise<ChildImmunization[]> {
    if (!this.db) await this.initializeDatabase();
    // Create a placeholder string with the correct number of placeholders based on the clientIds array length
    const placeholders = clientIds.map(() => '?').join(', ');
    const query = `SELECT * FROM ChildImmunization WHERE ClientId IN (${placeholders}) AND IsDeleted = 0;`;
    const result = await this.db.query(query, clientIds);
    console.log(result.values);
    return result.values as ChildImmunization[];
  }

  // async addChildImmunization(childImmunizations: ChildImmunization[]): Promise<capSQLiteChanges | null> {
  //   if (!this.db) await this.initializeDatabase();
  //   // get the unique client ids from childImmunizations
  //   const clientIds = Array.from(new Set(childImmunizations.map((item) => item.ClientId)));

  //   console.log(childImmunizations);

  //   //  * Check if the client is in client table
  //   console.log(clientIds?.[0]);

  //   // * Generate the query
  //   const baseQuery = `INSERT INTO ChildImmunization (
  //     TransactionId,
  //     ImmunizationStatus,
  //     IsDeleted,
  //     ClientId,
  //     IsSynced,
  //     OnlineDbOid
  //   ) VALUES `;
  //   const placeholders = childImmunizations.map(() => `( ?, ?, ?, ?, ?, ?)`).join(', ');
  //   const query = baseQuery + placeholders + ';';

  //   const params: (number | string | undefined)[] = [];

  //   for (const item of childImmunizations) {
  //     const { ImmunizationStatus, IsDeleted, ClientId, IsSynced, OnlineDbOid } = item;
  //     params.push(generateGUID(), ImmunizationStatus, IsDeleted ? 1 : 0, ClientId, IsSynced, OnlineDbOid);
  //   }
  //   console.log(query, params);
  //   try {
  //     for (const items of childImmunizations) {
  //       console.log('Client Id : ', items.ClientId);
  //       const OidForClient = (
  //         await this.db.query('SELECT OnlineDbOid FROM Client WHERE Oid = ?;', [items.ClientId])
  //       ).values?.map((value: ChildImmunization) => value.OnlineDbOid);

  //       // Delete the data from sync queue
  //       if (OidForClient?.length) {
  //         console.log('OidForClient : ', OidForClient);
  //         for (const Oid of OidForClient) {
  //           if (Oid) await this.syncQueueService.deleteQueueByTableAndTransactionId('ChildImmunization', Oid);
  //         }
  //       }

  //       // Delete the existing data from the table
  //       const deleteResponse = await this.db.run('DELETE FROM ChildImmunization WHERE ClientId = ?;', [items.ClientId]);
  //       console.log('Deleted Response : ', deleteResponse);
  //     }

  //     console.log(query, params);
  //     // Execute the query with the parameters
  //     const response = await this.db.run(query, params);

  //     // Get The TransactionId of the inserted item
  //     let newInsertedOidArr = (
  //       await this.db.query('SELECT TransactionId FROM ChildImmunization WHERE ClientId = ?;', [clientIds?.[0]])
  //     ).values?.map((oid) => oid.TransactionId);

  //     // Add the data to the sync queue
  //     // if (newInsertedOidArr?.length) {
  //     //   for (const oid of newInsertedOidArr) {
  //     //     await this.syncQueueService.addTransactionInQueue({
  //     //       id: 0,
  //     //       operation: 'INSERT',
  //     //       tableName: 'ChildImmunization',
  //     //       transactionId: oid,
  //     //       dateCreated: dayjs().format(),
  //     //       createdBy: 1,
  //     //       dateModified: dayjs().format(),
  //     //       modifiedBy: 1,
  //     //     });
  //     //   }
  //     // }

  //     await this.getChildImmunizations();
  //     return response;
  //   } catch (error) {
  //     console.error('Error adding child immunization:', error);
  //     this.toast.openToast({
  //       message: 'Error adding child immunization',
  //       color: 'error',
  //     });
  //     return null;
  //   }
  // }

  async updateChildImmunizationById(TransactionId: string, childImmunization: ChildImmunization) {
    const sql = `
    UPDATE ChildImmunization
    SET
      ImmunizationStatus = ?,
      IsDeleted = ?,
      ClientId = ?,
      IsSynced = ?,
      OnlineDbOid = ?
    WHERE TransactionId = ?;
    `;
    const params = [
      childImmunization.ImmunizationStatus,
      childImmunization.IsDeleted ?? 0,
      childImmunization.ClientId,
      childImmunization.IsSynced,
      childImmunization.OnlineDbOid,
      TransactionId,
    ];

    try {
      await this.db.run(sql, params);
      await this.getChildImmunizations();
      this.toast.openToast({
        message: 'Child immunization updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating child immunization:', error);
      this.toast.openToast({
        message: 'Error updating child immunization',
        color: 'error',
      });
    }
  }

  async getChildImmunizationByClientId(clientId: string): Promise<ChildImmunization[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(`SELECT * FROM ChildImmunization WHERE ClientId = ? AND IsDeleted = 0;`, [
      clientId,
    ]);
    return result.values as ChildImmunization[];
  }

  async getChildImmunizationById(TransactionId: string): Promise<ChildImmunization | null> {
    const sql = `
      SELECT *
      FROM ChildImmunization
      WHERE TransactionId = ?;
    `;
    const params = [TransactionId];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as ChildImmunization;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching child immunization by id:', error);
        return null;
      });
  }

  async deleteChildImmunizationById(TransactionId: string) {
    const sql = `DELETE FROM ChildImmunization WHERE TransactionId = ?`;
    const params = [TransactionId];

    try {
      await this.db.run(sql, params);
      await this.getChildImmunizations();
    } catch (error) {
      console.error('Error deleting child immunization:', error);
    }
  }
}
