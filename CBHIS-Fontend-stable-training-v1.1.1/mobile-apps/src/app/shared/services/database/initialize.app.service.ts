import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ApiResponseWithData } from '../../models/api-response';
import { DeviceInfo, DeviceInfoDto } from '../../models/device-info';
import { DbStorageService } from './db-storage.service';
import { SQLiteService } from './sqlite.service';

@Injectable()
export class InitializeAppService {
  // Local variables declaration
  isAppInit: boolean = false;
  platform!: string;
  dbName: string = environment.database.name;
  baseUrl: string = environment.baseUrl;

  // Constructor to inject services
  constructor(
    private sqliteService: SQLiteService,
    private storageService: DbStorageService,
    private http: HttpClient,
    private _platform: Platform,
    private router: Router
  ) {}

  // Function to initialize the app
  async initializeApp() {
    // this._platform.ready().then(() => {
    //   this._platform.backButton.subscribeWithPriority(10, () => {
    //     // Handle the back button event
    //     if (this.router.url === '/auth/sign-in') {
    //       // Prevent going back to the login page
    //       navigator;
    //     } else {
    //       // Navigate back normally
    //       this.navCtrl.pop();
    //     }
    //   });
    // });

    await this.sqliteService.initializePlugin().then(async (res) => {
      this.platform = this.sqliteService.platform;
      try {
        if (this.sqliteService.platform === 'web') {
          await this.sqliteService.initWebStore();
        }

        // Initialize the CBHIS database;
        await this.storageService.initializeDatabase(this.dbName);

        // delete database
        // await this.storageService.deleteDatabase();

        if (this.sqliteService.platform === 'web') {
          await this.sqliteService.saveToStore(this.dbName);
        }

        this.isAppInit = true;
        // await this.initializeDeviceOnOnline();
      } catch (error) {
        console.log(`initializeAppError: ${error}`);
      }
    });
  }

  async initializeDeviceOnOnline() {
    console.log('initialize device');
    let device: DeviceInfo | undefined = await this.storageService.getDeviceInfo();

    if (device?.isSynced === 'false') {
      let deviceObject: DeviceInfoDto = {
        iMEINumber: device.uuid,
        identifiedDescription: 'Device Info',
        description: `DeviceId: ${device.uuid}|Model: ${device.model}|Platform: ${device.platform}|OS Version: ${device.osVersion}|Manufacturer: ${device.manufacturer}|Is Virtual: ${device.isVirtual}|Battery Level: ${device.batteryLevel}|Is Charging: ${device.isCharging}|Language Code: ${device.languageCode}|Language Tag: ${device.languageTag}
                  `,
      };
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'No-Auth': 'True',
        Authorization: 'Bearer Jl7Fl8Ee64w=',
      });
      this.http
        .post<ApiResponseWithData<DeviceInfoDto>>(`${this.baseUrl}device`, JSON.stringify(deviceObject), { headers })
        .subscribe(
          (response: ApiResponseWithData<DeviceInfoDto>) => {
            if (response.isSuccess) {
              console.log('API call successful:', response.data);
              if (device != undefined) {
                this.storageService.updateDeviceInfo(device.uuid);
              }
            } else {
              console.error('API call failed:', response.message);
              // Handle failure scenario
            }
          },
          (error) => {
            console.error('API call error:', error);
            // Handle error scenario
          }
        );
    }
  }
}
