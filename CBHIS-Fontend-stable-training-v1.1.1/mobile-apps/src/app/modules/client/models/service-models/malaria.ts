// Interface for MalariaRisks table
export interface MalariaRisk {
  Oid: number;
  Description: string;
  IsDeleted: boolean;
}

// Interface for HouseholdMalariaRisk table
export interface HouseholdMalariaRisk {
  TransactionId?: string;
  ClientId: string;
  MalariaRiskId: number;
  IsDeleted: boolean;
  CreatedBy: string;
  CreatedAt?: string;
  ModifiedBy?: string;
  MatchId?: string;
  OnlineDbOid?: string;
}

// Interface for MalariaSymptoms table
export interface MalariaSymptom {
  Oid: number;
  Description: string;
  IsDeleted: boolean;
}

// Interface for ClientMalariaSymptoms table
export interface ClientMalariaSymptom {
  TransactionId?: string;
  ClientId: string;
  MalariaSymptomId: number;
  IsDeleted: boolean;
  CreatedBy: string;
  CreatedAt?: string;
  ModifiedBy?: string;
  MatchId?: string;
  OnlineDbOid?: string;
}

// Interface for MalariaCaseFinding table
export interface MalariaCaseFinding {
  TransactionId: string;
  ClientId: string;
  IsResidenceInMalariaEndemicArea: boolean;
  IsMalariaExposed?: boolean | null; // Nullable with ?
  ExposedWhere?: string | null; // Nullable with ?
  IsDeleted: boolean;
  CreatedBy: string;
  MatchId?: string;
  CreatedAt?: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

// Interface for MalariaPrevention table
export interface MalariaPrevention {
  TransactionId: string;
  ClientId: string;
  ISR: number;
  ISRProvider: number;
  HASITN?: boolean; // Nullable with ?
  NumberOfITN?: number | null; // Nullable with ?
  IsITNObserved?: boolean | null; // Nullable with ?
  MaxAgeOfITN?: number | null; // Nullable with ?
  HasNetBeenTreated?: boolean; // Nullable with ?
  LastNetWasTreated?: number | null; // Nullable with ?
  MalariaCampaign?: number | null; // Nullable with ?
  MalariaCampaignMedium?: number | null; // Nullable with ?
  IsDeleted: boolean;
  CreatedBy: string;
  CreatedAt?: string;
  ModifiedBy?: string;
  MatchId?: string;
  OnlineDbOid?: string;
}

// Interface for MalariaControlIntervention table
export interface MalariaControlIntervention {
  Oid: number;
  Description: string;
  IsDeleted: boolean;
}

// Interface for HouseholdControlIntervention table
export interface HouseholdControlIntervention {
  TransactionId: string;
  ClientId: string;
  ControlInterventionId: number;
  IsDeleted: boolean;
  CreatedBy: string;
  CreatedAt?: string;
  ModifiedBy?: string;
  MatchId?: string;
  OnlineDbOid?: string;
}
