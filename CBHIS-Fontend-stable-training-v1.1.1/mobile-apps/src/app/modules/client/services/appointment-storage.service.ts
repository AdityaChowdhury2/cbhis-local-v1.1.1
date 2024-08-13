import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { SQLiteService } from '../../../shared/services/database/sqlite.service';
import { AssignedAppointment } from '../models/appointment';
// import { AssignedAppointment } from '../models/assigned-appointment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentStorageService {
  public assignedAppointmentList: BehaviorSubject<AssignedAppointment[]> = new BehaviorSubject<AssignedAppointment[]>(
    []
  );
  private db!: SQLiteDBConnection;
  private isAppointmentsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private syncQueueService: SyncStorageService,
    private toast: ToastService
  ) {
    this.initializeDatabase().then(() => {
      console.log('SearchAppointmentStorageService initialized');
      this.loadAssignedAppointments();
    });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getAssignedAppointments();
    } catch (error) {
      console.log('database init', error);
    }
  }

  appointmentsState(): Observable<boolean> {
    return this.isAppointmentsReady.asObservable();
  }

  fetchAssignedAppointments(): Observable<AssignedAppointment[]> {
    return this.assignedAppointmentList.asObservable();
  }

  async loadAssignedAppointments() {
    if (!this.db) await this.initializeDatabase();
    const assignedAppointments: AssignedAppointment[] = (
      await this.db.query('SELECT * FROM AssignedAppointment WHERE IsDeleted = 0 ORDER BY AppointmentDate DESC;')
    ).values as AssignedAppointment[];
    console.log('Appointments from storage service', assignedAppointments);
    this.assignedAppointmentList.next(assignedAppointments);
  }

  async getAssignedAppointments() {
    if (!this.db) await this.initializeDatabase();
    await this.loadAssignedAppointments();
    this.isAppointmentsReady.next(true);
  }

  async getAllAssignedAppointments(): Promise<AssignedAppointment[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      'SELECT * FROM AssignedAppointment WHERE IsDeleted = 0 ORDER BY AppointmentDate DESC;'
    );

    return result.values as AssignedAppointment[];
  }

  getAllAssignedAppointmentsObservable(): Observable<AssignedAppointment[]> {
    return this.assignedAppointmentList.asObservable();
  }

  async addAssignedAppointment(assignedAppointments: AssignedAppointment[]): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

    const baseQuery = `INSERT INTO AssignedAppointment (
          TransactionId,
          UserId,
          AppointmentType,
          AppointmentDate,
          Details,
          ClientId,
          Status,
          Priority,
          IsDeleted,
          IsSynced,
          OnlineDbOid
        ) VALUES `;
    const placeholders = assignedAppointments.map(() => `( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';
    const appointmentUuid = generateGUID();

    const params: (number | string | undefined)[] = [];

    for (const item of assignedAppointments) {
      const {
        UserId,
        AppointmentType,
        AppointmentDate,
        Details,
        ClientId,
        Status,
        Priority,
        IsDeleted,
        IsSynced,
        OnlineDbOid,
      } = item;
      params.push(
        appointmentUuid,
        UserId,
        AppointmentType,
        AppointmentDate,
        Details,
        ClientId,
        Status,
        Priority,
        IsDeleted ? 1 : 0,
        IsSynced,
        OnlineDbOid
      );
    }
    console.log('query: ', query);
    console.log('params: ', params);

    try {
      for (const items of assignedAppointments) {
        console.log('ClientId: ', items.ClientId);
        // const OidForClient = (
        //   await this.db.query('SELECT TransactionId FROM AssignedAppointment WHERE ClientId = ?;', [items.ClientId])
        // ).values?.map((oid) => oid.TransactionId);

        //   if (OidForClient?.length) {
        //     console.log('OidForClient for delete operation: ', OidForClient);
        //     for (const oid of OidForClient) {
        //       await this.syncQueueService.deleteQueueByTableAndTransactionId('AssignedAppointment', oid);
        //     }
        //   }

        //   const deleteResponse = await this.db.run('DELETE FROM AssignedAppointment WHERE ClientId = ?', [
        //     items.ClientId,
        //   ]);
        //   console.log('Deleted Response: ', deleteResponse);
      }

      const response = await this.db.run(query, params);

      // const newInsertedOidArr = (
      //   await this.db.query(`SELECT TransactionId FROM AssignedAppointment WHERE TransactionId = ${appointmentUuid};`)
      // ).values?.map((oid) => oid.TransactionId);

      // if (newInsertedOidArr?.length) {
      //   for (const insertedOid of newInsertedOidArr) {
      //     await this.syncQueueService.addTransactionInQueue({
      //       id: 0,
      //       operation: 'INSERT',
      //       tableName: 'AssignedAppointment',
      //       transactionId: insertedOid,
      //       dateCreated: dayjs().format(),
      //       createdBy: 1,
      //       dateModified: dayjs().format(),
      //       modifiedBy: 1,
      //     });
      //   }
      // }

      await this.getAssignedAppointments();
      return response;
    } catch (error) {
      console.error('Error adding assigned appointment:', error);
      this.toast.openToast({
        message: 'Error adding assigned appointment',
        color: 'error',
      });
      return null;
    }
  }

  async rescheduleAppointment(appointmentId: string, date: string) {
    if (!this.db) await this.initializeDatabase();

    const sqlForUpdate = `
      UPDATE AssignedAppointment
      SET
        AppointmentDate = ?
      WHERE TransactionId = ?;
    `;

    const paramsForUpdate = [date, appointmentId];

    try {
      await this.db.run(sqlForUpdate, paramsForUpdate);
      // TODO: need to add in transaction queue
      // this.syncQueueService.addTransactionInQueue({
      //   id: 0,
      //   operation: 'UPDATE',
      //   tableName: 'AssignedAppointment',
      //   transactionId: appointmentId,
      //   dateCreated: dayjs().format(),
      //   createdBy: 1,
      //   dateModified: dayjs().format(),
      //   modifiedBy: 1,
      // });
      await this.getAssignedAppointments();
      console.log('Assigned appointment updated successfully');
      this.toast.openToast({
        message: 'Assigned appointment updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating assigned appointment:', error);
      this.toast.openToast({
        message: 'Error updating assigned appointment',
        color: 'error',
      });
    }
  }

  async getAssignedAppointmentByClientId(clientId: string): Promise<AssignedAppointment[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM AssignedAppointment WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as AssignedAppointment[];
  }

  async filterAppointmentsByDate(appointmentDate: string): Promise<AssignedAppointment[]> {
    if (!this.db) await this.initializeDatabase();

    const sql = `SELECT * FROM AssignedAppointment WHERE AppointmentDate LIKE ? AND IsDeleted = 0;`;

    const params = [`%${appointmentDate}%`];
    console.log(sql, params);
    const result = await this.db.query(sql, params);

    await this.getAssignedAppointments();
    // this.assignedAppointmentList.next(result.values as AssignedAppointment[]);
    return result.values as AssignedAppointment[];
  }
}
