import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';

import { SharedModule } from 'src/app/shared/shared.module';

import { LeftSidebarMenuComponent } from './components/left-sidebar-menu/left-sidebar-menu.component';
import { AncCounselingForPregnancyWizardComponent } from './components/modals/anc-counseling-for-pregnancy-wizard/anc-counseling-for-pregnancy-wizard.component';

import { IndividualDetailsComponent } from './pages/individual-details/individual-details.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DashboardPageRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [
    DashboardPage,
    LeftSidebarMenuComponent,
    IndividualDetailsComponent,
    AncCounselingForPregnancyWizardComponent,
  ],
})
export class DashboardPageModule {}
