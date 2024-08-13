import { ANC } from 'src/app/modules/client/models/anc';
import { Client } from 'src/app/modules/client/models/client';
import { ANCDiscussedTopics } from 'src/app/modules/client/models/discussed-anc-topics';
import { DiscussedHealthEducationTopic } from 'src/app/modules/client/models/discussed-topics';
import { HouseholdDrinkingWater } from 'src/app/modules/client/models/household-drinking-water';
import { HouseholdSafeWaterSource } from 'src/app/modules/client/models/household-safe-water-source';
import { HouseholdWASHs } from 'src/app/modules/client/models/household-wash';
import { ARTClient } from 'src/app/modules/client/models/service-models/art';
import {
  ChildGrowthMonitoring,
  ChildImmunization,
  ImmunizationAdverseEvent,
} from 'src/app/modules/client/models/service-models/child-health';
import { FamilyPlan, UsedFamilyPlanMethod } from 'src/app/modules/client/models/service-models/family-planning';
import { GivenHBCService, HBCClientAssessment } from 'src/app/modules/client/models/service-models/hbc';
import { Counseling, HIVSelfTest } from 'src/app/modules/client/models/service-models/hiv';
import {
  ClientMalariaSymptom,
  HouseholdControlIntervention,
  HouseholdMalariaRisk,
  MalariaCaseFinding,
  MalariaPrevention,
} from 'src/app/modules/client/models/service-models/malaria';
import { ClientNCDHistory, NCDScreening } from 'src/app/modules/client/models/service-models/ncd';
import {
  ClientTBEnvironmentalAssessment,
  ClientTBSymptom,
  TBDiscussedTopic,
  TBKeyAffectedClient,
} from 'src/app/modules/client/models/service-models/tb';
import {
  ClientBCF,
  ClientMinimumAcceptableDiet,
  HouseholdDietaryDiversity,
} from './../../modules/client/models/service-models/household-nutrition';
import {
  PostNatal,
  PostNatalDangerSign,
  PostNatalDepression,
  PostNatalFeedingMethod,
  PostNatalPreventativeService,
} from './../../modules/client/models/service-models/postnatal';

export interface SyncQueue {
  id: number;
  operation: string;
  tableName: string;
  transactionId: number | string;
  dateCreated: string;
  createdBy: number | string;
  dateModified: string;
  modifiedBy: number | string;
}
export interface SyncQueueItem {
  id: number;
  operation: string;
  tableName: string;
  transactionId: string;
  dateCreated: string;
  createdBy: string;
  dateModified: string;
  modifiedBy: string;
  HouseholdSafeWaterSources_row_data: string;
  ANC_row_data: string;
  HouseholdDrinkingWaters_row_data: string;
  DiscussedTopics_row_data: string;
  HouseholdWASHs_row_data: string;
  DiscussedANCTopics_row_data: string;
  Client_row_data: string;
  FamilyPlan_row_data: string;
  UsedFamilyPlanMethod_row_data: string;
  ChildGrowthMonitoring_row_data: string;
  ChildImmunization_row_data: string;
  ImmunizationAdverseEvent_row_data: string;
  PostNatal_row_data: string;
  PostNatalPreventativeService_row_data: string;
  PostNatalDangerSign_row_data: string;
  PostNatalDepression_row_data: string;
  PostNatalFeedingMethod_row_data: string;
  HouseholdDietaryDiversity_row_data: string;
  ClientBCF_row_data: string;
  ClientMinimumAcceptableDiet_row_data: string;
  Counseling_row_data: string;
  HIVSelfTest_row_data: string;
  ARTClient_row_data: string;
  TBKeyAffectedClient_row_data: string;
  ClientTBSymptom_row_data: string;
  ClientTBEnvironmentalAssessment_row_data: string;
  TBDiscussedTopic_row_data: string;
  HouseholdMalariaRisk_row_data: string;
  ClientMalariaSymptom_row_data: string;
  MalariaCaseFinding_row_data: string;
  MalariaPrevention_row_data: string;
  HouseholdControlIntervention_row_data: string;
  GivenHBCService_row_data: string;
  HBCServiceCategory_row_data: string;
  HBCClientAssessment_row_data: string;
  ClientNCDHistory_row_data: string;
  NCDScreening_row_data: string;
}

// export interface SyncQueueApiResponse {
//   data: SyncQueueApiData[];
//   message: string;
//   isSuccess: boolean;
// }

