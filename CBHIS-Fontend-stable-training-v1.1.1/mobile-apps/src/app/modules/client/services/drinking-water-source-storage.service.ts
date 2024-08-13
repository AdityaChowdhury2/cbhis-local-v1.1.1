import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { DrinkingWaterSource } from '../models/drinking-water-source';

@Injectable({
  providedIn: 'root',
})
export class DrinkingWaterSourceStorageService {
  private db!: SQLiteDBConnection;
  private isReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataList: BehaviorSubject<DrinkingWaterSource[]> = new BehaviorSubject<DrinkingWaterSource[]>([]);

  constructor(private sqliteService: SQLiteService) {
    this.initializeDatabase();
  }

  async initializeDatabase() {
    this.db = await this.sqliteService.retrieveConnection();
    await this.loadData();
    this.isReady.next(true);
  }

  async loadData() {
    const result = await this.db.query('SELECT * FROM DrinkingWaterSource WHERE IsDeleted = 0;');
    this.dataList.next(result.values as DrinkingWaterSource[]);
  }

  fetchData() {
    return this.dataList.asObservable();
  }

  async addItem(item: DrinkingWaterSource) {
    const query = `INSERT INTO DrinkingWaterSource (Description, IsDeleted) VALUES (?, ?);`;
    const params = [item.Description, item.IsDeleted];
    await this.db.run(query, params);
    await this.loadData();
  }

  async updateItem(item: DrinkingWaterSource) {
    const query = `UPDATE DrinkingWaterSource SET Description = ?, IsDeleted = ? WHERE Oid = ?;`;
    const params = [item.Description, item.IsDeleted, item.Oid];
    await this.db.run(query, params);
    await this.loadData();
  }

  async deleteItem(id: number) {
    const query = `UPDATE DrinkingWaterSource SET IsDeleted = 1 WHERE Oid = ?;`;
    await this.db.run(query, [id]);
    await this.loadData();
  }
}
