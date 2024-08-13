import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../../models/client';
import { ARTClient } from '../../../models/service-models/art';
import { ArtStorageService } from '../../../services/art/art-storage.service';

@Component({
  selector: 'app-art-wizard',
  templateUrl: './art-wizard.component.html',
  styleUrls: ['./art-wizard.component.scss'],
})
export class ARTWizardComponent implements OnInit {
  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  isUpdate: boolean = false;
  existingRecords: ARTClient[] = [];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private ARTClientService: ArtStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      MedicationSideEffect: new FormControl(),
      IsOnTBPrevention: new FormControl(),
      WellbeingIssues: new FormControl(),
      OnlineDbOid: new FormControl(null),
    });
  }

  async ngOnInit() {
    this.existingRecords = await this.ARTClientService.getARTClientsByClientIds(
      this.member.map((member) => member.Oid)
    );

    console.log('response ', this.existingRecords);

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
      this.isUpdate = true;
      this.form.patchValue({
        OnlineDbOid: singleClientData.OnlineDbOid,
        MedicationSideEffect: singleClientData.MedicationSideEffect,
        IsOnTBPrevention: singleClientData.IsOnTBPrevention,
        WellbeingIssues: singleClientData.WellbeingIssues,
        TransactionId: singleClientData.TransactionId,
      });
    } else {
      this.form.patchValue({
        OnlineDbOid: null,
        MedicationSideEffect: null,
        IsOnTBPrevention: null,
        WellbeingIssues: null,
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
        MedicationSideEffect: null,
        IsOnTBPrevention: null,
        WellbeingIssues: null,
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
        MedicationSideEffect: this.existingRecords[0].MedicationSideEffect,
        IsOnTBPrevention: this.existingRecords[0].IsOnTBPrevention,
        WellbeingIssues: this.existingRecords[0].WellbeingIssues,
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

  // For submitting the form
  async onSubmit() {
    console.log(this.form.value);
    let matchId = uuidv4();
    if (
      this.form.get('MedicationSideEffect')?.value ||
      this.form.get('WellbeingIssues')?.value ||
      this.form.get('IsOnTBPrevention')?.value ||
      this.isUpdate
    ) {
      const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

      if (currentUser && currentUser.Oid) {
        const ARTClientArray: ARTClient[] = this.member.map((member) => {
          const existingRecord = this.existingRecords.find((record) => record.ClientId === member.Oid);

          const ARTClientPayload: ARTClient = {
            TransactionId: existingRecord?.TransactionId,
            MedicationSideEffect: this.form.get('MedicationSideEffect')?.value,
            IsOnTBPrevention: this.form.get('IsOnTBPrevention')?.value,
            WellbeingIssues: this.form.get('WellbeingIssues')?.value,
            OnlineDbOid: existingRecord?.OnlineDbOid || this.form.get('OnlineDbOid')?.value,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            MatchId: matchId,
            IsDeleted: false,

            CreateAt: dayjs().format(),
          };
          return ARTClientPayload;
        });
        const responses = await this.ARTClientService.addARTClient(ARTClientArray);

        let success = false;
        success = responses.every((response) => response?.changes?.changes);

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
      }
    } else {
    }
    this.dismissModal();
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
