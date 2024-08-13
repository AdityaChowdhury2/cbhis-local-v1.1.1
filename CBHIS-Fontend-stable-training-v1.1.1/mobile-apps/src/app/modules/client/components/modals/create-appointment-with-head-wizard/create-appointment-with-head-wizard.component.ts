import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { LanguageService } from 'src/app/shared/services/language.service';
import { RelationTypeOptions, generateGUID } from 'src/app/shared/utils/common';
import { dateFormatter } from 'src/app/shared/utils/dateFormatter';
import { ModalService } from '../../../../../shared/services/modal.service';
import { AppointmentStatus, Priority } from '../../../enums/appointment.enum';
import { Age, EducationLevel, MaritalStatus, Sex } from '../../../enums/client.enum';
import { AppointmentStorageService } from '../../../services/appointment-storage.service';
import { ClientStorageService } from '../../../services/client-storage.service';
import { CommunicatorService } from './../../../services/communicator.service';
import { Village, VillageStorageService } from './../../../services/village-storage.service';

dayjs.extend(customParseFormat);
@Component({
  selector: 'app-create-appointment-with-head-wizard',
  templateUrl: './create-appointment-with-head-wizard.component.html',
  styleUrls: ['./create-appointment-with-head-wizard.component.scss'],
})
export class CreateAppointmentWithHeadWizardComponent implements OnInit {
  @ViewChild('deceasedDateTime') deceasedDateTimeRef!: IonDatetime;
  @ViewChild('dob') dobDateTimeRef!: IonDatetime;
  // * Form Initialization
  form: FormGroup;
  isValid: boolean = false;
  villages: Village[] = [];
  currentUser: UserAccount | null = {} as UserAccount;
  relationTypeOptions = RelationTypeOptions;
  currentDate = new Date();
  maxDate = new Date().toISOString();

