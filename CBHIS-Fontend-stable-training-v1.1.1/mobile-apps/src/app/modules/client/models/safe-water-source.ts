export interface SafeWaterSource {
  Oid: number;
  Description: string;
  IsDeleted: number;
  IsSynced?: number;
  CreatedBy?: string;
  ModifiedBy?: string;
  OnlineDbOid: number;
}
