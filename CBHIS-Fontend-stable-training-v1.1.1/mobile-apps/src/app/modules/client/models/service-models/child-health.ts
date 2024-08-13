export interface ChildGrowthMonitoring {
  TransactionId?: string;
  MAUCStatus: number;
  Weight?: number | null;
  Height?: number | null;
  WastingNutritionalOedem: number;
  IsVitaminAGiven: boolean;
  IsDewormingPillGiven: boolean;
  IsDeleted?: boolean; // Optional as it has a default value in the database
  ClientId: string;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

export interface ChildImmunization {
  TransactionId?: string;
  ImmunizationStatus: number;
  IsDeleted: boolean;
  ClientId: string;
  IsSynced?: number;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
  ImmunizationAdverseEvents?: ImmunizationAdverseEvent[] | null;
}

// models/service-models/adverse-event.ts
export interface AdverseEvent {
  Oid: number;
  Description: string;
  IsSynced?: number;
  OnlineDbOid?: string;
  IsDeleted: boolean;
}

// models/service-models/immunization-adverse-event.ts
export interface ImmunizationAdverseEvent {
  TransactionId?: string;
  ImmunizationId: string;
  AdverseEventId: number;
  IsDeleted: boolean;
  IsSynced?: number;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}
