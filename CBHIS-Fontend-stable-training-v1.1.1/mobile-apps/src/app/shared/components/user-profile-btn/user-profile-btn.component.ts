import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover } from '@ionic/angular/common';
import { AuthService } from 'src/app/core/services/auth.service';

import { UserAccount } from 'src/app/modules/auth/models/user';
import { UserType } from 'src/app/modules/client/enums/user.enum';
import { ModalService } from '../../services/modal.service';
import { UserSettingsPopoverComponent } from '../user-settings-popover/user-settings-popover.component';

@Component({
  selector: 'app-user-profile-btn',
  templateUrl: './user-profile-btn.component.html',
  styleUrls: ['./user-profile-btn.component.scss'],
})
export class UserProfileBtnComponent implements OnInit {
  @ViewChild('popover') popover: IonPopover = {} as IonPopover;
  userName: string = '';
  designation: string = '';
  userRole: { [key: string]: string } = {
    [UserType.SystemAdministrator]: 'Admin',
    [UserType.Supervisor]: 'Supervisor',
    [UserType.RHM]: 'RHM',
  };

  user: UserAccount = {} as UserAccount;

  constructor(
    private popOverService: ModalService,

    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    try {
      const user = this.authService.getCurrentUser().subscribe((user) => {
        if (user) {
          this.user = user;
          this.userName = user.Username;
          this.designation = this.userRole[user.UserType];
        }
      });
    } catch (error) {
      console.log('Load current user error:', error);
    }
  }

  isOpen = false;

  presentPopover(e: Event) {
    this.popOverService.presentPopover({
      component: UserSettingsPopoverComponent,
      event: e,
      cssClass: 'user-settings-popover',
      mode: 'ios',
      componentProps: {
        userName: this.userName,
        designation: this.designation,
      },
    });
  }

  closePopover() {
    this.popOverService.dismissPopover();
  }
}
