import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterLink } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { LeftSidebarComponent } from './components/left-sidebar/left-sidebar.component';
import { LogoComponent } from './components/logo/logo.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RightNavbarComponent } from './components/right-navbar/right-navbar.component';
import { UserProfileBtnComponent } from './components/user-profile-btn/user-profile-btn.component';
import { UserSettingsPopoverComponent } from './components/user-settings-popover/user-settings-popover.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterLink],
  exports: [UserProfileBtnComponent, LeftSidebarComponent, RightNavbarComponent, FooterComponent, LogoComponent],
  declarations: [
    UserProfileBtnComponent,
    LeftSidebarComponent,
    NavbarComponent,
    RightNavbarComponent,
    FooterComponent,
    LogoComponent,
    UserSettingsPopoverComponent,
  ],
})
export class SharedModule {}
