export interface AssignedAppointment {
  TransactionId?: string;
  UserId: string;
  AppointmentType: string;
  AppointmentDate: string;
  Details?: string;
  ClientId: string;
  Status: number;
  Priority: number;
  IsDeleted?: boolean;
  IsSynced?: number;
  OnlineDbOid?: string;
}
