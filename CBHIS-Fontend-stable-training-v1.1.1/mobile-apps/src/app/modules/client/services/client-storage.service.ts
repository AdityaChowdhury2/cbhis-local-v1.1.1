import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Client } from '../models/client';

@Injectable({
  providedIn: 'root',
})
export class ClientStorageService {
  private db!: SQLiteDBConnection;
  private isClientReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public clientList: BehaviorSubject<Client[]> = new BehaviorSubject<Client[]>([]);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('ClientStorageService initialized');
    });
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
    if (!this.db) await this.initializeDatabase();
    const clients: Client[] = (await this.db.query('SELECT * FROM Client;')).values as Client[];
    console.log('client info ==>>>', clients);
    this.clientList.next(clients);
  }

  async getClients() {
    if (!this.db) await this.initializeDatabase();
    await this.loadClients();
    this.isClientReady.next(true);
  }

  async addClient(client: Client): Promise<capSQLiteChanges | null> {
    if (!this.db) await this.initializeDatabase();

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
      client.HasBirthCertificate ? 1 : 0,
      client.IsDisabled ? 1 : 0,
      client?.IsDeceased ? 1 : 0,
      client?.DateDeceased ? client.DateDeceased : '',
      client.IsFamilyHead,
      client.RelationalType ? client.RelationalType : null,
      client.FamilyHeadId ? client.FamilyHeadId : null,
      client.VillageId,
      client.IsPregnant ? 1 : 0,
      client.IsDeleted ? 1 : 0,
      client.CreatedBy,
      client.ModifiedBy ?? null,
    ];

    const query = `INSERT INTO Client (Oid,
      FirstName, MiddleName, LastName, Age, DOB, Sex, MaritalStatus, PIN, Cellphone, EducationLevel,
      Occupation, HasBirthCertificate, IsDisabled, IsDeceased, DateDeceased, IsFamilyHead, RelationalType,
      FamilyHeadId, VillageId, IsPregnant, IsDeleted , CreatedBy, ModifiedBy
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

    try {
      const response = await this.db.run(query, params);
      await this.getClients();
      console.log('Client added successfully');
      await this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'INSERT',
        tableName: 'Client',
        transactionId: client.Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      this.toast.openToast({ message: 'Successfully registered', color: 'success', duration: 1000 });
      console.log(response);

      return response;
    } catch (error) {
      console.log('Error adding client:', error);
      this.toast.openToast({ message: 'Error adding client', color: 'error' });
      return null;
    }
  }

  async updateClient(client: Client) {
    if (!this.db) await this.initializeDatabase();
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

    const query = `UPDATE Client SET
      FirstName = ?, MiddleName = ?, LastName = ?, Age = ?, DOB = ?, Sex = ?, MaritalStatus = ?, PIN = ?, Cellphone = ?, EducationLevel = ?, Occupation = ?, HasBirthCertificate = ?, IsDisabled = ?, IsDeceased = ?, DateDeceased = ?, IsFamilyHead = ?, RelationWithFamilyHead = ?, FamilyHeadId = ?, VillageId = ?, IsDeleted = ?  WHERE Oid = ?;
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

  // change head of the family
  // async changeHeadOfFamily(newHeadId: string, oldHeadId: string) {
  //   console.log("provide id's", newHeadId, oldHeadId);

  //   return;

  //   try {
  //     // get current head of family
  //     const currentHead = (await this.db.query('SELECT * FROM Client WHERE Oid = ?;', [oldHeadId]))
  //       .values?.[0] as Client;
  //     const newHead = (await this.db.query('SELECT * FROM Client WHERE Oid = ?;', [newHeadId])).values?.[0] as Client;

  //     // get members of the family without the head
  //     const familyMembers = (await this.db.query('SELECT * FROM Client WHERE FamilyHeadId = ?;', [oldHeadId]))
  //       .values as Client[];

  //     // set the new head of family
  //     await this.db.run('UPDATE Client SET FamilyHeadId = ?, IsFamilyHead = 1 WHERE Oid = ?', [null, newHeadId]);

  //     // set the old head of family as a member of the family and update the relation with the new head
  //     await this.db.run(
  //       'UPDATE Client SET FamilyHeadId = ?, RelationWithFamilyHead= ?, IsFamilyHead = 0 WHERE Oid = ?',
  //       [newHeadId, getOldHeadRelationship(newHead?.RelationWithFamilyHead!, currentHead?.Sex), oldHeadId]
  //     );

  //     // update the members of the family with relation to the new head
  //     for (const member of familyMembers) {
  //       if (member.Oid === newHeadId || member.Oid == oldHeadId) continue;
  //       await this.db.run('UPDATE Client SET FamilyHeadId= ?, RelationWithFamilyHead = ? WHERE Oid = ?', [
  //         newHeadId,
  //         changeRelationshipMapping[newHead?.RelationWithFamilyHead!][member.RelationWithFamilyHead!],
  //         member.Oid,
  //       ]);
  //     }

  //     await this.getClients();
  //     console.log('Head of family changed successfully');
  //     this.toast.openToast({ message: 'Head of family changed successfully', color: 'success' });
  //   } catch (error) {
  //     console.log('Error changing head of family:', error);
  //     this.toast.openToast({ message: 'Error changing head of family', color: 'error' });
  //   }
  // }
  // async changeHeadOfFamily(clientId: string, oldHeadId: number) {
  //   // find the client with the client id
  //   const client = (await this.db.query('SELECT * FROM Clients WHERE Oid = ?;', [clientId])).values?.[0] as Client;
  //   if (!client) {
  //     console.log('client not found');
  //     return;
  //   }

  //   // find the old head of family
  //   const oldHead = (await this.db.query('SELECT * FROM Clients WHERE Oid = ?;', [oldHeadId])).values?.[0] as Client;
  //   if (!oldHead) {
  //     console.log('old head not found');
  //     return;
  //   }

  //   // begin transaction
  //   // await this.db.run('BEGIN TRANSACTION;');

  //   // drop the old head of family and update the new head of family with old head's oid
  //   try {
  //     await this.db.run('DELETE FROM Clients WHERE Oid = ?;', [oldHeadId]);
  //     await this.db.run('DELETE FROM Clients WHERE Oid = ?;', [clientId]);
  //     // clients as family head
  //     await this.addClient({ ...client, IsFamilyHead: 1, Oid: oldHeadId, FamilyHeadId: undefined });
  //     // family head as client
  //     await this.addClient({ ...oldHead, IsFamilyHead: 0, Oid: clientId, FamilyHeadId: clientId });
  //     // await this.db.run('COMMIT;');
  //     console.log('Head of family changed successfully');
  //     this.toast.openToast({ message: 'Head of family changed successfully', color: 'success' });
  //   } catch (error) {
  //     console.log('Error changing head of family:', error);
  //     this.toast.openToast({ message: 'Error changing head of family', color: 'error' });
  //     // await this.db.run('ROLLBACK;');
  //   }
  // }

  // load all family heads
  async getAllFamilyHead() {
    if (!this.db) await this.initializeDatabase();
    const familyHeads = (await this.db.query('SELECT * FROM Client WHERE IsFamilyHead = 1;'))?.values as Client[];
    console.log(familyHeads);
    return familyHeads;
  }

  // Find head by memberId
  async fetchMemberByOid(Oid: string): Promise<Client | null> {
    if (!this.db) await this.initializeDatabase();
    const sql = `
      SELECT * FROM Client WHERE Oid = ?;
    `;
    const param = [Oid];

    try {
      const result = await this.db.query(sql, param);
      return result.values?.[0];
    } catch (error) {
      this.toast.openToast({ message: 'Error fetching family head by Oid', color: 'error' });
      console.error('Error fetching family head by Oid:', error);
      return null;
    }
  }

  // find the family members
  async findFamilyMembers(familyHeadId: string): Promise<Client[]> {
    if (!this.db) await this.initializeDatabase();
    const familyMembers = (await this.db.query('SELECT * FROM Client WHERE FamilyHeadId = ?;', [familyHeadId]))
      .values as Client[];

    // find the family head
    const familyHead = (await this.db.query('SELECT * FROM Client WHERE Oid = ?;', [familyHeadId]))
      .values?.[0] as Client;

    // add the family head to the family members
    familyMembers.push(familyHead);

    console.log(familyMembers);
    // return the family members
    return familyMembers;
  }

  async findMembersCountByFamilyHeadId(familyHeadId: string): Promise<number> {
    if (!this.db) await this.initializeDatabase();
    const familyMembers = (await this.db.query('SELECT COUNT(*) FROM Client WHERE FamilyHeadId = ?;', [familyHeadId]))
      .values?.[0]['COUNT(*)'] as number;

    return familyMembers;
  }

  // find members by Id
  async findMemberById(familyHeadId: string, clientIds: string[]): Promise<Client[]> {
    console.log(familyHeadId, clientIds);
    if (!this.db) await this.initializeDatabase();
    // Assuming clientIds is an array like [1, 2, 3]
    // Assuming clientIds is an array like [1, 2, 3]
    const placeholders = clientIds.map(() => '?').join(', ');
    console.log(placeholders);
    // "?, ?, ?"
    const query = `SELECT * FROM Client WHERE Oid IN (${placeholders})`;

    const query2 = 'SELECT * FROM CLIENT';
    const response = (await this.db.query(query2)).values;
    console.log(response);

    // Now, spread the clientIds into the query parameters along with familyHeadId
    const familyMembers = (await this.db.query(query, [...clientIds])).values as Client[];
    // Execute the query, spreading the clientIds into the parameters array
    // await this.db.query(query, [familyHeadId, ...clientIds]);
    console.log(query);
    // const familyMembers = (await this.db.query('SELECT * FROM Clients WHERE FamilyHeadId = 1 OR Oid IN (1)'))
    //   .values as Client[];

    // find the family head
    // const familyHead = (await this.db.query('SELECT * FROM Clients WHERE Oid = ?;', [familyHeadId]))
    //   .values?.[0] as Client;

    // add the family head to the family members
    // familyMembers.push(familyHead);

    console.log('familyMembers from find member by id ', familyMembers);
    // return the family members
    return familyMembers;
  }
}
