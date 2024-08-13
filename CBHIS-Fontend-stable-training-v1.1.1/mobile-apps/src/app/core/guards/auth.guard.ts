import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ToastService } from 'src/app/shared/services/toast.service';
import { AuthStorageService } from '../services/auth-storage.service';
import { AuthService } from '../services/auth.service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private storage: AuthStorageService,
    private toastService: ToastService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    try {
      const loginStatus: UserAccount | null = await this.storage.getCurrentLoginStatus();
      console.log('loginStatus:', loginStatus);

      if (!loginStatus) {
        console.info('Redirect to login page!');
        return this.router.createUrlTree(['/auth/sign-in'], {
          queryParams: { returnUrl: state.url },
        });
      }
      console.log(route.firstChild?.queryParamMap.get('individualId'));
      console.log('route ', route);
      console.log('familyId ', route.firstChild?.firstChild?.paramMap.get('familyId'));
      console.log('familyId ', route.firstChild?.queryParamMap.get('familyId'));
      const allowedRoutes = [
        '/client/settings',
        '/client/search',
        '/client/change-password',
        `/client/family-details/${
          route.firstChild?.firstChild?.paramMap.get('familyId') || route.firstChild?.paramMap.get('familyId')
        }`,
        `/client/service-points?familyId=${
          route.firstChild?.firstChild?.queryParamMap.get('familyId') || route.firstChild?.queryParamMap.get('familyId')
        }&individualId=${
          route.firstChild?.firstChild?.queryParamMap.get('individualId') ||
          route.firstChild?.queryParamMap.get('individualId')
        }`,
        '/admin/users',
      ];

      if (allowedRoutes.includes(state.url)) {
        console.log('allowed routes includes state url ,', state.url);
        return true;
      } else {
        console.log('allowed routes not includes state url ,', state.url);
        return this.router.createUrlTree(['/']);
      }
    } catch (error) {
      console.error('Error in canActivate:', error);
      // Handle errors gracefully, maybe redirect to an error page
      return this.router.createUrlTree(['/error']);
    }
  }
}
