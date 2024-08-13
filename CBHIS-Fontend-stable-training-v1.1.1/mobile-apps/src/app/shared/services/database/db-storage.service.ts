import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { OnlineActions } from '../../enums/action.enum';
import * as Appointment from '../../models/appointment';
import { DeviceInfo } from '../../models/device-info';
import * as ILookup from '../../models/online-format';
import {
  Anc,
  ArtClients,
  ChildGrowthMonitorings,
  ChildImmunizations,
  ClientMinimumAcceptableDiets,
  ClientNcdhistorie,
  ClientTbenvironmentalAssessments,
  ClientTbsymptoms,
  Counselings,
  FamilyPlans,
  HbcClientAssessment,
  HivSelfTests,
  HouseholdControlIntervention,
  ImmunizationAdverseEvents,
  MalariaCaseFinding,
  MalariaPrevention,
  PostNatals,
} from '../../models/upload-state';
import { UserUpgradeStatements } from '../../upgrades/user.upgrade.statements';
import { SqlGeneratorService } from '../sql-generator.service';
import { ToastService } from '../toast.service';
import { DeviceService } from './../device.service';
import { DbnameVersionService } from './dbname-version.service';
import { SQLiteService } from './sqlite.service';

@Injectable()
export class DbStorageService {
  private databaseName: string = '';
  private uUpdStmts: UserUpgradeStatements = new UserUpgradeStatements();
  private versionUpgrades;
  private loadToVersion;
  public db!: SQLiteDBConnection;

  constructor(
    private sqliteService: SQLiteService,
    private dbVerService: DbnameVersionService,
    private deviceService: DeviceService,
    private toaster: ToastService,
    private sqlGeneratorService: SqlGeneratorService
  ) {
    this.versionUpgrades = this.uUpdStmts.userUpgrades;
    this.loadToVersion = this.versionUpgrades[this.versionUpgrades.length - 1].toVersion;
  }

  async initializeDatabase(dbName: string) {
    this.databaseName = dbName;

    // create upgrade statements
    await this.sqliteService.addUpgradeStatement({
      database: this.databaseName,
      upgrade: this.versionUpgrades,
    });

    // create and/or open the database
    this.db = await this.sqliteService.openDatabase(
      this.databaseName,
      false,
      'no-encryption',
      this.loadToVersion,
      false
    );
    this.dbVerService.set(this.databaseName, this.loadToVersion);

    // await this.dropTables();

    // create tables
    await this.createTables();

    // add device info
    await this.addDeviceInfo(await this.deviceService.getDeviceInfo());

    // think twice before delete database
    // await this.deleteDatabase();
  }

  async deleteDatabase() {
    await this.sqliteService.deleteDatabase();
  }

