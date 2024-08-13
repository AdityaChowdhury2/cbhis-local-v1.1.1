export interface TypeDevice {
  data: any[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}
export interface TypeDeviceData {
    oid: number;
    description: string;
    imeiNumber: string;
    createdBy?: string;
    dateCreated?: string;
    modifiedBy?: any;
    dateModified?: any;
    isDeleted: boolean;
    isSynced?: boolean;
  }