export interface SyncQueueData {
  id: number;
  operation: number | undefined;
  tableCode: number | undefined;
  transactionId: string | number;
  dateCreated: string;
  createdBy: number | string;
  dateModified: string;
  modifiedBy: number | string;
  HouseholdSafeWaterSources?: HouseholdSafeWaterSource;
  ANC?: ANC;
  HouseholdDrinkingWaters?: HouseholdDrinkingWater;
  HouseholdWASHs?: HouseholdWASHs;
  DiscussedANCTopics?: ANCDiscussedTopics;
  Clients?: Client;
  FamilyPlans?: FamilyPlan;
  UsedFamilyPlanMethods?: UsedFamilyPlanMethod;
  DiscussedTopics?: DiscussedHealthEducationTopic;
  ChildGrowthMonitorings?: ChildGrowthMonitoring;
  ChildImmunizations?: ChildImmunization;
  ImmunizationAdverseEvents?: ImmunizationAdverseEvent;
  PostNatals?: PostNatal;
  PostNatalPreventativeServices?: PostNatalPreventativeService;
  PostNatalDangerSigns?: PostNatalDangerSign;
  PostNatalDepressions?: PostNatalDepression;
  PostNatalFeedingMethods?: PostNatalFeedingMethod;
  ARTClients?: ARTClient;
  ClientTBSymptoms?: ClientTBSymptom;
  ClientTBEnvironmentalAssessments?: ClientTBEnvironmentalAssessment;
  ClientMinimumAcceptableDiets?: ClientMinimumAcceptableDiet;
  Counselings?: Counseling;
  HIVSelfTests?: HIVSelfTest;
  MalariaCaseFinding?: MalariaCaseFinding;
  MalariaPrevention?: MalariaPrevention;
  HBCClientAssessment?: HBCClientAssessment;
  ClientNCDHistorie?: ClientNCDHistory;
  HouseholdControlIntervention?: HouseholdControlIntervention;
  HouseholdDietaryDiversities?: HouseholdDietaryDiversity;
  ClientBCFs?: ClientBCF;
  TBDiscussedTopics?: TBDiscussedTopic;
  TbKeyAffectedClients?: TBKeyAffectedClient;
  HouseholdMalariaRisk?: HouseholdMalariaRisk;
  ClientMalariaSymptom?: ClientMalariaSymptom;
  GivenHBCService?: GivenHBCService;
  NCDScreening?: NCDScreening;
}

// export interface SyncQueueApiData {
//   id: number;
//   operation: number;
//   tableCode: number;
//   transactionId: string;
//   dateCreated: string;
//   createdBy: string;
//   dateModified: string;
//   modifiedBy: string;
//   householdDrinkingWaters: HouseholdDrinkingWaters;
//   anc: Anc;
//   householdSafeWaterSources: HouseholdSafeWaterSources;
//   householdWASHs: HouseholdWashs;
//   discussedANCTopics: DiscussedAnctopics;
//   clients: Clients;
//   familyPlans: FamilyPlans;
//   usedFamilyPlanMethods: UsedFamilyPlanMethods;
//   childGrowthMonitorings: ChildGrowthMonitorings;
//   childImmunizations: ChildImmunizations;
//   immunizationAdverseEvents: ImmunizationAdverseEvents;
//   postNatals: PostNatals;
//   postNatalPreventativeServices: PostNatalPreventativeServices;
//   postNatalDangerSigns: PostNatalDangerSigns;
//   postNatalDepressions: PostNatalDepressions;
//   postNatalFeedingMethods: PostNatalFeedingMethods;
//   householdDietaryDiversities: HouseholdDietaryDiversities;
//   clientBCFs: ClientBcfs;
//   clientMinimumAcceptableDiets: ClientMinimumAcceptableDiets;
//   counselings: Counselings;
//   hivSelfTests: HivSelfTests;
//   artClients: ArtClients;
//   tbKeyAffectedClients: TbKeyAffectedClients;
//   clientTBSymptoms: ClientTbsymptoms;
//   clientTBEnvironmentalAssessments: ClientTbenvironmentalAssessments;
//   tbDiscussedTopics: TbDiscussedTopics;
//   householdMalariaRisk: HouseholdMalariaRisk;
//   clientMalariaSymptom: ClientMalariaSymptom;
//   malariaCaseFinding: MalariaCaseFinding;
//   malariaPrevention: MalariaPrevention;
//   householdControlIntervention: HouseholdControlIntervention;
//   givenHBCService: GivenHbcservice;
//   hbcServiceCategory: HbcServiceCategory;
//   hbcClientAssessment: HbcClientAssessment;
//   clientNCDHistorie: ClientNcdhistorie;
// }

