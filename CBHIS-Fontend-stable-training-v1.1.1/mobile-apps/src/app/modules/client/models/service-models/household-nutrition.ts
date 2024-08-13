export interface DietaryDiversity {
  Oid: number;
  Description: string;
  IsDeleted?: boolean;
}

export interface HouseholdDietaryDiversity {
  TransactionId?: string;
  ClientId: string;
  DietaryDiversityId: number;
  IsDeleted?: boolean;
  CreatedBy: string;
  CreatedAt?: string;
  MatchId?: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

export interface BreastFeedingAndComplementaryFeeding {
  Oid: number;
  Description: string;
  IsDeleted?: boolean;
}

export interface ClientBCF {
  TransactionId?: string;
  ClientId: string;
  BCFId: number;
  IsDeleted?: boolean;
  CreatedBy: string;
  CreatedAt?: string;
  MatchId?: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

// Interface for MinimumAcceptableDiet table
export interface MinimumAcceptableDiet {
  Oid: number; // Primary key
  Description: string;
  IsDeleted?: Boolean; // Defaulted to 0
}

// Interface for ClientMinimumAcceptableDiet table
export interface ClientMinimumAcceptableDiet {
  TransactionId?: string; // Primary key
  ClientId: string;
  MinimumAcceptableDietId: number;
  Frequency?: number | null; // Optional field
  IsDeleted?: boolean; // Defaulted to 0
  CreatedBy: string; // Optional field
  CreatedAt?: string;
  MatchId?: string; // Optional field
  ModifiedBy?: string; // Optional field
  OnlineDbOid?: string; // Optional field
}
