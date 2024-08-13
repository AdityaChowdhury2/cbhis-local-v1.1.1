import { Injectable } from '@angular/core';

import {
  CapacitorSQLite,
  CapacitorSQLitePlugin,
  SQLiteConnection,
  SQLiteDBConnection,
  capSQLiteUpgradeOptions,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class SQLiteService {
  // Local variables declaration
  dbName: string = environment.database.name;
  sqliteConnection!: SQLiteConnection;
  isService: boolean = false;
  platform!: string;
  sqlitePlugin!: CapacitorSQLitePlugin;
  native: boolean = false;

  constructor() {}
  /**
   * Plugin Initialization
   */
  async initializePlugin(): Promise<boolean> {
    this.platform = Capacitor.getPlatform();
    if (this.platform === 'ios' || this.platform === 'android') this.native = true;
    this.sqlitePlugin = CapacitorSQLite;
    this.sqliteConnection = new SQLiteConnection(this.sqlitePlugin);
    this.isService = true;
    return true;
  }

  /*
   * Initialize the Web Database
   */
  async initWebStore(): Promise<void> {
    try {
      await this.sqliteConnection.initWebStore();
    } catch (err: any) {
      const msg = err.message ? err.message : err;
      return Promise.reject(`initWebStore: ${err}`);
    }
  }

  /*
   * Open a database
   */
  async openDatabase(
    dbName: string,
    encrypted: boolean,
    mode: string,
    version: number,
    readonly: boolean
  ): Promise<SQLiteDBConnection> {
    let db: SQLiteDBConnection;
    const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
    let isConn = (await this.sqliteConnection.isConnection(dbName, readonly)).result;
    if (retCC && isConn) {
      db = await this.sqliteConnection.retrieveConnection(dbName, readonly);
    } else {
      db = await this.sqliteConnection.createConnection(dbName, encrypted, mode, version, readonly);
    }
    await db.open();
    return db;
  }

  /*
   * Retrieve a connection
   */
  async retrieveConnection(dbName: string = this.dbName, readonly: boolean = false): Promise<SQLiteDBConnection> {
    return await this.sqliteConnection.retrieveConnection(dbName, readonly);
  }

  /*
   * Close a connection
   */
  async closeConnection(database: string, readonly?: boolean): Promise<void> {
    const readOnly = readonly ? readonly : false;
    return await this.sqliteConnection.closeConnection(database, readOnly);
  }

  async addUpgradeStatement(options: capSQLiteUpgradeOptions): Promise<void> {
    await this.sqlitePlugin.addUpgradeStatement(options);
    return;
  }

  async deleteDatabase(): Promise<void> {
    await this.sqlitePlugin.deleteDatabase({ database: this.dbName });
    return;
  }
  async importFromJson(jsonstring: string): Promise<void> {
    await this.sqliteConnection.importFromJson(jsonstring);
  }
  async saveToStore(database: string): Promise<void> {
    return await this.sqliteConnection.saveToStore(database);
  }
}
