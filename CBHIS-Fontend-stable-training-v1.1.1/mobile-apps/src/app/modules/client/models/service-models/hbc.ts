export interface HBCClientAssessment {
  TransactionId: string;
  ClientId: string;
  Condition: number;
  IsDischargedFromHBC?: boolean | null;
  ReasonForDischarge?: number | null;
  IsDeleted: boolean;
  OnlineDbOid?: string;
  CreatedBy: string;
  ModifiedBy?: string;
}

export interface HBCService {
  Oid: number;
  Description: string;
  IsSynced?: number;
  OnlineDbOid?: string;
  IsDeleted: boolean;
}

export interface GivenHBCService {
  TransactionId?: string;
  ClientId: string;
  HBCServiceId: number;
  IsDeleted: boolean;
  IsSynced?: number;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

export interface ServiceCategory {
  Oid: number;
  Description: string;
  IsSynced?: number;
  OnlineDbOid?: string;
  IsDeleted: boolean;
}

export interface HBCServiceCategory {
  Oid?: number;
  ClientId: string;
  ServiceCategoryId: number;
  IsDeleted: boolean;
  IsSynced?: number;
  OnlineDbOid?: string;
}
