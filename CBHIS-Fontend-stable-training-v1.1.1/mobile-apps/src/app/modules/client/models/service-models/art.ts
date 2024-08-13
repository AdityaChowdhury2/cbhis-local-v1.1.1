export interface ARTClient {
  TransactionId?: string;
  ClientId: string;
  MedicationSideEffect?: number | null;
  IsOnTBPrevention?: boolean;
  WellbeingIssues?: string | null;
  IsDeleted: boolean;
  CreatedBy: string;
  MatchId?: string;
  CreateAt?: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}
