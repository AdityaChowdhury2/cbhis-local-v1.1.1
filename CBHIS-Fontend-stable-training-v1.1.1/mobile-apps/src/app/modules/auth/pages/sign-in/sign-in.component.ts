import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { AlertButton, isPlatform } from '@ionic/angular';
import { Login } from 'src/app/core/models/login';
import { CurrentLogin } from 'src/app/core/models/login-activity';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiResponseWithData } from 'src/app/shared/models/api-response';
import { DeviceInfoDto } from 'src/app/shared/models/device-info';
import { DbStorageService } from 'src/app/shared/services/database/db-storage.service';
import { DeviceService } from 'src/app/shared/services/device.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { NetworkService } from 'src/app/shared/services/network.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { isEnglish } from 'src/app/shared/utils/common';
import { encryptedTo } from 'src/app/shared/utils/encryption';
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../../services/user-storage.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  // Local variables declaration
  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  submitted = false;
  isLoading: boolean = false;
  isKeyboardOpen = false;
  isShowPassword = false;
  uuid: string = '';
  isDeviceDataSend: boolean = false;
  uniqueIdentifier: string = '';
  baseUrl: string = environment.baseUrl;
  english = isEnglish;

  constructor(
    private authService: AuthService,
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router,
    private route: ActivatedRoute,
    private readonly toaster: ToastService,
    private userStorageService: UserStorageService,
    private authStorageService: AuthStorageService,
    private deviceService: DeviceService,
    private http: HttpClient,
    private storageService: DbStorageService,
    private networkService: NetworkService,
    private languageService: LanguageService
  ) {
    // Bind this to onAlertSubmit
    this.onAlertSubmit = this.onAlertSubmit.bind(this);
  }

  alertButtons: AlertButton[] = [
    // { text: 'Cancel', role: 'cancel' },
    {
      text: 'Tfumela',
      cssClass: 'alert-button-confirm',
      handler: (data) => {
        console.log(data['device-name']);
        this.uniqueIdentifier = data?.['device-name'];
        if (data['device-name']) {
          this.onAlertSubmit();
          return true;
        } else {
          return false;
        }
      },
    },
  ];

  // ngOnInit lifecycle hook to initialize the form and check login status
  async ngOnInit() {
    this.languageService.languageObservable$.subscribe((data) => {
      this.english = data;
    });

    // if platform is not web then listen for keyboard open and close events
    if (isPlatform('capacitor')) {
      Keyboard.addListener('keyboardDidShow', () => {
        this.isKeyboardOpen = true;
      });

      Keyboard.addListener('keyboardDidHide', () => {
        this.isKeyboardOpen = false;
      });
    }

    const device = await this.deviceService.getDeviceId();

    // Get device data

    this.storageService.getDeviceInfoByUuid(device.identifier).then((device) => {
      console.log('storage service device info --->', device);
      console.log('This. device data send =>>>>', this.isDeviceDataSend);
      if (device?.isSynced === 'false') {
        this.isDeviceDataSend = false;
      } else if (device?.isSynced === 'true') {
        this.isDeviceDataSend = true;
      } else {
        this.isDeviceDataSend = false;
      }
      if (!this.isDeviceDataSend) {
        this.toaster.openAlert({
          header: 'Yetsa umshina Ligama',
          inputs: [
            {
              name: 'device-name',
              type: 'text',
              placeholder: 'Faka ligama lemshina',
              cssClass: 'custom-alert-input',
            },
          ],
          cssClass: 'custom-alert',
          buttons: this.alertButtons,
        });
      }
    });

    // Check if user is already logged in
    let user: CurrentLogin | null = await this.authStorageService.getLoginStatus();

    if (user != null) {
      // Redirect user based on their last login time
      if (this.authService.hasLoggedInWithinLastDay(user.login_time)) {
        console.log('User has logged in within the last day. Redirecting...');
        this._router.navigate(['/client/settings']); // Change to your desired route
      } else {
        console.log('User login time is more than one day old. Logging out...');
        this.authService.logout();
        this._router.navigate(['/auth']); // Redirect to login page
      }
    }
  }

  openSendDeviceDataAlert() {
    this.toaster.openAlert({
      header: 'Send Device Information',
      inputs: [
        {
          name: 'device-name',
          type: 'text',
          placeholder: 'Enter Your Full Name',
          cssClass: 'custom-alert-input',
        },
      ],
      cssClass: 'custom-alert',
      buttons: this.alertButtons,
    });
  }

  async onAlertSubmit() {
    console.log(this.uniqueIdentifier);
    const device = await this.deviceService.getDeviceInfo();
    console.log(device);

    let deviceObject: DeviceInfoDto = {
      iMEINumber: device.uuid,
      identifiedDescription: this.uniqueIdentifier,
      description: `DeviceId: ${device.uuid}|Model: ${device.model}|Platform: ${device.platform}|OS Version: ${device.osVersion}|Manufacturer: ${device.manufacturer}|Is Virtual: ${device.isVirtual}|Battery Level: ${device.batteryLevel}|Is Charging: ${device.isCharging}|Language Code: ${device.languageCode}|Language Tag: ${device.languageTag}
                  `,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True',
      Authorization: 'Bearer Jl7Fl8Ee64w=',
    });
    if (this.uniqueIdentifier !== '') {
      const isConnected = (await this.networkService.getCurrentNetworkStatus()).connected;
      // this.http.options();
      if (isConnected) {
        this.http
          .post<ApiResponseWithData<DeviceInfoDto>>(`${this.baseUrl}device`, JSON.stringify(deviceObject), { headers })
          .subscribe(
            (response: ApiResponseWithData<DeviceInfoDto>) => {
              if (response != undefined) {
                this.storageService.updateDeviceInfo(device.uuid);
              }
              if (response.isSuccess) {
                console.log('API call successful:', response.data);
                this.toaster.openToast({
                  message: 'Device information sent successfully',
                  duration: 1000,
                  position: 'bottom',
                  translucent: false,
                  animated: true,
                  color: 'success',
                });
              } else {
                console.error('API call failed:', response.message);
                // Handle failure scenario
                this.toaster.openToast({
                  message: response.message,
                  duration: 1000,
                  position: 'bottom',
                  translucent: false,
                  animated: true,
                  color: 'danger',
                });
              }
            },
            (error) => {
              if (error instanceof HttpErrorResponse) {
                // throw new HttpErrorResponse({ error });
                console.log(error);
                this.toaster.openToast({
                  // message: `${JSON.stringify(error)}`,
                  message: 'HTTP Server Error',
                  // message: 'Please Check Your Internet Connection and Restart the App',
                  duration: 1000,
                  position: 'bottom',
                  color: 'danger',
                });
              }
            }
          );
      } else
        this.toaster.openToast({
          message: 'Please Check Your Internet Connection and Restart the App',
          duration: 1000,
          position: 'bottom',
          color: 'danger',
        });
    }
  }
  // async onAlertSubmit() {
  //   console.log(this.uniqueIdentifier);
  //   const device = await this.deviceService.getDeviceInfo();
  //   console.log(device);

  //   let deviceObject: DeviceInfoDto = {
  //     iMEINumber: device.uuid,
  //     identifiedDescription: this.uniqueIdentifier,
  //     description: `DeviceId: ${device.uuid}|Model: ${device.model}|Platform: ${device.platform}|OS Version: ${device.osVersion}|Manufacturer: ${device.manufacturer}|Is Virtual: ${device.isVirtual}|Battery Level: ${device.batteryLevel}|Is Charging: ${device.isCharging}|Language Code: ${device.languageCode}|Language Tag: ${device.languageTag}
  //                 `,
  //   };
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'No-Auth': 'True',
  //     Authorization: 'Bearer Jl7Fl8Ee64w=',
  //   });
  //   if (this.uniqueIdentifier !== '') {
  //     const isConnected = (await this.networkService.getCurrentNetworkStatus()).connected;
  //     this.http
  //       .post<ApiResponseWithData<DeviceInfoDto>>(`${this.baseUrl}device`, JSON.stringify(deviceObject), { headers })
  //       .subscribe(
  //         (response: ApiResponseWithData<DeviceInfoDto>) => {
  //           if (response != undefined) {
  //             this.storageService.updateDeviceInfo(device.uuid);
  //           }
  //           if (response.isSuccess) {
  //             console.log('API call successful:', response.data);
  //             this.toaster.openToast({
  //               message: 'Device information sent successfully',
  //               duration: 1000,
  //               position: 'bottom',
  //               translucent: false,
  //               animated: true,
  //               color: 'success',
  //             });
  //           } else {
  //             console.error('API call failed:', response.message);
  //             // Handle failure scenario
  //             this.toaster.openToast({
  //               message: response.message,
  //               duration: 1000,
  //               position: 'bottom',
  //               translucent: false,
  //               animated: true,
  //               color: 'danger',
  //             });
  //           }
  //         },
  //         (error) => {
  //           console.error('API call error:', error);
  //           // Handle error scenario
  //         }
  //       );
  //   }
  // }

  async onSubmit() {
    await this.userStorageService.getUsers();
    // Check if form is valid
    this.isLoading = true;

    if (this.form.valid) {
      let formValue: Login = this.form.value;

      const isOnline = await this.networkService.getCurrentNetworkStatus();

      if (isOnline?.connected) {
        try {
          await this.onlineLogin(formValue);
        } catch (error) {
          console.log('online login error', error);
        } finally {
          this.isLoading = false;
        }
      } else {
        try {
          await this.offlineLogin(formValue);
        } catch (error) {
          console.log('Offline login error', error);
        } finally {
          this.isLoading = false;
        }
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  async onlineLogin(formValue: Login) {
    this.authService
      .login({
        ...formValue,
        password: encryptedTo(formValue?.password),
        // imeiNumber: 'ac8b5ef47025491c',
        // imeiNumber: '90a6f673-f88a-4e92-b3dc-af5c553c8120', // aditya device aditya 12345678
        imeiNumber: (await this.deviceService.getDeviceId()).identifier,
      })
      .subscribe(async (res) => {
        // Handle successful login
        if (res?.data) {
          const user = {
            Oid: res?.data?.oid,
            FirstName: res?.data?.firstName,
            LastName: res?.data?.lastName,
            MiddleName: res?.data?.middleName,
            PIN: res?.data?.pin,
            Cellphone: res?.data?.cellphone,
            Email: res?.data?.email,
            Username: res?.data?.username,
            Password: encryptedTo(formValue?.password),
            ConfirmPassword: res?.data?.confirmPassword,
            UserType: res?.data?.userType,
            Image: res?.data?.image,
            IMEINumber: res?.data?.imeiNumber,
            IsDeleted: res?.data?.isDeleted,
            AssignedVillages: JSON.stringify(res?.data?.assignedVillages),
            OnlineDbOid: res?.data?.oid,
          };

          // first delete the existing user from the offline db, cause we don't want to store multiple users, which can cause issues while offline login
          await this.userStorageService.deleteAllUser();

          // then add the new user to the offline db
          await this.userStorageService.addUser(user);

          // get the last created user to save the current login
          const lastUser = await this.userStorageService.findLastCreatedUser();

          // save the current login
          this.isLoading = false;

          // Handle successful login
          if (lastUser?.Oid) {
            await this.authService.handleLoginSuccess(lastUser);
            this.toaster.openToast({
              message: 'Login successful',
              duration: 1000,
              position: 'bottom',
              translucent: false,
              animated: true,
              color: 'success',
            });
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/client';
            this._router.navigateByUrl(returnUrl, { replaceUrl: true });
            this.form.reset();
          }
        } else {
          this.isLoading = false;

          // Handle login failure
          this.toaster.openToast({
            message: 'Invalid credentials or device has no permission to login',
            duration: 1000,
            position: 'bottom',
            translucent: false,
            animated: true,
            color: 'danger',
          });
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/client';
          this._router.navigateByUrl(returnUrl, { replaceUrl: true });
          this.form.reset();
        }
      });
  }

  async offlineLogin(formValue: Login) {
    const user = await this.userStorageService.isValidUser(
      formValue.username.trim(),
      encryptedTo(formValue.password.trim())
    );

    if (user?.Oid) {
      // save the current login
      this.isLoading = false;

      // save user to current login
      await this.authService.handleLoginSuccess(user);

      // show login toast
      this.toaster.openToast({
        message: 'Login successful',
        duration: 1000,
        position: 'bottom',
        translucent: false,
        animated: true,
        color: 'success',
      });
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/client';
      this._router.navigateByUrl(returnUrl, { replaceUrl: true });
      this.form.reset();
    } else {
      this.isLoading = false;

      // Handle login failure
      this.toaster.openToast({
        message: 'Invalid credentials or device has no permission to login',
        duration: 1000,
        position: 'bottom',
        translucent: false,
        animated: true,
        color: 'danger',
      });
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/client';
      this._router.navigateByUrl(returnUrl, { replaceUrl: true });
      this.form.reset();
    }
  }

  // Function to handle form submission
  // async _onSubmit() {
  //   // Check if form is valid
  //   this.isLoading = true;
  //   if (this.form.valid) {
  //     let formValue: Login = this.form.value;

  //     // Validate user credentials
  //     const validUser = await this.userStorageService.isValidUser(formValue.username.trim(), formValue.password.trim());

  //     console.log('validUser', validUser);

  //     // Handle successful login
  //     if (validUser) {
  //       await this.authService.handleLoginSuccess(validUser);
  //       const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/client';
  //       this._router.navigateByUrl(returnUrl);
  //       this.form.reset();
  //       this.isLoading = false;
  //     } else {
  //       // Handle login failure
  //       this.isLoading = false;
  //       this.toaster.openToast({
  //         message: 'Invalid username or password',
  //         duration: 1000,
  //         position: 'bottom',
  //         translucent: false,
  //         animated: true,
  //         color: 'danger',
  //       });
  //     }
  //   } else {
  //     // Mark all form fields as touched if form is invalid
  //     this.form.markAllAsTouched();
  //     this.isLoading = false;
  //   }
  // }

  changeShowPassword() {
    this.isShowPassword = !this.isShowPassword;
  }

  ngOnDestroy() {
    if (isPlatform('capacitor')) {
      Keyboard.removeAllListeners();
    }
  }
}
