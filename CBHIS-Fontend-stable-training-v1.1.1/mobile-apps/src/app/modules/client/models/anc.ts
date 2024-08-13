export interface ANC {
  TransactionId?: string;
  ClientId: string;
  IsCounselled: boolean;
  IsANCInitiated: boolean;
  IsMalariaDrugTaken: boolean;
  FrequencyOfMalariaTherapy: number;
  IsDeleted: boolean;
  OnlineDbOid?: string;
  CreatedBy: string;
  ModifiedBy?: string;
}