// export interface HouseholdDrinkingWaters {
//   transactionId: string;
//   familyHeadId: string;
//   drinkingWaterSourceId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface Anc {
//   transactionId: string;
//   isCounselled: boolean;
//   isANCInitiated: boolean;
//   isMalariaDrugTaken: boolean;
//   frequencyOfMalariaTherapy: number;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface HouseholdSafeWaterSources {
//   transactionId: string;
//   familyHeadId: string;
//   safeWaterSourceId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface HouseholdWashs {
//   transactionId: string;
//   familyHeadId: string;
//   washId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface DiscussedAnctopics {
//   transactionId: string;
//   ancTopicId: number;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface Clients {
//   oid: string;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   age: number;
//   dob: string;
//   sex: number;
//   maritalStatus: number;
//   educationLevel: number;
//   occupation: string;
//   hasBirthCertificate: boolean;
//   isDisabled: boolean;
//   isPregnant: boolean;
//   isDeceased: boolean;
//   dateDeceased: string;
//   isFamilyHead: boolean;
//   relationalType: number;
//   familyHeadId: string;
//   villageId: number;
//   pin: string;
//   cellphone: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
// }

// export interface FamilyPlans {
//   transactionId: string;
//   isPlanningToBePregnant: boolean;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface UsedFamilyPlanMethods {
//   transactionId: string;
//   fpMethodId: number;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface ChildGrowthMonitorings {
//   transactionId: string;
//   mucStatus: number;
//   weight: number;
//   height: number;
//   wastingNutritionalOedema: number;
//   isVitaminAGiven: boolean;
//   isDewormingPillGiven: boolean;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface ChildImmunizations {
//   transactionalId: string;
//   clientId: string;
//   client: Client;
//   immunizationStatus: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface Client {
//   oid: string;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   age: number;
//   dob: string;
//   sex: number;
//   maritalStatus: number;
//   educationLevel: number;
//   occupation: string;
//   hasBirthCertificate: boolean;
//   isDisabled: boolean;
//   isPregnant: boolean;
//   isDeceased: boolean;
//   dateDeceased: string;
//   isFamilyHead: boolean;
//   relationalType: number;
//   familyHeadId: string;
//   villageId: number;
//   pin: string;
//   cellphone: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
// }

