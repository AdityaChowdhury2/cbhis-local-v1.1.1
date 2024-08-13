import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';

export interface Village {
  Oid?: number;
  Description: string;
  ChiefdomId?: number;
  IsDeleted?: number;
}

@Injectable({
  providedIn: 'root',
})
export class VillageStorageService {
  public villageList: BehaviorSubject<Village[]> = new BehaviorSubject<Village[]>([]);
  private db!: SQLiteDBConnection;
  private isVillageReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private sqliteService: SQLiteService) {
    this.initializeDatabase().then(async () => {
      console.log('Village Service initialized');
      await this.loadVillages();
    });
  }

  async initializeDatabase() {
    try {
      // retrieve the database connection
      this.db = await this.sqliteService.retrieveConnection();
      await this.getVillages();
    } catch (error) {
      console.log('database init', error);
    }
  }

  villageState() {
    return this.isVillageReady.asObservable();
  }

  fetchVillage(): Observable<Village[]> {
    return this.villageList.asObservable();
  }

  async loadVillages() {
    const villages: Village[] = (await this.db.query('SELECT * FROM Village;')).values as Village[];
    console.log('load villages', villages);
    this.villageList.next(villages);
  }

  async getVillages() {
    await this.loadVillages();
    this.isVillageReady.next(true);
  }

  async geVillageById(id: number): Promise<Village | null> {
    const sql = `SELECT * FROM Village WHERE Oid = ?;`;
    const params = [id];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as Village;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error searching safe water by id:', error);
        return null;
      });
  }
}
