import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UserStorageService } from 'src/app/modules/auth/services/user-storage.service';

@Component({
  selector: 'app-create-user-wizard',
  templateUrl: './create-user-wizard.component.html',
  styleUrls: ['./create-user-wizard.component.scss'],
})
export class CreateUserWizardComponent implements OnInit {
  userForm: FormGroup;
  isValid: boolean = false;

  constructor(
    private modalController: ModalController,
    private userStorageService: UserStorageService
  ) {
    this.userForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      dob: new FormControl('', [Validators.required]),
      sex: new FormControl('', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      contactaddress: new FormControl('', [Validators.required]),
      countrycode: new FormControl('', [Validators.required]),
      cellphone: new FormControl('', [Validators.required]),
      isaccountactive: new FormControl(''),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      usertype: new FormControl(''),
      zoneid: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    const date = new Date();
    this.userForm.controls['dob'].setValue(date.toISOString());
  }

  onSubmit() {
    const isFormValid = this.userForm.valid;

    if (!isFormValid) {
      this.isValid = true;
      console.log(isFormValid);
    } else {
      console.log('Hello Submit', this.userForm?.value);
      this.isValid = false;
      this.userStorageService.addUser(this.userForm?.value);
      this.closeWizard();
      this.userForm.reset();
    }
  }

  changeDate(event: CustomEvent) {
    console.log(event.detail.value);
    this.userForm.controls['dob'].setValue(event.detail.value);
  }

  closeWizard() {
    this.modalController.dismiss();
  }
}
