import { Injectable } from '@angular/core';
import { capSQLiteResult, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject } from 'rxjs';
import { HouseholdWASHs } from './../../modules/client/models/household-wash';

import { CurrentLogin } from 'src/app/core/models/login-activity';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { SQLiteService } from 'src/app/shared/services/database/sqlite.service';
import { ToastService } from 'src/app/shared/services/toast.service';

import * as dayjs from 'dayjs';
import { ANC } from 'src/app/modules/client/models/anc';
import { Client } from 'src/app/modules/client/models/client';
import { ANCDiscussedTopics } from 'src/app/modules/client/models/discussed-anc-topics';
import { HouseholdDrinkingWater } from 'src/app/modules/client/models/household-drinking-water';
import { HouseholdSafeWaterSource } from 'src/app/modules/client/models/household-safe-water-source';
import { ImmunizationAdverseEvent } from 'src/app/modules/client/models/service-models/child-health';
import {
  PostNatalDangerSign,
  PostNatalDepression,
  PostNatalFeedingMethod,
  PostNatalPreventativeService,
} from 'src/app/modules/client/models/service-models/postnatal';
import { ActionState } from '../enums/action.enum';
import { TableCode } from '../enums/table-code.enum';
import { SyncQueue, SyncQueueData, SyncQueueItem } from '../models/sync-queue';

@Injectable({
  providedIn: 'root',
})
export class SyncStorageService {
  private db!: SQLiteDBConnection;
  // private isUserReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public syncQueue: BehaviorSubject<SyncQueue[]> = new BehaviorSubject<SyncQueue[]>([]);

  constructor(private sqliteService: SQLiteService, private toast: ToastService) {
    // this.initializeDatabase().then(() => {
    //   console.log('SyncStorageService initialized');
    // });
  }

  async initializeDatabase() {
    try {
      this.db = await this.sqliteService.retrieveConnection();
    } catch (error) {
      console.log('database init', error);
    }
  }

  async getAllTransactionsFromQueue_Old() {
    if (!this.db) await this.initializeDatabase();
    const sql = `
      SELECT id, operation, table_name AS tableName, transactionid AS transactionId, dateCreated, createdBy, dateModified, modifiedBy
      FROM sync_queue;
    `;

    try {
      const rows = (await this.db.query(sql)).values as SyncQueue[];
      return rows;
    } catch (error) {
      console.error('Error retrieving all transactions from queue:', error);
      throw error;
    }
  }
  private splitRowData(data: string): string[] {
    return data.split('|');
  }

  // async getAllTransactionsFromQueue_new() {
  //   if (!this.db) await this.initializeDatabase();
  //   const sql = this.generateSQLQuery();

  //   try {
  //     const rows = (await this.db.query(sql)).values as SyncQueueItem[];
  //     console.log(rows);
  //     const syncData = this.processSyncData(rows);
  //     console.log(syncData);
  //     return syncData;
  //   } catch (error) {
  //     console.error('Error retrieving all transactions from queue:', error);
  //     throw error;
  //   }
  // }

  // private generateSQLQuery() {
  //   return `
  //       SELECT
  //           sq.id,
  //           sq.operation,
  //           sq.table_name AS tableName,
  //           sq.transactionid AS transactionId,
  //           sq.dateCreated,
  //           sq.createdBy,
  //           sq.dateModified,
  //           sq.modifiedBy,
  //           COALESCE(
  //               hsw.Oid || '|' || hsw.FamilyHeadId || '|' || hsw.SafeWaterSourceId || '|' || hsw.IsDeleted || '|' || IFNULL(hsw.OnlineDbOid,''),
  //               ''
  //           ) AS HouseholdSafeWaterSources_row_data,
  //           COALESCE(
  //               an.Oid || '|' || an.ClientId || '|' || an.IsCounselled || '|' || an.IsMalariaDrugTaken || '|' || an.FrequencyOfMalariaTherapy || '|' || IFNULL(an.OnlineDbOid,'') || '|' || an.IsDeleted,
  //               ''
  //           ) AS ANC_row_data,
  //           COALESCE(
  //               hdw.Oid || '|' || hdw.FamilyHeadId || '|' || hdw.DrinkingWaterSourceId || '|' || hdw.IsDeleted || '|' || IFNULL(hdw.OnlineDbOid,''),
  //               ''
  //           ) AS HouseholdDrinkingWaters_row_data,
  //           COALESCE(
  //               hw.TransactionId || '|' || hw.FamilyHeadId || '|' || hw.WASHId || '|' || hw.IsDeleted || '|' || IFNULL(hw.OnlineDbOid,''),
  //               ''
  //           ) AS HouseholdWASHs_row_data,
  //           COALESCE(
  //             dt.TransactionId || '|' ||
  //             dt.TopicId || '|' ||
  //             dt.ClientId || '|' ||
  //             dt.IsDeleted || '|' ||
  //             IFNULL(dt.IsSynced, '') || '|' ||
  //             IFNULL(dt.OnlineDbOid, '') || '|' ||
  //             IFNULL(dt.CreatedBy, '') || '|' ||
  //             IFNULL(dt.ModifiedBy, ''),
  //             ''
  //           ) AS DiscussedTopics_row_data,
  //           COALESCE(
  //               da.Oid || '|' || da.ANCTopicId || '|' || da.ClientId || '|' || da.IsDeleted || '|' || IFNULL(da.OnlineDbOid,''),
  //               ''
  //           ) AS DiscussedANCTopics_row_data,
  //           COALESCE(
  //               cli.Oid || '|' || IFNULL(cli.FirstName, '') || '|' || IFNULL(cli.MiddleName, '') || '|' || IFNULL(cli.LastName, '') || '|' || IFNULL(cli.Age, '') || '|' || IFNULL(cli.DOB, '') || '|' || IFNULL(cli.Sex, '') || '|' || IFNULL(cli.MaritalStatus, '') || '|' || IFNULL(cli.PIN, '') || '|' || IFNULL(cli.Cellphone, '') || '|' || IFNULL(cli.EducationLevel, '') || '|' || IFNULL(cli.Occupation, '') || '|' || IFNULL(cli.HasBirthCertificate, '') || '|' || IFNULL(cli.IsDisabled, 'false') || '|' || IFNULL(cli.IsDeceased, 'false') || '|' || IFNULL(cli.DateDeceased, '') || '|' || IFNULL(cli.IsFamilyHead, '') || '|' || IFNULL(cli.RelationalType, '') || '|' || IFNULL(cli.FamilyHeadId, '') || '|' || IFNULL(cli.VillageId, '') || '|' || IFNULL(cli.IsDeleted, 'false') || '|' || IFNULL(cli.IsSynced, 'false') || '|' || IFNULL(cli.OnlineDbOid,''),
  //               ''
  //           ) AS Client_row_data,
  //           COALESCE(
  //               tb.Oid || '|' || tb.Description || '|' || IFNULL(tb.OnlineDbOid,'') || '|' || tb.IsDeleted,
  //               ''
  //           ) AS TBSymptom_row_data,
  //           COALESCE(
  //               hbc.Oid || '|' || hbc.Description || '|' || IFNULL(hbc.OnlineDbOid,'') || '|' || hbc.IsDeleted,
  //               ''
  //           ) AS HBCService_row_data,
  //           COALESCE(
  //               fp.Oid || '|' || fp.Description || '|' || IFNULL(fp.OnlineDbOid,'') || '|' || fp.IsDeleted,
  //               ''
  //           ) AS FPMethod_row_data,
  //           COALESCE(
  //               hc.Oid || '|' || hc.Description || '|' || hc.JobAid || '|' || IFNULL(hc.OnlineDbOid,'') || '|' || hc.IsDeleted,
  //               ''
  //           ) AS HealthEducationTopic_row_data,
  //           COALESCE(
  //               ncd.Oid || '|' || ncd.Description  || '|' || IFNULL(ncd.OnlineDbOid,'') || '|' || ncd.IsDeleted,
  //               ''
  //           ) AS NCDCondition_row_data,
  //           COALESCE(
  //               md.Oid || '|' || md.Description  || '|' || IFNULL(md.OnlineDbOid,'') || '|' || md.IsDeleted,
  //               ''
  //           ) AS MinimumAcceptableDiet_row_data,
  //           COALESCE(
  //               ev.Oid || '|' || ev.Description  || '|' || IFNULL(ev.OnlineDbOid,'') || '|' || ev.IsDeleted,
  //               ''
  //           ) AS AdverseEvent_row_data,
  //           COALESCE(
  //               ppd.Oid || '|' || ppd.Description || '|' || IFNULL(ppd.OnlineDbOid,'') || '|' || ppd.IsDeleted,
  //               ''
  //           ) AS PostpartumDepression_row_data,
  //           COALESCE(
  //               fe.Oid || '|' || fe.Description  || '|' || IFNULL(fe.OnlineDbOid,'') || '|' || fe.IsDeleted,
  //               ''
  //           ) AS FeedingMethod_row_data,
  //           COALESCE(
  //               di.Oid || '|' || di.Description || '|' || IFNULL(di.OnlineDbOid,'') || '|' || di.IsDeleted,
  //               ''
  //           ) AS DietaryDiversity_row_data,
  //           COALESCE(
  //               tbca.Oid || '|' || tbca.Description || '|' || IFNULL(tbca.OnlineDbOid,'') || '|' || tbca.IsDeleted,
  //               ''
  //           ) AS TBControlAssessment_row_data,
  //           COALESCE(
  //               tbea.Oid || '|' || tbea.Description || '|' || IFNULL(tbea.OnlineDbOid,'') || '|' || tbea.IsDeleted,
  //               ''
  //           ) AS TBEnvironmentalAssessment_row_data
  //       FROM
  //           sync_queue sq
  //       LEFT JOIN
  //           HouseholdSafeWaterSource hsw ON sq.transactionid = hsw.Oid AND sq.table_name = 'HouseholdSafeWaterSource'
  //       LEFT JOIN
  //           ANC an ON sq.transactionid = an.Oid AND sq.table_name = 'ANC'
  //       LEFT JOIN
  //           HouseholdDrinkingWater hdw ON sq.transactionid = hdw.Oid AND sq.table_name = 'HouseholdDrinkingWater'
  //       LEFT JOIN
  //           HouseholdWASH hw ON sq.transactionid = hw.TransactionId AND sq.table_name = 'HouseholdWASH'
  //       LEFT JOIN
  //           DiscussedTopic dt ON sq.transactionid = tb.Oid AND dt.table_name = 'DiscussedTopic'
  //       LEFT JOIN
  //           DiscussedANCTopic da ON sq.transactionid = da.Oid AND sq.table_name = 'DiscussedANCTopic'
  //       LEFT JOIN
  //           Client cli ON sq.transactionid = cli.Oid AND sq.table_name = 'Client'
  //       LEFT JOIN
  //           TBSymptom tb ON sq.transactionid = tb.Oid AND sq.table_name = 'TBSymptom'
  //       LEFT JOIN
  //           HBCService hbc ON sq.transactionid = hbc.Oid AND sq.table_name = 'HBCService'
  //       LEFT JOIN
  //           FamilyPlanningMethod fp ON sq.transactionid = fp.Oid AND sq.table_name = 'FamilyPlanningMethod'
  //       LEFT JOIN
  //           HealthEducationTopic hc ON sq.transactionid = hc.Oid AND sq.table_name = 'HealthEducationTopic'
  //       LEFT JOIN
  //           NCDCondition ncd ON sq.transactionid = ncd.Oid AND sq.table_name = 'NCDCondition'
  //       LEFT JOIN
  //           MinimumAcceptableDiet md ON sq.transactionid = md.Oid AND sq.table_name = 'MinimumAcceptableDiet'
  //       LEFT JOIN
  //           AdverseEvent ev ON sq.transactionid = ev.Oid AND sq.table_name = 'AdverseEvent'
  //       LEFT JOIN
  //           PostpartumDepression ppd ON sq.transactionid = ppd.Oid AND sq.table_name = 'PostpartumDepression'
  //       LEFT JOIN
  //           FeedingMethod fe ON sq.transactionid = fe.Oid AND sq.table_name = 'FeedingMethod'
  //       LEFT JOIN
  //           DietaryDiversity di ON sq.transactionid = di.Oid AND sq.table_name = 'DietaryDiversity'
  //       LEFT JOIN
  //           TBControlAssessment tbca ON sq.transactionid = tbca.Oid AND sq.table_name = 'TBControlAssessment'
  //       LEFT JOIN
  //           TBEnvironmentalAssessment tbea ON sq.transactionid = tbea.Oid AND sq.table_name = 'TBEnvironmentalAssessment';
  //   `;
  // }

