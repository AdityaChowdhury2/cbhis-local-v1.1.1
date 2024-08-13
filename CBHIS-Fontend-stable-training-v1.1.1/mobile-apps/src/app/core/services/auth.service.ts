import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ApiResponse, ApiResponseWithData } from 'src/app/shared/models/api-response';
import { environment } from 'src/environments/environment';
import { Login } from '../models/login';
import { UserLogin } from '../models/login-activity';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url: string = environment.baseUrl;
  // Add a BehaviorSubject to hold the current user data
  private currentUserSubject: BehaviorSubject<UserAccount | null> = new BehaviorSubject<UserAccount | null>(null);
  public currentUser: Observable<UserAccount | null> = this.currentUserSubject.asObservable();

  constructor(private httpClient: HttpClient, private authStorageService: AuthStorageService) {}
  hasLoggedInWithinLastDay(login_time: string): boolean {
    const currentTime = new Date();
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    let loginTime = new Date(login_time);

    return currentTime.getTime() - loginTime.getTime() < oneDayInMilliseconds;
  }
  login(resource: Login): Observable<ApiResponseWithData<UserLogin>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True',
      Authorization: 'Bearer Jl7Fl8Ee64w=',
    });

    return this.httpClient
      .post<any>(`${this.url}rhm-user-account/login`, JSON.stringify(resource), {
        headers,
      })
      .pipe(
        map((result: ApiResponseWithData<UserLogin>) => {
          console.log('api response', result);

          if (result.isSuccess === true) {
            // this.handleLoginSuccess(result.data);
            return result;
          } else {
            return result ?? ({} as ApiResponse); // Add a default return statement
          }
        }),
        catchError((error) => {
          console.log('Login Error:', error);
          return throwError(error);
        })
      );
  }

  async handleLoginSuccess(user: UserAccount) {
    if (user?.Oid) {
      await this.authStorageService.currentLoginInfo({
        id: 0,
        user_id: user.Oid,
        token: 'token',
        login_time: new Date().toISOString(),
      });
      this.currentUserSubject.next(user as UserAccount);
    }
    // await this.authStorageService.addLoginInfo({
    //   id: 0,
    //   user_id: user.id,
    //   token: 'token',
    //   status: true,
    //   device_info: 'Web Browser',
    //   ip_address: '',
    //   login_time: new Date().toISOString(),
    // } as LoginActivity);
  }

  async logout() {
    try {
      let currentLoginUser = await this.authStorageService.getCurrentLoginStatus();

      console.log('Current login user ', currentLoginUser);
      if (currentLoginUser?.Oid) {
        //   await this.authStorageService.addLogoutInfo({
        //     user_id: currentLoginUser.id,
        //     logout_time: new Date().toISOString(),
        //   } as LogoutActivity);
        await this.authStorageService.deleteCurrentLoginUser(currentLoginUser.Oid);
      }
      // Update the currentUserSubject with a null value
      this.currentUserSubject.next(null);
    } catch (error) {
      console.log('Error during logout:', error);
      // Handle error (e.g., show a toast notification)
    }
  }

  getCurrentUser(): Observable<UserAccount | null> {
    this.authStorageService.getCurrentLoginStatus().then((user) => {
      if (user) {
        this.currentUserSubject.next(user);
      }
    });
    return this.currentUser;
  }

  // async getCurrentUser(): Promise<User | null> {
  //   try {
  //     let currentLoginUser = await this.authStorageService.getCurrentLoginStatus();
  //     return currentLoginUser;
  //   } catch (error) {
  //     console.log('Error getting current user:', error);
  //     return null;
  //   }
  // }
}
