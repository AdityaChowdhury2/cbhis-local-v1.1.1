import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { AdminPage } from './admin.page';
import { EducationLevelsComponent } from './pages/education-levels/education-levels.component';
import { OccupationsComponent } from './pages/occupations/occupations.component';
import { UsersComponent } from './pages/users/users.component';
import { ZonesComponent } from './pages/zones/zones.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'occupations', component: OccupationsComponent },
      { path: 'education-levels', component: EducationLevelsComponent },
      { path: 'zones', component: ZonesComponent },
    ],
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