  priorityOptionsEnum: { [key: number]: string } = {
    [Priority.Low]: 'Low',
    [Priority.Critical]: 'Critical',
  };
  get priorityOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.priorityOptionsEnum).map((key) => {
      return {
        value: +key,
        label: this.priorityOptionsEnum[+key],
      };
    });
  }

  appointmentStatusOptionsEnum: { [key: number]: string } = {
    [AppointmentStatus.Pending]: 'Pending',
    [AppointmentStatus.Completed]: 'Completed',
    [AppointmentStatus.Cancelled]: 'Cancelled',
  };

  get appointmentStatusOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.appointmentStatusOptionsEnum).map((key) => {
      return {
        value: +key,
        label: this.appointmentStatusOptionsEnum[+key],
      };
    });
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

  ageOptionsEnum: { [key: number]: string } = {
    [Age.EighteenToTwentyFour]: '15 - 24',
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
  allVillages: Village[] = [];
  english = true;

  constructor(
    private modalService: ModalService,
    private clientService: ClientStorageService,
    private villageStorageService: VillageStorageService,
    private authService: AuthStorageService,
    private appointmentStorageService: AppointmentStorageService,
    private communicatorService: CommunicatorService,
    public languageService: LanguageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      // * Client Details
      FirstName: new FormControl('', [Validators.required]),
      MiddleName: new FormControl(''),
      LastName: new FormControl('', [Validators.required]),
      Sex: new FormControl('', [Validators.required]),
      Age: new FormControl(null),
      DOB: new FormControl(null, [Validators.required]),
      MaritalStatus: new FormControl(null, [Validators.required]),
      PIN: new FormControl('', [Validators.required]),
      Cellphone: new FormControl(null),
      EducationLevel: new FormControl(null, [Validators.required]),
      Occupation: new FormControl(''),
      HasBirthCertificate: new FormControl(false),
      IsDisabled: new FormControl(false),
      IsDeceased: new FormControl(false),
      DateDeceased: new FormControl(),
      IsPregnant: new FormControl(false),
      IsFamilyHead: new FormControl(1, [Validators.required]),
      // RelationWithFamilyHead: new FormControl(),
      FamilyHeadId: new FormControl(null),
      VillageId: new FormControl('', [Validators.required]),
      IsDeleted: new FormControl(false),
    });
  }

  // * Initial State
  ngOnInit() {
    this.languageService.languageObservable$.subscribe((data) => {
      this.english = data;
    });

    // * Add 13 Years for head age validation
    this.currentDate.setFullYear(this.currentDate.getFullYear() - 15);
    this.maxDate = this.currentDate.toISOString();

    console.log('this.currentDate', this.currentDate);
    console.log('this.maxDate', this.maxDate);

    this.authService.getCurrentLoginStatus().then((user) => {
      this.currentUser = user;

      let villageData: Village[] = [];

      this.villageStorageService.fetchVillage().subscribe((villages) => {
        console.log(' villages in add client wizard ', villages);
        this.allVillages = villages;
      });

      if (this.currentUser?.AssignedVillages) {
        const assignedVillages = JSON.parse(this.currentUser.AssignedVillages);
        const villages = JSON.parse(assignedVillages);

        console.log(villages);

        villageData = villages?.map((village: any) => ({
          Oid: village.villageId,
          Description: village?.village.description,
          ChiefdomId: 0,
          IsDeleted: village.isDeleted ? 1 : 0,
        }));
      }

      this.villages = villageData;
    });

    // * Get village list
    // this.villageStorageService.fetchVillage().subscribe((villages) => {
    //   console.log(' villages in add client wizard ', villages);
    //   this.villages = villages;
    // });

    // Subscribe to changes in 'IsDeceased' to toggle visibility of 'DateDeceased'
    this.form.get('IsDeceased')?.valueChanges.subscribe((value) => {
      // If 'IsDeceased' has any value, show 'DateDeceased', else hide it
      this.showDateDeceased = !!value;
    });

    // * By Default disable 'ispregnant' field
    this.form.get('IsPregnant')?.disable();

    // * Enable or disable 'ispregnant' based on 'sex' value
    this.form.get('Sex')?.valueChanges.subscribe((value) => {
      // * if sex is female
      if (value === 2) {
        this.form.get('IsPregnant')?.enable();
      } else {
        this.form.get('IsPregnant')?.setValue(false);
        this.form.get('IsPregnant')?.disable();
      }
    });
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

  /*

  {
    "FirstName": "adsf",
    "MiddleName": "",
    "LastName": "asdf",
    "Sex": 1,
    "Age": null,
    "DOB": "09/07/2002",
    "MaritalStatus": 1,
    "PIN": "1111111111111",
    "Cellphone": null,
    "EducationLevel": 1,
    "Occupation": "",
    "HasBirthCertificate": false,
    "IsDisabled": false,
    "IsDeceased": false,
    "DateDeceased": null,
    "IsFamilyHead": 1,
    "FamilyHeadId": null,
    "VillageId": 9,
    "IsDeleted": false
}

  */

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

    if (this.currentUser && this.currentUser?.Oid) {
      let clientOid = generateGUID();
      const clientAddResponse = await this.clientService.addClient({
        Oid: clientOid,
        FirstName: this.form.get('FirstName')?.value,
        MiddleName: this.form.get('MiddleName')?.value,
        LastName: this.form.get('LastName')?.value,
        Sex: this.form.get('Sex')?.value,
        Age: this.form.get('Age')?.value,
        DOB: dayjs(this.form.get('DOB')?.value, 'dd-MM-yyyy').toISOString(),
        MaritalStatus: this.form.get('MaritalStatus')?.value,
        PIN: this.form.get('PIN')?.value,
        Cellphone: this.form.get('Cellphone')?.value,
        EducationLevel: this.form.get('EducationLevel')?.value,
        Occupation: this.form.get('Occupation')?.value,
        HasBirthCertificate: this.form.get('HasBirthCertificate')?.value,
        IsDisabled: this.form.get('IsDisabled')?.value,
        IsDeceased: this.form.get('IsDeceased')?.value,
        DateDeceased: this.form.get('DateDeceased')?.value
          ? dayjs(this.form.get('DateDeceased')?.value, 'dd-MM-yyyy').toISOString()
          : null,
        IsFamilyHead: this.form.get('IsFamilyHead')?.value,
        IsPregnant: this.form.get('IsPregnant')?.value,
        FamilyHeadId: this.form.get('FamilyHeadId')?.value,
        VillageId: this.form.get('VillageId')?.value,
        IsDeleted: this.form.get('IsDeleted')?.value,
        CreatedBy: this.currentUser.Oid,
      });
      console.log(clientAddResponse);
      if (clientAddResponse?.changes) {
        const appointmentResponse = await this.appointmentStorageService.addAssignedAppointment([
          {
            UserId: this.currentUser.Oid,
            AppointmentType: 'Client Registration',
            AppointmentDate: new Date().toISOString().split('.')[0],
            ClientId: clientOid,
            Status: AppointmentStatus.Pending,
            Priority: Priority.Low,
          },
        ]);
        if (appointmentResponse?.changes) {
          this.closeWizard();
          this.form.reset();
          console.log('appointment added successfully');
          await this.appointmentStorageService.getAssignedAppointments();
          const appointmentResponse = await this.appointmentStorageService.filterAppointmentsByDate(
            dateFormatter(new Date().toISOString(), 'y-MM-dd')
          );

          this.communicatorService.callFilterAppointmentsByDate.next(
            dateFormatter(new Date().toISOString(), 'y-MM-dd')
          );

          console.log('appointmentResponse ===>', appointmentResponse);
        }
      } else {
        console.log('Client not added');
      }
    } else {
      console.log('No user details found');
    }
    this.submitLoading = false;
  }

  onDateChange(event: CustomEvent, formControlName: string) {
    console.log('event => ', event.detail.value, formControlName);
    console.log('date => ', dayjs(event.detail.value).toISOString(), formControlName);
    this.form.controls[formControlName].setValue(dateFormatter(event.detail.value));
    console.log(typeof this.form.controls[formControlName].value);
    console.log(dayjs(this.form.controls[formControlName].value, 'dd-MM-yyyy').toISOString());
  }

  // * Close Modal
  closeWizard() {
    this.modalService.dismissModal();
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
