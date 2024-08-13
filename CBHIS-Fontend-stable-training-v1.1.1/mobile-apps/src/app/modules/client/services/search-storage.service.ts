import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject } from 'rxjs';
import { SQLiteService } from '../../../shared/services/database/sqlite.service';

import { FamilyMember } from 'src/app/shared/models/family-member';
import { FamilyInfo } from '../models/search-result';

@Injectable({
  providedIn: 'root',
})
export class SearchStorageService {
  public memberList: BehaviorSubject<FamilyInfo[]> = new BehaviorSubject<FamilyInfo[]>([]);
  public familyMember: BehaviorSubject<FamilyMember[]> = new BehaviorSubject<FamilyMember[]>([]);
  private db!: SQLiteDBConnection;
  private isMembersReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private sqliteService: SQLiteService) {
    // this.initializeDatabase().then(() => {
    //   console.log('SearchStorageService initialized');
    // });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();

      // await this.getFamilyMembers(id);
    } catch (error) {
      console.log('database init', error);
    }
  }

  membersState() {
    return this.isMembersReady.asObservable();
  }

  fetchMembers(): BehaviorSubject<FamilyMember[]> {
    return this.familyMember;
  }

  async searchFamilyMembers(searchText: string, searchType: string) {
    console.log(searchText, searchType);
    if (searchText.length == 0) return [];
    let query = `
        SELECT
            identifiedfamilyid AS familyId,
            GROUP_CONCAT(firstname || ' ' || surname, ', ') AS memberName,
            (SELECT firstname || ' ' || surname FROM client
             WHERE ishousehead = 1
               AND identifiedfamilyid = c.identifiedfamilyid) AS houseHead,
            COUNT(*) AS totalDependent,
            address AS location,
            GROUP_CONCAT(countrycode || cellphone, ', ') AS contact
        FROM
            client c
        WHERE
    `;

    let params: string[] = [];

    switch (searchType) {
      case 'HeadMember':
        query += `ishousehead = 1 AND (firstname LIKE ? OR surname LIKE ?)`;
        params = [`%${searchText}%`, `%${searchText}%`];
        break;
      case 'Member':
        query += `ishousehead = 0 AND (firstname LIKE ? OR surname LIKE ?)`;
        params = [`%${searchText}%`, `%${searchText}%`];
        break;
      case 'Location':
        query += `address LIKE ?`;
        params = [`%${searchText}%`];
        break;
      case 'Contact':
        query += `cellphone LIKE ?`;
        params = [`%${searchText}%`];
        break;
      default:
        throw new Error('Invalid search type');
    }
    query += `
        GROUP BY
            identifiedfamilyid;
    `;
    const members: FamilyInfo[] = (await this.db.query(query, params)).values as FamilyInfo[];

    this.memberList.next(members);
    return members;
  }

  async getMemberByFamilyId(familyId: number) {
    const query = `
      SELECT
          id,
          firstname as firstName,
          surname as surname,
          sex,
          dob,
          isdobestimated as isDobEstimated,
          idnumber as idNumbe,
          countrycode as countryCode,
          cellphone as cellPhone,
          address as address,
          ispregnant as isPregnant,
          ishousehead as isHouseHead,
          relationaltype as relationalType,
          educationlevelid as educationLevelId,
          occupationid as occupationId,
          identifiedfamilyid as identifiedFamilyId
      FROM
          clients
      WHERE
          identifiedfamilyid = ?;
  `;

    // Execute the query with the provided familyId
    const members: FamilyMember[] = (await this.db?.query(query, [familyId]))?.values as FamilyMember[];

    // console.log('loadmembers', members);
    this.familyMember.next(members);
  }

  async getFamilyMembers(familyId: number) {
    if (!this.db) {
      await this.initializeDatabase();
    }

    await this.loadFamilyMembers(familyId);
    this.isMembersReady.next(true);
  }

  async loadFamilyMembers(familyId: number) {
    try {
      const members: FamilyMember[] = (
        await this.db.query('SELECT * FROM clients WHERE identifiedfamilyid = ?;', [familyId])
      ).values as FamilyMember[];

      console.log('loadmembers', members);

      this.familyMember.next(members);
    } catch (error) {
      console.log(error);
    }
  }
}