// export interface ImmunizationAdverseEvents {
//   transactionId: string;
//   immunizationId: string;
//   adverseEventId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatals {
//   transactionId: string;
//   placeOfDelivery: number;
//   postpartumLossOfBlood: number;
//   clientId: string;
//   isDeleted: boolean;
//   postNatalDangerSigns: PostNatalDangerSign[];
//   postNatalDepressions: PostNatalDepression[];
//   postNatalFeedingMethods: PostNatalFeedingMethod[];
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalDangerSign {
//   transactionId: string;
//   postNatalId: string;
//   dangerSignId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalDepression {
//   transactionId: string;
//   postNatalId: string;
//   postpartumDepressionId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalFeedingMethod {
//   transactionId: string;
//   postNatalId: string;
//   feedingMethodId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalPreventativeServices {
//   transactionId: string;
//   postNatalId: string;
//   postNatal: PostNatal;
//   preventativeServiceId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatal {
//   transactionId: string;
//   placeOfDelivery: number;
//   postpartumLossOfBlood: number;
//   clientId: string;
//   isDeleted: boolean;
//   postNatalDangerSigns: PostNatalDangerSign2[];
//   postNatalDepressions: PostNatalDepression2[];
//   postNatalFeedingMethods: PostNatalFeedingMethod2[];
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalDangerSign2 {
//   transactionId: string;
//   postNatalId: string;
//   dangerSignId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalDepression2 {
//   transactionId: string;
//   postNatalId: string;
//   postpartumDepressionId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalFeedingMethod2 {
//   transactionId: string;
//   postNatalId: string;
//   feedingMethodId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalDangerSigns {
//   transactionId: string;
//   postNatalId: string;
//   dangerSignId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalDepressions {
//   transactionId: string;
//   postNatalId: string;
//   postpartumDepressionId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface PostNatalFeedingMethods {
//   transactionId: string;
//   postNatalId: string;
//   feedingMethodId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface HouseholdDietaryDiversities {
//   transactionId: string;
//   clientId: string;
//   dietaryDiversityId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface ClientBcfs {
//   transactionalId: string;
//   clientId: string;
//   bcfId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface ClientMinimumAcceptableDiets {
//   transactionId: string;
//   clientId: string;
//   minimumAcceptableDietId: number;
//   frequency: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface Counselings {
//   transactionalId: string;
//   clientId: string;
//   counselingType: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface HivSelfTests {
//   transactionId: string;
//   isAcceptedHIVTest: boolean;
//   distributionType: number;
//   userProfile: number;
//   isAssistedSelfTest: boolean;
//   testResult: number;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface ArtClients {
//   transactionalId: string;
//   medicationSideEffects: number;
//   isOnTBPreventativeTherapy: boolean;
//   wellbeingIssues: string;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface TbKeyAffectedClients {
//   transactionId: string;
//   tbControlAssessmentId: number;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface ClientTbsymptoms {
//   transactionId: string;
//   isSputumCollected: boolean;
//   isTBContact: boolean;
//   isPresumptive: boolean;
//   clientId: string;
//   tbSymptomId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface ClientTbenvironmentalAssessments {
//   transactionId: string;
//   othersObserved: string;
//   clientId: string;
//   tbEnvironmentalAssessmentId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface TbDiscussedTopics {
//   transactionId: string;
//   tbTopicId: number;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface HouseholdMalariaRisk {
//   transactionId: string;
//   clientId: string;
//   malariaRiskId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface ClientMalariaSymptom {
//   transactionId: string;
//   clientId: string;
//   malariaSymptomId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface MalariaCaseFinding {
//   transactionId: string;
//   clientId: string;
//   isResidenceInHighRiskArea: boolean;
//   isMalariaExposed: boolean;
//   exposedWhere: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface MalariaPrevention {
//   transactionId: string;
//   isr: number;
//   isrProvider: number;
//   hasITN: boolean;
//   numberOfITN: number;
//   isitnObserved: boolean;
//   maxAgeOfITN: number;
//   hasBeenTrained: boolean;
//   lastNetWasTreated: number;
//   malariaCampaign: number;
//   malariaCampaignMedium: number;
//   clientId: string;
//   client: Client2;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface Client2 {
//   oid: string;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   age: number;
//   dob: string;
//   sex: number;
//   maritalStatus: number;
//   educationLevel: number;
//   occupation: string;
//   hasBirthCertificate: boolean;
//   isDisabled: boolean;
//   isPregnant: boolean;
//   isDeceased: boolean;
//   dateDeceased: string;
//   isFamilyHead: boolean;
//   relationalType: number;
//   familyHeadId: string;
//   villageId: number;
//   pin: string;
//   cellphone: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
// }

// export interface HouseholdControlIntervention {
//   transactionId: string;
//   clientId: string;
//   controlInterventionId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface GivenHbcservice {
//   transactionId: string;
//   clientId: string;
//   client: Client3;
//   hbcServiceId: number;
//   hbcService: HbcService;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface Client3 {
//   oid: string;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   age: number;
//   dob: string;
//   sex: number;
//   maritalStatus: number;
//   educationLevel: number;
//   occupation: string;
//   hasBirthCertificate: boolean;
//   isDisabled: boolean;
//   isPregnant: boolean;
//   isDeceased: boolean;
//   dateDeceased: string;
//   isFamilyHead: boolean;
//   relationalType: number;
//   familyHeadId: string;
//   villageId: number;
//   pin: string;
//   cellphone: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
// }

// export interface HbcService {
//   oid: number;
//   description: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
// }

// export interface HbcServiceCategory {
//   oid: number;
//   serviceId: number;
//   categoryId: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface HbcClientAssessment {
//   transactionId: string;
//   clientId: string;
//   client: Client4;
//   condition: number;
//   isDischarged: boolean;
//   reasonForDischarge: number;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }

// export interface Client4 {
//   oid: string;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   age: number;
//   dob: string;
//   sex: number;
//   maritalStatus: number;
//   educationLevel: number;
//   occupation: string;
//   hasBirthCertificate: boolean;
//   isDisabled: boolean;
//   isPregnant: boolean;
//   isDeceased: boolean;
//   dateDeceased: string;
//   isFamilyHead: boolean;
//   relationalType: number;
//   familyHeadId: string;
//   villageId: number;
//   pin: string;
//   cellphone: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
// }

// export interface ClientNcdhistorie {
//   transactionId: string;
//   screeningOutcome: number;
//   isTestConducted: boolean;
//   testOutcome: number;
//   ncdConditionId: number;
//   clientId: string;
//   isDeleted: boolean;
//   createdBy: string;
//   modifiedBy: string;
//   onlineDbOid: string;
// }
