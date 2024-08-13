export interface Root {
  isSuccess: boolean;
  data: Data;
  message: string | null;
}

export interface Data {
  device: Device;
  regions: Region[];
  chiefdoms: Chiefdom[];
  tinkhundlas: Tinkhundla[];
  villages: Village[];
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
  modifiedBy: string | null;
}

export interface Region {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface Chiefdom {
  oid: number;
  description: string;
  inkhundlaId: number;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface Tinkhundla {
  oid: number;
  description: string;
  regionId: number;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface Village {
  oid: number;
  description: string;
  chiefdomId: number;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface AncTopic {
  key: string;
  value: AncTopicValue;
}

export interface AncTopicValue {
  oid: number;
  description: string;
  jobaid: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface DrinkWaterSource {
  key: string;
  value: DrinkWaterSourceValue;
}

export interface DrinkWaterSourceValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface SafeWaterSource {
  key: string;
  value: SafeWaterSourceValue;
}

export interface SafeWaterSourceValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface Wash {
  key: string;
  value: WashValue;
}

export interface WashValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface HealthEducationTopic {
  key: string;
  value: HealthEducationTopicValue;
}

export interface HealthEducationTopicValue {
  oid: number;
  description: string;
  jobaid: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface FpMethod {
  key: string;
  value: FpMethodValue;
}

export interface FpMethodValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface MalariaControlIntervention {
  key: string;
  value: MalariaControlInterventionValue;
}

export interface MalariaControlInterventionValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface MinimumAcceptableDiet {
  key: string;
  value: MinimumAcceptableDietValue;
}

export interface MinimumAcceptableDietValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface MalariaSymptom {
  key: string;
  value: MalariaSymptomValue;
}

export interface MalariaSymptomValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface MalariaRisk {
  key: string;
  value: MalariaRiskValue;
}

export interface MalariaRiskValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface HbcService {
  key: string;
  value: HbcServiceValue;
}

export interface HbcServiceValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface HbcServiceCategory {
  key: string;
  value: HbcServiceCategoryValue;
}

export interface HbcServiceCategoryValue {
  oid: number;
  serviceId: number;
  categoryId: number;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
  onlineDbOid: string;
}

export interface ServiceCategory {
  key: string;
  value: ServiceCategoryValue;
}

export interface ServiceCategoryValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface TbEducationTopic {
  key: string;
  value: TbEducationTopicValue;
}

export interface TbEducationTopicValue {
  oid: number;
  description: string;
  jobaid: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface HivPreventativeService {
  key: string;
  value: HivPreventativeServiceValue;
}

export interface HivPreventativeServiceValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface NcdCondition {
  key: string;
  value: NcdConditionValue;
}

export interface NcdConditionValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface DangerSign {
  key: string;
  value: DangerSignValue;
}

export interface DangerSignValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface PostpartumDepression {
  key: string;
  value: PostpartumDepressionValue;
}

export interface PostpartumDepressionValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface FeedingMethod {
  key: string;
  value: FeedingMethodValue;
}

export interface FeedingMethodValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface DietaryDiversity {
  key: string;
  value: DietaryDiversityValue;
}

export interface DietaryDiversityValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface AdverseEvent {
  key: string;
  value: AdverseEventValue;
}

export interface AdverseEventValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface TbSymptom {
  key: string;
  value: TbSymptomValue;
}

export interface TbSymptomValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface TbControlAssessment {
  key: string;
  value: TbControlAssessmentValue;
}

export interface TbControlAssessmentValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface TbEnvironmentalAssessment {
  key: string;
  value: TbEnvironmentalAssessmentValue;
}

export interface TbEnvironmentalAssessmentValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}

export interface BreastfeedingAndComplimentaryFeeding {
  key: string;
  value: BreastfeedingAndComplimentaryFeedingValue;
}

export interface BreastfeedingAndComplimentaryFeedingValue {
  oid: number;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: string | null;
}
