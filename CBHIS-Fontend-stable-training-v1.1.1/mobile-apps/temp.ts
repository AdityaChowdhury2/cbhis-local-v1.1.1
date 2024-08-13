const regions = [
  {
    oid: 0,
    description: 'string',
    isDeleted: true,
    createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    modifiedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  },
];

// interface Region {
//   Oid: number;
//   Description: string;
//   IsDeleted: number;
//   IsSynced: number;
//   OnlineDbOid: string;
// }

// query to insert data into regions table
// `INSERT INTO Regions (Description, IsDeleted, IsSynced, OnlineDbOid) VALUES ( 'string', true, true, 0 );`

// loop through the regions array and prepare the query array for insertion
const regionQuery = regions.map((region) => {
  return `INSERT INTO Regions (Description, IsDeleted, IsSynced, OnlineDbOid) VALUES ( ${region.description}, ${Number(
    region.isDeleted
  )}, true, ${region.oid} );`;
});

export interface Root {
  isSuccess: boolean;
  data: Data;
}

export interface Data {
  device: Device;
  regions: Region[];
  chiefdoms: Chiefdom[];
  villages: Village[];
  devices: Device2[];
  ancTopics: AncTopic[];
  drinkWaterSources: DrinkWaterSource[];
  safeWaterSources: SafeWaterSource[];
  washes: Wash[];
  healthEducationTopics: HealthEducationTopic[];
  fpMethods: FpMethod[];
  malariaControlInterventions: MalariaControlIntervention[];
  minimumAcceptableDiets: MinimumAcceptableDiet[];
  malariaSymptoms: MalariaSymptom[];
  malariaRisks: MalariaRisk[];
  hbcServices: HbcService[];
  hbcServiceCategories: HbcServiceCategory[];
  serviceCategories: ServiceCategory[];
  tbEducationTopics: TbEducationTopic[];
  hivPreventativeServices: HivPreventativeService[];
  ncdConditions: NcdCondition[];
  dangerSigns: DangerSign[];
  postpartumDepressions: PostpartumDepression[];
  feedingMethods: FeedingMethod[];
  dietaryDiversities: DietaryDiversity[];
  adverseEvents: AdverseEvent[];
  tbSymptoms: TbSymptom[];
  tbControlAssessments: TbControlAssessment[];
  tbEnvironmentalAssessments: TbEnvironmentalAssessment[];
  breastfeedingAndComplimentaryFeedings: BreastfeedingAndComplimentaryFeeding[];
}

export interface Device {
  oid: number;
  description: string;
  imeiNumber: string;
  identifiedDescription: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface Region {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface Chiefdom {
  oid: number;
  description: string;
  inkhundlaId: number;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface Village {
  oid: number;
  description: string;
  chiefdomId: number;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface Device2 {
  oid: number;
  description: string;
  imeiNumber: string;
  identifiedDescription: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface AncTopic {
  oid: number;
  description: string;
  jobaid: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface DrinkWaterSource {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface SafeWaterSource {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface Wash {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface HealthEducationTopic {
  oid: number;
  description: string;
  jobaid: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface FpMethod {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface MalariaControlIntervention {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface MinimumAcceptableDiet {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface MalariaSymptom {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface MalariaRisk {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface HbcService {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
  serviceCategoryList: number[];
}

export interface HbcServiceCategory {
  oid: number;
  serviceId: number;
  categoryId: number;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface ServiceCategory {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
  hbCServiceList: number[];
}

export interface TbEducationTopic {
  oid: number;
  description: string;
  jobaid: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface HivPreventativeService {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface NcdCondition {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface DangerSign {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface PostpartumDepression {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface FeedingMethod {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface DietaryDiversity {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface AdverseEvent {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface TbSymptom {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface TbControlAssessment {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface TbEnvironmentalAssessment {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}

export interface BreastfeedingAndComplimentaryFeeding {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string;
}
