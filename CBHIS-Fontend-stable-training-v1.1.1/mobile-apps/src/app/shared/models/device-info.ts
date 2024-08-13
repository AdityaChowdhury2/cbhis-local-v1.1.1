export interface DeviceInfo {
  uuid: string;
  model: string;
  platform: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  languageCode: string;
  languageTag: string;
  isSynced: string;
}
export interface DeviceInfoDto {
  iMEINumber: string;
  description: string;
  identifiedDescription: string;
}
