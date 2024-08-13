import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { DistributionType, TestResult, UserProfile } from 'src/app/modules/client/enums/hiv.enum';
import { Client } from 'src/app/modules/client/models/client';
import { HIVSelfTest } from 'src/app/modules/client/models/service-models/hiv';
import { HIVSelfTestStorageService } from 'src/app/modules/client/services/hiv/hiv-self-test-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-self-test-wizard',
  templateUrl: './self-test-wizard.component.html',
  styleUrls: ['./self-test-wizard.component.scss'],
})
export class SelfTestWizardComponent implements OnInit {
  DistributionEnum: { [key: number]: string } = {
    [DistributionType.AnotherPerson]: 'Another Person',
    [DistributionType.SelfAndPartnerUse]: 'Self And Partner Use',
    [DistributionType.SelfTestOnly]: 'Self Test Only',
  };
  get DistributionTypeArray(): { value: number; label: string }[] {
    return Object.keys(this.DistributionEnum).map((key) => {
      return {
        value: +key,
        label: this.DistributionEnum[+key],
      };
    });
  }

  UserProfileEnum: { [key: number]: string } = {
    [UserProfile.Pregnant]: 'Pregnant',
    [UserProfile.MSM]: 'MSM',
    [UserProfile.LGBTQ]: 'LGBTQ',
    [UserProfile.PersonUsingDrugs]: 'Person Using Drugs',
    [UserProfile.SexWorker]: 'Sex Worker',
    [UserProfile.OVC]: 'OVC',
  };

  get UserProfileArray(): { value: number; label: string }[] {
    return Object.keys(this.UserProfileEnum).map((key) => {
      return {
        value: +key,
        label: this.UserProfileEnum[+key],
      };
    });
  }

  TestResultEnum: { [key: number]: string } = {
    [TestResult.Negative]: 'Negative',
    [TestResult.Positive]: 'Positive',
    [TestResult.NotDisclosed]: 'Not Disclosed',
  };

  get TestResultArray(): { value: number; label: string }[] {
    return Object.keys(this.TestResultEnum).map((key) => {
      return {
        value: +key,
        label: this.TestResultEnum[+key],
      };
    });
  }
  alertButtons = [
    {
      text: 'Ok',
      role: 'cancel',
      cssClass: 'secondary',
    },
  ];