  private async createTables() {
    if (!this.db) {
      this.toaster.openToast({
        message: 'No database connection available',
        duration: 1000,
        position: 'bottom',
        translucent: false,
        animated: true,
        color: 'danger',
      });
      console.error('No database connection available');
      return;
    }

    // drop user accounts table
    // const dropUserAccountsTable = `DROP TABLE IF EXISTS UserAccount;`;
    // await this.db.execute(dropUserAccountsTable);

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS recoveryrequests (
      id INTEGER PRIMARY KEY,
      username TEXT,
      countrycode TEXT,
      cellphone TEXT,
      daterequested TEXT NOT NULL,
      isrequestopen INTEGER NOT NULL,
      createdby TEXT,
      datecreated TEXT,
      modifiedby TEXT,
      datemodified TEXT,
      isdeleted INTEGER,
      issynced INTEGER,
      onlinedboid TEXT
    );

    CREATE TABLE IF NOT EXISTS UserAccount (
      Oid TEXT PRIMARY KEY NOT NULL,
      FirstName TEXT NOT NULL,
      MiddleName TEXT,
      LastName TEXT NOT NULL,
      Pin TEXT NOT NULL,
      Cellphone TEXT NOT NULL,
      Email TEXT,
      Username TEXT NOT NULL,
      Password TEXT,
      ConfirmPassword TEXT,
      UserType INTEGER NOT NULL,
      Image TEXT,
      IMEINumber TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      AssignedVillages TEXT,
      AssignedChiefdomList TEXT,
      AssignedVillageList TEXT,
      AssignedDeviceList TEXT,
      ProfilePicture TEXT,
      IsSynced INTEGER,
      OnlineDbOid TEXT
    );

    CREATE TABLE IF NOT EXISTS LogoutActivity (
      id INTEGER PRIMARY KEY,
      user_id TEXT,
      logout_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES UserAccount(Oid)
    );

    CREATE TABLE IF NOT EXISTS LoginActivity (
      id INTEGER PRIMARY KEY,
      user_id TEXT,
      token TEXT NOT NULL,
      device_info TEXT,
      ip_address TEXT,
      login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES UserAccount(Oid)
    );

    CREATE TABLE IF NOT EXISTS CurrentLogin (
      id INTEGER PRIMARY KEY,
      user_id TEXT,
      token TEXT NOT NULL,
      login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES UserAccount(Oid)
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY,
      operation TEXT,
      table_name TEXT,
      TransactionId TEXT NOT NULL,
      dateCreated TEXT,
      createdBy TEXT,
      dateModified TEXT,
      modifiedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS Region (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsDeleted INTEGER NOT NULL DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT
    );

    CREATE TABLE IF NOT EXISTS Tinkhundla (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      RegionId INTEGER NOT NULL DEFAULT 0,
      IsDeleted INTEGER NOT NULL DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      FOREIGN KEY (RegionId) REFERENCES Region(Oid) ON DELETE SET DEFAULT
    );

    CREATE TABLE IF NOT EXISTS Chiefdom (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      TinkhundlaId INTEGER NOT NULL DEFAULT 0,
      IsDeleted INTEGER NOT NULL DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      FOREIGN KEY (TinkhundlaId) REFERENCES Tinkhundla(Oid) ON DELETE SET DEFAULT
    );

    CREATE TABLE IF NOT EXISTS Village (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      ChiefdomId INTEGER NOT NULL DEFAULT 0,
      IsDeleted INTEGER NOT NULL DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      FOREIGN KEY (ChiefdomId) REFERENCES Chiefdom(Oid) ON DELETE SET DEFAULT
    );

    CREATE TABLE IF NOT EXISTS Client (
      Oid TEXT PRIMARY KEY,
      FirstName TEXT NOT NULL,
      MiddleName TEXT,
      LastName TEXT NOT NULL,
      Age INTEGER,
      DOB TEXT NOT NULL,
      Sex INTEGER NOT NULL,
      MaritalStatus INTEGER NOT NULL,
      PIN TEXT NOT NULL,
      Cellphone TEXT,
      EducationLevel INTEGER NOT NULL,
      Occupation TEXT,
      HasBirthCertificate INTEGER,
      IsDisabled INTEGER DEFAULT 0,
      IsDeceased INTEGER DEFAULT 0,
      DateDeceased TEXT,
      IsFamilyHead INTEGER NOT NULL DEFAULT 0,
      RelationalType INTEGER,
      FamilyHeadId TEXT,
      VillageId INTEGER NOT NULL,
      IsPregnant INTEGER DEFAULT 0,
      IsDeleted INTEGER NOT NULL DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (FamilyHeadId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (VillageId) REFERENCES Village(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS DrinkingWaterSource (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER
    );

    CREATE TABLE IF NOT EXISTS HouseholdDrinkingWater (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      FamilyHeadId TEXT NOT NULL,
      DrinkingWaterSourceId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (FamilyHeadId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (DrinkingWaterSourceId) REFERENCES DrinkingWaterSource(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS SafeWaterSource (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS HouseholdSafeWaterSource (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      FamilyHeadId TEXT NOT NULL,
      SafeWaterSourceId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT NOT NULL,
      ModifiedBy TEXT,
      FOREIGN KEY (FamilyHeadId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (SafeWaterSourceId) REFERENCES SafeWaterSource(Oid)
    );

    CREATE TABLE IF NOT EXISTS WASH (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS HouseholdWASH (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      FamilyHeadId TEXT NOT NULL,
      WASHId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT NOT NULL,
      ModifiedBy TEXT,
      FOREIGN KEY (FamilyHeadId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (WASHId) REFERENCES WASH(Oid)
    );

    CREATE TABLE IF NOT EXISTS HealthEducationTopic (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      JobAid TEXT,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS DiscussedTopic (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      TopicId INTEGER NOT NULL,
      ClientId TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      DateCreated TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (TopicId) REFERENCES HealthEducationTopic(Oid)
    );

    CREATE TABLE IF NOT EXISTS ANCTopic (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      JobAid TEXT,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS DiscussedANCTopic (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ANCTopicId INTEGER NOT NULL,
      ClientId TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT NOT NULL,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (ANCTopicId) REFERENCES ANCTopic(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ANC (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      IsCounselled INTEGER NOT NULL,
      IsANCInitiated INTEGER NOT NULL,
      IsMalariaDrugTaken INTEGER,
      FrequencyOfMalariaTherapy INTEGER,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT NOT NULL,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS AssignedAppointment (
      TransactionId TEXT PRIMARY KEY,
      UserId TEXT NOT NULL,
      AppointmentType TEXT NOT NULL,
      AppointmentDate TEXT NOT NULL,
      Details TEXT,
      ClientId TEXT NOT NULL,
      Status INTEGER NOT NULL,
      Priority INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS FamilyPlan (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      IsPlanningToBePregnant INTEGER NOT NULL,
      ClientId TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT NOT NULL,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS FamilyPlanningMethod (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS UsedFamilyPlanMethod (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      FPMethodId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT NOT NULL,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (FPMethodId) REFERENCES FamilyPlanningMethod(Oid)
    );

    CREATE TABLE IF NOT EXISTS ChildGrowthMonitoring (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      MAUCStatus INTEGER NOT NULL,
      Weight REAL,
      Height REAL,
      WastingNutritionalOedem INTEGER NOT NULL,
      IsVitaminAGiven INTEGER NOT NULL,
      IsDewormingPillGiven INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      ClientId TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS ChildImmunization (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ImmunizationStatus INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      ClientId TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS AdverseEvent (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ImmunizationAdverseEvent (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ImmunizationId TEXT NOT NULL,
      AdverseEventId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (AdverseEventId) REFERENCES AdverseEvent(Oid),
      FOREIGN KEY (ImmunizationId) REFERENCES ChildImmunization(TransactionId)
    );

    CREATE TABLE IF NOT EXISTS PostNatal (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      PlaceOfDelivery INTEGER,
      PostPartumLossOfBlood INTEGER,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS HivPreventativeService (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER
    );

    CREATE TABLE IF NOT EXISTS PostNatalPreventativeService (
      TransactionId TEXT PRIMARY KEY,
      PostNatalId TEXT NOT NULL,
      PreventativeServiceId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (PostNatalId) REFERENCES PostNatal(TransactionId),
      FOREIGN KEY (PreventativeServiceId) REFERENCES HivPreventativeService(Oid)
    );

    CREATE TABLE IF NOT EXISTS DangerSign (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER
    );

    CREATE TABLE IF NOT EXISTS PostNatalDangerSign (
      TransactionId TEXT PRIMARY KEY,
      PostNatalId TEXT NOT NULL,
      DangerSignId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (PostNatalId) REFERENCES PostNatal(TransactionId) ON DELETE CASCADE,
      FOREIGN KEY (DangerSignId) REFERENCES DangerSign(Oid)
    );

    CREATE TABLE IF NOT EXISTS PostPartumDepression (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER
    );

    CREATE TABLE IF NOT EXISTS PostNatalDepression (
      TransactionId TEXT PRIMARY KEY,
      PostNatalId TEXT NOT NULL,
      PostPartumDepressionId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (PostNatalId) REFERENCES PostNatal(TransactionId) ON DELETE CASCADE,
      FOREIGN KEY (PostPartumDepressionId) REFERENCES PostPartumDepression(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS FeedingMethod (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER
    );

    CREATE TABLE IF NOT EXISTS PostNatalFeedingMethod (
      TransactionId TEXT PRIMARY KEY,
      PostNatalId TEXT NOT NULL,
      FeedingMethodId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (PostNatalId) REFERENCES PostNatal(TransactionId) ON DELETE CASCADE,
      FOREIGN KEY (FeedingMethodId) REFERENCES FeedingMethod(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS DietaryDiversity (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid INTEGER
    );

    CREATE TABLE IF NOT EXISTS HouseholdDietaryDiversity (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      DietaryDiversityId INTEGER NOT NULL,
      ClientId TEXT NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (DietaryDiversityId) REFERENCES DietaryDiversity(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS BreastFeedingAndComplementaryFeeding (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ClientBCF (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      BCFId INTEGER NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS MinimumAcceptableDiet (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ClientMinimumAcceptableDiet (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      MinimumAcceptableDietId INTEGER NOT NULL,
      Frequency INTEGER,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (MinimumAcceptableDietId) REFERENCES MinimumAcceptableDiet(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Counseling (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      CounselingType INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS HIVSelfTest (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      IsAcceptedHIVTest INTEGER,
      DistributionType INTEGER,
      UserProfile INTEGER,
      IsAssistedSelfTest INTEGER,
      TestResult INTEGER,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS ARTClient (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      MedicationSideEffect INTEGER,
      IsOnTBPrevention INTEGER,
      WellbeingIssues TEXT,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS TBControlAssessment (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS TBKeyAffectedClient (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      TBControlAssessmentId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (TBControlAssessmentId) REFERENCES TBControlAssessment(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TBSymptom (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ClientTBSymptom (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      TBSymptomId INTEGER,
      IsSputumCollected INTEGER,
      IsTBContact INTEGER,
      IsPresumptive INTEGER,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (TBSymptomId) REFERENCES TBSymptom(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TBEnvironmentalAssessment (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ClientTBEnvironmentalAssessment (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      TBEnvironmentalAssessmentId INTEGER,
      OthersObserved TEXT,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (TBEnvironmentalAssessmentId) REFERENCES  TBEnvironmentalAssessment(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TBEducationTopic (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      JobAid TEXT,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS TBDiscussedTopic (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      TBTopicId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (TBTopicId) REFERENCES TBEducationTopic(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MalariaRisk (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS HouseholdMalariaRisk (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      MalariaRiskId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (MalariaRiskId) REFERENCES MalariaRisk(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MalariaSymptom (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ClientMalariaSymptom (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      MalariaSymptomId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (MalariaSymptomId) REFERENCES MalariaSymptom(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MalariaCaseFinding (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      IsResidenceInMalariaEndemicArea INTEGER,
      IsMalariaExposed INTEGER,
      ExposedWhere TEXT,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      IsDeleted INTEGER DEFAULT 0,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MalariaPrevention (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      ISR INTEGER NOT NULL,
      ISRProvider INTEGER NOT NULL,
      HASITN INTEGER,
      NumberOfITN INTEGER,
      IsITNObserved INTEGER,
      MaxAgeOfITN INTEGER,
      HasNetBeenTreated INTEGER,
      LastNetWasTreated INTEGER,
      MalariaCampaign INTEGER,
      MalariaCampaignMedium INTEGER,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      IsDeleted INTEGER DEFAULT 0,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MalariaControlIntervention (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS HouseholdControlIntervention (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      ControlInterventionId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      CreatedAt TEXT,
      MatchId TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (ControlInterventionId) REFERENCES MalariaControlIntervention(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS HBCService (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS GivenHBCService (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      HBCServiceId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (HBCServiceId) REFERENCES HBCService(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ServiceCategory (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS HBCServiceCategory (
      Oid INTEGER PRIMARY KEY,
      ClientId TEXT NOT NULL,
      ServiceCategoryId INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced TEXT,
      OnlineDbOid INTEGER,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (ServiceCategoryId) REFERENCES ServiceCategory(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS HBCClientAssessment (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      Condition INTEGER NOT NULL,
      IsDischargedFromHBC INTEGER,
      ReasonForDischarge INTEGER,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS NCDCondition (
      Oid INTEGER PRIMARY KEY,
      Description TEXT NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid INTEGER,
      IsDeleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ClientNCDHistory (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      NCDConditionId INTEGER NOT NULL,
      ScreeningOutcome INTEGER NOT NULL,
      IsTestConducted INTEGER,
      TestOutcome INTEGER,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid) ON DELETE CASCADE,
      FOREIGN KEY (NCDConditionId) REFERENCES NCDCondition(Oid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS NCDScreening (
      TransactionId TEXT PRIMARY KEY NOT NULL,
      ClientId TEXT NOT NULL,
      WaterIntake INTEGER NOT NULL,
      IsClientSmoking INTEGER NOT NULL,
      BreathingDifficulty INTEGER NOT NULL,
      Exercise INTEGER NOT NULL,
      HeartRateRaisingActivity INTEGER NOT NULL,
      VegetableConsumption INTEGER,
      FruitConsumption INTEGER,
      IsSweetenedFoodConsumed INTEGER,
      IsRefinedWheatConsumed INTEGER,
      SaltIntake INTEGER NOT NULL,
      AlcoholConsumption INTEGER NOT NULL,
      IsDeleted INTEGER NOT NULL,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      CreatedBy TEXT,
      ModifiedBy TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );

    CREATE TABLE IF NOT EXISTS device_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT,
      model TEXT,
      platform TEXT,
      osVersion TEXT,
      manufacturer TEXT,
      isVirtual TEXT,
      batteryLevel TEXT,
      isCharging TEXT,
      languageCode TEXT,
      languageTag TEXT,
      isSynced TEXT
    );
  `;

    const queryArry = createTableQuery.split(';');
    for (const query of queryArry) {
      if (query.trim() !== '') {
        try {
          await this.db.execute(query);
        } catch (e) {
          console.error('Error creating tables', e);
        }
      }
    }

    console.log('Tables created successfully');
  }

  // todo: should be removed
  async insertHouseholdControlInterventionData() {
    // Define the INSERT queries for HouseholdControlIntervention table
    const householdControlInterventionEntries = [
      `INSERT INTO HouseholdControlIntervention (TransactionId, ClientId, ControlInterventionId, IsDeleted) VALUES ('1', 'client1', 1, 0);`,
      `INSERT INTO HouseholdControlIntervention (TransactionId, ClientId, ControlInterventionId, IsDeleted) VALUES ('2', 'client2', 2, 0);`,
      // Add more entries as needed
    ];

    try {
      // Check if table is empty
      const checkHouseholdControlInterventionSql = `SELECT COUNT(*) AS count FROM HouseholdControlIntervention;`;
      const checkHouseholdControlInterventionResult = await this.db.query(checkHouseholdControlInterventionSql);
      const count = checkHouseholdControlInterventionResult.values?.[0].count;

      if (count > 0) {
        console.log('HouseholdControlIntervention entries already exist');
        return;
      }

      // Insert HouseholdControlIntervention entries
      for (const insertQuery of householdControlInterventionEntries) {
        await this.db.execute(insertQuery);
      }

      console.log('HouseholdControlIntervention entries inserted');
    } catch (error) {
      console.error('insertHouseholdControlInterventionData', error);
    }
  }

  async addDeviceInfo(deviceInfo: DeviceInfo) {
    const {
      uuid,
      model,
      platform,
      osVersion,
      manufacturer,
      isVirtual,
      batteryLevel,
      isCharging,
      languageCode,
      languageTag,
      isSynced,
    } = deviceInfo;
    const isVirtualStr = isVirtual ? 'Yes' : 'No';
    const isChargingStr = isCharging ? 'Yes' : 'No';
    const existingDeviceInfo = await this.db.query(`SELECT * FROM device_info WHERE uuid = ?`, [uuid]);
    console.log(existingDeviceInfo.values);
    if (existingDeviceInfo.values && existingDeviceInfo.values.length > 0) {
      console.log('already device info added');
    } else {
      await this.db.run(
        `INSERT INTO device_info (uuid, model, platform, osVersion, manufacturer, isVirtual, batteryLevel, isCharging, languageCode, languageTag, isSynced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          model,
          platform,
          osVersion,
          manufacturer,
          isVirtualStr,
          batteryLevel?.toString(),
          isChargingStr,
          languageCode,
          languageTag,
          String(isSynced),
        ]
      );
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo | undefined> {
    const res = await this.db.query('SELECT * FROM device_info');
    if (res && res.values && res.values.length > 0) {
      return res.values[0] as DeviceInfo;
    } else {
      return undefined;
    }
  }

  async getDeviceInfoByUuid(uuid: string): Promise<DeviceInfo | undefined> {
    console.log(uuid, 'uuid');
    const res = await this.db.query('SELECT * FROM device_info WHERE uuid = ?', [uuid]);
    if (res && res.values && res.values.length > 0) {
      return res.values[0] as DeviceInfo;
    } else {
      return undefined;
    }
  }

  async updateDeviceInfo(uuid: string): Promise<undefined> {
    await this.db.run(`UPDATE device_info SET isSynced = 'true' WHERE uuid = ?`, [uuid]);
  }

  /**
   * @description lockup table insert data query
   * single insert query for each table data and each item
   */

  /*----------  CLEAR LOOKUP TABLE ----------*/
  async clearLookupTables() {
    const tables = [
      'Village',
      'Chiefdom',
      'Tinkhundla',
      'Region',
      // 'ANCTopic',
      // 'DrinkingWaterSource',
      // 'SafeWaterSource',
      // 'WASH',
      // 'HealthEducationTopic',
      // 'FamilyPlanningMethod',
      // 'MalariaControlIntervention',
      // 'MinimumAcceptableDiet',
      // 'MalariaSymptom',
      // 'MalariaRisk',
      // 'HBCService',
      // 'TBEducationTopic',
      // 'HivPreventativeService',
      // 'NCDCondition',
      // 'DangerSign',
      // 'PostPartumDepression',
      // 'FeedingMethod',
      // 'DietaryDiversity',
      // 'AdverseEvent',
      // 'TBSymptom',
      // 'TBControlAssessment',
      // 'TBEnvironmentalAssessment',
      // 'BreastFeedingAndComplementaryFeeding',
    ];

    const deleteQueries = tables.map((table) => `DELETE FROM ${table};`);

    try {
      for (const query of deleteQueries) {
        await this.db.execute(query);
      }
    } catch (error) {
      console.error('clearLookupTables', error);
    }
  }

  /*----------  INSERT REGION  ----------*/
  async clearAndInsertInRegionTable(regions: ILookup.Region[]) {
    const sql = this.sqlGeneratorService.regionInsertionQuery(regions);

    if (!sql) {
      console.error('clearAndInsertInRegionTable: Invalid SQL');
      return;
    }

    try {
      await this.db.execute(sql);
    } catch (error) {
      console.error('clearAndInsertInRegionTable', error);
    }
  }

  /*----------  INSERT TINKHUNDLA  ----------*/
  async clearAndInsertInTinkhundlaTable(tinkhundlas: ILookup.Tinkhundla[]) {
    const sql = this.sqlGeneratorService.tinkhundlaInsertionQuery(tinkhundlas);

    if (!sql) {
      console.error('clearAndInsertInTinkhundlaTable: Invalid SQL');
      return;
    }

    try {
      await this.db.execute(sql);
    } catch (error) {
      console.error('clearAndInsertInTinkhundlaTable', error);
    }
  }

  /*----------  INSERT CHIEFDOM  ----------*/
  async clearAndInsertInChiefdomTable(chiefdoms: ILookup.Chiefdom[]) {
    // prepare insert query
    const sql = this.sqlGeneratorService.chiefdomInsertionQuery(chiefdoms);

    if (!sql) {
      console.error('clearAndInsertInChiefdomTable: Invalid SQL');
      return;
    }

    try {
      await this.db.execute(sql);
    } catch (error) {
      console.error('clearAndInsertInChiefdomTable', error);
    }
  }

  /*----------  INSERT VILLAGE  ----------*/
  async clearAndInsertInVillageTable(villages: ILookup.Village[]) {
    const sql = this.sqlGeneratorService.villageInsertionQuery(villages);

    try {
      await this.db.execute(sql);
    } catch (error) {
      console.error('clearAndInsertInVillageTable', error);
    }
  }

  /*----------  INSERT ANC TOPIC  ----------*/
  async syncANCTopicData(topics: ILookup.AncTopic[]) {
    // separate topics array based on action
    const createArr: ILookup.AncTopicValue[] = [];
    const updateArr: ILookup.AncTopicValue[] = [];
    const deleteArr: ILookup.AncTopicValue[] = [];

    console.log(createArr, 'createArr from anc topic');

    // separate topics based on action
    for (const topic of topics) {
      if (topic.key == OnlineActions.CREATE) {
        createArr.push(topic.value);
      } else if (topic.key == OnlineActions.UPDATE) {
        updateArr.push(topic.value);
      } else if (topic.key == OnlineActions.DELETE) {
        deleteArr.push(topic.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.ancTopicInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.ancTopicUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.ancTopicDeleteQuery(deleteArr);

    // check if sql is valid

    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertANCTopic: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync ANC Topic error ', error);
        }
      }
    }
  }

  /*----------  INSERT DRINKING WATER SOURCE  ----------*/
  async syncDrinkWaterSourceData(sources: ILookup.DrinkWaterSource[]) {
    // separate sources array based on action
    const createArr: ILookup.DrinkWaterSourceValue[] = [];
    const updateArr: ILookup.DrinkWaterSourceValue[] = [];
    const deleteArr: ILookup.DrinkWaterSourceValue[] = [];

    // separate sources based on action
    for (const source of sources) {
      if (source.key == OnlineActions.CREATE) {
        createArr.push(source.value);
      } else if (source.key == OnlineActions.UPDATE) {
        updateArr.push(source.value);
      } else if (source.key == OnlineActions.DELETE) {
        deleteArr.push(source.value);
      }
    }

    // prepare query
    const createSQL = this.sqlGeneratorService.drinkingWaterSourceInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.drinkingWaterSourceUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.drinkingWaterSourceDeleteQuery(deleteArr);

    // check if sql is valid
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertDrinkWaterSource: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Drinking Water Source error ', error);
        }
      }
    }
  }

  /*----------  INSERT SAFE WATER SOURCE  ----------*/
  async syncSafeWaterSourceData(sources: ILookup.SafeWaterSource[]) {
    // separate sources array based on action
    const createArr: ILookup.SafeWaterSourceValue[] = [];
    const updateArr: ILookup.SafeWaterSourceValue[] = [];
    const deleteArr: ILookup.SafeWaterSourceValue[] = [];

    // separate sources based on action
    for (const source of sources) {
      if (source.key == OnlineActions.CREATE) {
        createArr.push(source.value);
      } else if (source.key == OnlineActions.UPDATE) {
        updateArr.push(source.value);
      } else if (source.key == OnlineActions.DELETE) {
        deleteArr.push(source.value);
      }
    }

    // prepare query
    const createSQL = this.sqlGeneratorService.safeWaterSourceInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.safeWaterSourceUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.safeWaterSourceDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertSafeWaterSource: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Safe Water Source error ', error);
        }
      }
    }
  }

  /*----------  INSERT WASH  ----------*/
  async syncWASHData(washes: ILookup.Wash[]) {
    // separate washes array based on action
    const createArr: ILookup.WashValue[] = [];
    const updateArr: ILookup.WashValue[] = [];
    const deleteArr: ILookup.WashValue[] = [];

    // separate washes based on action
    for (const wash of washes) {
      if (wash.key == OnlineActions.CREATE) {
        createArr.push(wash.value);
      } else if (wash.key == OnlineActions.UPDATE) {
        updateArr.push(wash.value);
      } else if (wash.key == OnlineActions.DELETE) {
        deleteArr.push(wash.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.washInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.washUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.washDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertWASH: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync WASH error ', error);
        }
      }
    }
  }

  /*----------  INSERT HEALTH EDUCATION TOPIC  ----------*/
  async syncHealthEducationTopicData(topics: ILookup.HealthEducationTopic[]) {
    // separate topics array based on action
    const createArr: ILookup.HealthEducationTopicValue[] = [];
    const updateArr: ILookup.HealthEducationTopicValue[] = [];
    const deleteArr: ILookup.HealthEducationTopicValue[] = [];

    // separate topics based on action
    for (const topic of topics) {
      if (topic.key == OnlineActions.CREATE) {
        createArr.push(topic.value);
      } else if (topic.key == OnlineActions.UPDATE) {
        updateArr.push(topic.value);
      } else if (topic.key == OnlineActions.DELETE) {
        deleteArr.push(topic.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.healthEducationTopicInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.healthEducationTopicUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.healthEducationTopicDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertHealthEducationTopic: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Health Education Topic error ', error);
        }
      }
    }
  }

  /*----------  INSERT FP METHOD  ----------*/
  async syncFPMethodData(methods: ILookup.FpMethod[]) {
    // separate methods array based on action
    const createArr: ILookup.FpMethodValue[] = [];
    const updateArr: ILookup.FpMethodValue[] = [];
    const deleteArr: ILookup.FpMethodValue[] = [];

    // separate methods based on action
    for (const method of methods) {
      if (method.key == OnlineActions.CREATE) {
        createArr.push(method.value);
      } else if (method.key == OnlineActions.UPDATE) {
        updateArr.push(method.value);
      } else if (method.key == OnlineActions.DELETE) {
        deleteArr.push(method.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.fpMethodInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.fpMethodUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.fpMethodDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertFPMethod: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync FP Method error ', error);
        }
      }
    }
  }

  /*----------  INSERT MALARIA CONTROL INTERVENTIONS  ----------*/
  async syncMalariaControlIntervention(interventions: ILookup.MalariaControlIntervention[]) {
    // separate interventions array based on action
    const createArr: ILookup.MalariaControlInterventionValue[] = [];
    const updateArr: ILookup.MalariaControlInterventionValue[] = [];
    const deleteArr: ILookup.MalariaControlInterventionValue[] = [];

    // separate interventions based on action
    for (const intervention of interventions) {
      if (intervention.key == OnlineActions.CREATE) {
        createArr.push(intervention.value);
      } else if (intervention.key == OnlineActions.UPDATE) {
        updateArr.push(intervention.value);
      } else if (intervention.key == OnlineActions.DELETE) {
        deleteArr.push(intervention.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.malariaControlInterventionInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.malariaControlInterventionUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.malariaControlInterventionDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertMalariaControlIntervention: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Malaria Control Intervention error ', error);
        }
      }
    }
  }

  /*----------  INSERT MINIMUM ACCEPTABLE DIET  ----------*/
  async syncMinimumAcceptableDiet(diets: ILookup.MinimumAcceptableDiet[]) {
    // separate diets array based on action
    const createArr: ILookup.MinimumAcceptableDietValue[] = [];
    const updateArr: ILookup.MinimumAcceptableDietValue[] = [];
    const deleteArr: ILookup.MinimumAcceptableDietValue[] = [];

    // separate diets based on action
    for (const diet of diets) {
      if (diet.key == OnlineActions.CREATE) {
        createArr.push(diet.value);
      } else if (diet.key == OnlineActions.UPDATE) {
        updateArr.push(diet.value);
      } else if (diet.key == OnlineActions.DELETE) {
        deleteArr.push(diet.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.minimumAcceptableDietInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.minimumAcceptableDietUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.minimumAcceptableDietDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertMinimumAcceptableDiet: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Minimum Acceptable Diet error ', error);
        }
      }
    }
  }

  /*----------  INSERT MALARIA SYMPTOMS  ----------*/
  async syncMalariaSymptoms(symptoms: ILookup.MalariaSymptom[]) {
    // separate symptoms array based on action
    const createArr: ILookup.MalariaSymptomValue[] = [];
    const updateArr: ILookup.MalariaSymptomValue[] = [];
    const deleteArr: ILookup.MalariaSymptomValue[] = [];

    // separate symptoms based on action
    for (const symptom of symptoms) {
      if (symptom.key == OnlineActions.CREATE) {
        createArr.push(symptom.value);
      } else if (symptom.key == OnlineActions.UPDATE) {
        updateArr.push(symptom.value);
      } else if (symptom.key == OnlineActions.DELETE) {
        deleteArr.push(symptom.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.malariaSymptomInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.malariaSymptomUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.malariaSymptomDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertMalariaSymptoms: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Malaria Symptoms error ', error);
        }
      }
    }
  }

  /*----------  INSERT MALARIA RISK  ----------*/
  async syncMalariaRiskData(risks: ILookup.MalariaRisk[]) {
    // separate risks array based on action
    const createArr: ILookup.MalariaRiskValue[] = [];
    const updateArr: ILookup.MalariaRiskValue[] = [];
    const deleteArr: ILookup.MalariaRiskValue[] = [];

    // separate risks based on action
    for (const risk of risks) {
      if (risk.key == OnlineActions.CREATE) {
        createArr.push(risk.value);
      } else if (risk.key == OnlineActions.UPDATE) {
        updateArr.push(risk.value);
      } else if (risk.key == OnlineActions.DELETE) {
        deleteArr.push(risk.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.malariaRiskInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.malariaRiskUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.malariaRiskDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertMalariaRisk: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Malaria Risk error ', error);
        }
      }
    }
  }

  /*----------  INSERT HBC SERVICE  ----------*/
  async syncHBCService(services: ILookup.HbcService[]) {
    // separate services array based on action
    const createArr: ILookup.HbcServiceValue[] = [];
    const updateArr: ILookup.HbcServiceValue[] = [];
    const deleteArr: ILookup.HbcServiceValue[] = [];

    // separate services based on action
    for (const service of services) {
      if (service.key == OnlineActions.CREATE) {
        createArr.push(service.value);
      } else if (service.key == OnlineActions.UPDATE) {
        updateArr.push(service.value);
      } else if (service.key == OnlineActions.DELETE) {
        deleteArr.push(service.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.hbcServiceInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.hbcServiceUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.hbcServiceDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertHBCService: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync HBC Service error ', error);
        }
      }
    }
  }

  /*----------  INSERT HBC SERVICE Category ----------*/
  async syncServiceCategory(services: ILookup.ServiceCategory[]) {
    // separate services array based on action
    const createArr: ILookup.ServiceCategoryValue[] = [];
    const updateArr: ILookup.ServiceCategoryValue[] = [];
    const deleteArr: ILookup.ServiceCategoryValue[] = [];

    // separate services based on action
    for (const service of services) {
      if (service.key == OnlineActions.CREATE) {
        createArr.push(service.value);
      } else if (service.key == OnlineActions.UPDATE) {
        updateArr.push(service.value);
      } else if (service.key == OnlineActions.DELETE) {
        deleteArr.push(service.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.insertServiceCategoryQuery(createArr);
    const updateSQL = this.sqlGeneratorService.updateServiceCategoryQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.deleteServiceCategoryQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertServiceCategory: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Service Category error ', error);
        }
      }
    }
  }

  /*----------  INSERT TB EDUCATION TOPIC  ----------*/
  async syncTBEducationTopic(topics: ILookup.TbEducationTopic[]) {
    // separate topics array based on action
    const createArr: ILookup.TbEducationTopicValue[] = [];
    const updateArr: ILookup.TbEducationTopicValue[] = [];
    const deleteArr: ILookup.TbEducationTopicValue[] = [];

    // separate topics based on action
    for (const topic of topics) {
      if (topic.key == OnlineActions.CREATE) {
        createArr.push(topic.value);
      } else if (topic.key == OnlineActions.UPDATE) {
        updateArr.push(topic.value);
      } else if (topic.key == OnlineActions.DELETE) {
        deleteArr.push(topic.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.tbEductionTopicInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.tbEductionTopicUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.tbEductionTopicDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertTBEducationTopic: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync TB Education Topic error ', error);
        }
      }
    }
  }

  /*----------  INSERT HIV PREVENTATIVE SERVICE  ----------*/
  async syncHIVPreventativeService(services: ILookup.HivPreventativeService[]) {
    // separate services array based on action
    const createArr: ILookup.HivPreventativeServiceValue[] = [];
    const updateArr: ILookup.HivPreventativeServiceValue[] = [];
    const deleteArr: ILookup.HivPreventativeServiceValue[] = [];

    // separate services based on action
    for (const service of services) {
      if (service.key == OnlineActions.CREATE) {
        createArr.push(service.value);
      } else if (service.key == OnlineActions.UPDATE) {
        updateArr.push(service.value);
      } else if (service.key == OnlineActions.DELETE) {
        deleteArr.push(service.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.hivPreventativeServiceInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.hivPreventativeServiceUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.hivPreventativeServiceDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertHIVPreventativeService: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync HIV Preventative Service error ', error);
        }
      }
    }
  }

  /*----------  INSERT NCD CONDITION  ----------*/
  async syncNCDCondition(conditions: ILookup.NcdCondition[]) {
    // separate conditions array based on action
    const createArr: ILookup.NcdConditionValue[] = [];
    const updateArr: ILookup.NcdConditionValue[] = [];
    const deleteArr: ILookup.NcdConditionValue[] = [];

    // separate conditions based on action
    for (const condition of conditions) {
      if (condition.key == OnlineActions.CREATE) {
        createArr.push(condition.value);
      } else if (condition.key == OnlineActions.UPDATE) {
        updateArr.push(condition.value);
      } else if (condition.key == OnlineActions.DELETE) {
        deleteArr.push(condition.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.ncdConditionInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.ncdConditionUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.ncdConditionDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertNCDCondition: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync NCD Condition error ', error);
        }
      }
    }
  }

  /*----------  INSERT DANGER SIGN  ----------*/
  async syncDangerSignData(signs: ILookup.DangerSign[]) {
    // separate signs array based on action
    const createArr: ILookup.DangerSignValue[] = [];
    const updateArr: ILookup.DangerSignValue[] = [];
    const deleteArr: ILookup.DangerSignValue[] = [];

    // separate signs based on action
    for (const sign of signs) {
      if (sign.key == OnlineActions.CREATE) {
        createArr.push(sign.value);
      } else if (sign.key == OnlineActions.UPDATE) {
        updateArr.push(sign.value);
      } else if (sign.key == OnlineActions.DELETE) {
        deleteArr.push(sign.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.dangerSignInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.dangerSignUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.dangerSignDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertDangerSign: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Danger Sign error ', error);
        }
      }
    }
  }

  /*----------  INSERT POSTPARTUM DEPRESSIONS  ----------*/
  async syncPostpartumDepressionData(depressions: ILookup.PostpartumDepression[]) {
    // separate depressions array based on action
    const createArr: ILookup.PostpartumDepressionValue[] = [];
    const updateArr: ILookup.PostpartumDepressionValue[] = [];
    const deleteArr: ILookup.PostpartumDepressionValue[] = [];

    // separate depressions based on action
    for (const depression of depressions) {
      if (depression.key == OnlineActions.CREATE) {
        createArr.push(depression.value);
      } else if (depression.key == OnlineActions.UPDATE) {
        updateArr.push(depression.value);
      } else if (depression.key == OnlineActions.DELETE) {
        deleteArr.push(depression.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.postpartumDepressionInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.postpartumDepressionUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.postpartumDepressionDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertPostpartumDepression: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Postpartum Depression error ', error);
        }
      }
    }
  }

  /*----------  INSERT FEEDING METHODS  ----------*/
  async syncFeedingMethodData(methods: ILookup.FeedingMethod[]) {
    // separate methods array based on action
    const createArr: ILookup.FeedingMethodValue[] = [];
    const updateArr: ILookup.FeedingMethodValue[] = [];
    const deleteArr: ILookup.FeedingMethodValue[] = [];

    // separate methods based on action
    for (const method of methods) {
      if (method.key == OnlineActions.CREATE) {
        createArr.push(method.value);
      } else if (method.key == OnlineActions.UPDATE) {
        updateArr.push(method.value);
      } else if (method.key == OnlineActions.DELETE) {
        deleteArr.push(method.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.feedingMethodInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.feedingMethodUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.feedingMethodDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertFeedingMethod: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Feeding Method error ', error);
        }
      }
    }
  }

  /*----------  INSERT DIETARY DIVERSITIES  ----------*/
  async syncDietaryDiversityData(dietaries: ILookup.DietaryDiversity[]) {
    // separate dietaries array based on action
    const createArr: ILookup.DietaryDiversityValue[] = [];
    const updateArr: ILookup.DietaryDiversityValue[] = [];
    const deleteArr: ILookup.DietaryDiversityValue[] = [];

    // separate dietaries based on action
    for (const dietary of dietaries) {
      if (dietary.key == OnlineActions.CREATE) {
        createArr.push(dietary.value);
      } else if (dietary.key == OnlineActions.UPDATE) {
        updateArr.push(dietary.value);
      } else if (dietary.key == OnlineActions.DELETE) {
        deleteArr.push(dietary.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.dietaryDiversityInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.dietaryDiversityUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.dietaryDiversityDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertDietaryDiversity: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Dietary Diversity error ', error);
        }
      }
    }
  }

  /*----------  INSERT ADVERSE EVENT  ----------*/
  async syncAdverseEventData(events: ILookup.AdverseEvent[]) {
    // separate events array based on action
    const createArr: ILookup.AdverseEventValue[] = [];
    const updateArr: ILookup.AdverseEventValue[] = [];
    const deleteArr: ILookup.AdverseEventValue[] = [];

    // separate events based on action
    for (const event of events) {
      if (event.key == OnlineActions.CREATE) {
        createArr.push(event.value);
      } else if (event.key == OnlineActions.UPDATE) {
        updateArr.push(event.value);
      } else if (event.key == OnlineActions.DELETE) {
        deleteArr.push(event.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.adverseEventInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.adverseEventUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.adverseEventDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertAdverseEvent: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Adverse Event error ', error);
        }
      }
    }
  }

  /*----------  INSERT TB SYMPTOMS  ----------*/
  async syncTBSymptomData(symptoms: ILookup.TbSymptom[]) {
    // separate symptoms array based on action
    const createArr: ILookup.TbSymptomValue[] = [];
    const updateArr: ILookup.TbSymptomValue[] = [];
    const deleteArr: ILookup.TbSymptomValue[] = [];

    // separate symptoms based on action
    for (const symptom of symptoms) {
      if (symptom.key == OnlineActions.CREATE) {
        createArr.push(symptom.value);
      } else if (symptom.key == OnlineActions.UPDATE) {
        updateArr.push(symptom.value);
      } else if (symptom.key == OnlineActions.DELETE) {
        deleteArr.push(symptom.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.tbSymptomInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.tbSymptomUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.tbSymptomDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertTBSymptom: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync TB Symptom error ', error);
        }
      }
    }
  }

  /*----------  INSERT TB CONTROL ASSESSMENT  ----------*/
  async syncTBControlAssessment(assessments: ILookup.TbControlAssessment[]) {
    // separate assessments array based on action
    const createArr: ILookup.TbControlAssessmentValue[] = [];
    const updateArr: ILookup.TbControlAssessmentValue[] = [];
    const deleteArr: ILookup.TbControlAssessmentValue[] = [];

    // separate assessments based on action
    for (const assessment of assessments) {
      if (assessment.key == OnlineActions.CREATE) {
        createArr.push(assessment.value);
      } else if (assessment.key == OnlineActions.UPDATE) {
        updateArr.push(assessment.value);
      } else if (assessment.key == OnlineActions.DELETE) {
        deleteArr.push(assessment.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.tbControlAssessmentInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.tbControlAssessmentUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.tbControlAssessmentDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertTBControlAssessment: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync TB Control Assessment error ', error);
        }
      }
    }
  }

  /*----------  INSERT TB ENVIRONMENTAL ASSESSMENT  ----------*/
  async syncTBEnvironmentalAssessment(assessments: ILookup.TbEnvironmentalAssessment[]) {
    // separate assessments array based on action
    const createArr: ILookup.TbEnvironmentalAssessmentValue[] = [];
    const updateArr: ILookup.TbEnvironmentalAssessmentValue[] = [];
    const deleteArr: ILookup.TbEnvironmentalAssessmentValue[] = [];

    // separate assessments based on action
    for (const assessment of assessments) {
      if (assessment.key == OnlineActions.CREATE) {
        createArr.push(assessment.value);
      } else if (assessment.key == OnlineActions.UPDATE) {
        updateArr.push(assessment.value);
      } else if (assessment.key == OnlineActions.DELETE) {
        deleteArr.push(assessment.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.tbEnvironmentalAssessmentInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.tbEnvironmentalAssessmentUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.tbEnvironmentalAssessmentDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertTBEnvironmentalAssessment: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync TB Environmental Assessment error ', error);
        }
      }
    }
  }

  /*----------  INSERT BREASTFEEDING AND COMPLIMENTARY FEEDING  ----------*/
  async syncBreastfeedingAndComplementaryFeeding(feedings: ILookup.BreastfeedingAndComplimentaryFeeding[]) {
    // separate feedings array based on action
    const createArr: ILookup.BreastfeedingAndComplimentaryFeedingValue[] = [];
    const updateArr: ILookup.BreastfeedingAndComplimentaryFeedingValue[] = [];
    const deleteArr: ILookup.BreastfeedingAndComplimentaryFeedingValue[] = [];

    // separate feedings based on action
    for (const feeding of feedings) {
      if (feeding.key == OnlineActions.CREATE) {
        createArr.push(feeding.value);
      } else if (feeding.key == OnlineActions.UPDATE) {
        updateArr.push(feeding.value);
      } else if (feeding.key == OnlineActions.DELETE) {
        deleteArr.push(feeding.value);
      }
    }

    // prepare insert query
    const createSQL = this.sqlGeneratorService.breastfeedingAndComplimentaryFeedingInsertionQuery(createArr);
    const updateSQL = this.sqlGeneratorService.breastfeedingAndComplimentaryFeedingUpdateQuery(updateArr);
    const deleteSQL = this.sqlGeneratorService.breastfeedingAndComplimentaryFeedingDeleteQuery(deleteArr);

    // check if sql is valid and execute
    for (const sql of [createSQL, ...updateSQL, ...deleteSQL]) {
      if (!sql) {
        console.error('insertBreastfeedingAndComplementaryFeeding: Invalid SQL');
      } else {
        try {
          await this.db.execute(sql);
        } catch (error) {
          console.error('Sync Breastfeeding And Complimentary Feeding error ', error);
        }
      }
    }
  }

  /*----------  INSERT APPOINTMENT  ----------*/
  async insertAppointmentData(appointments: Appointment.AppointmentData[]) {
    // loop through each appointment data and insert
    for (const appointment of appointments) {
      if (appointment.isDeleted) continue;

      // prepare insert query
      const clientSql = this.sqlGeneratorService.clientInsertionQuery(appointment.clients);
      const sql = this.sqlGeneratorService.appointmentInsertionQuery(appointment);

      console.log(sql);

      // check if sql is valid
      if (!sql || !clientSql) {
        console.error('insertAppointmentData: Invalid SQL');
        return;
      }

      try {
        // execute insert query
        for (const insertQuery of clientSql) {
          try {
            const response = await this.db.execute(insertQuery);
            console.log(response);
          } catch (error) {
            console.log(insertQuery);
            console.log('insert query error', error);
          }
        }

        // execute insert query
        await this.db.execute(sql);
      } catch (error) {
        console.error('insertAppointmentData', error);
      }
    }
  }

  /*----------  INSERT ANC  ----------*/
  async updateANCItem(onlineDbOid: string, anc?: Anc) {
    if (anc !== undefined) {
      var queryObject = this.sqlGeneratorService.updateANCItem(anc, onlineDbOid);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateFamilyPlanItem(onlineDbOid: string, familyPlanning?: FamilyPlans) {
    if (familyPlanning !== undefined) {
      var queryObject = this.sqlGeneratorService.updateFamilyPlanItem(onlineDbOid, familyPlanning);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateChildGrowthMonitoringItem(onlineDbOid: string, childGrowthMonitoring?: ChildGrowthMonitorings) {
    if (childGrowthMonitoring !== undefined) {
      var queryObject = this.sqlGeneratorService.updateChildGrowthMonitoringItem(onlineDbOid, childGrowthMonitoring);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateClientMinimumAcceptableDietItem(
    onlineDbOid: string,
    clientMinimumAcceptableDiet?: ClientMinimumAcceptableDiets
  ) {
    if (clientMinimumAcceptableDiet !== undefined) {
      var queryObject = this.sqlGeneratorService.updateClientMinimumAcceptableDietItem(
        onlineDbOid,
        clientMinimumAcceptableDiet
      );
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateCounselingItem(onlineDbOid: string, counseling?: Counselings) {
    if (counseling !== undefined) {
      var queryObject = this.sqlGeneratorService.updateCounselingItem(onlineDbOid, counseling);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateHIVSelfTestItem(onlineDbOid: string, hivSelfTest?: HivSelfTests) {
    if (hivSelfTest !== undefined) {
      var queryObject = this.sqlGeneratorService.updateHIVSelfTestItem(onlineDbOid, hivSelfTest);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateARTClientItem(onlineDbOid: string, artClient?: ArtClients) {
    if (artClient !== undefined) {
      var queryObject = this.sqlGeneratorService.updateARTClientItem(onlineDbOid, artClient);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateClientTBSymptomItem(onlineDbOid: string, clientTBSymptom?: ClientTbsymptoms) {
    if (clientTBSymptom !== undefined) {
      var queryObject = this.sqlGeneratorService.updateClientTBSymptomItem(onlineDbOid, clientTBSymptom);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateClientTBEnvironmentalAssessmentItem(
    onlineDbOid: string,
    clientTBEnvironmentalAssessment?: ClientTbenvironmentalAssessments
  ) {
    if (clientTBEnvironmentalAssessment !== undefined) {
      var queryObject = this.sqlGeneratorService.updateClientTBEnvironmentalAssessmentItem(
        onlineDbOid,
        clientTBEnvironmentalAssessment
      );
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateMalariaCaseFindingItem(onlineDbOid: string, malariaCaseFinding?: MalariaCaseFinding) {
    if (malariaCaseFinding !== undefined) {
      var queryObject = this.sqlGeneratorService.updateMalariaCaseFindingItem(onlineDbOid, malariaCaseFinding);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateMalariaPreventionItem(onlineDbOid: string, malariaPrevention?: MalariaPrevention) {
    if (malariaPrevention !== undefined) {
      var queryObject = this.sqlGeneratorService.updateMalariaPreventionItem(onlineDbOid, malariaPrevention);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateHouseholdControlInterventionItem(
    onlineDbOid: string,
    householdControlIntervention?: HouseholdControlIntervention
  ) {
    if (householdControlIntervention !== undefined) {
      var queryObject = this.sqlGeneratorService.updateHouseholdControlInterventionItem(
        onlineDbOid,
        householdControlIntervention
      );
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateHBCClientAssessmentItem(onlineDbOid: string, hbcClientAssessment?: HbcClientAssessment) {
    if (hbcClientAssessment !== undefined) {
      var queryObject = this.sqlGeneratorService.updateHBCClientAssessmentItem(onlineDbOid, hbcClientAssessment);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }
  async updateClientNCDHistoryItem(onlineDbOid: string, clientNCDHistory?: ClientNcdhistorie) {
    if (clientNCDHistory !== undefined) {
      var queryObject = this.sqlGeneratorService.updateClientNCDHistoryItem(onlineDbOid, clientNCDHistory);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateChildImmunizationItem(onlineDbOid: string, childImmunization?: ChildImmunizations) {
    if (childImmunization !== undefined) {
      var queryObject = this.sqlGeneratorService.updateChildImmunizationItem(onlineDbOid, childImmunization);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updatePostNatalItem(onlineDbOid: string, postNatal?: PostNatals) {
    if (postNatal !== undefined) {
      var queryObject = this.sqlGeneratorService.updatePostNatalItem(onlineDbOid, postNatal);
      await this.db.run(queryObject.query, queryObject.params);
    }
  }

  async updateImmunizationAdverseEventItem(onlineDbOid: string, immunizationAdverseEvent?: ImmunizationAdverseEvents) {
    if (immunizationAdverseEvent !== undefined) {
      var queryObject = this.sqlGeneratorService.updateImmunizationAdverseEventItem(
        onlineDbOid,
        immunizationAdverseEvent
      );
      await this.db.run(queryObject.query, queryObject.params);
    }
  }
}
