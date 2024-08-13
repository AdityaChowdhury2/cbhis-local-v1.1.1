import { Injectable } from '@angular/core';
import { ModalController, ModalOptions, PopoverController, PopoverOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private modalController: ModalController, private popoverController: PopoverController) {}

  async presentModal(options: ModalOptions) {
    const modal = await this.modalController.create(options);
    await modal.present();
    return await modal;
  }

  async dismissModal(data?: any, role?: string) {
    return await this.modalController.dismiss(data, role);
  }

  async presentPopover(options: PopoverOptions) {
    const popover = await this.popoverController.create({
      ...options,
      translucent: true,
    });
    return await popover.present();
  }

  async dismissPopover() {
    return await this.popoverController.dismiss();
  }
}
