export interface HealthEducationTopic {
  Oid: number;
  Description: string;
  Jobaid: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface ANCTopic {
  Oid: number;
  Description: string;
  Jobaid: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface FPMethod {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface MasterRecord {
  Oid: number;
  TableCode: number;
  DateCreated: string;
  CreatedBy: string;
  DateModified: string;
  ModifiedBy: string;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface DrinkingWaterSource {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface SafeWaterSource {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface WASH {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface AdverseEvent {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface HivPreventativeService {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface PreventativeService {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface ChildhoodIllness {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface Treatment {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface Device {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface DangerSign {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface PostpartumDepression {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface FeedingMethod {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface Region {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface Tinkhundla {
  Oid: number;
  Description: string;
  RegionId: number;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface DietaryDiversity {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface Chiefdom {
  Oid: number;
  Description: string;
  InkhundlaId: number;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface Village {
  Oid: number;
  Description: string;
  ChiefdomId: number;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}

export interface SubVillage {
  Oid: number;
  Description: string;
  VillageId: number;
  IsDeleted: number;
  IsSynced: number;
  OnlineDbOid: string;
}
