// export interface User extends BaseEntity {
//   firstname: string;
//   surname: string;
//   dob: string;
//   sex: number;
//   designation: string;
//   contactaddress: string;
//   countrycode: string;
//   cellphone: string;
//   isaccountactive: number;
//   username: string;
//   password: string;
//   usertype: number;
//   devicetoken?: string;
// }

// export interface OnlineUser {
//   assignedChiefdomList: any;
//   assignedDeviceList: any;
//   assignedVillageList: any;
//   cellphone: string;
//   confirmPassword: string;
//   email: string;
//   firstName: string;
//   image: string | null;
//   imeiNumber: string;
//   isDeleted: boolean;
//   lastName: string;
//   middleName: string;
//   oid: string;
//   password: string;
//   pin: string;
//   profilePicture: string | null;
//   userType: number;
//   username: string;
// }
export interface UserAccount {
  Oid: string;
  FirstName: string;
  MiddleName?: string; // Optional field
  LastName: string;
  PIN: string;
  Cellphone: string;
  Email?: string; // Optional field
  Username: string;
  Password: string;
  ConfirmPassword?: string;
  UserType: number;
  Image?: string; // Optional field
  IMEINumber?: string; // Optional field
  IsDeleted: boolean;
  AssignedVillages?: any; // Optional field
  AssignedChiefdomList?: number[]; // Optional field
  AssignedVillageList?: number[]; // Optional field
  AssignedDeviceList?: number[]; // Optional field
  ProfilePicture?: ProfilePicture; // Optional field
  OnlineDbOid: string; // Optional field
  IsSynced?: boolean;
}
export interface ProfilePicture {
  // Define the properties of ProfilePicture based on your C# class
  // For example:
  url: string;
  altText?: string;
}

export interface OnlineUser {
  oid: string;
  firstName: string;
  middleName: any;
  lastName: string;
  pin: string;
  cellphone: string;
  email: any;
  username: string;
  password: string;
  confirmPassword: any;
  userType: number;
  isDeleted: boolean;
  assignedChiefdoms: any;
  assignedVillages: any;
  assignedDevices: any;
  profilePicture: any;
  assignedChiefdomList: any;
  assignedVillageList: any;
  assignedVillageListString: any;
  assignedDeviceList: any;
  createdBy: string;
  modifiedBy: any;
  // oid: number;
  // firstName: string;
  // middleName?: string;
  // lastName: string;
  // pin: string;
  // cellphone: string;
  // email?: any;
  // username: string;
  // password: string;
  // confirmPassword?: any;
  // userType: number;
  // isDeleted: boolean;
  // images: any;
  // assignedChiefdoms?: any;
  // assignedVillages?: any;
  // assignedDevices?: any;
  // profilePicture?: any;
  // assignedChiefdomList?: any;
  // assignedVillageList?: any;
  // assignedVillageListString?: any;
  // assignedDeviceList?: any;
  // createdBy?: string;
  // modifiedBy?: any;
}
