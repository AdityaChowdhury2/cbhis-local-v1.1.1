import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { DashboardPage } from './dashboard.page';
import { IndividualDetailsComponent } from './pages/individual-details/individual-details.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [{ path: 'individual-details', component: IndividualDetailsComponent }],
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
