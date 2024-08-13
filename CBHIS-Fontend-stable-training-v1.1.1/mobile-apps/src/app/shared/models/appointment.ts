export interface AppointmentResponse {
  isSuccess: boolean;
  data: AppointmentData[];
  message: any;
}

export interface AppointmentData {
  oid: number;
  appointmentType: string;
  details: string;
  appointmentDate: string;
  status: number;
  priority: number;
  userId: string;
  clientId: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: any;
  clients: Client[];
}

export interface Client {
  oid: string;
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  dob: string;
  sex: number;
  maritalStatus: number;
  educationLevel: number;
  occupation: string;
  hasBirthCertificate: boolean;
  isDisabled: boolean;
  isDeceased: boolean;
  dateDeceased: any;
  isFamilyHead: boolean;
  relationalType: number;
  familyHeadId?: string;
  villageId: number;
  pin: string;
  cellphone: string;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: any;
}
