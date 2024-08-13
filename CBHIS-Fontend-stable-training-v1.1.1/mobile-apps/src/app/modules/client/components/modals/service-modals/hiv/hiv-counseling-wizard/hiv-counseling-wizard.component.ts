import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { CounselingType } from 'src/app/modules/client/enums/hiv.enum';
import { Client } from 'src/app/modules/client/models/client';
import { Counseling } from 'src/app/modules/client/models/service-models/hiv';
import { CounsellingStorageService } from 'src/app/modules/client/services/hiv/counselling-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-hiv-counseling-wizard',
  templateUrl: './hiv-counseling-wizard.component.html',
  styleUrls: ['./hiv-counseling-wizard.component.scss'],
})
export class HivCounselingWizardComponent implements OnInit {
  counselingTypesEnum: { [key: number]: string } = {
    [CounselingType.HIVInitial]: 'HIV Initial',
    [CounselingType.HIVPostTest]: 'HIV Post Test',
    [CounselingType.ANC]: 'ANC',
    [CounselingType.General]: 'General',
  };

  get counselingTypesArray() {
    return Object.entries(this.counselingTypesEnum).map(([key, value]) => {
      return { label: value, value: +key };
    });
  }

  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  existingRecords: Counseling[] = [];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private CounselingService: CounsellingStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      OnlineDbOid: new FormControl(null),
      CounselingType: new FormControl(null, [Validators.required]),
    });
  }

  async ngOnInit() {
    // * Fetching the existing records
    this.existingRecords = await this.CounselingService.getClientsCounselingByClientIds(
      this.member.map((member) => member.Oid)
    );

    console.log('Existing Records ==>', this.existingRecords);

    // * Get Client IDs from the existing records
    const clientsFromExistingRecords = this.existingRecords.map((record) => record.ClientId);

    // * Check if the clients from the existing records are the same as the selected clients
    const isSameClients = this.member.every((member) => clientsFromExistingRecords.includes(member.Oid));
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
        CounselingType: singleClientData.CounselingType,
        TransactionId: singleClientData.TransactionId,
      });
    } else {
      this.form.patchValue({
        OnlineDbOid: null,
        CounselingType: null,
        TransactionId: null,
      });
    }
  }

  private handleMultipleClients(isSameClients: boolean, isSameMatchId: boolean) {
    if (!this.existingRecords.length) {
      // No data for any selected clients
      this.form.patchValue({
        OnlineDbOid: null,
        CounselingType: null,
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
        CounselingType: this.existingRecords[0].CounselingType,
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

        const CounselingArray: Counseling[] = this.member.map((member) => {
          const existingRecord = this.existingRecords.find((record) => record.ClientId === member.Oid);

          const CounselingPayload: Counseling = {
            TransactionId: existingRecord?.TransactionId,
            CounselingType: this.form.value.CounselingType,
            OnlineDbOid: existingRecord?.OnlineDbOid || this.form.value.OnlineDbOid,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            IsDeleted: false,
            MatchId: matchId,
            CreatedAt: dayjs().format(),
          };
          return CounselingPayload;
        });

        const responses = await this.CounselingService.addCounseling(CounselingArray);
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
