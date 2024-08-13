import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { Frequency } from '../../../enums/household-nutrition.enum';
import { Client } from '../../../models/client';
import { ClientMinimumAcceptableDiet } from '../../../models/service-models/household-nutrition';
import { MinimumAcceptableDietStorageService } from '../../../services/household-nutrition/minimum-acceptable-diet.service';

@Component({
  selector: 'app-minimum-acceptable-diet-wizard',
  templateUrl: './minimum-acceptable-diet-wizard.component.html',
  styleUrls: ['./minimum-acceptable-diet-wizard.component.scss'],
})
export class MinimumAcceptableDietWizardComponent implements OnInit {
  frequencyOptionsEnum: { [key: number]: string } = {
    [Frequency.Once]: 'Once',
    [Frequency.Twice]: 'Twice',
    [Frequency.Thrice]: 'Thrice',
    [Frequency.FourTimes]: 'Four Times',
    [Frequency.AboveFourTimes]: 'Above Four Times',
  };

  get frequencyOptionsArray(): { value: number; label: string }[] {
    return Object.keys(this.frequencyOptionsEnum).map((key) => {
      return {
        value: +key,
        label: this.frequencyOptionsEnum[+key],
      };
    });
  }

  minimumAcceptableDiets: { Oid: number; Description: string }[] = [];

  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  selectedItems: number[] = [];
  isEnabled: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  existingRecords: ClientMinimumAcceptableDiet[] = [];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private MinimumAcceptableService: MinimumAcceptableDietStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      // TransactionId: new FormControl(null),
      MinimumAcceptableDietId: new FormControl(null, Validators.required),
      Frequency: new FormControl(null),
      OnlineDbOid: new FormControl(null),
    });
  }

  async ngOnInit() {
    // Fetching Minimum Acceptable Diets
    this.MinimumAcceptableService.fetchMinimumAcceptableDiet().subscribe((data) => {
      this.minimumAcceptableDiets = data;
    });

    // Enable the form if no items are selected
    // this.isEnabled = this.selectedItems?.length === 0;

    // Fetch existing records for the selected members
    this.existingRecords = await this.MinimumAcceptableService.getClientsMinimumAcceptableDietByClientIds(
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
        MinimumAcceptableDietId: singleClientData.MinimumAcceptableDietId,
        Frequency: singleClientData.Frequency,
        TransactionId: singleClientData.TransactionId,
      });
    } else {
      this.form.patchValue({
        OnlineDbOid: null,
        MinimumAcceptableDietId: null,
        Frequency: null,
        TransactionId: null,
      });
    }
  }

  private handleMultipleClients(isSameClients: boolean, isSameMatchId: boolean) {
    if (!this.existingRecords.length) {
      // No data for any selected clients
      this.form.patchValue({
        OnlineDbOid: null,
        MinimumAcceptableDietId: null,
        Frequency: null,
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
        MinimumAcceptableDietId: this.existingRecords[0].MinimumAcceptableDietId,
        Frequency: this.existingRecords[0].Frequency,
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

  // * Handle Select
  handleSelectionChange(event: any, value: number) {
    this.isEnabled = false;
    if (event.detail.checked) {
      this.selectedItems.push(value);
    } else {
      const index = this.selectedItems.indexOf(value);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      }
    }

    if (this.selectedItems.length === 0) {
      this.isEnabled = true;
    } else {
      this.isEnabled = false;
    }
  }

  // * For submitting the form
  async onSubmit() {
    this.submitLoading = true;
    const isFormValid = this.form.valid;
    let matchId = uuidv4();
    // * Validation Check
    if (!isFormValid) {
      this.isValid = true;
      this.submitLoading = false;
      return;
    } else {
      if (this.form.valid) {
        const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

        const MinimumWizardArray: ClientMinimumAcceptableDiet[] = this.member.map((member) => {
          // Find existing record for the member
          const existingRecord = this.existingRecords.find((record) => record.ClientId === member.Oid);

          // If existing record is found, update it
          const ClientMinimumAcceptablePayload: ClientMinimumAcceptableDiet = {
            TransactionId: existingRecord?.TransactionId,
            MinimumAcceptableDietId: this.form.value.MinimumAcceptableDietId,
            Frequency: this.form.value.Frequency,
            OnlineDbOid: existingRecord?.OnlineDbOid || this.form.value.OnlineDbOid,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            IsDeleted: false,
            MatchId: matchId,
            CreatedAt: dayjs().format(),
          };
          return ClientMinimumAcceptablePayload;
        });

        console.log(MinimumWizardArray);

        const responses = await this.MinimumAcceptableService.addClientMinimumAcceptableDiet(MinimumWizardArray);

        console.log('responses =>', responses);
        let success = false;

        // if all response.changes.changes is true, then success is true
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
