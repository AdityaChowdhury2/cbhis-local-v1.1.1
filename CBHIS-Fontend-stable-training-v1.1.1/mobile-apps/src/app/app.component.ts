import { Component } from '@angular/core';
import { Device } from '@capacitor/device';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { Subscription } from 'rxjs';
import { NetworkService } from './shared/services/network.service';
import { ThemeService } from './shared/services/theme.service';
import { ToastService } from './shared/services/toast.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isService: boolean = false;
  capPlatform!: string;
  native: boolean = false;
  overlays: boolean = false;
  private networkStatusSubscription!: Subscription;

  constructor(private toaster: ToastService, private networkService: NetworkService, private theme: ThemeService) {}

  async ngOnInit() {
    dayjs.extend(utc);
    const info = await Device.getInfo();
    console.log(info.model);

    // this.toaster.openToast({
    //   message: 'Device Info: ' + info.model,
    //   position: 'top',
    //   duration: 1000,
    // });
    // this.networkStatusSubscription = this.networkService.networkStatus$.subscribe((status) => {
    //   console.log(status);
    //   if (status.connected) {
    //     this.toaster.openToast({
    //       message: `You are Online now`,
    //       position: 'bottom',
    //       duration: 1000,
    //     });
    //   } else {
    //     this.toaster.openToast({
    //       message: `You are Offline now`,
    //       position: 'bottom',
    //       duration: 1000,
    //     });
    //   }
    // });
  }

  // async initializeNetworkListener() {
  //   const status = await Network.getStatus();
  //   this.previousStatus = status;

  //   Network.addListener('networkStatusChange', async (status) => {
  //     if (this.hasNetworkStatusChanged(status)) {
  //       this.toaster.openToast({
  //         message: `Network status changed to ${status.connected ? 'online' : 'offline'}`,
  //       });
  //     }
  //     this.previousStatus = status;
  //   });
  // }

  // hasNetworkStatusChanged(currentStatus: any): boolean {
  //   if (!this.previousStatus) {
  //     return true;
  //   }
  //   return this.previousStatus.connected !== currentStatus.connected;
  // }

  // ngOnDestroy() {
  //   if (this.networkStatusSubscription) {
  //     this.networkStatusSubscription.unsubscribe();
  //   }
  // }
}
