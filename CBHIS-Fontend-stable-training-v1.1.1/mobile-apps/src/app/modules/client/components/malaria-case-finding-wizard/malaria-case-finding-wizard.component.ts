import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as dayjs from 'dayjs';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../models/client';
import { MalariaCaseFinding } from '../../models/service-models/malaria';
import { CaseFindingStorageService } from '../../services/malaria/case-finding-storage.service';
import { AuthStorageService } from './../../../../core/services/auth-storage.service';

@Component({
  selector: 'app-malaria-case-finding-wizard',
  templateUrl: './malaria-case-finding-wizard.component.html',
  styleUrls: ['./malaria-case-finding-wizard.component.scss'],
})
export class MalariaCaseFindingWizardComponent implements OnInit {
  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  isUpdate: boolean = false;
  existingRecords: MalariaCaseFinding[] = [];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private caseFindingStorageService: CaseFindingStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      IsResidenceInMalariaEndemicArea: new FormControl(false),
      IsMalariaExposed: new FormControl(false),
      ExposedWhere: new FormControl(),
      OnlineDbOid: new FormControl(null),
    });
  }

  async ngOnInit() {
    // Fetch existing records for the selected members
    this.existingRecords = await this.caseFindingStorageService.getClientsMalariaCaseFindingByClientIds(
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
      this.isUpdate = true;
      this.form.patchValue({
        OnlineDbOid: singleClientData.OnlineDbOid,
        IsResidenceInMalariaEndemicArea: singleClientData.IsResidenceInMalariaEndemicArea,
        IsMalariaExposed: singleClientData.IsMalariaExposed,
        ExposedWhere: singleClientData.ExposedWhere,
        TransactionId: singleClientData.TransactionId,
      });
    } else {
      this.form.patchValue({
        OnlineDbOid: null,
        IsResidenceInMalariaEndemicArea: null,
        IsMalariaExposed: null,
        ExposedWhere: null,
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
        IsResidenceInMalariaEndemicArea: null,
        IsMalariaExposed: null,
        ExposedWhere: null,
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
        IsResidenceInMalariaEndemicArea: this.existingRecords[0].IsResidenceInMalariaEndemicArea,
        IsMalariaExposed: this.existingRecords[0].IsMalariaExposed,
        ExposedWhere: this.existingRecords[0].ExposedWhere,
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
    let matchId = uuidv4();
    console.log(this.form.value);
    if (
      this.form.get('IsResidenceInMalariaEndemicArea')?.value ||
      this.form.get('IsMalariaExposed')?.value ||
      this.form.get('ExposedWhere')?.value ||
      this.isUpdate
    ) {
      const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

      const MalariaCaseFindingArray: MalariaCaseFinding[] = this.member.map((member) => {
        const MalariaCaseFindingPayload: MalariaCaseFinding = {
          TransactionId: this.form.value.TransactionId,
          IsResidenceInMalariaEndemicArea: this.form.value.IsResidenceInMalariaEndemicArea,
          IsMalariaExposed: this.form.value.IsMalariaExposed,
          ExposedWhere: this.form.value.ExposedWhere,
          OnlineDbOid: this.form.value.OnlineDbOid,
          CreatedBy: currentUser.Oid,
          ClientId: member.Oid,
          IsDeleted: false,
          MatchId: matchId,
          CreatedAt: dayjs().format(),
        };
        return MalariaCaseFindingPayload;
      });

      const responses = await this.caseFindingStorageService.addMalariaCaseFinding(MalariaCaseFindingArray);
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
      console.log('Form not submitted');
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
