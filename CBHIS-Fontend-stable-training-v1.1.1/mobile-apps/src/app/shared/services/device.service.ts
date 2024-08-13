import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { DeviceInfo } from '../models/device-info';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor() {}

  async getDeviceInfoAsDescription() {
    const idInfo = await Device.getId();
    const generalInfo = await Device.getInfo();
    const batteryInfo = await Device.getBatteryInfo();
    const languageCode = await Device.getLanguageCode();
    const languageTag = await Device.getLanguageTag();

    return `
      DeviceId: ${idInfo}
      Model: ${generalInfo.model}
      Platform: ${generalInfo.platform}
      OS Version: ${generalInfo.osVersion}
      Manufacturer: ${generalInfo.manufacturer}
      Is Virtual: ${generalInfo.isVirtual}
      Battery Level: ${batteryInfo.batteryLevel}
      Is Charging: ${batteryInfo.isCharging}
      Language Code: ${languageCode.value}
      Language Tag: ${languageTag.value}
    `;
  }
  async getDeviceInfo(): Promise<DeviceInfo> {
    const idInfo = await Device.getId();
    const generalInfo = await Device.getInfo();
    const batteryInfo = await Device.getBatteryInfo();
    const languageCode = await Device.getLanguageCode();
    const languageTag = await Device.getLanguageTag();

    return {
      uuid: idInfo.identifier,
      model: generalInfo.model,
      platform: generalInfo.platform,
      osVersion: generalInfo.osVersion,
      manufacturer: generalInfo.manufacturer,
      isVirtual: generalInfo.isVirtual,
      languageCode: languageCode.value,
      languageTag: languageTag.value,
      isSynced: 'false',
    };
  }

  async getDeviceId() {
    return await Device.getId();
  }
}