  private processSyncData(rows: SyncQueueItem[]): SyncQueueData[] {
    const syncData: SyncQueueData[] = [];

    rows.forEach((element) => {
      const obj = this.processRowData(element);
      syncData.push(obj);
    });

    return syncData;
  }

  private processRowData(element: SyncQueueItem): SyncQueueData {
    const obj: SyncQueueData = {
      id: element.id,
      operation: this.getEnumValue(ActionState, element.operation),
      tableCode: this.getEnumValue(TableCode, element.tableName),
      transactionId: element.transactionId,
      dateCreated: element.dateCreated,
      createdBy: 'b72ffa3f-8e54-49ff-1102-08dc95b2ca9e',
      dateModified: element.dateModified,
      modifiedBy: Number(element.modifiedBy),
    };

    obj['HouseholdSafeWaterSources'] = this.processHouseholdSafeWaterSources(
      element.HouseholdSafeWaterSources_row_data
    );
    obj['ANC'] = this.processANC(element.ANC_row_data);
    obj['HouseholdDrinkingWaters'] = this.processHouseholdDrinkingWaters(element.HouseholdDrinkingWaters_row_data);
    obj['HouseholdWASHs'] = this.processHouseholdWASHs(element.HouseholdWASHs_row_data);
    obj['DiscussedANCTopics'] = this.processDiscussedANCTopics(element.DiscussedANCTopics_row_data);
    obj['Clients'] = this.processClient(element.Client_row_data);
    // obj['TBSymptom'] = this.processTBSymptom(element.TBSymptom_row_data);
    // obj['HBCService'] = this.processHBCService(element.HBCService_row_data);
    // obj['FamilyPlanningMethod'] = this.processFamilyPlanningMethod(element.FPMethod_row_data);
    // obj['HealthEducationTopic'] = this.processHealthEducationTopic(element.HealthEducationTopic_row_data);
    // obj['NCDCondition'] = this.processNCDCondition(element.NCDCondition_row_data);
    // obj['MinimumAcceptableDiet'] = this.processMinimumAcceptableDiet(element.MinimumAcceptableDiet_row_data);
    // obj['AdverseEvent'] = this.processAdverseEvent(element.AdverseEvent_row_data);
    // obj['PostpartumDepression'] = this.processPostpartumDepression(element.PostpartumDepression_row_data);
    // obj['FeedingMethod'] = this.processFeedingMethod(element.FeedingMethod_row_data);
    // obj['DietaryDiversity'] = this.processDietaryDiversity(element.DietaryDiversity_row_data);
    // obj['TBControlAssessment'] = this.processTBControlAssessment(element.TBControlAssessment_row_data);
    // obj['TBEnvironmentalAssessment'] = this.processTBEnvironmentalAssessment(element.TBEnvironmentalAssessment_row_data);
    console.log(obj);
    return obj;
  }

  private processHouseholdSafeWaterSources(data: string): HouseholdSafeWaterSource | undefined {
    const rowData = this.splitRowData(data);
    if (rowData.length > 1) {
      return {
        TransactionId: rowData[0],
        FamilyHeadId: rowData[1],
        SafeWaterSourceId: parseInt(rowData[2]),
        IsDeleted: !!rowData[3],
        OnlineDbOid: rowData[4],
        CreatedBy: rowData[5],
      };
    }
    return undefined;
  }

  private processANC(data: string): ANC | undefined {
    const rowData = this.splitRowData(data);
    if (rowData.length > 1) {
      return {
        TransactionId: this.checkFalsyString(rowData[0]),
        ClientId: this.checkFalsyString(rowData[1]),
        IsCounselled: !!this.checkFalsyNumber(rowData[2]),
        IsANCInitiated: !!this.checkFalsyNumber(rowData[3]),
        IsMalariaDrugTaken: !!this.checkFalsyNumber(rowData[4]),
        FrequencyOfMalariaTherapy: this.checkFalsyNumber(rowData[5]),
        IsDeleted: !!this.checkFalsyNumber(rowData[6]),
        OnlineDbOid: rowData[7],
        CreatedBy: rowData[8],
      };
    }
    return undefined;
  }

  private processHouseholdWASHs(data: string): HouseholdWASHs | undefined {
    const rowData = this.splitRowData(data);
    if (rowData.length > 1) {
      return {
        TransactionId: this.checkFalsyString(rowData[0]),
        FamilyHeadId: this.checkFalsyString(rowData[1]),
        WASHId: this.checkFalsyNumber(rowData[2]),
        IsDeleted: !!this.checkFalsyNumber(rowData[3]),
        OnlineDbOid: rowData[4],
        CreatedBy: rowData[5],
      };
    }
    return undefined;
  }

  private processHouseholdDrinkingWaters(data: string): HouseholdDrinkingWater | undefined {
    const rowData = this.splitRowData(data);
    if (rowData.length > 1) {
      return {
        TransactionId: this.checkFalsyString(rowData[0]),
        FamilyHeadId: this.checkFalsyString(rowData[1]),
        DrinkingWaterSourceId: this.checkFalsyNumber(rowData[2]),
        IsDeleted: !!this.checkFalsyNumber(rowData[3]),
        OnlineDbOid: rowData[4],
        CreatedBy: rowData[5],
      };
    }
    return undefined;
  }

  private processDiscussedANCTopics(data: string): ANCDiscussedTopics | undefined {
    const rowData = this.splitRowData(data);
    if (rowData.length > 1) {
      return {
        TransactionId: this.checkFalsyString(rowData[0]),
        ANCTopicId: this.checkFalsyNumber(rowData[1]),
        ClientId: this.checkFalsyString(rowData[2]),
        IsDeleted: !!this.checkFalsyNumber(rowData[3]),
        OnlineDbOid: rowData[4],
        CreatedBy: rowData[5],
      };
    }
    return undefined;
  }

  private processClient(data: string): Client | undefined {
    const Client_row_data = this.splitRowData(data);
    if (Client_row_data.length > 1) {
      return {
        Oid: Client_row_data[0],
        FirstName: Client_row_data[1],
        MiddleName: Client_row_data[2] || undefined,
        LastName: Client_row_data[3],
        Age: parseInt(Client_row_data[4]),
        DOB: Client_row_data[5],
        Sex: parseInt(Client_row_data[6]),
        MaritalStatus: parseInt(Client_row_data[7]),
        PIN: Client_row_data[8],
        Cellphone: Client_row_data[9] || undefined,
        EducationLevel: parseInt(Client_row_data[10]),
        Occupation: Client_row_data[11] || undefined,
        HasBirthCertificate: !!Client_row_data[12],
        IsDisabled: !!Client_row_data[13],
        IsDeceased: !!Client_row_data[14],
        DateDeceased: Client_row_data[15] || dayjs().toISOString(),
        IsFamilyHead: !!Client_row_data[16],
        RelationalType: parseInt(Client_row_data[17]),
        FamilyHeadId: Client_row_data[18] || undefined,
        VillageId: parseInt(Client_row_data[19]),
        IsDeleted: !!Client_row_data[20],
        IsSynced: !!Client_row_data[21],
        CreatedBy: Client_row_data[22],
        IsPregnant: !!Client_row_data[23],
        OnlineDbOid: Client_row_data[24],
      };
    }
    return undefined;
  }