  form: FormGroup;
  submitLoading: boolean = false;
  isValid: boolean = false;
  isUpdate: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  existingRecords: HIVSelfTest[] = [];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private HIVSelfTestService: HIVSelfTestStorageService,
    private toaster: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      DistributionType: new FormControl(),
      UserProfile: new FormControl(),
      TestResult: new FormControl(),
      IsAssistedSelfTest: new FormControl(),
      IsAcceptedHIVTest: new FormControl(),
      OnlineDbOid: new FormControl(null),
    });
  }

  async ngOnInit() {
    // * Fetching the existing records
    this.existingRecords = await this.HIVSelfTestService.getClientsHIVSelfTestByClientIds(
      this.member.map((member) => member.Oid)
    );

    console.log('Existing Records ==>', this.existingRecords);

    // Get Client IDs from the existing records
    const clientsFromExistingRecords = this.existingRecords.map((record) => record.ClientId);

    // Check if the clients from the existing records are the same as the selected clients
    const isSameClients = this.member.every((client) => clientsFromExistingRecords.includes(client.Oid));
    const isSameMatchId = this.existingRecords.every((record) => record.MatchId === this.existingRecords[0]?.MatchId);

    if (this.member.length === 1) {
      // Single client selected
      this.handleSingleClient();
    } else if (this.member.length > 1) {
      // Multiple clients selected
      this.handleMultipleClients(isSameClients, isSameMatchId);
    }

    // * Check if the client is the head
    this.form.get('TestResult')?.valueChanges.subscribe((value) => {
      console.log(value);
      if (value === 2) {
        this.toaster.openAlert({
          header: '',
          subHeader: 'Tfumela lona esibhedlela',
          cssClass: '',
          buttons: this.alertButtons,
          backdropDismiss: false,
        });
      }
    });
  }

  private handleSingleClient() {
    const singleClientData = this.existingRecords.find((record) => record.ClientId === this.member[0].Oid);
    if (singleClientData) {
      this.isUpdate = true;
      this.form.patchValue({
        OnlineDbOid: singleClientData.OnlineDbOid,
        DistributionType: singleClientData.DistributionType,
        UserProfile: singleClientData.UserProfile,
        TestResult: singleClientData.TestResult,
        IsAssistedSelfTest: singleClientData.IsAssistedSelfTest,
        IsAcceptedHIVTest: singleClientData.IsAcceptedHIVTest,
        TransactionId: singleClientData.TransactionId,
      });
    } else {
      this.form.patchValue({
        OnlineDbOid: null,
        DistributionType: null,
        UserProfile: null,
        TestResult: null,
        IsAssistedSelfTest: null,
        IsAcceptedHIVTest: null,
        TransactionId: null,
      });
    }
  }

  private handleMultipleClients(isSameClients: boolean, isSameMatchId: boolean) {
    if (!this.existingRecords.length) {
      this.isUpdate = true;
      // No data for any selected clients
      this.form.patchValue({
        OnlineDbOid: null,
        DistributionType: null,
        UserProfile: null,
        TestResult: null,
        IsAssistedSelfTest: null,
        IsAcceptedHIVTest: null,
        TransactionId: null,
      });
    } else if (!isSameClients) {
      // Some clients have data, some do not
      this.showAlert(
        'Service records for the selected client already exist. Please choose the existing client to update their records or select a different client to create new records.'
      );
    } else if (!isSameMatchId) {
      // Different clients have different data
      this.showAlert(
        'The selected client has different versions of records. Please select each client individually to create or update their records.'
      );
    } else {
      this.isUpdate = true;
      // All selected clients have the same data
      this.form.patchValue({
        OnlineDbOid: this.existingRecords[0].OnlineDbOid,
        DistributionType: this.existingRecords[0].DistributionType,
        UserProfile: this.existingRecords[0].UserProfile,
        TestResult: this.existingRecords[0].TestResult,
        IsAssistedSelfTest: this.existingRecords[0].IsAssistedSelfTest,
        IsAcceptedHIVTest: this.existingRecords[0].IsAcceptedHIVTest,
        TransactionId: this.existingRecords[0].TransactionId,
      });
    }
  }

  private showAlert(message: string) {
    this.toast.openAlert({
      header: '',
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.dismissModal();
            return true;
          },
          cssClass: 'alert-button-confirm',
        },
      ],
      cssClass: 'service-check-alert',
    });
  }

  // * For submitting the form
  async onSubmit() {
    let matchId = uuidv4();
    this.submitLoading = true;
    console.log(this.form.value);
    if (
      this.form.get('DistributionType')?.value ||
      this.form.get('UserProfile')?.value ||
      this.form.get('TestResult')?.value ||
      this.form.get('IsAssistedSelfTest')?.value ||
      this.form.get('IsAcceptedHIVTest')?.value ||
      this.isUpdate
    ) {
      const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;
      const HIVSelfTestArray: HIVSelfTest[] = this.member.map((member) => {
        const existingRecord = this.existingRecords.find((record) => record.ClientId === member.Oid);

        const HIVSelfTestPayload: HIVSelfTest = {
          TransactionId: existingRecord?.TransactionId,
          DistributionType: this.form.value.DistributionType,
          UserProfile: this.form.value.UserProfile,
          TestResult: this.form.value.TestResult,
          IsAssistedSelfTest: this.form.value.IsAssistedSelfTest,
          IsAcceptedHIVTest: this.form.value.IsAcceptedHIVTest,
          OnlineDbOid: existingRecord?.OnlineDbOid || this.form.value.OnlineDbOid,
          CreatedBy: currentUser.Oid,
          ClientId: member.Oid,
          IsDeleted: false,
          MatchId: matchId,
          CreatedAt: dayjs().format(),
        };
        return HIVSelfTestPayload;
      });

      const responses = await this.HIVSelfTestService.addHIVSelfTest(HIVSelfTestArray);
      let success = false;
      success = responses.every((response) => response?.changes?.changes);

      if (success) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 1000,
          position: 'bottom',
          color: 'success',
        });
        this.form.reset();
      } else {
        this.toast.openToast({
          message: 'Failed to save the data',
          duration: 1000,
          position: 'bottom',
          color: 'danger',
        });
      }
    } else {
      // this.toast.openToast({
      //   message: 'Please fill in all required fields',
      //   duration: 1000,
      //   position: 'bottom',
      //   color: 'warning',
      // });
    }

    this.submitLoading = false;
    this.dismissModal();
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
