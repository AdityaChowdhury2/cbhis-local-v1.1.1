export interface LogoutActivity {
  id: number;
  user_id: number;
  logout_time: string;
}

export interface LoginActivity {
  id: number;
  user_id: number | string;
  token: string;
  device_info?: string;
  ip_address?: string;
  login_time: string;
}

export interface CurrentLogin {
  id: number;
  user_id: number | string;
  token: string;
  login_time: string;
}

export interface UserLogin {
  oid: string;
  firstName: string;
  middleName: any;
  lastName: string;
  pin: string;
  cellphone: string;
  email: any;
  username: string;
  password: any;
  confirmPassword: any;
  userType: number;
  image: any;
  imeiNumber: string;
  isDeleted: boolean;
  assignedVillages: AssignedVillage[];
  assignedChiefdomList: any;
  assignedVillageList: any;
  assignedDeviceList: any;
  profilePicture: any;
}

export interface AssignedVillage {
  oid: number;
  villageId: number;
  village: any;
  rhmId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string;
  modifiedBy: any;
}
