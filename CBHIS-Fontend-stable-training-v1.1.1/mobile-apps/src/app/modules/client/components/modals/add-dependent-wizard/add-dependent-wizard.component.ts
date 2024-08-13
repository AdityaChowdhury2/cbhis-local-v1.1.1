import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonDatetime, ModalController, NavParams } from '@ionic/angular';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { ClientStorageService } from 'src/app/modules/client/services/client-storage.service';
import { RelationTypeOptions, generateGUID } from 'src/app/shared/utils/common';
import { dateFormatter } from 'src/app/shared/utils/dateFormatter';
import { Age, EducationLevel, MaritalStatus, Sex } from '../../../enums/client.enum';
import { Client } from '../../../models/client';
import { CommunicatorService } from '../../../services/communicator.service';
import { VillageStorageService } from '../../../services/village-storage.service';

dayjs.extend(customParseFormat);
@Component({
  selector: 'app-add-dependent-wizard',
  templateUrl: './add-dependent-wizard.component.html',
  styleUrls: ['./add-dependent-wizard.component.scss'],
})
export class AddDependentWizardComponent implements OnInit {
  @ViewChild('deceasedDateTime') deceasedDateTimeRef!: IonDatetime;
  @ViewChild('dob') dobDateTimeRef!: IonDatetime;
  // * Local variables
  form: FormGroup;
  head!: Client;
  isValid: boolean = false;
  // villages: Village[] = [];
  relationTypeOptions = RelationTypeOptions;
  maxDate = new Date().toISOString();
  sexOptionsEnum: { [key: number]: string } = {
    [Sex.Male]: 'Lomdvuna (Male)',
    [Sex.Female]: 'Lomsikati (Female)',
    [Sex.Unknown]: 'Lobulili lobunye (Other)',
  };

