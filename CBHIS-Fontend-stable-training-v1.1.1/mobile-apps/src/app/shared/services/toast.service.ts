import { Injectable } from '@angular/core';
import { AlertController, AlertOptions, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController, private alertController: AlertController) {}

  async openToast(options: ToastOptions) {
    const defaultOptions: ToastOptions = {
      message: '',
      duration: 10000,
      position: 'bottom',
      translucent: false,
      animated: true,
    };

    const toastOptions = { ...defaultOptions, ...options };

    const toast = await this.toastController.create(toastOptions);
    await toast.present();
  }
  async openAlert(options: AlertOptions) {
    const defaultOptions: AlertOptions = {
      header: 'Alert',
      subHeader: '',
      message: '',
      buttons: ['OK'],
      backdropDismiss: false,
    };

    const alertOptions = { ...defaultOptions, ...options };

    const alert = await this.alertController.create(alertOptions);
    await alert.present();
  }
}
