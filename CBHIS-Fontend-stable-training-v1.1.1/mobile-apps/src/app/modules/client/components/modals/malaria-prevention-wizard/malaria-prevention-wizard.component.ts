import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { ISR, MalariaCampaign } from '../../../enums/malaria.enum';
import { Client } from '../../../models/client';
import { MalariaPrevention } from '../../../models/service-models/malaria';
import { PreventionStorageService } from '../../../services/malaria/prevention-storage.service';
import { ISRProvider, NumberOfITN } from './../../../enums/malaria.enum';
@Component({
  selector: 'app-malaria-prevention-wizard',
  templateUrl: './malaria-prevention-wizard.component.html',
  styleUrls: ['./malaria-prevention-wizard.component.scss'],
})
export class MalariaPreventionWizardComponent implements OnInit {
  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  ISROptionsEnum: { [key: number]: string } = { [ISR.ISR]: 'ISR - 1' };
  existingRecords: MalariaPrevention[] = [];

  get ISROptionsArray() {
    return Object.keys(this.ISROptionsEnum).map((key) => {
      return { value: +key, label: this.ISROptionsEnum[+key] };
    });
  }

  ISRProviderOptionsEnum: { [key: number]: string } = {
    [ISRProvider.GovernmentWorkerProgram]: 'GOVERNMENT WORKER/PROGRAM',
    [ISRProvider.PrivateCompany]: 'PRIVATE COMPANY',
    [ISRProvider.NGO]: 'NONGOVERNMENTAL ORGANIZATION',
    [ISRProvider.Unknown]: 'UNKNOWN',
  };

  get ISRProviderOptionsArray() {
    return Object.keys(this.ISRProviderOptionsEnum).map((key) => {
      return { value: +key, label: this.ISRProviderOptionsEnum[+key] };
    });
  }

  NumberOfITNOptionsEnum: { [key: number]: string } = { [NumberOfITN.NumberOfITN]: '1 - ITN' };

  get NumberOfITNOptionsArray() {
    return Object.keys(this.NumberOfITNOptionsEnum).map((key) => {
      return { value: +key, label: this.NumberOfITNOptionsEnum[+key] };
    });
  }

  MalariaCampaignOptionsEnum: { [key: number]: string } = {
    [MalariaCampaign.Radio]: 'Radio',
    [MalariaCampaign.Television]: 'Television',
    [MalariaCampaign.Poster]: 'Poster',
    [MalariaCampaign.Billboard]: 'Billboard',
    [MalariaCampaign.RHM]: 'RHM',
    [MalariaCampaign.CommunityEvent]: 'Community Event',
    [MalariaCampaign.NGO]: 'NGO',
  };

  get MalariaCampaignOptionsArray() {
    return Object.keys(this.MalariaCampaignOptionsEnum).map((key) => {
      return { value: +key, label: this.MalariaCampaignOptionsEnum[+key] };
    });
  }

  LastNetWasTreatedOptions = [
    { value: 1, label: 'Yes' },
    { value: 2, label: 'No' },
  ];

  // TODO: CREATE ENUM FOR THIS
  MaxAgeOfITNOptions = [
    { value: 1, label: 'Less than 6 months' },
    { value: 2, label: '6-12 months' },
    { value: 3, label: '1-2 years' },
    { value: 4, label: '2-3 years' },
    { value: 5, label: '3-4 years' },
    { value: 6, label: '4-5 years' },
    { value: 7, label: 'More than 5 years' },
  ];

