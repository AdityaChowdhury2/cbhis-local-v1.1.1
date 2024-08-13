import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ClientPage } from './client.page';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { FamilyDetailsComponent } from './pages/family-details/family-details.component';
import { SearchComponent } from './pages/search/search.component';
import { ServicePointsComponent } from './pages/service-points/service-points.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: ClientPage,
    children: [
      {
        path: '',
        redirectTo: 'settings',
        pathMatch: 'full',
      },
      { path: 'settings', component: SettingsComponent },
      {
        path: 'service-points',
        component: ServicePointsComponent,
      },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'search', component: SearchComponent },
      { path: 'family-details/:familyId', component: FamilyDetailsComponent },
    ],
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientPageRoutingModule {}
