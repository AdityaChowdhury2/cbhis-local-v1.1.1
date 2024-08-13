export interface Client {
  Oid: string;
  FirstName: string;
  MiddleName?: string;
  LastName: string;
  Age?: number;
  DOB: string;
  Sex: number;
  MaritalStatus: number;
  PIN: string;
  Cellphone?: string;
  EducationLevel: number;
  Occupation?: string;
  HasBirthCertificate?: boolean;
  IsDisabled?: boolean;
  IsDeceased?: boolean;
  DateDeceased?: string | null;
  IsFamilyHead: boolean;
  RelationalType?: number;
  FamilyHeadId?: string;
  VillageId: number;
  IsPregnant: boolean;
  IsDeleted: boolean;
  IsSynced?: boolean;
  OnlineDbOid?: string;
  CreatedBy: string;
  ModifiedBy?: string;
}
