import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';

import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { generateGUID, RelationTypeOptions } from 'src/app/shared/utils/common';
import { dateFormatter } from 'src/app/shared/utils/dateFormatter';
import { ModalService } from '../../../../../shared/services/modal.service';
import { Age, EducationLevel, MaritalStatus, Sex } from '../../../enums/client.enum';
import { ClientStorageService } from '../../../services/client-storage.service';
import { Village, VillageStorageService } from './../../../services/village-storage.service';

@Component({
  selector: 'app-add-client-wizard',
  templateUrl: './add-client-wizard.component.html',
  styleUrls: ['./add-client-wizard.component.scss'],
})
export class AddClientWizardComponent implements OnInit {
  // * Form Initialization
  form: FormGroup;
  isValid: boolean = false;
  villages: Village[] = [];

  // TODO: Enum relation

  relationTypeOptions = RelationTypeOptions;
  educationLevelOptionsEnum: { [key: number]: string } = {
    [EducationLevel.Primary]: 'Primary',
    [EducationLevel.Secondary]: 'Secondary',
    [EducationLevel.HighSchool]: 'High School',
    [EducationLevel.Tertiary]: 'Tertiary',
  };
  maxDate = new Date().toISOString();

  get educationLevelOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.educationLevelOptionsEnum).map((key) => {
      return {
        value: +key,
        label: this.educationLevelOptionsEnum[+key],
      };
    });
  }

  maritalStatusOptionsEnum: { [key: number]: string } = {
    [MaritalStatus.Single]: 'Single',
    [MaritalStatus.Married]: 'Married',
    [MaritalStatus.Widowed]: 'Widowed',
    [MaritalStatus.Divorced]: 'Divorced',
    [MaritalStatus.Separated]: 'Separated',
  };

  get MaritalStatusOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.maritalStatusOptionsEnum).map((key) => ({
      value: +key,
      label: this.maritalStatusOptionsEnum[+key],
    }));
  }

  sexOptionsEnum: { [key: number]: string } = {
    [Sex.Male]: 'Male',
    [Sex.Female]: 'Female',
    [Sex.Unknown]: 'Unknown',
  };

  get SexOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.sexOptionsEnum).map((key) => ({
      value: +key,
      label: this.sexOptionsEnum[+key],
    }));
  }

  ageOptionsEnum: { [key: number]: string } = {
    [Age.ZeroToTwelve]: '0 - 12',
    [Age.ThirteenToSeventeen]: '13 - 17',
    [Age.EighteenToTwentyFour]: '18 - 24',
    [Age.TwentyFiveToThirtyFour]: '25 - 34',
    [Age.ThirtyFiveToFortyNine]: '35 - 49',
    [Age.FiftyToSixtyFour]: '50 - 64',
    [Age.SixtyFiveAndAbove]: '65 - Above',
  };

  get ageOptionsArray() {
    return Object.keys(this.ageOptionsEnum).map((key) => {
      return {
        value: +key,
        label: this.ageOptionsEnum[+key],
      };
    });
  }

  submitLoading: boolean = false;
  showDateDeceased: boolean = false;
  isForeigner: FormControl = new FormControl(false);
  haveNoPin: FormControl = new FormControl();
  isDisabled: boolean = false;

  constructor(
    private modalService: ModalService,
    private clientService: ClientStorageService,
    private villageStorageService: VillageStorageService,
    private authService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      FirstName: new FormControl('', [Validators.required]),
      MiddleName: new FormControl(''),
      LastName: new FormControl('', [Validators.required]),
      Sex: new FormControl('', [Validators.required]),
      Age: new FormControl(null),
      DOB: new FormControl(null, [Validators.required]),
      MaritalStatus: new FormControl(null, [Validators.required]),
      PIN: new FormControl('', [Validators.required]),
      Cellphone: new FormControl(''),
      EducationLevel: new FormControl(null, [Validators.required]),
      Occupation: new FormControl(''),
      HasBirthCertificate: new FormControl(),
      IsDisabled: new FormControl(),
      IsDeceased: new FormControl(),
      DateDeceased: new FormControl(),
      IsFamilyHead: new FormControl(1, [Validators.required]),
      // RelationWithFamilyHead: new FormControl(),
      FamilyHeadId: new FormControl(),
      VillageId: new FormControl('', [Validators.required]),
      IsDeleted: new FormControl(0),
    });
  }

  // * Initial State
  ngOnInit() {
    // * Get village list
    this.villageStorageService.fetchVillage().subscribe((villages) => {
      console.log(' villages in add client wizard ', villages);
      this.villages = villages;
    });

    // Subscribe to changes in 'IsDeceased' to toggle visibility of 'DateDeceased'
    this.form.get('IsDeceased')?.valueChanges.subscribe((value) => {
      // If 'IsDeceased' has any value, show 'DateDeceased', else hide it
      this.showDateDeceased = !!value;
    });

    // * By Default disable 'ispregnant' field
    // this.form.get('ispregnant')?.disable();

    // * Enable or disable 'ispregnant' based on 'sex' value
    // this.form.get('Sex')?.valueChanges.subscribe((value) => {
    //   // * if sex is female
    //   if (value === 2) {
    //     this.form.get('ispregnant')?.enable();
    //   } else {
    //     this.form.get('ispregnant')?.disable();
    //   }
    // });
  }

  // * Date Input Handler
  changeDate(event: CustomEvent) {
    // console.log(event.detail.value);
    const dateOfBirth = dayjs(event.detail.value);
    const age = dayjs().diff(dateOfBirth, 'year');
    // this.form.controls['dob'].setValue(dateFormatter(dateOfBirth.toISOString()));
    // this.form.controls['dob'].setValue(age);
  }

  // * Calculate Date of Birth
  calculateDOB() {
    const currentDate = dayjs();
    const dateOfBirth = currentDate.subtract(this.form.get('Age')?.value, 'year');
    this.form.controls['DOB'].setValue(dateFormatter(dateOfBirth.toISOString()));
    console.log(this.form.controls['DOB'].value);
  }

  getDobValue(): string {
    const dobValue = this.form.get('dob')?.value;
    return dobValue ? new Date(dobValue).toISOString() : '';
  }

  // * On Foreigner Change
  onIsForeignerChange() {
    if (this.isForeigner.value) {
      this.form.controls['PIN'].setValue('111111111');
      this.isDisabled = true;
      this.haveNoPin.setValue(false);
    } else {
      this.form.controls['PIN'].setValue('');
      this.isDisabled = false;
    }
  }

  ionselectChange(event: CustomEvent) {
    console.log(event.detail.value);
  }

  // * On Have No Pin
  onHaveNoPinChange() {
    if (this.haveNoPin.value) {
      this.form.controls['PIN'].setValue('1111111111111');
      this.isDisabled = true;
      this.isForeigner.setValue(false);
    } else {
      this.form.controls['PIN'].setValue('');
      this.isDisabled = false;
    }
  }

  // * save the data
  async onSubmit() {
    this.submitLoading = true;

    const isFormValid = this.form.valid;
    if (!isFormValid) {
      this.isValid = true;
      console.log(isFormValid);
      return;
    }
    console.log('Client details as per form ', this.form.value);
    this.isValid = false;
    let currentUser = await this.authService.getCurrentLoginStatus();
    let clientOid = generateGUID();

    if (currentUser && currentUser?.Oid) {
      const response = await this.clientService.addClient({
        Oid: clientOid,
        ...this.form.value,
        CreatedBy: currentUser.Oid,
      });
      console.log(response);
      if (response?.changes) {
        this.closeWizard();
        this.form.reset();
      }
      {
        console.log('Failed to add client');
      }
    } else {
      console.log('No user details found');
    }
    this.submitLoading = false;
  }

  onDateChange(event: CustomEvent, formControlName: string) {
    console.log('date => ', dayjs(event.detail.value).toISOString(), formControlName);
    this.form.controls[formControlName].setValue(dateFormatter(event.detail.value));
  }

  // * Close Modal
  closeWizard() {
    this.modalService.dismissModal();
  }
}
