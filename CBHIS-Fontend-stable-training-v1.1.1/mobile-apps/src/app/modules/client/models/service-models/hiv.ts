// Interface for Counseling table
export interface Counseling {
  TransactionId?: string; // Primary key, not null
  ClientId: string; // Foreign key referencing Clients(Oid)
  CounselingType: number; // Integer field, not null
  IsDeleted: boolean; // Defaulted to 0
  CreatedBy: string; // Foreign key referencing Users(Oid)
  CreatedAt?: string;
  MatchId?: string; // Nullable field for text
  ModifiedBy?: string; // Nullable field for text
  OnlineDbOid?: string; // Nullable field for text
}

// Interface for HIVSelfTests table
export interface HIVSelfTest {
  TransactionId?: string; // Primary key, not null
  ClientId: string; // Foreign key referencing Clients(Oid)
  IsAcceptedHIVTest?: boolean | null; // Nullable field for text
  DistributionType?: number | null; // Optional field for integer
  UserProfile?: number | null; // Optional field for integer
  IsAssistedSelfTest?: boolean | null; // Optional field for integer
  TestResult?: number | null; // Optional field for integer
  IsDeleted: boolean; // Defaulted to 0
  CreatedBy: string; // Foreign key referencing Users(Oid)
  CreatedAt?: string;
  MatchId?: string; // Nullable field for text
  ModifiedBy?: string; // Nullable field for text
  OnlineDbOid?: string; // Nullable field for text
}
