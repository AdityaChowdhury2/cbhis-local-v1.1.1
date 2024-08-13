import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminPageRoutingModule } from './admin-routing.module';

import { SharedModule } from 'src/app/shared/shared.module';
import { AdminPage } from './admin.page';
import { AdminMenuComponent } from './components/admin-menu/admin-menu.component';
import { CreateUserWizardComponent } from './components/create-user-wizard/create-user-wizard.component';
import { EducationLevelsComponent } from './pages/education-levels/education-levels.component';
import { OccupationsComponent } from './pages/occupations/occupations.component';
import { UsersComponent } from './pages/users/users.component';
import { ZonesComponent } from './pages/zones/zones.component';
import { AddZoneWizardComponent } from './components/add-zone-wizard/add-zone-wizard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminPageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AdminPage,
    AdminMenuComponent,
    UsersComponent,
    EducationLevelsComponent,
    OccupationsComponent,
    CreateUserWizardComponent,
    ZonesComponent,
    AddZoneWizardComponent,
  ],
})
export class AdminPageModule {}
