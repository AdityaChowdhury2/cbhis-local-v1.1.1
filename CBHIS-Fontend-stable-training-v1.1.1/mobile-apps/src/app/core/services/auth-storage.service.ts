import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { UserStorageService } from 'src/app/modules/auth/services/user-storage.service';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { environment } from 'src/environments/environment';
import { CurrentLogin, LoginActivity, LogoutActivity } from '../models/login-activity';
// import { User } from './../../modules/auth/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private dbName: string = environment.database.name;
  private db!: SQLiteDBConnection;
  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private userStorageService: UserStorageService
  ) {
    this.initializeDatabase().then(() => {
      console.log('AuthStorageService initialized');
    });
  }

  async initializeDatabase() {
    try {
      //this.db = await this.sqliteService.retrieveConnection();
      this.db = await this.sqliteService.openDatabase(this.dbName, false, 'no-encryption', 1, false);

      console.log(this.db);
    } catch (error) {
      console.log('database init', error);
    }
  }

  async addLoginInfo(login: LoginActivity) {
    const { user_id, token, device_info, ip_address, login_time } = login;

    const sql = `
      INSERT INTO LoginActivity (
        user_id, token, device_info, ip_address, login_time
      ) VALUES (?, ?, ?, ?, ?);
    `;
    const params = [user_id, token, device_info, ip_address, login_time];

    try {
      await this.db.run(sql, params);
      console.log('Login information added successfully');
    } catch (error) {
      console.log('Error adding login information:', error);
    }
  }

  async currentLoginInfo(login: CurrentLogin) {
    if (this.db == null && this.db == undefined) {
      await this.initializeDatabase().then(() => {
        console.log('AuthStorageService initialized');
      });
    }

    console.log('login', login);

    const { user_id, token, login_time } = login;

    const responseUser = await this.db.query('SELECT * FROM UserAccount;');
    console.log('User Response ', responseUser);

    const sql = `
      INSERT INTO CurrentLogin (
        user_id, token, login_time
      ) VALUES (?, ?, ?);
    `;
    const params = [user_id, token, login_time];
    console.log('params of current login', params);

    try {
      await this.db.run(sql, params);
      console.log('Login information added successfully');
    } catch (error) {
      console.log('Error adding login information:', error);
    }
  }

  async getCurrentLoginStatus(): Promise<UserAccount | null> {
    if (this.db == null || this.db == undefined) {
      await this.initializeDatabase().then(() => {
        console.log('AuthStorageService initialized');
      });
    }
    const sql = 'SELECT * FROM CurrentLogin';
    try {
      const result = await this.db.query(sql);
      console.log('user details from get Current Login status ', result);
      if (result && result.values && result.values.length > 0) {
        const loginStatus: CurrentLogin = result.values[0] as CurrentLogin;
        console.log('LoginStatus : ', loginStatus);
        return this.userStorageService.getUserById(loginStatus.user_id as number);
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error fetching current login status:', error);
      return null;
    }
  }

  async getLoginStatus(): Promise<CurrentLogin | null> {
    if (this.db == null || this.db == undefined) {
      await this.initializeDatabase().then(() => {
        console.log('AuthStorageService initialized');
      });
    }
    const sql = 'SELECT * FROM CurrentLogin';
    try {
      const result = await this.db.query(sql);
      console.log('user details from current Login', result);
      if (result && result.values && result.values.length > 0) {
        const loginStatus: CurrentLogin = result.values[0] as CurrentLogin;
        console.log('LoginStatus : ', loginStatus.user_id);
        return loginStatus;
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error fetching current login status:', error);
      return null;
    }
  }

  async addLogoutInfo(logout: LogoutActivity) {
    const { user_id, logout_time } = logout;

    const sql = `
      INSERT INTO LogoutActivity (
        user_id, logout_time
      ) VALUES (?, ?);
    `;
    const params = [user_id, logout_time];

    try {
      const response = await this.db.run(sql, params);
      console.log('Logout information added successfully');
    } catch (error) {
      console.log('Error adding logout information:', error);
    }
  }

  async deleteCurrentLoginUser(id: number | string) {
    if (!id) return;
    const sql = `DELETE FROM CurrentLogin WHERE user_id= ?`;
    const params = [id];

    try {
      const response = await this.db.run(sql, params);
      console.log('delete current login user response ', response);
    } catch (error) {
      console.log('Error deleting current login user:', error);
    }
  }
}