  @Input() head!: Client;
  @Input() member!: Client[];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private preventionStorageService: PreventionStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      ISR: new FormControl(null, [Validators.required]),
      ISRProvider: new FormControl(null, [Validators.required]),
      NumberOfITN: new FormControl(),
      MalariaCampaignMedium: new FormControl(),
      LastNetWasTreated: new FormControl(),
      MalariaCampaign: new FormControl(),
      MaxAgeOfITN: new FormControl(),
      HasNetBeenTreated: new FormControl(false),
      IsITNObserved: new FormControl(false),
      HasITN: new FormControl(false),
      OnlineDbOid: new FormControl(null),
    });
  }

  async ngOnInit() {
    // Enable the form if no items are selected
    // this.isEnabled = this.selectedItems?.length === 0;

    // Fetch existing records for the selected members
    this.existingRecords = await this.preventionStorageService.getMalariaPreventionByClientIds(
      this.member.map((member) => member.Oid)
    );

    console.log('responses', this.existingRecords);

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
  }

  private handleSingleClient() {
    const singleClientData = this.existingRecords.find((record) => record.ClientId === this.member[0].Oid);
    if (singleClientData) {
      this.form.patchValue({
        OnlineDbOid: singleClientData.OnlineDbOid,
        ISR: singleClientData.ISR,
        ISRProvider: singleClientData.ISRProvider,
        NumberOfITN: singleClientData.NumberOfITN,
        MalariaCampaignMedium: singleClientData.MalariaCampaignMedium,
        LastNetWasTreated: singleClientData.LastNetWasTreated,
        MalariaCampaign: singleClientData.MalariaCampaign,
        MaxAgeOfITN: singleClientData.MaxAgeOfITN,
        HasNetBeenTreated: singleClientData.HasNetBeenTreated,
        IsITNObserved: singleClientData.IsITNObserved,
        HasITN: singleClientData.HASITN,
        TransactionId: singleClientData.TransactionId,
      });
    } else {
      this.form.patchValue({
        OnlineDbOid: null,
        ISR: null,
        ISRProvider: null,
        NumberOfITN: null,
        MalariaCampaignMedium: null,
        LastNetWasTreated: null,
        MalariaCampaign: null,
        MaxAgeOfITN: null,
        HasNetBeenTreated: null,
        IsITNObserved: null,
        HasITN: null,
        TransactionId: null,
      });
    }
  }

  private handleMultipleClients(isSameClients: boolean, isSameMatchId: boolean) {
    if (!this.existingRecords.length) {
      // No data for any selected clients
      this.form.patchValue({
        OnlineDbOid: null,
        ISR: null,
        ISRProvider: null,
        NumberOfITN: null,
        MalariaCampaignMedium: null,
        LastNetWasTreated: null,
        MalariaCampaign: null,
        MaxAgeOfITN: null,
        HasNetBeenTreated: null,
        IsITNObserved: null,
        HasITN: null,
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
      // All selected clients have the same data
      this.form.patchValue({
        OnlineDbOid: this.existingRecords[0].OnlineDbOid,
        ISR: this.existingRecords?.[0].ISR,
        ISRProvider: this.existingRecords?.[0].ISRProvider,
        NumberOfITN: this.existingRecords?.[0].NumberOfITN,
        MalariaCampaignMedium: this.existingRecords?.[0].MalariaCampaignMedium,
        LastNetWasTreated: this.existingRecords?.[0].LastNetWasTreated,
        MalariaCampaign: this.existingRecords?.[0].MalariaCampaign,
        MaxAgeOfITN: this.existingRecords?.[0].MaxAgeOfITN,
        HasNetBeenTreated: this.existingRecords?.[0].HasNetBeenTreated,
        IsITNObserved: this.existingRecords?.[0].IsITNObserved,
        HasITN: this.existingRecords?.[0].HASITN,
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
    const isFormValid = this.form.valid;

    // * Validation Check
    if (!isFormValid) {
      this.isValid = true;
      this.submitLoading = false;
      return;
    } else {
      if (this.form.valid) {
        const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

        const MalariaPreventionArray: MalariaPrevention[] = this.member.map((member) => {
          const MalariaPreventionPayload: MalariaPrevention = {
            TransactionId: this.form.value.TransactionId,
            ISR: this.form.value.ISR,
            ISRProvider: this.form.value.ISRProvider,
            NumberOfITN: this.form.value.NumberOfITN,
            MalariaCampaignMedium: this.form.value.MalariaCampaignMedium,
            LastNetWasTreated: this.form.value.LastNetWasTreated,
            MalariaCampaign: this.form.value.MalariaCampaign,
            MaxAgeOfITN: this.form.value.MaxAgeOfITN,
            HasNetBeenTreated: this.form.value.HasNetBeenTreated,
            IsITNObserved: this.form.value.IsITNOberved,
            HASITN: this.form.value.HasITN,
            OnlineDbOid: this.form.value.OnlineDbOid,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            IsDeleted: false,
            MatchId: matchId,
            CreatedAt: dayjs().format(),
          };
          return MalariaPreventionPayload;
        });

        const responses = await this.preventionStorageService.addMalariaPrevention(MalariaPreventionArray);

        let success = false;
        success = responses.every((response) => response?.changes?.changes);

        if (success) {
          this.toast.openToast({
            message: 'Successfully recorded',
            duration: 2000,
            position: 'bottom',
            color: 'success',
          });
          this.form.reset();
        } else {
          this.toast.openToast({
            message: 'Failed to save the data',
            duration: 2000,
            position: 'bottom',
            color: 'danger',
          });
        }
      } else {
        this.toast.openToast({
          message: 'Please fill in all required fields',
          duration: 1000,
          position: 'bottom',
          color: 'warning',
        });
      }

      this.submitLoading = false;
      this.dismissModal();
    }
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
