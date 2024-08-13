export interface FamilyPlan {
  TransactionId?: string;
  IsPlanningToBePregnant: number | boolean | any;
  ClientId: string;
  IsDeleted: boolean | null;
  IsSynced?: boolean | null;
  OnlineDbOid?: string | null;
  CreatedBy: string;
  ModifiedBy?: string;
}
export interface FamilyPlanningMethod {
  Oid: number;
  Description: string;
  IsSynced?: number;
  OnlineDbOid?: string;
  IsDeleted?: number;
}
export interface UsedFamilyPlanMethod {
  TransactionId?: string;
  ClientId: string;
  FPMethodId: number;
  IsDeleted: boolean;
  IsSynced?: number;
  OnlineDbOid?: string;
  CreatedBy: string;
  ModifiedBy?: string;
}
