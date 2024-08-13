import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { SQLiteService } from '../../../shared/services/database/sqlite.service';
import { UserAccount } from '../models/user';
import { encryptedTo } from './../../../shared/utils/encryption';

@Injectable({
  providedIn: 'root',
})
export class UserStorageService {
  // Local variables declaration
  public userList: BehaviorSubject<UserAccount[]> = new BehaviorSubject<UserAccount[]>([]);
  private db!: SQLiteDBConnection;
  private isUserReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // Constructor to inject services
  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    // Initialize the database
    this.initializeDatabase().then(() => {
      console.log('UserStorageService initialized');
    });
  }

  async initializeDatabase() {
    // Attempts to create or open the database connection
    try {
      this.db = await this.sqliteService.retrieveConnection();
    } catch (error) {
      console.log('database init', error);
    }
  }

  userState() {
    // Returns an observable for the user ready state
    return this.isUserReady.asObservable();
  }
  fetchUsers(): Observable<UserAccount[]> {
    // Returns an observable for the list of users
    return this.userList.asObservable();
  }

  // Loads users from the database and updates the userList BehaviorSubject
  async loadUsers() {
    const users: UserAccount[] = (await this.db.query('SELECT * FROM UserAccount;')).values as UserAccount[];
    console.log('loadUser', users);
    this.userList.next(users);
  }

  // Loads users and sets the user ready state to true
  async getUsers() {
    await this.loadUsers();
    this.isUserReady.next(true);
  }

  // Adds a new user to the database and updates the user list
  async addUser(user: UserAccount) {
    const {
      Oid,
      FirstName,
      MiddleName,
      LastName,
      PIN,
      Cellphone,
      Email,
      Username,
      Password,
      ConfirmPassword,
      UserType,
      Image,
      IMEINumber,
      IsDeleted,
      AssignedVillages,
      AssignedChiefdomList,
      AssignedVillageList,
      AssignedDeviceList,
      ProfilePicture,
      OnlineDbOid,
      IsSynced,
    } = user;

    console.log(user);
    const sql = `
    INSERT INTO UserAccount (
      Oid,
      FirstName,
      MiddleName, 
      LastName, 
      Pin, 
      Cellphone, 
      Email, 
      Username,
      Password,
      ConfirmPassword, 
      UserType, 
      Image, 
      IMEINumber, 
      IsDeleted, 
      AssignedVillages, 
      AssignedChiefdomList, 
      AssignedVillageList, 
      AssignedDeviceList, 
      ProfilePicture, 
      OnlineDBOid, 
      IsSynced
    ) VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      Oid,
      FirstName,
      MiddleName,
      LastName,
      PIN,
      Cellphone,
      Email,
      Username,
      Password,
      ConfirmPassword,
      UserType,
      Image,
      IMEINumber,
      IsDeleted ?? 0,
      JSON.stringify(AssignedVillages ?? []),
      JSON.stringify(AssignedChiefdomList ?? {}),
      JSON.stringify(AssignedVillageList ?? {}),
      JSON.stringify(AssignedDeviceList ?? {}),
      JSON.stringify(ProfilePicture ?? {}),
      OnlineDbOid,
      IsSynced ?? 0,
    ];

    try {
      console.log('[add user]', sql, params);

      await this.db.run(sql, params);
      console.log('User added successfully');

      // get last inserted users Id
      const lastUser = (await this.db.query('SELECT * FROM UserAccount ORDER BY Oid DESC LIMIT 1;'))
        .values?.[0] as UserAccount;

      console.log('lastUser Id', lastUser.Oid);

      // if (lastUser?.Oid) {
      //   this.syncQueueService.addTransactionInQueue({
      //     id: 0,
      //     operation: 'INSERT',
      //     tableName: 'UserAccount',
      //     transactionId: lastUser.Oid,
      //     dateCreated: dayjs().format(),
      //     createdBy: 1,
      //     dateModified: dayjs().format(),
      //     modifiedBy: 1,
      //   });
      // }
      console.log('in user storage service : User added => ');
      this.getUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      this.toast.openToast({
        message: 'Error',
        color: 'error',
      });
    }
  }

  // Updates a user's information in the database by their ID
  // async updateUserById(id: number, user: User) {
  //   const {
  //     firstname,
  //     surname,
  //     dob,
  //     sex,
  //     designation,
  //     contactaddress,
  //     countrycode,
  //     cellphone,
  //     isaccountactive,
  //     username,
  //     password,
  //     usertype,
  //     devicetoken,

  //     createdby,
  //     datecreated,
  //     modifiedby,
  //     datemodified,
  //     isdeleted,
  //     issynced,
  //     onlinedboid,
  //   } = user;

  //   const sql = `
  //     UPDATE UserAccount
  //     SET
  //       firstname=?,
  //       surname=?,
  //       dob=?,
  //       sex=?,
  //       designation=?,
  //       contactaddress=?,
  //       countrycode=?,
  //       cellphone=?,
  //       isaccountactive=?,
  //       username=?,
  //       password=?,
  //       usertype=?,
  //       devicetoken=?,
  //       zoneid=?,
  //       createdby=?,
  //       datecreated=?,
  //       modifiedby=?,
  //       datemodified=?,
  //       isdeleted=?,
  //       issynced=?,
  //       onlinedboid=?
  //     WHERE id=?
  //   `;
  //   const params = [
  //     firstname,
  //     surname,
  //     dob,
  //     sex,
  //     designation,
  //     contactaddress,
  //     countrycode,
  //     cellphone,
  //     isaccountactive,
  //     username,
  //     password,
  //     usertype,
  //     devicetoken,

  //     createdby,
  //     datecreated,
  //     modifiedby,
  //     datemodified,
  //     isdeleted,
  //     issynced,
  //     onlinedboid,
  //     id,
  //   ];

  //   try {
  //     await this.db.run(sql, params);

  //     this.syncQueueService.addTransactionInQueue({
  //       id: 0,
  //       operation: 'UPDATE',
  //       tableName: 'UserAccount',
  //       transactionId: id,
  //       dateCreated: dayjs().format(),
  //       createdBy: 1,
  //       dateModified: dayjs().format(),
  //       modifiedBy: 1,
  //     });
  //     await this.getUsers();
  //     console.log('User updated successfully');
  //     this.toast.openToast({
  //       message: 'User updated successfully',
  //       color: 'success',
  //     });
  //   } catch (error) {
  //     console.error('Error updating user:', error);
  //     this.toast.openToast({
  //       message: 'User updated successfully',
  //       color: 'error',
  //     });
  //   }
  // }

  // Searches for users by username and returns a list of matching users
  // async searchUsersByUsername(searchTerm: string): Promise<UserAccount[]> {
  //   const sql = `
  //     SELECT *
  //     FROM UserAccount
  //     WHERE username LIKE ?;
  //   `;
  //   const params = [`%${searchTerm}%`];

  //   try {
  //     const result = await this.db.query(sql, params);

  //     if (result && result.values && result.values.length > 0) {
  //       return result.values.map((row: any) => ({
  //         id: row.id,
  //         firstname: row.firstname,
  //         surname: row.surname,
  //         dob: row.dob,
  //         sex: row.sex,
  //         designation: row.designation,
  //         contactaddress: row.contactaddress,
  //         countrycode: row.countrycode,
  //         cellphone: row.cellphone,
  //         isaccountactive: row.isaccountactive,
  //         username: row.username,
  //         password: row.password,
  //         usertype: row.usertype,
  //         devicetoken: row.devicetoken,
  //         zoneid: row.zoneid,
  //         createdby: row.createdby,
  //         datecreated: row.datecreated,
  //         modifiedby: row.modifiedby,
  //         datemodified: row.datemodified,
  //         isdeleted: row.isdeleted,
  //         issynced: row.issynced,
  //         onlinedboid: row.onlinedboid,
  //       }));
  //     } else {
  //       return [];
  //     }
  //   } catch (error) {
  //     console.error('Error searching users by username:', error);
  //     return [];
  //   }
  // }

  // update user password by username
  async updateUserPassword(username: string, password: string) {
    const sql = `UPDATE UserAccount SET Password=? WHERE Username=?`;
    const params = [encryptedTo(password), username];

    try {
      await this.db.run(sql, params);
      await this.getUsers(); // Assuming getUsers() retrieves updated user list
    } catch (error) {
      console.error('Error updating user password:', error);
    }
  }

  // Retrieves a single user by their ID
  async getUserById(id: number | string): Promise<UserAccount | null> {
    const sql = `
      SELECT *
      FROM UserAccount
      WHERE Oid = ?;
    `;
    const params = [id];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as UserAccount;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error searching users by username:', error);
        return null;
      });
  }

  // Deletes a user from the database by their ID
  async deleteUserById(id: string) {
    const sql = `DELETE FROM UserAccount WHERE TransactionId=?`;
    const params = [id];

    try {
      await this.db.run(sql, params);
      await this.getUsers(); // Assuming getUsers() retrieves updated user list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  // Validates if a user exists with the given username and password
  async isValidUser(username: string, password: string): Promise<UserAccount | null> {
    if (!this.db) await this.initializeDatabase();

    console.log('isValidUser', username, password);

    try {
      const sql = `SELECT * FROM UserAccount WHERE Username = ? AND Password = ?;`;
      const res = await this.db.query(sql, [username, password]);

      console.log('isValidUser', res);

      if (res !== undefined && res.values !== undefined && res.values.length > 0) {
        const user: UserAccount = res.values[0] as UserAccount;
        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.log('isValidUser', error);
      return null;
    }
  }

  async findLastCreatedUser() {
    const sql = `SELECT * FROM UserAccount ORDER BY Oid DESC LIMIT 1;`;
    try {
      const result = await this.db.query(sql);
      console.log('last created user', result);
      if (result && result.values && result.values.length > 0) {
        return result.values[0] as UserAccount;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching last created user:', error);
      return null;
    }
  }

  async deleteAllUser() {
    // if database is not initialized, initialize it
    if (!this.db) await this.initializeDatabase();

    // delete all users
    const sql = `DELETE FROM UserAccount`;
    try {
      await this.db.run(sql);
      await this.getUsers(); // Assuming getUsers() retrieves updated user list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
}
