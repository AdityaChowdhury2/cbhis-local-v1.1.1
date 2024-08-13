import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ToiletAndWasteDisposal } from '../models/toilet-waste-disposal';

@Injectable({
  providedIn: 'root',
})
export class ToiletAndWasteDisposalStorageService {
  // * Local variables
  public toiletAndWasteDisposalList: BehaviorSubject<ToiletAndWasteDisposal[]> = new BehaviorSubject<
    ToiletAndWasteDisposal[]
  >([]);
  private db!: SQLiteDBConnection;
  private isToiletAndWasteDisposalReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    // this.initializeDatabase().then(() => {
    //   console.log('Toilet and waste disposal StorageService initialized');
    // });
  }

  async initializeDatabase() {
    try {
      // retrieve the database connection
      this.db = await this.sqliteService.retrieveConnection();
      await this.getToiletAndWasteDisposalData();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // * State management
  toiletAndWasteDisposalState() {
    return this.isToiletAndWasteDisposalReady.asObservable();
  }

  // * Return the list as observable
  fetchToiletAndWasteDisposalData(): Observable<ToiletAndWasteDisposal[]> {
    return this.toiletAndWasteDisposalList.asObservable();
  }

  // * Load the data from the database
  async loadToiletAndWasteDisposalData() {
    const toiletAndWasteDisposalData: ToiletAndWasteDisposal[] = (
      await this.db.query('SELECT * FROM toiletandwastedisposals;')
    ).values as ToiletAndWasteDisposal[];
    console.log('loadToiletAndWasteDisposalData', toiletAndWasteDisposalData);
    this.toiletAndWasteDisposalList.next(toiletAndWasteDisposalData);
  }

  // * Get the data from the database and set the state to ready
  async getToiletAndWasteDisposalData() {
    await this.loadToiletAndWasteDisposalData();
    this.isToiletAndWasteDisposalReady.next(true);
  }

  // * Add a new toilet and waste disposal data
  async addToiletAndWasteDisposalData(toiletAndWasteDisposal: ToiletAndWasteDisposal) {
    const sql = `INSERT INTO toiletandwastedisposals (
      flushorpourflushtoilet,
      ordinarypittoilet,
      ventilatedimprovedprivy,
      nofacilitybushfield,
      wastedisposalfacility,
      wastesegregation,
      nonbiodegradablewasemanagement,
      yardgrooming,
      presenceofstagnantwaterinyard,
      other,
      identifiedfamilyid,
      createdby,
      datecreated,
      modifiedby,
      datemodified,
      isdeleted,
      issynced,
      onlinedboid
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    );`;

    const params = [
      toiletAndWasteDisposal.flushorpourflushtoilet,
      toiletAndWasteDisposal.ordinarypittoilet,
      toiletAndWasteDisposal.ventilatedimprovedprivy,
      toiletAndWasteDisposal.nofacilitybushfield,
      toiletAndWasteDisposal.wastedisposalfacility,
      toiletAndWasteDisposal.wastesegregation,
      toiletAndWasteDisposal.nonbiodegradablewasemanagement,
      toiletAndWasteDisposal.yardgrooming,
      toiletAndWasteDisposal.presenceofstagnantwaterinyard,
      toiletAndWasteDisposal.other,
      toiletAndWasteDisposal.identifiedfamilyid,
      toiletAndWasteDisposal.createdby,
      toiletAndWasteDisposal.datecreated,
      toiletAndWasteDisposal.modifiedby,
      toiletAndWasteDisposal.datemodified,
      toiletAndWasteDisposal.isdeleted,
      toiletAndWasteDisposal.issynced,
      toiletAndWasteDisposal.onlinedboid,
    ];
    try {
      await this.db.run(sql, params);
      console.log('Toilet and waste disposal data added');

      this.toast.openToast({
        message: 'Toilet and waste disposal data added',
        duration: 1000,
        color: 'success',
      });
      let transactionId: number = 0;

      let data = await this.db.query('SELECT id FROM toiletandwastedisposals order by id DESC limit 1');

      if (data && data.values && data.values.length > 0) {
        transactionId = data.values[0].id;
      }
      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'INSERT',
        tableName: 'toiletandwastedisposals',
        transactionId: transactionId,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      this.getToiletAndWasteDisposalData();
    } catch (error) {
      console.log('Error adding toilet and waste disposal data', error);
      this.toast.openToast({
        message: 'Error adding toilet and waste disposal data',
        duration: 1000,
        color: 'error',
      });
    }
  }

  // * Get a single toilet and waste disposal data by Family id
  async getToiletAndWasteDisposalDataByFamilyId(familyId: number): Promise<ToiletAndWasteDisposal | null> {
    // * If family id is not provided return null
    if (!familyId) return null;

    // * If family id is provided, get the data from the database
    const sql = `SELECT * FROM toiletandwastedisposals WHERE identifiedfamilyid = ?;`;

    const params = [familyId];

    try {
      const data = await this.db.query(sql, params);
      if (data && data.values && data.values.length > 0) {
        return data.values[0] as ToiletAndWasteDisposal;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting toilet and waste disposal data by family id', error);
      return null;
    }
  }

  // * Update an existing toilet and waste disposal data
  async updateToiletAndWasteDisposalDataById(id: number, toiletAndWasteDisposal: ToiletAndWasteDisposal) {
    const sql = `
        UPDATE toiletandwastedisposals
        SET
            flushorpourflushtoilet = ?,
            ordinarypittoilet = ?,
            ventilatedimprovedprivy = ?,
            nofacilitybushfield = ?,
            wastedisposalfacility = ?,
            wastesegregation = ?,
            nonbiodegradablewasemanagement = ?,
            yardgrooming = ?,
            presenceofstagnantwaterinyard = ?,
            other = ?,
            identifiedfamilyid = ?,
            createdby = ?,
            datecreated = ?,
            modifiedby = ?,
            datemodified = ?,
            isdeleted = ?,
            issynced = ?,
            onlinedboid = ?
        WHERE id = ?;
    `;
    const params = [
      toiletAndWasteDisposal.flushorpourflushtoilet,
      toiletAndWasteDisposal.ordinarypittoilet,
      toiletAndWasteDisposal.ventilatedimprovedprivy,
      toiletAndWasteDisposal.nofacilitybushfield,
      toiletAndWasteDisposal.wastedisposalfacility,
      toiletAndWasteDisposal.wastesegregation,
      toiletAndWasteDisposal.nonbiodegradablewasemanagement,
      toiletAndWasteDisposal.yardgrooming,
      toiletAndWasteDisposal.presenceofstagnantwaterinyard,
      toiletAndWasteDisposal.other,
      toiletAndWasteDisposal.identifiedfamilyid,
      toiletAndWasteDisposal.createdby,
      toiletAndWasteDisposal.datecreated,
      toiletAndWasteDisposal.modifiedby,
      toiletAndWasteDisposal.datemodified,
      toiletAndWasteDisposal.isdeleted,
      toiletAndWasteDisposal.issynced,
      toiletAndWasteDisposal.onlinedboid,
      id,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'toiletandwastedisposals',
        transactionId: id,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getToiletAndWasteDisposalData();
      console.log('Toilet and waste disposal data updated');
      this.toast.openToast({
        message: 'Toilet and waste disposal data updated',
        duration: 1000,
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating toilet and waste disposal data', error);
      this.toast.openToast({
        message: 'Error updating toilet and waste disposal data',
        duration: 1000,
        color: 'error',
      });
    }
  }

  // * Delete an existing toilet and waste disposal data with the given id
  async deleteToiletAndWasteDisposalDataById(id: string) {
    const sql = `
      DELETE FROM toiletandwastedisposals WHERE id = ?;
    `;
    const params = [id];

    try {
      await this.db.run(sql, params);
      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'DELETE',
        tableName: 'toiletandwastedisposals',
        transactionId: parseInt(id),
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    } catch (error) {
      console.error('Error deleting toilet and waste disposal data', error);
      this.toast.openToast({
        message: 'Error deleting toilet and waste disposal data',
        duration: 1000,
        color: 'error',
      });
    }
  }
}
