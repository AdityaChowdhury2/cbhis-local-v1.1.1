import { Injectable } from '@angular/core';
import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import * as dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { generateGUID } from 'src/app/shared/utils/common';
import { DiscussedHealthEducationTopic } from '../models/discussed-topics';
import { HealthEducationTopics } from '../models/health-education-topics';

@Injectable({
  providedIn: 'root',
})
export class HealthEducationDiscussedTopicsStorageService {
  public discussedHealthEducationTopicList: BehaviorSubject<DiscussedHealthEducationTopic[]> = new BehaviorSubject<
    DiscussedHealthEducationTopic[]
  >([]);
  private db!: SQLiteDBConnection;
  private isDiscussedHealthEducationTopicsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public healthEducationTopicsList: BehaviorSubject<HealthEducationTopics[]> = new BehaviorSubject<
    HealthEducationTopics[]
  >([]);
  private isHealthEducationTopicsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private toast: ToastService,
    private syncQueueService: SyncStorageService
  ) {
    // Initialize the database connection
    this.initializeDatabase().then(() => {
      console.log('DiscussedHealthEducationTopicsStorageService initialized');
      this.loadHealthEducationTopics();
      this.loadDiscussedHealthEducationTopics();
    });
  }

  async initializeDatabase() {
    try {
      // Retrieve the database connection
      this.db = await this.sqliteService.retrieveConnection();
      await this.getDiscussedHealthEducationTopics();
    } catch (error) {
      console.log('database init', error);
    }
  }

  // the state of the HealthEducationTopics as observable
  healthEducationTopicsState(): Observable<boolean> {
    return this.isHealthEducationTopicsReady.asObservable();
  }

  // the state of the HealthEducationTopics as observable
  discussedHealthEducationTopicsState(): Observable<boolean> {
    return this.isDiscussedHealthEducationTopicsReady.asObservable();
  }

  // Send all the HealthEducationTopics List as observable
  fetchHealthEducationTopics(): Observable<HealthEducationTopics[]> {
    return this.healthEducationTopicsList.asObservable();
  }

  // Send all the discussed HealthEducationTopics List as observable
  fetchDiscussedHealthEducationTopics(): Observable<DiscussedHealthEducationTopic[]> {
    return this.discussedHealthEducationTopicList.asObservable();
  }
  // Load all the HealthEducationTopics from the database
  async loadHealthEducationTopics() {
    const healthEducationTopics: HealthEducationTopics[] = (await this.db.query('SELECT * FROM HealthEducationTopic;'))
      .values as HealthEducationTopics[];

    this.healthEducationTopicsList.next(healthEducationTopics);
  }

  // Load all the Discussed HealthEducationTopics from the database
  async loadDiscussedHealthEducationTopics() {
    const discussedHealthEducationTopics: DiscussedHealthEducationTopic[] = (
      await this.db.query('SELECT * FROM DiscussedTopic;')
    ).values as DiscussedHealthEducationTopic[];
    this.discussedHealthEducationTopicList.next(discussedHealthEducationTopics);
  }

  async getDiscussedHealthEducationTopics() {
    await this.loadDiscussedHealthEducationTopics();
    this.isDiscussedHealthEducationTopicsReady.next(true);
  }

  async addDiscussedHealthEducationTopic(
    discussedHealthEducationTopic: DiscussedHealthEducationTopic[]
  ): Promise<capSQLiteChanges | null> {
    try {
      if (!this.db) await this.initializeDatabase();
      const { query, params, generatedGUIDs } = this.generateInsertQueryAndParams(discussedHealthEducationTopic);
      const uniqueClientIds = [...new Set(discussedHealthEducationTopic.map((item) => item.ClientId))];
      await this.deletePreviousTransactions(uniqueClientIds);
      const response = await this.executeInsertQuery(query, params);
      await this.addToSyncQueue(generatedGUIDs);
      await this.getDiscussedHealthEducationTopics();
      return response;
    } catch (error) {
      console.error('Error adding discussed health education topics:', error);
      this.toast.openToast({
        message: 'Error adding discussed health education topics',
        color: 'error',
      });
      return null;
    }
  }

  // Generate the insert query and parameters for the discussed health education topics
  generateInsertQueryAndParams(discussedHealthEducationTopic: DiscussedHealthEducationTopic[]) {
    const generatedGUIDs: string[] = [];
    const baseQuery = `INSERT INTO DiscussedTopic (
      TransactionId,
      TopicId,
      ClientId,
      IsDeleted,
      CreatedBy,
      MatchId,
      CreatedAt
    ) VALUES `;
    const placeholders = discussedHealthEducationTopic.map(() => `(?, ?, ?, ?, ?, ?, ?)`).join(', ');
    const query = baseQuery + placeholders + ';';

    const params: (string | number)[] = [];

    discussedHealthEducationTopic.forEach((item) => {
      const guid = generateGUID();
      generatedGUIDs.push(guid);
      params.push(
        guid,
        item.TopicId,
        item.ClientId,
        item.IsDeleted ? 1 : 0,
        item.CreatedBy,
        item.MatchId as string,
        item.CreatedAt as string
      );
    });
    console.log('QUERY ==> ', query);
    console.log('params ==> ', params);
    return { query, params, generatedGUIDs };
  }

  // Delete the previous transactions for the discussed health education topics and sync queue
  async deletePreviousTransactions(uniqueClientIds: string[]) {
    for (const clientId of uniqueClientIds) {
      const previousTransactionIds = (
        await this.db.query('SELECT TransactionId FROM DiscussedTopic WHERE ClientId = ?', [clientId])
      ).values?.map((row) => row.TransactionId);

      if (previousTransactionIds && previousTransactionIds.length > 0) {
        await this.db.run(
          `DELETE FROM DiscussedTopic WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
          previousTransactionIds
        );
        await this.db.run(
          `DELETE FROM sync_queue WHERE TransactionId IN (${previousTransactionIds.map(() => '?').join(',')})`,
          previousTransactionIds
        );
      }
    }
  }

  // Execute the insert query with the parameters
  async executeInsertQuery(query: string, params: (string | number)[]) {
    return await this.db.run(query, params);
  }

  async addToSyncQueue(generatedGUIDs: string[]) {
    for (const guid of generatedGUIDs) {
      await this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'INSERT',
        tableName: 'DiscussedTopic',
        transactionId: guid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
    }
  }

  async updateDiscussedHealthEducationTopicById(
    Oid: number,
    discussedHealthEducationTopic: DiscussedHealthEducationTopic
  ) {
    const sql = `
    UPDATE DiscussedTopic
    SET
      TopicId = ?,
      ClientId = ?,
      IsDeleted = ?
    WHERE Oid = ?;
    `;
    const params = [
      discussedHealthEducationTopic.TopicId,
      discussedHealthEducationTopic.ClientId,
      discussedHealthEducationTopic.IsDeleted ?? 0,
      Oid,
    ];

    try {
      await this.db.run(sql, params);

      this.syncQueueService.addTransactionInQueue({
        id: 0,
        operation: 'UPDATE',
        tableName: 'DiscussedTopic',
        transactionId: Oid,
        dateCreated: dayjs().format(),
        createdBy: 1,
        dateModified: dayjs().format(),
        modifiedBy: 1,
      });
      await this.getDiscussedHealthEducationTopics();
      console.log('Discussed health education topic updated successfully');
      this.toast.openToast({
        message: 'Discussed health education topic updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Error updating discussed health education topic:', error);
      this.toast.openToast({
        message: 'Error updating discussed health education topic',
        color: 'error',
      });
    }
  }

  async getDiscussedHealthEducationTopicsByClientId(clientId: string): Promise<DiscussedHealthEducationTopic[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query('SELECT * FROM DiscussedTopic WHERE ClientId = ? AND IsDeleted = 0;', [
      clientId,
    ]);
    console.log(result.values);
    return result.values as DiscussedHealthEducationTopic[];
  }

  async getDiscussedHealthEducationTopicById(Oid: number): Promise<DiscussedHealthEducationTopic | null> {
    const sql = `
      SELECT *
      FROM DiscussedTopic
      WHERE Oid = ?;
    `;
    const params = [Oid];

    return this.db
      .query(sql, params)
      .then((result) => {
        if (result && result.values && result.values.length > 0) {
          return result.values[0] as DiscussedHealthEducationTopic;
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error('Error fetching discussed health education topic by id:', error);
        return null;
      });
  }

  // for multiple clients

  async getDiscussedHealthEducationTopicsByClientIds(clientIds: string[]): Promise<DiscussedHealthEducationTopic[]> {
    if (!this.db) await this.initializeDatabase();
    const result = await this.db.query(
      `SELECT * FROM DiscussedTopic WHERE ClientId IN (${clientIds.map(() => '?').join(',')}) AND IsDeleted = 0;`,
      clientIds
    );
    return result.values as DiscussedHealthEducationTopic[];
  }

  async deleteDiscussedHealthEducationTopicById(Oid: number) {
    const sql = `DELETE FROM DiscussedTopic WHERE Oid = ?`;
    const params = [Oid];

    try {
      await this.db.run(sql, params);
      await this.getDiscussedHealthEducationTopics();
    } catch (error) {
      console.error('Error deleting discussed health education topic:', error);
    }
  }
}
