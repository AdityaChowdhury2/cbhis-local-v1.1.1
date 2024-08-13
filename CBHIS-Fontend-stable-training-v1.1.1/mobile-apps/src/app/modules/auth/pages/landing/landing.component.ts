import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentLogin } from 'src/app/core/models/login-activity';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  user: CurrentLogin | null = {} as CurrentLogin;
  timeoutId: any;
  constructor(
    private authService: AuthService,
    private readonly _router: Router,
    private authStorageService: AuthStorageService
  ) {}

  async ngOnInit() {
    this.user = await this.authStorageService.getLoginStatus();
    console.log(this.user);
    if (this.user !== null) {
      if (this.authService.hasLoggedInWithinLastDay(this.user.login_time)) {
        console.log('User has logged in within the last day. Redirecting...');
        this._router.navigate(['/client']); // Change to your desired route
      } else {
        console.log('User login time is more than one day old. Logging out...');
        this.authService.logout();
        this._router.navigate(['/auth']);
      }
    }
  }
}
