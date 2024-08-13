import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject } from 'rxjs';
import { Client } from 'src/app/modules/client/models/client';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ClientStorageService {
  private databaseName: string = 'cbhis';
  private db!: SQLiteDBConnection;
  private isClientReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public clientList: BehaviorSubject<Client[]> = new BehaviorSubject<Client[]>([]);

  constructor(private sqliteService: SQLiteService, private toast: ToastService) {
    // this.initializeDatabase().then(() => {
    //   console.log('ClientStorageService initialized');
    // });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
      await this.getClients();
    } catch (error) {
      console.log('database init', error);
    }
  }

  clientState() {
    return this.isClientReady.asObservable();
  }

  fetchClients(): BehaviorSubject<Client[]> {
    return this.clientList;
  }

  async loadClients() {
    // if (!this.db) await this.initializeDatabase();

    const clients: Client[] = (await this.db.query('SELECT * FROM Client;')).values as Client[];

    this.clientList.next(clients);
  }

  async getClients() {
    if (!this.db) await this.initializeDatabase();
    console.log('Get Client s after appointement ');
    await this.loadClients();
    this.isClientReady.next(true);
  }

  async addClient(client: Client) {
    const params = [
      client.Oid,
      client.FirstName,
      client.MiddleName,
      client.LastName,
      client.Age,
      client.DOB,
      client.Sex,
      client.MaritalStatus,
      client.PIN,
      client.Cellphone,
      client.EducationLevel,
      client.Occupation,
      client.HasBirthCertificate,
      client.IsDisabled,
      client.IsDeceased,
      client.DateDeceased,
      client.IsFamilyHead,
      client.RelationalType,
      client.FamilyHeadId,
      client.VillageId,
      client.IsDeleted,
    ];

    const query = `INSERT INTO Clients (
      Oid, FirstName, MiddleName, LastName, Age, DOB, Sex, MaritalStatus, PIN, Cellphone, EducationLevel,
      Occupation, HasBirthCertificate, IsDisabled, IsDeceased, DateDeceased, IsFamilyHead, RelationalType,
      FamilyHeadId, VillageId, IsDeleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

    try {
      await this.db.run(query, params);
      await this.loadClients();
      console.log('Client added successfully');
      this.toast.openToast({ message: 'Successfully registered', color: 'success', duration: 1000 });
    } catch (error) {
      console.log('Error adding client:', error);
      this.toast.openToast({ message: JSON.stringify(error), color: 'error' });
    }
  }

  async updateClient(client: Client) {
    const params = [
      client.FirstName,
      client.MiddleName,
      client.LastName,
      client.Age,
      client.DOB,
      client.Sex,
      client.MaritalStatus,
      client.PIN,
      client.Cellphone,
      client.EducationLevel,
      client.Occupation,
      client.HasBirthCertificate,
      client.IsDisabled,
      client.IsDeceased,
      client.DateDeceased,
      client.IsFamilyHead,
      client.RelationalType,
      client.FamilyHeadId,
      client.VillageId,
      client.IsDeleted,
      client.Oid,
    ];

    const query = `UPDATE Clients SET
      FirstName = ?, MiddleName = ?, LastName = ?, Age = ?, DOB = ?, Sex = ?, MaritalStatus = ?, PIN = ?, Cellphone = ?,
      EducationLevel = ?, Occupation = ?, HasBirthCertificate = ?, IsDisabled = ?, IsDeceased = ?, DateDeceased = ?,
      IsFamilyHead = ?, RelationalType = ?, FamilyHeadId = ?, VillageId = ?, IsDeleted = ?
      WHERE Oid = ?;
    `;

    try {
      await this.db.run(query, params);
      await this.loadClients();
      console.log('Client updated successfully');
      this.toast.openToast({ message: 'Client updated successfully', color: 'success' });
    } catch (error) {
      console.log('Error updating client:', error);
      this.toast.openToast({ message: 'Error updating client', color: 'error' });
    }
  }

  async deleteClient(oid: string) {
    const query = `DELETE FROM Clients WHERE Oid = ?;`;

    try {
      await this.db.run(query, [oid]);
      await this.loadClients();
      console.log('Client deleted successfully');
      this.toast.openToast({ message: 'Client deleted successfully', color: 'success' });
    } catch (error) {
      console.log('Error deleting client:', error);
      this.toast.openToast({ message: 'Error deleting client', color: 'error' });
    }
  }

  async getClientById(oid: string): Promise<Client | null> {
    const query = `SELECT * FROM Client WHERE Oid = ?;`;

    try {
      const result = await this.db.query(query, [oid]);
      if ((result?.values?.length as number) > 0) {
        return result.values?.[0] as Client;
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error retrieving client:', error);
      return null;
    }
  }
}
