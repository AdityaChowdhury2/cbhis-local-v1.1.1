import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ChangePasswordWizardComponent } from 'src/app/modules/client/components/modals/change-password-wizard/change-password-wizard.component';
import { LanguageService } from '../../services/language.service';
import { ModalService } from '../../services/modal.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-user-settings-popover',
  templateUrl: './user-settings-popover.component.html',
  styleUrls: ['./user-settings-popover.component.scss'],
})
export class UserSettingsPopoverComponent implements OnInit {
  @Input() userName!: string;
  @Input() designation!: string;
  text = {};

  constructor(
    private theme: ThemeService,
    private authService: AuthService,
    private router: Router,
    private popoverService: ModalService,
    public languageService: LanguageService
  ) {}

  ngOnInit() {
    console.log(this.userName, this.designation);
  }

  // changeLanguage() {
  //   this.languageService.toggleLanguage();

  //   this.text = this.languageService.test();

  //   console.log('text ==>', this.text);
  // }

  // * for logout a user
  async logout() {
    await this.authService.logout();
    this.router.navigate(['auth/sign-in']);
    this.closePopover();
  }

  // * for close the popover
  closePopover() {
    this.popoverService.dismissPopover();
  }

  // * for changing password
  onChangePasswordClick() {
    // this.router.navigate(['client/change-password']);
    this.closePopover();
    this.popoverService.presentModal({
      component: ChangePasswordWizardComponent,
      cssClass: 'change-password-modal',
    });
  }

  // * for change theme
  changeTheme(name: string) {
    console.log('name', name);
    this.theme.setTheme(name);
  }
}
