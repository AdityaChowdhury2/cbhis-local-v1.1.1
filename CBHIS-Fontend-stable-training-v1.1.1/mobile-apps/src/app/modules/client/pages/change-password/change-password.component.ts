import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { isPlatform } from '@ionic/angular';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { confirmPasswordValidator } from 'src/app/core/utils/confirm-password.validator';
import { OnlineUser } from 'src/app/modules/auth/models/user';
import { UserStorageService } from 'src/app/modules/auth/services/user-storage.service';
import { ApiResponseWithData } from 'src/app/shared/models/api-response';
import { ToastService } from 'src/app/shared/services/toast.service';
import { environment } from 'src/environments/environment';
import { ChangePassword } from './../../models/change-password';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  // Local Variables Declaration
  isKeyboardOpen = false;
  baseUrl: string = environment.baseUrl;
  isShowPassword: boolean = false;
  isCurrentPasswordShow: boolean = false;
  isNewPasswordShow: boolean = false;

  form: FormGroup = new FormGroup(
    {
      // UserName: new FormControl('', [Validators.required]),
      Password: new FormControl('', [Validators.required]),
      NewPassword: new FormControl('', [Validators.required]),
      ConfirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: [confirmPasswordValidator] }
  );

  constructor(
    private http: HttpClient,
    private authStorageService: AuthStorageService,
    private userStorageService: UserStorageService,
    private toaster: ToastService,
    private authService: AuthService,
    private router: Router
  ) {}

  get confirmPasswordError(): string | null {
    if (this.form.hasError('passwordMismatch')) {
      return 'New password and Confirm password must be same.';
    }
    return null;
  }

  ngOnInit() {
    // if platform is not web then listen for keyboard open and close events
    if (isPlatform('capacitor')) {
      Keyboard.addListener('keyboardWillShow', () => {
        this.isKeyboardOpen = true;
      });

      Keyboard.addListener('keyboardWillHide', () => {
        this.isKeyboardOpen = false;
      });
    }

    // this.authStorageService.getCurrentLoginStatus().then((data) => {
    //   this.form.get('username')?.setValue(data?.Username);
    // });
  }

  // * On submit
  async onSubmit() {
    console.log(this.form.value);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True',
      Authorization: 'Bearer Jl7Fl8Ee64w=',
    });

    if (this.form.valid) {
      // get login user data
      const currentUser = await this.userStorageService.findLastCreatedUser();

      // if user is not logged in then show error message
      if (!currentUser) {
        this.toaster.openToast({
          message: 'You are not logged in. Please login first.',
          position: 'bottom',
          duration: 1000,
          color: 'danger',
        });
        return;
      }

      let formPayload: ChangePassword = {
        username: currentUser?.Username || '',
        password: this.form.get('Password')?.value,
        newpassword: this.form.get('NewPassword')?.value,
        confirmpassword: this.form.get('ConfirmPassword')?.value,
      };

      this.http
        .post<ApiResponseWithData<OnlineUser>>(
          `${this.baseUrl}user-account/update-password`,
          JSON.stringify(formPayload),
          { headers }
        )
        .subscribe((res) => {
          console.log('change password ====>', res);
          if (res.isSuccess) {
            this.toaster.openToast({
              message: 'Password changed successfully!',
              position: 'bottom',
              duration: 1000,
              color: 'success',
            });
            this.logout();
            // Update the password in user storage
            this.userStorageService.updateUserPassword(currentUser?.Username, formPayload.newpassword).then(() => {
              console.log('Password updated locally');
            });
          } else {
            this.toaster.openToast({
              message: res.message,
              position: 'bottom',
              duration: 1000,
              color: 'danger',
            });
          }
        });
    }
  }

  passwordShow() {
    this.isShowPassword = !this.isShowPassword;
  }
  currentPassword() {
    this.isCurrentPasswordShow = !this.isCurrentPasswordShow;
  }
  newPassword() {
    this.isNewPasswordShow = !this.isNewPasswordShow;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['auth/sign-in']);
  }

  ngOnDestroy() {
    if (isPlatform('capacitor')) {
      Keyboard.removeAllListeners();
    }
  }
}