  get SexOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.sexOptionsEnum).map((key) => ({
      value: +key,
      label: this.sexOptionsEnum[+key],
    }));
  }
  maritalStatusOptionsEnum: { [key: number]: string } = {
    [MaritalStatus.Single]: 'Lotsetfwe',
    [MaritalStatus.Married]: 'Umfelokati/Umfelwa',
    [MaritalStatus.Widowed]: 'Labahlukana ngalokusemtsetfweni',
    [MaritalStatus.Divorced]: 'labacabana bangahlukani ngekwemtsetfo',
    [MaritalStatus.Separated]: 'Kutiphilisa',
  };

  get MaritalStatusOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.maritalStatusOptionsEnum).map((key) => ({
      value: +key,
      label: this.maritalStatusOptionsEnum[+key],
    }));
  }

  educationLevelOptionsEnum: { [key: number]: string } = {
    [EducationLevel.Primary]: 'Sikolwa lesincane (Primary)',
    [EducationLevel.Secondary]: 'Isekhondari (Secondary)',
    [EducationLevel.HighSchool]: 'Imfundvo lephakeme (High School)',
    [EducationLevel.Tertiary]: 'Tekufundzela (Tertiary)',
    [EducationLevel.NotApplicable]: 'Akudzingeki (Not Applicable)',
  };

  get educationLevelOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.educationLevelOptionsEnum).map((key) => {
      return {
        value: +key,
        label: this.educationLevelOptionsEnum[+key],
      };
    });
  }

  submitLoading: boolean = false;
  showDateDeceased: boolean = false;
  isForeigner: FormControl = new FormControl(false);
  haveNoPin: FormControl = new FormControl();
  isDisabled: boolean = false;

  // * constructor
  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private clientService: ClientStorageService,
    private authStorageService: AuthStorageService,
    private villageStorageService: VillageStorageService,
    private communicatorService: CommunicatorService
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
      HasBirthCertificate: new FormControl(false),
      IsDisabled: new FormControl(false),
      IsDeceased: new FormControl(false),
      DateDeceased: new FormControl(),
      IsFamilyHead: new FormControl(0, [Validators.required]),
      RelationalType: new FormControl(null, [Validators.required]),
      FamilyHeadId: new FormControl(0, [Validators.required]),
      VillageId: new FormControl(),
      IsPregnant: new FormControl(false),
      IsDeleted: new FormControl(false),
    });
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

  // * Initial Action
  ngOnInit() {
    // * Get village list
    // this.villageStorageService.fetchVillage().subscribe((villages) => {
    //   this.villages = villages;
    // });

    // Subscribe to changes in 'IsDeceased' to toggle visibility of 'DateDeceased'
    this.form.get('IsDeceased')?.valueChanges.subscribe((value) => {
      // If 'IsDeceased' has any value, show 'DateDeceased', else hide it
      this.showDateDeceased = !!value;
    });

    this.head = this.navParams.get('head');
    this.form.get('ispregnant')?.disable();

    console.log('This head is => ', this.head);

    this.form.get('VillageId')?.setValue(this.head.VillageId);

    // * By Default disable 'ispregnant' and 'RelationalType' field
    this.form.get('ispregnant')?.disable();
    this.form.get('RelationalType')?.disable();

    // * Enable or disable 'ispregnant' based on 'sex' value
    this.form.get('Sex')?.valueChanges.subscribe((value) => {
      if (value === 2) {
        this.form.get('ispregnant')?.enable();
        this.form.get('RelationalType')?.enable();
        this.form.get('RelationalType')?.setValidators([Validators.required]);
        this.relationTypeOptions = [
          { value: 2, key: 'Sisi' },
          { value: 4, key: 'Indvodzakati' },
          { value: 6, key: 'Indvodzana' },
          { value: 7, key: 'Bhuti' },
        ];
      } else if (value === 1) {
        this.form.get('ispregnant')?.disable();
        this.form.get('RelationalType')?.enable();
        this.form.get('RelationalType')?.setValidators([Validators.required]);
        this.relationTypeOptions = [
          { value: 1, key: 'Make' },
          { value: 3, key: 'Lotetfwele' },
          { value: 5, key: 'Umfati' },
        ];
      } else if (value === 3) {
        this.form.get('ispregnant')?.disable();
        this.form.get('RelationalType')?.enable();
        this.form.get('RelationalType')?.setValidators([Validators.required]);
        this.relationTypeOptions = [
          { value: 1, key: 'Make' },
          { value: 3, key: 'Lotetfwele' },
          { value: 5, key: 'Umfati' },
          { value: 2, key: 'Sisi' },
          { value: 4, key: 'Indvodzakati' },
          { value: 6, key: 'Indvodzana' },
          { value: 7, key: 'Bhuti' },
        ];
      } else {
        this.form.get('ispregnant')?.disable();
        this.form.get('RelationalType')?.disable();
        this.form.get('RelationalType')?.clearValidators();
        this.relationTypeOptions = [];
      }
      this.form.get('RelationalType')?.updateValueAndValidity();
    });

    this.form.get('IsPregnant')?.disable();

    // * Enable or disable 'ispregnant' based on 'sex' value
    this.form.get('Sex')?.valueChanges.subscribe((value) => {
      // * if sex is female
      if (value === 2) {
        this.form.get('IsPregnant')?.enable();
      } else {
        this.form.get('IsPregnant')?.setValue(0);
        this.form.get('IsPregnant')?.disable();
      }
    });
  }

  // * Calculate Date of Birth
  calculateDOB() {
    const currentDate = dayjs();
    const dateOfBirth = currentDate.subtract(this.form.get('Age')?.value, 'year');
    this.form.controls['DOB'].setValue(dateFormatter(dateOfBirth.toISOString()));
    console.log(this.form.controls['DOB'].value);
  }

  // * Handle Submit
  async onSubmit() {
    this.submitLoading = true;
    console.log('Dependent details as per form ', this.form.value);
    const isFormValid = this.form.valid;
    if (!isFormValid) {
      this.isValid = true;
      console.log(isFormValid);
      this.submitLoading = false;
      return;
    }
    this.isValid = false;
    let currentUser = await this.authStorageService.getCurrentLoginStatus();

    console.log('new dependant details', this.form.value);

    if (currentUser && currentUser?.Oid) {
      let clientOid = generateGUID();
      const response = await this.clientService.addClient({
        Oid: clientOid,
        FirstName: this.form.value.FirstName,
        MiddleName: this.form.value.MiddleName,
        LastName: this.form.value.LastName,
        Sex: this.form.value.Sex,
        Age: this.form.value.Age,
        DOB: dayjs(this.form.value.DOB, 'dd-MM-yyyy').toISOString(),
        FamilyHeadId: this.head.Oid,
        IsFamilyHead: false,
        IsDeleted: false,
        IsDeceased: this.form.value.IsDeceased,
        DateDeceased: this.form.value.DateDeceased
          ? dayjs(this.form.value.DateDeceased, 'dd-MM-yyyy').toISOString()
          : null,
        MaritalStatus: this.form.value.MaritalStatus,
        PIN: this.form.value.PIN,
        Cellphone: this.form.value.Cellphone,
        EducationLevel: this.form.value.EducationLevel,
        Occupation: this.form.value.Occupation,
        HasBirthCertificate: this.form.value.HasBirthCertificate,
        IsPregnant: this.form.value.IsPregnant,
        IsDisabled: this.form.value.IsDisabled,
        VillageId: this.form.value.VillageId,
        RelationalType: this.form.value.RelationalType,
        CreatedBy: currentUser.Oid,
      });
      if (response?.changes) {
        this.submitLoading = false;
        this.closeWizard();
        this.form.reset();
        this.communicatorService.callFilterAppointmentsByDate.next(dateFormatter(new Date().toISOString(), 'y-MM-dd'));
      }
    }
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

  // * Date Input Handler
  onDateChange(event: CustomEvent, controlName: string) {
    console.log(event.detail.value);
    this.form.controls[controlName].setValue(dateFormatter(event.detail.value));
  }

  // // * Handle Submit
  // async onSubmit() {
  //   if (!this.form.valid) {
  //     this.isValid = true;
  //     console.log(this.form.valid);
  //     return;
  //   }

  //   const user = await this.authService.getCurrentUser();
  //   const addDependentPayload: Client = addCommonFields(
  //     {
  //       ...this.form.value,
  //       identifiedfamilyid: this.head?.identifiedfamilyid,
  //       ispregnant: this.form.value.ispregnant ? 1 : 0,
  //       isdisabled: this.form.value.isdisabled ? 1 : 0,
  //     },
  //     user
  //   );

  //   console.log('Dependent details as per form ', addDependentPayload);

  //   this.isValid = false;
  //   this.clientService.addClient(addDependentPayload);
  //   this.closeWizard();
  //   this.form.reset();
  // }

  // * Date Input Handler
  changeDate(event: CustomEvent) {
    console.log(event.detail.value);
    this.form.controls['dob'].setValue(dateFormatter(event.detail.value));
  }

  closeWizard() {
    this.modalController.dismiss();
  }

  // * handle set date
  setDeceasedDateAndCloseModal() {
    this.deceasedDateTimeRef.confirm();
    this.closeWizard();
  }
  // * handle set date for dob
  setDOBAndCloseModal() {
    this.dobDateTimeRef.confirm();
    this.closeWizard();
  }
}
