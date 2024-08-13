export interface TBControlAssessment {
  Oid: number; // Primary key, integer
  Description: string; // Not null, text description
  IsDeleted?: boolean; // Defaulted to 0, integer
}

export interface TBKeyAffectedClient {
  TransactionId?: string;
  ClientId: string;
  TBControlAssessmentId: number;
  IsDeleted?: boolean;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

// Interface for TBSymptoms table
export interface TBSymptom {
  Oid: number; // Primary key, integer
  Description: string; // Not null, text description
  IsDeleted?: boolean; // Defaulted to false
  CreatedBy?: string; // Not null, text
  ModifiedBy?: string; // Not null, text
}

// Interface for ClientTBSymptoms table
export interface ClientTBSymptom {
  TransactionId?: string; // Primary key, not null
  ClientId: string; // Foreign key referencing Clients(Oid)
  TBSymptomId: number | null; // Nullable foreign key referencing TBSymptoms(Oid)
  IsSputumCollected: boolean; // Integer, assumed to be boolean-like
  IsTBContact: boolean; // Integer, assumed to be boolean-like
  IsPresumptive: boolean; // Integer, assumed to be boolean-like
  IsDeleted: boolean; // Defaulted to false
  CreatedBy: string; // Not null, text
  ModifiedBy?: string;
  OnlineDbOid?: string; // Nullable text field
}

// Interface for TBEnvironmentalAssessment table
export interface TBEnvironmentalAssessment {
  Oid: number; // Primary key, integer
  Description: string; // Not null, text description
  IsDeleted?: boolean; // Defaulted to false
}

// Interface for ClientTBEnvironmentalAssessment table
export interface ClientTBEnvironmentalAssessment {
  TransactionId?: string; // Primary key, not null
  ClientId: string; // Foreign key referencing Clients(Oid)
  TBEnvironmentalAssessmentId?: number | null; // Nullable foreign key referencing TBEnvironmentalAssessment(Oid)
  OthersObserved?: string | null; // Nullable text field
  IsDeleted?: boolean; // Defaulted to false
  CreatedBy: string; // Not null, text
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

// Interface for TBEducationTopics table
export interface TBEducationTopic {
  Oid: number; // Primary key, integer
  Description: string; // Not null, text description
  JobAid?: string; // Nullable text field
  IsDeleted?: boolean; // Defaulted to false
}

// Interface for TBDiscussedTopic table
export interface TBDiscussedTopic {
  TransactionId?: string; // Primary key, not null
  ClientId: string; // Foreign key referencing Clients(Oid)
  TBTopicId: number; // Foreign key referencing TBEducationTopics(Oid)
  IsDeleted?: boolean; // Defaulted to false
  CreatedBy: string; // Not null, text
  ModifiedBy?: string;
  OnlineDbOid?: string;
}