  async getAllTransactionsFromQueue() {
    if (!this.db) await this.initializeDatabase();
    const sql = `
    SELECT
        sq.id,
        sq.operation,
        sq.table_name AS tableName,
        sq.transactionid AS transactionId,
        sq.dateCreated,
        sq.createdBy,
        sq.dateModified,
        sq.modifiedBy,
        COALESCE(
            hsw.TransactionId || '|' || 
            hsw.FamilyHeadId || '|' || 
            hsw.SafeWaterSourceId || '|' || 
            hsw.IsDeleted || '|' || 
            hsw.CreatedBy || '|' || 
            IFNULL(hsw.OnlineDbOid,''),
            ''
        ) AS HouseholdSafeWaterSources_row_data,
        COALESCE(
            an.TransactionId || '|' || 
            an.ClientId || '|' || 
            an.IsCounselled || '|' || 
            an.IsANCInitiated || '|' || 
            an.IsMalariaDrugTaken || '|' || 
            an.FrequencyOfMalariaTherapy || '|' || 
            IFNULL(an.OnlineDbOid,'') || '|' || 
            an.IsDeleted || '|' || 
            an.CreatedBy,
            ''
        ) AS ANC_row_data,
        COALESCE(
            hdw.TransactionId || '|' || 
            hdw.FamilyHeadId || '|' || 
            hdw.DrinkingWaterSourceId || '|' || 
            hdw.IsDeleted || '|' || 
            hdw.CreatedBy || '|' || 
            IFNULL(hdw.OnlineDbOid,''),
            ''
        ) AS HouseholdDrinkingWaters_row_data,
        COALESCE(
            hw.TransactionId || '|' || 
            hw.FamilyHeadId || '|' || 
            hw.WASHId || '|' || 
            hw.IsDeleted || '|' || 
            hw.CreatedBy || '|' || 
            IFNULL(hw.OnlineDbOid,''),
            ''
        ) AS HouseholdWASHs_row_data,
        COALESCE(
          dt.TransactionId || '|' || 
          dt.TopicId || '|' || 
          dt.ClientId || '|' || 
          dt.IsDeleted || '|' || 
          IFNULL(dt.IsSynced, '') || '|' || 
          IFNULL(dt.OnlineDbOid, '') || '|' || 
          dt.CreatedBy || '|' || 
          IFNULL(dt.ModifiedBy, ''),
          ''
        ) AS DiscussedTopics_row_data,
        COALESCE(
            da.TransactionId || '|' || da.ANCTopicId || '|' || da.ClientId || '|' || da.IsDeleted || '|' || da.CreatedBy || '|' || IFNULL(da.OnlineDbOid,''),
            ''
        ) AS DiscussedANCTopics_row_data,
        COALESCE(
            cli.Oid || '|' || 
            cli.FirstName || '|' || 
            IFNULL(cli.MiddleName, '') || '|' || 
            cli.LastName || '|' || 
            IFNULL(cli.Age, '') || '|' || 
            cli.DOB || '|' || 
            IFNULL(cli.Sex, '') || '|' || 
            IFNULL(cli.MaritalStatus, '') || '|' || 
            IFNULL(cli.PIN, '') || '|' || 
            IFNULL(cli.Cellphone, '') || '|' || 
            IFNULL(cli.EducationLevel, '') || '|' || 
            IFNULL(cli.Occupation, '') || '|' || 
            IFNULL(cli.HasBirthCertificate,'') || '|' || 
            cli.IsDisabled || '|' || 
            cli.IsDeceased || '|' || 
            IFNULL(cli.DateDeceased, '') || '|' || 
            IFNULL(cli.IsFamilyHead, '') || '|' || 
            IFNULL(cli.RelationalType, '') || '|' || 
            IFNULL(cli.FamilyHeadId, '') || '|' || 
            IFNULL(cli.VillageId, '') || '|' || 
            IFNULL(cli.IsDeleted, '') || '|' || 
            IFNULL(cli.IsSynced, '') || '|' || 
            cli.CreatedBy || '|' || 
            IFNULL(cli.IsPregnant, '') || '|' || 
            IFNULL(cli.OnlineDbOid,''),
            ''
        ) AS Client_row_data,
        COALESCE(
            fp.TransactionId || '|' || 
            fp.IsPlanningToBePregnant || '|' || 
            fp.ClientId || '|' || 
            fp.IsDeleted || '|' || 
            fp.CreatedBy || '|' || 
            IFNULL(fp.OnlineDbOid, ''),
            ''
        ) AS FamilyPlan_row_data,
        COALESCE(
            ufpm.TransactionId || '|' || ufpm.ClientId || '|' || ufpm.FPMethodId || '|' || ufpm.IsDeleted || '|' || ufpm.CreatedBy || '|' || IFNULL(ufpm.OnlineDbOid, ''),
            ''
        ) AS UsedFamilyPlanMethod_row_data,
        COALESCE(
            cgm.TransactionId || '|' || 
            cgm.MAUCStatus || '|' || 
            IFNULL(cgm.Weight, '') || '|' || 
            IFNULL(cgm.Height, '') || '|' || 
            cgm.WastingNutritionalOedem || '|' || 
            cgm.IsVitaminAGiven || '|' || 
            cgm.IsDewormingPillGiven || '|' || 
            cgm.IsDeleted || '|' || 
            cgm.ClientId || '|' || 
            cgm.CreatedBy || '|' || 
            IFNULL(cgm.OnlineDbOid,''),
            ''
        ) AS ChildGrowthMonitoring_row_data,
        COALESCE(
            ci.TransactionId || '|' || 
            ci.ClientId || '|' || 
            ci.ImmunizationStatus || '|' || 
            ci.IsDeleted || '|' || 
            ci.CreatedBy || '|' || 
            IFNULL(ci.OnlineDbOid,''),
            ''
        ) AS ChildImmunization_row_data,
        COALESCE(
            iae.TransactionId || '|' || 
            iae.ImmunizationId || '|' || 
            iae.AdverseEventId || '|' || 
            iae.IsDeleted || '|' || 
            iae.CreatedBy || '|' || 
            IFNULL(iae.OnlineDbOid,''),
            ''
        ) AS ImmunizationAdverseEvent_row_data,
        COALESCE(
            pn.TransactionId || '|' || 
            pn.ClientId || '|' || 
            IFNULL(pn.PlaceOfDelivery, '') || '|' || 
            IFNULL(pn.PostPartumLossOfBlood, '') || '|' || 
            pn.IsDeleted || '|' || 
            pn.CreatedBy || '|' || 
            IFNULL(pn.OnlineDbOid,''),
            ''
        ) AS PostNatal_row_data,
        COALESCE(
            pps.TransactionId || '|' || 
            pps.PostNatalId || '|' || 
            pps.PreventativeServiceId || '|' || 
            pps.IsDeleted || '|' || 
            pps.CreatedBy || '|' || 
            IFNULL(pps.OnlineDbOid,''),
            ''
        ) AS PostNatalPreventativeService_row_data,
        COALESCE(
            pnds.TransactionId || '|' || 
            pnds.PostNatalId || '|' || 
            pnds.DangerSignId || '|' || 
            pnds.IsDeleted || '|' || 
            pnds.CreatedBy || '|' || 
            IFNULL(pnds.OnlineDbOid,''),
            ''
        ) AS PostNatalDangerSign_row_data,
        COALESCE(
            pnd.TransactionId || '|' || 
            pnd.PostNatalId || '|' || 
            pnd.PostPartumDepressionId || '|' || 
            pnd.IsDeleted || '|' || 
            pnd.CreatedBy || '|' || 
            IFNULL(pnd.OnlineDbOid,''),
            ''
        ) AS PostNatalDepression_row_data,
        COALESCE(
            pnm.TransactionId || '|' || 
            pnm.PostNatalId || '|' || 
            pnm.FeedingMethodId || '|' || 
            pnm.IsDeleted || '|' || 
            pnm.CreatedBy || '|' || 
            IFNULL(pnm.OnlineDbOid,''),
            ''
        ) AS PostNatalFeedingMethod_row_data,
        COALESCE(
            hdd.TransactionId || '|' || 
            hdd.ClientId || '|' || 
            hdd.DietaryDiversityId || '|' || 
            hdd.IsDeleted || '|' || 
            hdd.CreatedBy || '|' || 
            IFNULL(hdd.OnlineDbOid,''),
            ''
        ) AS HouseholdDietaryDiversity_row_data,
        COALESCE(
            cbcf.TransactionId || '|' || 
            cbcf.ClientId || '|' || 
            cbcf.BCFId || '|' || 
            cbcf.IsDeleted || '|' || 
            cbcf.CreatedBy || '|' || 
            IFNULL(cbcf.OnlineDbOid,''),
            ''
        ) AS ClientBCF_row_data,
        COALESCE(
            cmad.TransactionId || '|' || 
            cmad.ClientId || '|' || 
            cmad.MinimumAcceptableDietId || '|' || 
            IFNULL(cmad.Frequency, 0) || '|' || 
            cmad.IsDeleted || '|' || 
            cmad.CreatedBy || '|' || 
            IFNULL(cmad.OnlineDbOid,''),
            ''
        ) AS ClientMinimumAcceptableDiet_row_data,
        COALESCE(
            cs.TransactionId || '|' || 
            cs.ClientId || '|' || 
            cs.CounselingType || '|' || 
            cs.IsDeleted || '|' || 
            cs.CreatedBy || '|' || 
            IFNULL(cs.OnlineDbOid,''),
            ''
        ) AS Counseling_row_data,
        COALESCE(
            hst.TransactionId || '|' || 
            hst.ClientId || '|' || 
            IFNULL(hst.IsAcceptedHIVTest, '') || '|' || 
            IFNULL(hst.DistributionType, '') || '|' || 
            IFNULL(hst.UserProfile, '') || '|' || 
            IFNULL(hst.IsAssistedSelfTest, '') || '|' || 
            IFNULL(hst.TestResult, '') || '|' || 
            hst.IsDeleted || '|' || 
            hst.CreatedBy || '|' || 
            IFNULL(hst.OnlineDbOid,''),
            ''
        ) AS HIVSelfTest_row_data,
        COALESCE(
            art.TransactionId || '|' || 
            art.ClientId || '|' || 
            IFNULL(art.MedicationSideEffect, '') || '|' || 
            IFNULL(art.IsOnTBPrevention, '') || '|' || 
            IFNULL(art.WellbeingIssues, '') || '|' || 
            art.IsDeleted || '|' || 
            art.CreatedBy || '|' || 
            IFNULL(art.OnlineDbOid,''),
            ''
        ) AS ARTClient_row_data,
        COALESCE(
            tbc.TransactionId || '|' || 
            tbc.ClientId || '|' || 
            tbc.TBControlAssessmentId || '|' || 
            tbc.IsDeleted || '|' || 
            tbc.CreatedBy || '|' || 
            IFNULL(tbc.OnlineDbOid,''),
            ''
        ) AS TBKeyAffectedClient_row_data,
        COALESCE(
            cts.TransactionId || '|' || 
            cts.ClientId || '|' || 
            IFNULL(cts.TBSymptomId, '') || '|' || 
            IFNULL(cts.IsSputumCollected,'') || '|' || 
            IFNULL(cts.IsTBContact,'') || '|' || 
            IFNULL(cts.IsPresumptive, '') || '|' || 
            cts.IsDeleted || '|' || 
            cts.CreatedBy || '|' || 
            IFNULL(cts.OnlineDbOid,''),
            ''
        ) AS ClientTBSymptom_row_data,
        COALESCE(
            ctea.TransactionId || '|' || 
            ctea.ClientId || '|' || 
            IFNULL(ctea.TBEnvironmentalAssessmentId, '') || '|' || 
            IFNULL(ctea.OthersObserved,'') || '|' || 
            ctea.IsDeleted || '|' || 
            ctea.CreatedBy || '|' || 
            IFNULL(ctea.OnlineDbOid,''),
            ''
        ) AS ClientTBEnvironmentalAssessment_row_data,
        COALESCE(
            tdt.TransactionId || '|' || 
            tdt.ClientId || '|' || 
            tdt.TBTopicId || '|' || 
            tdt.IsDeleted || '|' || 
            tdt.CreatedBy || '|' || 
            IFNULL(tdt.OnlineDbOid,''),
            ''
        ) AS TBDiscussedTopic_row_data,
        COALESCE(
            hmr.TransactionId || '|' || 
            hmr.ClientId || '|' || 
            hmr.MalariaRiskId || '|' || 
            hmr.IsDeleted || '|' || 
            hmr.CreatedBy || '|' || 
            IFNULL(hmr.OnlineDbOid,''),
            ''
        ) AS HouseholdMalariaRisk_row_data,
        COALESCE(
            cms.TransactionId || '|' || cms.ClientId || '|' || cms.MalariaSymptomId || '|' || cms.IsDeleted || '|' || cms.CreatedBy || '|' || IFNULL(cms.OnlineDbOid,''),
            ''
        ) AS ClientMalariaSymptom_row_data,
        COALESCE(
            mcf.TransactionId || '|' || 
            mcf.ClientId || '|' || 
            IFNULL(mcf.IsResidenceInMalariaEndemicArea, '') || '|' || 
            IFNULL(mcf.IsMalariaExposed, '') || '|' || 
            IFNULL(mcf.ExposedWhere, '') || '|' || 
            mcf.IsDeleted || '|' || 
            mcf.CreatedBy || '|' || 
            IFNULL(mcf.OnlineDbOid,''),
            ''
        ) AS MalariaCaseFinding_row_data,
        COALESCE(
            mp.TransactionId || '|' || 
            mp.ClientId || '|' || 
            mp.ISR || '|' || 
            mp.ISRProvider || '|' || 
            IFNULL(mp.HASITN,'') || '|' || 
            IFNULL(mp.NumberOfITN, '') || '|' || 
            IFNULL(mp.IsITNObserved, '') || '|' || 
            IFNULL(mp.MaxAgeOfITN, '') || '|' || 
            IFNULL(mp.HasNetBeenTreated,'') || '|' || 
            IFNULL(mp.LastNetWasTreated, '') || '|' || 
            IFNULL(mp.MalariaCampaign, '') || '|' || 
            IFNULL(mp.MalariaCampaignMedium, '') || '|' || 
            mp.IsDeleted || '|' || 
            mp.CreatedBy || '|' || 
            IFNULL(mp.OnlineDbOid,''),
            ''
        ) AS MalariaPrevention_row_data,
        COALESCE(
            hci.TransactionId || '|' || 
            hci.ClientId || '|' || 
            hci.ControlInterventionId || '|' || 
            hci.IsDeleted || '|' || 
            hci.CreatedBy || '|' || 
            IFNULL(hci.OnlineDbOid,''),
            ''
        ) AS HouseholdControlIntervention_row_data,
        COALESCE(
            ghbcs.TransactionId || '|' || 
            ghbcs.ClientId || '|' || 
            ghbcs.HBCServiceId || '|' || 
            ghbcs.IsDeleted || '|' || 
            ghbcs.CreatedBy || '|' || 
            IFNULL(ghbcs.OnlineDbOid,''),
            ''
        ) AS GivenHBCService_row_data,
        COALESCE(
            hbcs.Oid || '|' || hbcs.ClientId || '|' || hbcs.ServiceCategoryId || '|' || hbcs.IsDeleted || '|' || hbcs.CreatedBy || '|' || IFNULL(hbcs.OnlineDbOid,''),
            ''
        ) AS HBCServiceCategory_row_data,
        COALESCE(
            hbca.TransactionId || '|' || 
            hbca.ClientId || '|' || 
            hbca.Condition || '|' || 
            IFNULL(hbca.IsDischargedFromHBC, '') || '|' || 
            IFNULL(hbca.ReasonForDischarge, '') || '|' || 
            hbca.IsDeleted || '|' || 
            hbca.CreatedBy || '|' || 
            IFNULL(hbca.OnlineDbOid,''),
            ''
        ) AS HBCClientAssessment_row_data,
        COALESCE(
            cnh.TransactionId || '|' || 
            cnh.ClientId || '|' || 
            cnh.NCDConditionId || '|' || 
            cnh.ScreeningOutcome || '|' || 
            IFNULL(cnh.IsTestConducted, '') || '|' || 
            IFNULL(cnh.TestOutcome, '') ||  '|'  || 
            cnh.IsDeleted || '|' || 
            cnh.CreatedBy || '|' || 
            IFNULL(cnh.OnlineDbOid,''),
            ''
        ) AS ClientNCDHistory_row_data,
        COALESCE(
            ncds.TransactionId || '|' || 
            ncds.ClientId || '|' || 
            ncds.WaterIntake || '|' || 
            IFNULL(ncds.IsClientSmoking, '') || '|' || 
            ncds.BreathingDifficulty || '|' || 
            ncds.Exercise || '|' || 
            ncds.HeartRateRaisingActivity || '|' || 
            IFNULL(ncds.VegetableConsumption, '') || '|' || 
            IFNULL(ncds.FruitConsumption, '') || '|' || 
            IFNULL(ncds.IsSweetenedFoodConsumed, '') || '|' || 
            IFNULL(ncds.IsRefinedWheatConsumed, '') || '|' || 
            ncds.SaltIntake || '|' || 
            ncds.AlcoholConsumption || '|' || 
            ncds.IsDeleted || '|' || 
            ncds.CreatedBy || '|' || 
            IFNULL(ncds.OnlineDbOid, ''),
            ''
        ) AS NCDScreening_row_data
    FROM
        sync_queue sq
    LEFT JOIN
        HouseholdSafeWaterSource hsw ON sq.transactionid = hsw.TransactionId AND sq.table_name = 'HouseholdSafeWaterSource'
    LEFT JOIN
        ANC an ON sq.transactionid = an.TransactionId OR sq.transactionid = an.OnlineDbOid AND sq.table_name = 'ANC'
    LEFT JOIN
        HouseholdDrinkingWater hdw ON sq.transactionid = hdw.TransactionId AND sq.table_name = 'HouseholdDrinkingWater'
    LEFT JOIN
        HouseholdWASH hw ON sq.transactionid = hw.TransactionId AND sq.table_name = 'HouseholdWASH'
    LEFT JOIN
        DiscussedANCTopic da ON sq.transactionid = da.TransactionId AND sq.table_name = 'DiscussedANCTopic'
    LEFT JOIN
        DiscussedTopic dt ON sq.transactionid = dt.TransactionId AND sq.table_name = 'DiscussedTopic'
    LEFT JOIN
        Client cli ON sq.transactionid = cli.Oid AND sq.table_name = 'Client'
    LEFT JOIN
        FamilyPlan fp ON sq.transactionid = fp.TransactionId OR sq.transactionid = fp.OnlineDbOid AND sq.table_name = 'FamilyPlan'
    LEFT JOIN
        UsedFamilyPlanMethod ufpm ON sq.transactionid = ufpm.TransactionId AND sq.table_name = 'UsedFamilyPlanMethod'
    LEFT JOIN
        ChildGrowthMonitoring cgm ON sq.transactionid = cgm.TransactionId OR sq.transactionid = cgm.OnlineDbOid AND sq.table_name = 'ChildGrowthMonitoring'
    LEFT JOIN
        ChildImmunization ci ON sq.transactionid = ci.TransactionId OR sq.transactionid = ci.OnlineDbOid AND sq.table_name = 'ChildImmunization'
    LEFT JOIN
        ImmunizationAdverseEvent iae ON sq.transactionid = iae.TransactionId AND sq.table_name = 'ImmunizationAdverseEvent'
    LEFT JOIN
        PostNatal pn ON sq.transactionid = pn.TransactionId OR sq.transactionid = pn.OnlineDbOid AND sq.table_name = 'PostNatal'
    LEFT JOIN
        PostNatalPreventativeService pps ON sq.transactionid = pps.TransactionId AND sq.table_name = 'PostNatalPreventativeService'
    LEFT JOIN
        PostNatalDangerSign pnds ON sq.transactionid = pnds.TransactionId AND sq.table_name = 'PostNatalDangerSign'
    LEFT JOIN
        PostNatalDepression pnd ON sq.transactionid = pnd.TransactionId AND sq.table_name = 'PostNatalDepression'
    LEFT JOIN
        PostNatalFeedingMethod pnm ON sq.transactionid = pnm.TransactionId AND sq.table_name = 'PostNatalFeedingMethod'
    LEFT JOIN
        HouseholdDietaryDiversity hdd ON sq.transactionid = hdd.TransactionId AND sq.table_name = 'HouseholdDietaryDiversity'
    LEFT JOIN
        ClientBCF cbcf ON sq.transactionid = cbcf.TransactionId AND sq.table_name = 'ClientBCF'
    LEFT JOIN
        ClientMinimumAcceptableDiet cmad ON sq.transactionid = cmad.TransactionId OR sq.transactionid = cmad.OnlineDbOid AND sq.table_name = 'ClientMinimumAcceptableDiet'
    LEFT JOIN
        Counseling cs ON sq.transactionid = cs.TransactionId OR sq.transactionid = cs.OnlineDbOid AND sq.table_name = 'Counseling'
    LEFT JOIN
        HIVSelfTest hst ON sq.transactionid = hst.TransactionId OR sq.transactionid = hst.OnlineDbOid AND sq.table_name = 'HIVSelfTest'
    LEFT JOIN
        ARTClient art ON sq.transactionid = art.TransactionId OR sq.transactionid = art.OnlineDbOid AND sq.table_name = 'ARTClient'
    LEFT JOIN
        TBKeyAffectedClient tbc ON sq.transactionid = tbc.TransactionId AND sq.table_name = 'TBKeyAffectedClient'
    LEFT JOIN
        ClientTBSymptom cts ON sq.transactionid = cts.TransactionId OR sq.transactionid = cts.OnlineDbOid AND sq.table_name = 'ClientTBSymptom'
    LEFT JOIN
        ClientTBEnvironmentalAssessment ctea ON sq.transactionid = ctea.TransactionId OR sq.transactionid = ctea.OnlineDbOid AND sq.table_name = 'ClientTBEnvironmentalAssessment'
    LEFT JOIN
        TBDiscussedTopic tdt ON sq.transactionid = tdt.TransactionId AND sq.table_name = 'TBDiscussedTopic'
    LEFT JOIN
        HouseholdMalariaRisk hmr ON sq.transactionid = hmr.TransactionId AND sq.table_name = 'HouseholdMalariaRisk'
    LEFT JOIN
        ClientMalariaSymptom cms ON sq.transactionid = cms.TransactionId AND sq.table_name = 'ClientMalariaSymptom'
    LEFT JOIN
        MalariaCaseFinding mcf ON sq.transactionid = mcf.TransactionId OR sq.transactionid = mcf.OnlineDbOid AND sq.table_name = 'MalariaCaseFinding'
    LEFT JOIN
        MalariaPrevention mp ON sq.transactionid = mp.TransactionId OR sq.transactionid = mp.OnlineDbOid AND sq.table_name = 'MalariaPrevention'
    LEFT JOIN
        HouseholdControlIntervention hci ON sq.transactionid = hci.TransactionId OR sq.transactionid = hci.OnlineDbOid AND sq.table_name = 'HouseholdControlIntervention'
    LEFT JOIN
        GivenHBCService ghbcs ON sq.transactionid = ghbcs.TransactionId AND sq.table_name = 'GivenHBCService'
    LEFT JOIN
        HBCServiceCategory hbcs ON sq.transactionid = hbcs.Oid AND sq.table_name = 'HBCServiceCategory'
    LEFT JOIN
        HBCClientAssessment hbca ON sq.transactionid = hbca.TransactionId OR sq.transactionid = hbca.OnlineDbOid AND sq.table_name = 'HBCClientAssessment'
    LEFT JOIN
        NCDScreening ncds ON sq.transactionid = ncds.TransactionId OR sq.transactionid = ncds.OnlineDbOid AND sq.table_name = 'NCDScreening'
    LEFT JOIN
        ClientNCDHistory cnh ON sq.transactionid = cnh.TransactionId OR sq.transactionid = cnh.OnlineDbOid AND sq.table_name = 'ClientNCDHistory';
`;

    try {
      const rows = (await this.db.query(sql)).values as SyncQueueItem[];
      console.log('From sync storage service ', rows);
      let syncData: SyncQueueData[] = [] as SyncQueueData[];
      const syncQueueIdsForDeleteFromSyncQueue: number[] = [];

      const ImmunizationAdverseEvents: ImmunizationAdverseEvent[] = [];
      const PostNatalDangerSigns: PostNatalDangerSign[] = [];
      const PostNatalDepressions: PostNatalDepression[] = [];
      const PostNatalFeedingMethods: PostNatalFeedingMethod[] = [];
      const PostNatalPreventativeServices: PostNatalPreventativeService[] = [];

      if (rows !== undefined && rows.length > 0) {
        rows.forEach((element) => {
          console.log('element in ImmunizationAdverseEvent', element);
          // console.log('element in ImmunizationAdverseEvent', typeof element.transactionId);
          if (element.tableName === 'ImmunizationAdverseEvent') {
            const splitRowData = (data: string) => data?.split('|');
            const ImmunizationAdverseEvent_row_data = splitRowData(element.ImmunizationAdverseEvent_row_data);
            let obj: ImmunizationAdverseEvent = {
              TransactionId: ImmunizationAdverseEvent_row_data[0],
              ImmunizationId: this.checkFalsyString(ImmunizationAdverseEvent_row_data[1]),
              AdverseEventId: this.checkFalsyNumber(ImmunizationAdverseEvent_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(ImmunizationAdverseEvent_row_data[3]),
              CreatedBy: this.checkFalsyString(ImmunizationAdverseEvent_row_data[4]),
              OnlineDbOid: ImmunizationAdverseEvent_row_data[5]
                ? ImmunizationAdverseEvent_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
            console.log('element in ImmunizationAdverseEvent', typeof element.transactionId);
            ImmunizationAdverseEvents.push(obj);
            syncQueueIdsForDeleteFromSyncQueue.push(element.id);
          }
          if (element.tableName === 'PostNatalDangerSign') {
            const splitRowData = (data: string) => data?.split('|');
            const PostNatalDangerSign_row_data = splitRowData(element.PostNatalDangerSign_row_data);
            let obj: PostNatalDangerSign = {
              TransactionId: PostNatalDangerSign_row_data[0],
              PostNatalId: this.checkFalsyString(PostNatalDangerSign_row_data[1]),
              DangerSignId: this.checkFalsyNumber(PostNatalDangerSign_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(PostNatalDangerSign_row_data[3]),
              CreatedBy: this.checkFalsyString(PostNatalDangerSign_row_data[4]),
              OnlineDbOid: PostNatalDangerSign_row_data[5]
                ? PostNatalDangerSign_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
            PostNatalDangerSigns.push(obj);
            syncQueueIdsForDeleteFromSyncQueue.push(element.id);
          }
          if (element.tableName === 'PostNatalPreventativeService') {
            const splitRowData = (data: string) => data?.split('|');
            const PostNatalPreventativeService_row_data = splitRowData(element.PostNatalPreventativeService_row_data);
            let obj: PostNatalPreventativeService = {
              TransactionId: PostNatalPreventativeService_row_data[0],
              PostNatalId: this.checkFalsyString(PostNatalPreventativeService_row_data[1]),
              PreventativeServiceId: this.checkFalsyNumber(PostNatalPreventativeService_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(PostNatalPreventativeService_row_data[3]),
              CreatedBy: this.checkFalsyString(PostNatalPreventativeService_row_data[4]),
              OnlineDbOid: PostNatalPreventativeService_row_data[5]
                ? PostNatalPreventativeService_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
            PostNatalPreventativeServices.push(obj);
            syncQueueIdsForDeleteFromSyncQueue.push(element.id);
          }
          if (element.tableName === 'PostNatalDepression') {
            const splitRowData = (data: string) => data?.split('|');
            const PostNatalDepression_row_data = splitRowData(element.PostNatalDepression_row_data);
            let obj: PostNatalDepression = {
              TransactionId: PostNatalDepression_row_data[0],
              PostNatalId: this.checkFalsyString(PostNatalDepression_row_data[1]),
              PostPartumDepressionId: this.checkFalsyNumber(PostNatalDepression_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(PostNatalDepression_row_data[3]),
              CreatedBy: this.checkFalsyString(PostNatalDepression_row_data[4]),
              OnlineDbOid: PostNatalDepression_row_data[5]
                ? PostNatalDepression_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
            PostNatalDepressions.push(obj);
            syncQueueIdsForDeleteFromSyncQueue.push(element.id);
          }
          if (element.tableName === 'PostNatalFeedingMethod') {
            const splitRowData = (data: string) => data?.split('|');
            const PostNatalFeedingMethod_row_data = splitRowData(element.PostNatalFeedingMethod_row_data);
            let obj: PostNatalFeedingMethod = {
              TransactionId: PostNatalFeedingMethod_row_data[0],
              PostNatalId: this.checkFalsyString(PostNatalFeedingMethod_row_data[1]),
              FeedingMethodId: this.checkFalsyNumber(PostNatalFeedingMethod_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(PostNatalFeedingMethod_row_data[3]),
              CreatedBy: this.checkFalsyString(PostNatalFeedingMethod_row_data[4]),
              OnlineDbOid: PostNatalFeedingMethod_row_data[5]
                ? PostNatalFeedingMethod_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
            PostNatalFeedingMethods.push(obj);
            syncQueueIdsForDeleteFromSyncQueue.push(element.id);
          }
        });
      }

      console.log('IMMUNIZATION_ADVERSE_EVENT', ImmunizationAdverseEvents);
      if (rows !== undefined && rows.length > 0) {
        console.log('in 2nd loop');
        syncData = rows.map((element) => {
          console.log('element ', element);
          const splitRowData = (data: string) => data?.split('|');
          const HouseholdSafeWaterSources_row_data = splitRowData(element.HouseholdSafeWaterSources_row_data);
          const ANC_row_data = splitRowData(element.ANC_row_data);
          const HouseholdDrinkingWaters_row_data = splitRowData(element.HouseholdDrinkingWaters_row_data);
          const HouseholdWASHs_row_data = splitRowData(element.HouseholdWASHs_row_data);
          const DiscussedTopics_row_data = splitRowData(element.DiscussedTopics_row_data);
          const DiscussedANCTopics_row_data = splitRowData(element.DiscussedANCTopics_row_data);
          const Client_row_data = splitRowData(element.Client_row_data);
          const FamilyPlan_row_data = splitRowData(element.FamilyPlan_row_data);
          const UsedFamilyPlanMethod_row_data = splitRowData(element.UsedFamilyPlanMethod_row_data);
          const ChildGrowthMonitoring_row_data = splitRowData(element.ChildGrowthMonitoring_row_data);
          const ChildImmunization_row_data = splitRowData(element.ChildImmunization_row_data);
          const ImmunizationAdverseEvent_row_data = splitRowData(element.ImmunizationAdverseEvent_row_data);
          const PostNatal_row_data = splitRowData(element.PostNatal_row_data);
          const PostNatalPreventativeService_row_data = splitRowData(element.PostNatalPreventativeService_row_data);
          const PostNatalDangerSign_row_data = splitRowData(element.PostNatalDangerSign_row_data);
          const PostNatalDepression_row_data = splitRowData(element.PostNatalDepression_row_data);
          const PostNatalFeedingMethod_row_data = splitRowData(element.PostNatalFeedingMethod_row_data);
          const HouseholdDietaryDiversity_row_data = splitRowData(element.HouseholdDietaryDiversity_row_data);
          const ClientBCF_row_data = splitRowData(element.ClientBCF_row_data);
          const ClientMinimumAcceptableDiet_row_data = splitRowData(element.ClientMinimumAcceptableDiet_row_data);
          const Counseling_row_data = splitRowData(element.Counseling_row_data);
          const HIVSelfTest_row_data = splitRowData(element.HIVSelfTest_row_data);
          const ARTClient_row_data = splitRowData(element.ARTClient_row_data);
          const TBKeyAffectedClient_row_data = splitRowData(element.TBKeyAffectedClient_row_data);
          const ClientTBSymptom_row_data = splitRowData(element.ClientTBSymptom_row_data);
          const ClientTBEnvironmentalAssessment_row_data = splitRowData(
            element.ClientTBEnvironmentalAssessment_row_data
          );
          const TBDiscussedTopic_row_data = splitRowData(element.TBDiscussedTopic_row_data);
          const HouseholdMalariaRisk_row_data = splitRowData(element.HouseholdMalariaRisk_row_data);
          const ClientMalariaSymptom_row_data = splitRowData(element.ClientMalariaSymptom_row_data);
          const MalariaCaseFinding_row_data = splitRowData(element.MalariaCaseFinding_row_data);
          const MalariaPrevention_row_data = splitRowData(element.MalariaPrevention_row_data);
          const HouseholdControlIntervention_row_data = splitRowData(element.HouseholdControlIntervention_row_data);
          const GivenHBCService_row_data = splitRowData(element.GivenHBCService_row_data);
          const HBCServiceCategory_row_data = splitRowData(element.HBCServiceCategory_row_data);
          const HBCClientAssessment_row_data = splitRowData(element.HBCClientAssessment_row_data);
          const ClientNCDHistory_row_data = splitRowData(element.ClientNCDHistory_row_data);
          const NCDScreening_row_data = splitRowData(element.NCDScreening_row_data);

          let obj: SyncQueueData = {
            id: element.id,
            operation: this.getEnumValue(ActionState, element.operation),
            tableCode: this.getEnumValue(TableCode, element.tableName),
            transactionId: element.transactionId,
            dateCreated: element.dateCreated,
            createdBy: element.createdBy,
            dateModified: element.dateModified,
            modifiedBy: '00000000-0000-0000-0000-000000000000',
          };

          if (HouseholdDrinkingWaters_row_data.length > 1) {
            obj['HouseholdDrinkingWaters'] = {
              TransactionId: this.checkFalsyString(HouseholdDrinkingWaters_row_data[0]),
              FamilyHeadId: this.checkFalsyString(HouseholdDrinkingWaters_row_data[1]),
              DrinkingWaterSourceId: this.checkFalsyNumber(HouseholdDrinkingWaters_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(HouseholdDrinkingWaters_row_data[3]),
              CreatedBy: this.checkFalsyString(HouseholdDrinkingWaters_row_data[4]),
              OnlineDbOid: HouseholdDrinkingWaters_row_data[5]
                ? HouseholdDrinkingWaters_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ANC_row_data.length > 1) {
            obj['ANC'] = {
              TransactionId: ANC_row_data[0],
              ClientId: this.checkFalsyString(ANC_row_data[1]),
              IsCounselled: !!this.checkFalsyNumber(ANC_row_data[2]),
              IsANCInitiated: !!this.checkFalsyNumber(ANC_row_data[3]),
              IsMalariaDrugTaken: !!this.checkFalsyNumber(ANC_row_data[4]),
              FrequencyOfMalariaTherapy: this.checkFalsyNumber(ANC_row_data[5]),
              IsDeleted: !!this.checkFalsyNumber(ANC_row_data[7]),
              CreatedBy: this.checkFalsyString(ANC_row_data[8]),
              OnlineDbOid: ANC_row_data[6] ? ANC_row_data[6] : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (DiscussedTopics_row_data.length > 1) {
            obj['DiscussedTopics'] = {
              TransactionId: DiscussedTopics_row_data[0],
              TopicId: this.checkFalsyNumber(DiscussedTopics_row_data[1]),
              ClientId: this.checkFalsyString(DiscussedTopics_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(DiscussedTopics_row_data[3]),
              OnlineDbOid: DiscussedTopics_row_data[5]
                ? DiscussedTopics_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              CreatedBy: this.checkFalsyString(DiscussedTopics_row_data[6]),
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (HouseholdSafeWaterSources_row_data.length > 1) {
            obj['HouseholdSafeWaterSources'] = {
              TransactionId: this.checkFalsyString(HouseholdSafeWaterSources_row_data[0]),
              FamilyHeadId: this.checkFalsyString(HouseholdSafeWaterSources_row_data[1]),
              SafeWaterSourceId: this.checkFalsyNumber(HouseholdSafeWaterSources_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(HouseholdSafeWaterSources_row_data[3]),
              CreatedBy: this.checkFalsyString(HouseholdSafeWaterSources_row_data[4]),
              OnlineDbOid: HouseholdSafeWaterSources_row_data[5]
                ? HouseholdSafeWaterSources_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (HouseholdWASHs_row_data.length > 1) {
            obj['HouseholdWASHs'] = {
              TransactionId: this.checkFalsyString(HouseholdWASHs_row_data[0]),
              FamilyHeadId: this.checkFalsyString(HouseholdWASHs_row_data[1]),
              WASHId: this.checkFalsyNumber(HouseholdWASHs_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(HouseholdWASHs_row_data[3]),
              CreatedBy: this.checkFalsyString(HouseholdWASHs_row_data[4]),
              OnlineDbOid: HouseholdWASHs_row_data[5]
                ? HouseholdWASHs_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (DiscussedANCTopics_row_data.length > 1) {
            obj['DiscussedANCTopics'] = {
              TransactionId: this.checkFalsyString(DiscussedANCTopics_row_data[0]),
              ANCTopicId: this.checkFalsyNumber(DiscussedANCTopics_row_data[1]),
              ClientId: this.checkFalsyString(DiscussedANCTopics_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(DiscussedANCTopics_row_data[3]),
              CreatedBy: this.checkFalsyString(DiscussedANCTopics_row_data[4]),
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (Client_row_data.length > 1) {
            console.log('Client_row_data => ', Client_row_data);
            obj['Clients'] = {
              Oid: this.checkFalsyString(Client_row_data[0]),
              FirstName: Client_row_data[1],
              MiddleName: this.checkFalsyString(Client_row_data[2]),
              LastName: Client_row_data[3],
              Age: this.checkFalsyNumber(Client_row_data[4]),
              DOB: Client_row_data[5],
              Sex: parseInt(Client_row_data[6]),
              MaritalStatus: parseInt(Client_row_data[7]),
              PIN: Client_row_data[8],
              Cellphone: this.checkFalsyString(Client_row_data[9]),
              EducationLevel: parseInt(Client_row_data[10]),
              Occupation: this.checkFalsyString(Client_row_data[11]),
              HasBirthCertificate: !!this.checkFalsyNumber(Client_row_data[12]),
              IsDisabled: !!this.checkFalsyNumber(Client_row_data[13]),
              IsDeceased: !!this.checkFalsyNumber(Client_row_data[14]),
              DateDeceased: Client_row_data[15] ? Client_row_data[15] : null,
              IsFamilyHead: !!this.checkFalsyNumber(Client_row_data[16]),
              RelationalType: this.checkFalsyNumber(Client_row_data[17]),
              FamilyHeadId: Client_row_data[18] || undefined,
              VillageId: parseInt(Client_row_data[19]),
              IsDeleted: !!this.checkFalsyNumber(Client_row_data[20]),
              IsSynced: !!this.checkFalsyNumber(Client_row_data[21]),
              CreatedBy: this.checkFalsyString(Client_row_data[22]),
              IsPregnant: !!this.checkFalsyNumber(Client_row_data[23]),
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (FamilyPlan_row_data.length > 1) {
            obj['FamilyPlans'] = {
              TransactionId: this.checkFalsyString(FamilyPlan_row_data[0]),
              IsPlanningToBePregnant: !!this.checkFalsyNumber(FamilyPlan_row_data[1]),
              ClientId: this.checkFalsyString(FamilyPlan_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(FamilyPlan_row_data[3]),
              CreatedBy: this.checkFalsyString(FamilyPlan_row_data[4]),
              OnlineDbOid: FamilyPlan_row_data[5] ? FamilyPlan_row_data[5] : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (UsedFamilyPlanMethod_row_data.length > 1) {
            obj['UsedFamilyPlanMethods'] = {
              TransactionId: this.checkFalsyString(UsedFamilyPlanMethod_row_data[0]),
              ClientId: this.checkFalsyString(UsedFamilyPlanMethod_row_data[1]),
              FPMethodId: this.checkFalsyNumber(UsedFamilyPlanMethod_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(UsedFamilyPlanMethod_row_data[3]),
              CreatedBy: this.checkFalsyString(UsedFamilyPlanMethod_row_data[4]),
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ChildGrowthMonitoring_row_data.length > 1) {
            console.log('ChildGrowthMonitoring_row_data => ', ChildGrowthMonitoring_row_data);
            obj['ChildGrowthMonitorings'] = {
              TransactionId: this.checkFalsyString(ChildGrowthMonitoring_row_data[0]),
              MAUCStatus: this.checkFalsyNumber(ChildGrowthMonitoring_row_data[1]),
              Weight: ChildGrowthMonitoring_row_data[2]
                ? this.checkFalsyNumber(ChildGrowthMonitoring_row_data[2])
                : null,
              Height: ChildGrowthMonitoring_row_data[3]
                ? this.checkFalsyNumber(ChildGrowthMonitoring_row_data[3])
                : null,
              WastingNutritionalOedem: this.checkFalsyNumber(ChildGrowthMonitoring_row_data[4]),
              IsVitaminAGiven: !!this.checkFalsyNumber(ChildGrowthMonitoring_row_data[5]),
              IsDewormingPillGiven: !!this.checkFalsyNumber(ChildGrowthMonitoring_row_data[6]),
              IsDeleted: !!this.checkFalsyNumber(ChildGrowthMonitoring_row_data[7]),
              ClientId: this.checkFalsyString(ChildGrowthMonitoring_row_data[8]),
              CreatedBy: this.checkFalsyString(ChildGrowthMonitoring_row_data[9]),
              OnlineDbOid: ChildGrowthMonitoring_row_data[10]
                ? ChildGrowthMonitoring_row_data[10]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ChildImmunization_row_data.length > 1) {
            obj['ChildImmunizations'] = {
              TransactionId: this.checkFalsyString(ChildImmunization_row_data[0]),
              ClientId: this.checkFalsyString(ChildImmunization_row_data[1]),
              ImmunizationStatus: this.checkFalsyNumber(ChildImmunization_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(ChildImmunization_row_data[3]),
              CreatedBy: this.checkFalsyString(ChildImmunization_row_data[4]),
              OnlineDbOid: ChildImmunization_row_data[5]
                ? ChildImmunization_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
              ImmunizationAdverseEvents: ImmunizationAdverseEvents.filter(
                (item) => item.ImmunizationId === ChildImmunization_row_data[0]
              ),
            };
          }
          if (PostNatal_row_data.length > 1) {
            console.log('postnatal data', PostNatal_row_data);
            obj['PostNatals'] = {
              TransactionId: this.checkFalsyString(PostNatal_row_data[0]),
              ClientId: this.checkFalsyString(PostNatal_row_data[1]),
              PlaceOfDelivery: PostNatal_row_data[2] ? this.checkFalsyNumber(PostNatal_row_data[2]) : null,
              PostPartumLossOfBlood: PostNatal_row_data[3] ? this.checkFalsyNumber(PostNatal_row_data[3]) : null,
              IsDeleted: !!this.checkFalsyNumber(PostNatal_row_data[4]),
              CreatedBy: this.checkFalsyString(PostNatal_row_data[5]),
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
              PostNatalDangerSigns: PostNatalDangerSigns.filter((item) => item.PostNatalId === PostNatal_row_data[0]),
              PostNatalDepressions: PostNatalDepressions.filter((item) => item.PostNatalId === PostNatal_row_data[0]),
              PostNatalFeedingMethods: PostNatalFeedingMethods.filter(
                (item) => item.PostNatalId === PostNatal_row_data[0]
              ),
              PostNatalPreventativeServices: PostNatalPreventativeServices.filter(
                (item) => item.PostNatalId === PostNatal_row_data[0]
              ),
            };
          }

          if (HouseholdDietaryDiversity_row_data.length > 1) {
            obj['HouseholdDietaryDiversities'] = {
              TransactionId: this.checkFalsyString(HouseholdDietaryDiversity_row_data[0]),
              ClientId: this.checkFalsyString(HouseholdDietaryDiversity_row_data[1]),
              DietaryDiversityId: this.checkFalsyNumber(HouseholdDietaryDiversity_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(HouseholdDietaryDiversity_row_data[3]),
              CreatedBy: this.checkFalsyString(HouseholdDietaryDiversity_row_data[4]),
              OnlineDbOid: HouseholdDietaryDiversity_row_data[5]
                ? HouseholdDietaryDiversity_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ClientBCF_row_data.length > 1) {
            obj['ClientBCFs'] = {
              TransactionId: this.checkFalsyString(ClientBCF_row_data[0]),
              ClientId: this.checkFalsyString(ClientBCF_row_data[1]),
              BCFId: this.checkFalsyNumber(ClientBCF_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(ClientBCF_row_data[3]),
              CreatedBy: this.checkFalsyString(ClientBCF_row_data[4]),
              OnlineDbOid: ClientBCF_row_data[5] ? ClientBCF_row_data[5] : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ClientMinimumAcceptableDiet_row_data.length > 1) {
            obj['ClientMinimumAcceptableDiets'] = {
              TransactionId: this.checkFalsyString(ClientMinimumAcceptableDiet_row_data[0]),
              ClientId: this.checkFalsyString(ClientMinimumAcceptableDiet_row_data[1]),
              MinimumAcceptableDietId: this.checkFalsyNumber(ClientMinimumAcceptableDiet_row_data[2]),
              Frequency: ClientMinimumAcceptableDiet_row_data[3]
                ? this.checkFalsyNumber(ClientMinimumAcceptableDiet_row_data[3])
                : null,
              IsDeleted: !!this.checkFalsyNumber(ClientMinimumAcceptableDiet_row_data[4]),
              CreatedBy: this.checkFalsyString(ClientMinimumAcceptableDiet_row_data[5]),
              OnlineDbOid: ClientMinimumAcceptableDiet_row_data[6]
                ? ClientMinimumAcceptableDiet_row_data[6]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (Counseling_row_data.length > 1) {
            obj['Counselings'] = {
              TransactionId: this.checkFalsyString(Counseling_row_data[0]),
              ClientId: this.checkFalsyString(Counseling_row_data[1]),
              CounselingType: this.checkFalsyNumber(Counseling_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(Counseling_row_data[3]),
              CreatedBy: this.checkFalsyString(Counseling_row_data[4]),
              OnlineDbOid: Counseling_row_data[5] ? Counseling_row_data[5] : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (HIVSelfTest_row_data.length > 1) {
            console.log('this hiv self test ', HIVSelfTest_row_data);
            obj['HIVSelfTests'] = {
              TransactionId: this.checkFalsyString(HIVSelfTest_row_data[0]),
              ClientId: this.checkFalsyString(HIVSelfTest_row_data[1]),
              IsAcceptedHIVTest: !!this.checkFalsyNumber(HIVSelfTest_row_data[2]),
              DistributionType: HIVSelfTest_row_data[3] ? this.checkFalsyNumber(HIVSelfTest_row_data[3]) : null,
              UserProfile: HIVSelfTest_row_data[4] ? this.checkFalsyNumber(HIVSelfTest_row_data[4]) : null,
              IsAssistedSelfTest: !!this.checkFalsyNumber(HIVSelfTest_row_data[5]),
              TestResult: HIVSelfTest_row_data[6] ? this.checkFalsyNumber(HIVSelfTest_row_data[6]) : null,
              IsDeleted: !!this.checkFalsyNumber(HIVSelfTest_row_data[7]),
              CreatedBy: this.checkFalsyString(HIVSelfTest_row_data[8]),
              OnlineDbOid: HIVSelfTest_row_data[9] ? HIVSelfTest_row_data[9] : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ARTClient_row_data.length > 1) {
            obj['ARTClients'] = {
              TransactionId: this.checkFalsyString(ARTClient_row_data[0]),
              ClientId: this.checkFalsyString(ARTClient_row_data[1]),
              MedicationSideEffect: ARTClient_row_data[2] ? this.checkFalsyNumber(ARTClient_row_data[2]) : null,
              IsOnTBPrevention: !!this.checkFalsyNumber(ARTClient_row_data[3]),
              WellbeingIssues: ARTClient_row_data[4] ? ARTClient_row_data[4] : null,
              IsDeleted: !!this.checkFalsyNumber(ARTClient_row_data[5]),
              CreatedBy: this.checkFalsyString(ARTClient_row_data[6]),
              OnlineDbOid: ARTClient_row_data[7] ? ARTClient_row_data[7] : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (TBKeyAffectedClient_row_data.length > 1) {
            obj['TbKeyAffectedClients'] = {
              TransactionId: this.checkFalsyString(TBKeyAffectedClient_row_data[0]),
              ClientId: this.checkFalsyString(TBKeyAffectedClient_row_data[1]),
              TBControlAssessmentId: this.checkFalsyNumber(TBKeyAffectedClient_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(TBKeyAffectedClient_row_data[3]),
              CreatedBy: this.checkFalsyString(TBKeyAffectedClient_row_data[4]),
              OnlineDbOid: TBKeyAffectedClient_row_data[5]
                ? TBKeyAffectedClient_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ClientTBSymptom_row_data.length > 1) {
            obj['ClientTBSymptoms'] = {
              TransactionId: this.checkFalsyString(ClientTBSymptom_row_data[0]),
              ClientId: this.checkFalsyString(ClientTBSymptom_row_data[1]),
              TBSymptomId: ClientTBSymptom_row_data[2] ? this.checkFalsyNumber(ClientTBSymptom_row_data[2]) : null,
              IsSputumCollected: !!this.checkFalsyNumber(ClientTBSymptom_row_data[3]),
              IsTBContact: !!this.checkFalsyNumber(ClientTBSymptom_row_data[4]),
              IsPresumptive: !!this.checkFalsyNumber(ClientTBSymptom_row_data[5]),
              IsDeleted: !!this.checkFalsyNumber(ClientTBSymptom_row_data[6]),
              CreatedBy: this.checkFalsyString(ClientTBSymptom_row_data[7]),
              OnlineDbOid: ClientTBSymptom_row_data[8]
                ? ClientTBSymptom_row_data[8]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ClientTBEnvironmentalAssessment_row_data.length > 1) {
            obj['ClientTBEnvironmentalAssessments'] = {
              TransactionId: this.checkFalsyString(ClientTBEnvironmentalAssessment_row_data[0]),
              ClientId: this.checkFalsyString(ClientTBEnvironmentalAssessment_row_data[1]),
              TBEnvironmentalAssessmentId: ClientTBEnvironmentalAssessment_row_data[2]
                ? this.checkFalsyNumber(ClientTBEnvironmentalAssessment_row_data[2])
                : null,
              OthersObserved: ClientTBEnvironmentalAssessment_row_data[3]
                ? ClientTBEnvironmentalAssessment_row_data[3]
                : null,
              IsDeleted: !!this.checkFalsyNumber(ClientTBEnvironmentalAssessment_row_data[4]),
              CreatedBy: this.checkFalsyString(ClientTBEnvironmentalAssessment_row_data[5]),
              OnlineDbOid: ClientTBEnvironmentalAssessment_row_data[6]
                ? ClientTBEnvironmentalAssessment_row_data[6]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (TBDiscussedTopic_row_data.length > 1) {
            obj['TBDiscussedTopics'] = {
              TransactionId: this.checkFalsyString(TBDiscussedTopic_row_data[0]),
              ClientId: this.checkFalsyString(TBDiscussedTopic_row_data[1]),
              TBTopicId: this.checkFalsyNumber(TBDiscussedTopic_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(TBDiscussedTopic_row_data[3]),
              CreatedBy: this.checkFalsyString(TBDiscussedTopic_row_data[4]),
              OnlineDbOid: TBDiscussedTopic_row_data[5]
                ? TBDiscussedTopic_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (HouseholdMalariaRisk_row_data.length > 1) {
            obj['HouseholdMalariaRisk'] = {
              TransactionId: this.checkFalsyString(HouseholdMalariaRisk_row_data[0]),
              ClientId: this.checkFalsyString(HouseholdMalariaRisk_row_data[1]),
              MalariaRiskId: this.checkFalsyNumber(HouseholdMalariaRisk_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(HouseholdMalariaRisk_row_data[3]),
              CreatedBy: this.checkFalsyString(HouseholdMalariaRisk_row_data[4]),
              OnlineDbOid: HouseholdMalariaRisk_row_data[5]
                ? HouseholdMalariaRisk_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ClientMalariaSymptom_row_data.length > 1) {
            obj['ClientMalariaSymptom'] = {
              TransactionId: this.checkFalsyString(ClientMalariaSymptom_row_data[0]),
              ClientId: this.checkFalsyString(ClientMalariaSymptom_row_data[1]),
              MalariaSymptomId: this.checkFalsyNumber(ClientMalariaSymptom_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(ClientMalariaSymptom_row_data[3]),
              CreatedBy: this.checkFalsyString(ClientMalariaSymptom_row_data[4]),
              OnlineDbOid: ClientMalariaSymptom_row_data[5]
                ? ClientMalariaSymptom_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (MalariaCaseFinding_row_data.length > 1) {
            obj['MalariaCaseFinding'] = {
              TransactionId: this.checkFalsyString(MalariaCaseFinding_row_data[0]),
              ClientId: this.checkFalsyString(MalariaCaseFinding_row_data[1]),
              IsResidenceInMalariaEndemicArea: !!this.checkFalsyNumber(MalariaCaseFinding_row_data[2]),
              IsMalariaExposed: !!this.checkFalsyNumber(MalariaCaseFinding_row_data[3]),
              ExposedWhere: MalariaCaseFinding_row_data[4]
                ? this.checkFalsyString(MalariaCaseFinding_row_data[4])
                : null,
              IsDeleted: !!this.checkFalsyNumber(MalariaCaseFinding_row_data[5]),
              CreatedBy: this.checkFalsyString(MalariaCaseFinding_row_data[6]),
              OnlineDbOid: MalariaCaseFinding_row_data[7]
                ? MalariaCaseFinding_row_data[7]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (MalariaPrevention_row_data.length > 1) {
            obj['MalariaPrevention'] = {
              TransactionId: this.checkFalsyString(MalariaPrevention_row_data[0]),
              ClientId: this.checkFalsyString(MalariaPrevention_row_data[1]),
              ISR: this.checkFalsyNumber(MalariaPrevention_row_data[2]),
              ISRProvider: this.checkFalsyNumber(MalariaPrevention_row_data[3]),
              HASITN: !!this.checkFalsyNumber(MalariaPrevention_row_data[4]),
              NumberOfITN: MalariaPrevention_row_data[5] ? this.checkFalsyNumber(MalariaPrevention_row_data[5]) : null,
              IsITNObserved: !!this.checkFalsyNumber(MalariaPrevention_row_data[6]),
              MaxAgeOfITN: MalariaPrevention_row_data[7] ? this.checkFalsyNumber(MalariaPrevention_row_data[7]) : null,
              HasNetBeenTreated: !!this.checkFalsyNumber(MalariaPrevention_row_data[8]),
              LastNetWasTreated: MalariaPrevention_row_data[9]
                ? this.checkFalsyString(MalariaPrevention_row_data[9])
                : null,
              MalariaCampaign: MalariaPrevention_row_data[10]
                ? this.checkFalsyNumber(MalariaPrevention_row_data[10])
                : null,
              MalariaCampaignMedium: MalariaPrevention_row_data[11]
                ? this.checkFalsyNumber(MalariaPrevention_row_data[11])
                : null,
              IsDeleted: !!this.checkFalsyNumber(MalariaPrevention_row_data[12]),
              CreatedBy: this.checkFalsyString(MalariaPrevention_row_data[13]),
              OnlineDbOid: MalariaPrevention_row_data[14]
                ? MalariaPrevention_row_data[14]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (HouseholdControlIntervention_row_data.length > 1) {
            obj['HouseholdControlIntervention'] = {
              TransactionId: this.checkFalsyString(HouseholdControlIntervention_row_data[0]),
              ClientId: this.checkFalsyString(HouseholdControlIntervention_row_data[1]),
              ControlInterventionId: this.checkFalsyNumber(HouseholdControlIntervention_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(HouseholdControlIntervention_row_data[3]),
              CreatedBy: this.checkFalsyString(HouseholdControlIntervention_row_data[4]),
              OnlineDbOid: HouseholdControlIntervention_row_data[5]
                ? HouseholdControlIntervention_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (GivenHBCService_row_data.length > 1) {
            obj['GivenHBCService'] = {
              TransactionId: this.checkFalsyString(GivenHBCService_row_data[0]),
              ClientId: this.checkFalsyString(GivenHBCService_row_data[1]),
              HBCServiceId: this.checkFalsyNumber(GivenHBCService_row_data[2]),
              IsDeleted: !!this.checkFalsyNumber(GivenHBCService_row_data[3]),
              CreatedBy: this.checkFalsyString(GivenHBCService_row_data[4]),
              OnlineDbOid: GivenHBCService_row_data[5]
                ? GivenHBCService_row_data[5]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (NCDScreening_row_data.length > 1) {
            obj['NCDScreening'] = {
              TransactionId: this.checkFalsyString(NCDScreening_row_data[0]),
              ClientId: this.checkFalsyString(NCDScreening_row_data[1]),
              WaterIntake: this.checkFalsyNumber(NCDScreening_row_data[2]),
              IsClientSmoking: !!this.checkFalsyNumber(NCDScreening_row_data[3]),
              BreathingDifficulty: this.checkFalsyNumber(NCDScreening_row_data[4]),
              Exercise: this.checkFalsyNumber(NCDScreening_row_data[5]),
              HeartRateRaisingActivity: this.checkFalsyNumber(NCDScreening_row_data[6]),
              VegetableConsumption: NCDScreening_row_data[7] ? this.checkFalsyNumber(NCDScreening_row_data[7]) : null,
              FruitConsumption: NCDScreening_row_data[8] ? this.checkFalsyNumber(NCDScreening_row_data[8]) : null,
              IsSweetenedFoodConsumed: !!this.checkFalsyNumber(NCDScreening_row_data[9]),
              IsRefinedWheatConsumed: !!this.checkFalsyNumber(NCDScreening_row_data[10]),
              SaltIntake: this.checkFalsyNumber(NCDScreening_row_data[11]),
              AlcoholConsumption: this.checkFalsyNumber(NCDScreening_row_data[12]),
              IsDeleted: !!this.checkFalsyNumber(NCDScreening_row_data[13]),
              CreatedBy: this.checkFalsyString(NCDScreening_row_data[14]),
              OnlineDbOid: NCDScreening_row_data[15]
                ? NCDScreening_row_data[15]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          // if (HBCServiceCategory_row_data.length > 1) {
          //   obj['HBCServiceCategory'] = {
          //     TransactionId: this.checkFalsyString(HBCServiceCategory_row_data[0]),
          //     ClientId: this.checkFalsyString(HBCServiceCategory_row_data[1]),
          //     ServiceCategoryId: this.checkFalsyNumber(HBCServiceCategory_row_data[2]),
          //     IsDeleted: !!this.checkFalsyNumber(HBCServiceCategory_row_data[3]),
          //     CreatedBy: this.checkFalsyString(HBCServiceCategory_row_data[4]),
          //     ModifiedBy: '00000000-0000-0000-0000-000000000000',
          //   };
          // }
          if (HBCClientAssessment_row_data.length > 1) {
            obj['HBCClientAssessment'] = {
              TransactionId: this.checkFalsyString(HBCClientAssessment_row_data[0]),
              ClientId: this.checkFalsyString(HBCClientAssessment_row_data[1]),
              Condition: this.checkFalsyNumber(HBCClientAssessment_row_data[2]),
              IsDischargedFromHBC: !!this.checkFalsyNumber(HBCClientAssessment_row_data[3]),
              ReasonForDischarge: HBCClientAssessment_row_data[4]
                ? this.checkFalsyNumber(HBCClientAssessment_row_data[4])
                : null,
              IsDeleted: !!this.checkFalsyNumber(HBCClientAssessment_row_data[5]),
              CreatedBy: this.checkFalsyString(HBCClientAssessment_row_data[6]),
              OnlineDbOid: HBCClientAssessment_row_data[7]
                ? HBCClientAssessment_row_data[7]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }
          if (ClientNCDHistory_row_data.length > 1) {
            obj['ClientNCDHistorie'] = {
              TransactionId: this.checkFalsyString(ClientNCDHistory_row_data[0]),
              ClientId: this.checkFalsyString(ClientNCDHistory_row_data[1]),
              NCDConditionId: this.checkFalsyNumber(ClientNCDHistory_row_data[2]),
              ScreeningOutcome: this.checkFalsyNumber(ClientNCDHistory_row_data[3]),
              IsTestConducted: !!this.checkFalsyNumber(ClientNCDHistory_row_data[4]),
              TestOutcome: ClientNCDHistory_row_data[5] ? this.checkFalsyNumber(ClientNCDHistory_row_data[5]) : null,
              IsDeleted: !!this.checkFalsyNumber(ClientNCDHistory_row_data[6]),
              CreatedBy: this.checkFalsyString(ClientNCDHistory_row_data[7]),
              OnlineDbOid: ClientNCDHistory_row_data[8]
                ? ClientNCDHistory_row_data[8]
                : '00000000-0000-0000-0000-000000000000',
              ModifiedBy: '00000000-0000-0000-0000-000000000000',
            };
          }

          return obj;
        });
      }

      // remove the syncQueueIdsForDeleteFromSyncQueue from syncData
      syncData = syncData.filter((syncDataItem) => {
        return !syncQueueIdsForDeleteFromSyncQueue.includes(syncDataItem.id);
      });

      console.log(syncData);
      return syncData;
    } catch (error) {
      console.error('Error retrieving all transactions from queue:', error);
      throw error;
    }
  }

  checkFalsyString(value: any) {
    if (!value) {
      return '';
    } else {
      return value;
    }
  }

  checkFalsyNumber(value: any) {
    if (!value) {
      return 0;
    } else {
      return Number(value);
    }
  }

  async getCurrentLoginUser(): Promise<UserAccount | null> {
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
        console.log('LoginStatus : ', loginStatus.user_id);
        const sql = `
        SELECT *
        FROM UserAccount
        WHERE Oid = ?;
      `;
        const params = [loginStatus.user_id];

        return this.db.query(sql, params).then((result) => {
          if (result && result.values && result.values.length > 0) {
            return result.values[0] as UserAccount;
          } else {
            return null;
          }
        });
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error fetching current login status:', error);
      return null;
    }
  }

  getEnumValue(enumObj: any, key: string): number | undefined {
    // console.log('In get enum Value', enumObj, key);
    // console.log(enumObj[key as keyof typeof enumObj]);
    return enumObj[key as keyof typeof enumObj];
  }

  async addTransactionInQueue(sync: SyncQueue) {
    if (!this.db) await this.initializeDatabase();

    let user: UserAccount | null = await this.getCurrentLoginUser();
    if (user != null) {
      sync.createdBy = user.OnlineDbOid == undefined ? '00000000-0000-0000-0000-000000000000' : user.OnlineDbOid;
      sync.modifiedBy = user.OnlineDbOid == undefined ? '00000000-0000-0000-0000-000000000000' : user.OnlineDbOid;
    }
    const { operation, tableName, transactionId, dateCreated, createdBy, dateModified, modifiedBy } = sync;
    const sql = `
      INSERT INTO sync_queue (
        operation, table_name, transactionid, dateCreated, createdBy, dateModified, modifiedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [operation, tableName, transactionId, dateCreated, createdBy, dateModified, modifiedBy];
    console.log(sql, params);
    try {
      // await this.db.beginTransaction();
      await this.db.run(sql, params);
      // await this.db.commitTransaction();
      console.log('Queued information added successfully');
    } catch (error) {
      // await this.db.rollbackTransaction();
      console.error('Error adding Queued information:', error);
    }
  }

  async deleteQueueById(id: number) {
    if (!this.db) await this.initializeDatabase();
    const sql = `DELETE FROM sync_queue WHERE id=?`;
    const params = [id];
    try {
      await this.db.run(sql, params);
    } catch (error) {
      console.error('Error deleting queue:', error);
    }
  }

  async deleteQueueByTransactionId(id: string) {
    if (!this.db) await this.initializeDatabase();
    const sql = `DELETE FROM sync_queue WHERE TransactionId=?`;
    const params = [id];
    try {
      await this.db.run(sql, params);
    } catch (error) {
      console.error('Error deleting queue:', error);
    }
  }

  async deleteQueue() {
    if (!this.db) await this.initializeDatabase();
    const sql = `DELETE FROM sync_queue`;
    try {
      await this.db.run(sql);
    } catch (error) {
      console.error('Error deleting queue:', error);
    }
  }

  // delete queue by table name
  async deleteQueueByTableName(tableName: string) {
    if (!this.db) await this.initializeDatabase();
    const sql = `DELETE FROM sync_queue WHERE table_name = ?`;
    const params = [tableName];
    try {
      await this.db.run(sql, params);
    } catch (error) {
      console.error('Error deleting queue:', error);
    }
  }

  async getSyncQueueDataByTransactionId(transactionId: string): Promise<capSQLiteResult | null> {
    if (!this.db) await this.initializeDatabase();
    const sql = `SELECT * FROM sync_queue WHERE transactionid = ?`;
    const params = [transactionId];
    try {
      const result = await this.db.query(sql, params);
      return result.values?.[0];
    } catch (error) {
      console.error('Error fetching queue:', error);
      return null;
    }
  }

  async deleteQueueByTableAndTransactionId(tableName: string, transactionId: string) {
    if (!this.db) await this.initializeDatabase();
    console.log('table Name ', tableName);
    console.log('transaction Id ', transactionId);
    const sql = `DELETE FROM sync_queue WHERE table_name = ? and TransactionId= ?`;
    const params = [tableName, transactionId];
    try {
      // console.log('In deleteQueueByTableAndTransactionId method of SyncStorageService');
      const response = await this.db.run(sql, params);
      // console.log('Delete Response ', response);
      // console.log('QueueBy Table And TransactionId deleted successfully');
      // const values = await this.getAllTransactionsFromQueue();
      // console.log(values);
    } catch (error) {
      console.error('Error deleting QueueBy Table And TransactionId:', error);
    }
  }
}
