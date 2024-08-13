import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthPage } from './auth.page';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { TwoStepsComponent } from './pages/two-steps/two-steps.component';

const routes: Routes = [
  {
    path: '',
    component: AuthPage,
    children: [
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
      // { path: 'landing', component: LandingComponent },
      { path: 'sign-in', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'new-password', component: NewPasswordComponent },
      { path: 'two-steps', component: TwoStepsComponent },
      { path: '**', redirectTo: 'landing', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}
