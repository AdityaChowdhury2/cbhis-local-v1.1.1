import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../models/client';
import { HouseholdControlIntervention, MalariaControlIntervention } from '../../models/service-models/malaria';
import { HouseholdControlInterventionStorageService } from '../../services/malaria/household-control-intervention-storage.service';
@Component({
  selector: 'app-household-control-intervention-wizard',
  templateUrl: './household-control-intervention-wizard.component.html',
  styleUrls: ['./household-control-intervention-wizard.component.scss'],
})
export class HouseholdControlInterventionWizardComponent implements OnInit {
  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  controlInterventionsOptions: MalariaControlIntervention[] = [];
  existingRecords: HouseholdControlIntervention[] = [];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private householdControlInterventionService: HouseholdControlInterventionStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      ControlInterventionId: new FormControl('', Validators.required),
      OnlineDbOid: new FormControl(null),
    });
  }

  async ngOnInit() {
    this.householdControlInterventionService.fetchMalariaControlInterventions().subscribe((controlInterventions) => {
      console.log('controlInterventions :>> ', controlInterventions);
      this.controlInterventionsOptions = controlInterventions;
    });

    this.existingRecords = await this.householdControlInterventionService.getHouseholdControlInterventionByClientIds(
      this.member.map((member) => member.Oid)
    );

    console.log(this.existingRecords);
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
        ControlInterventionId: singleClientData.ControlInterventionId,
        TransactionId: singleClientData.TransactionId,
      });
    } else {
      this.form.patchValue({
        OnlineDbOid: null,
        ControlInterventionId: null,
        TransactionId: null,
      });
    }
  }

  private handleMultipleClients(isSameClients: boolean, isSameMatchId: boolean) {
    if (!this.existingRecords.length) {
      // No data for any selected clients
      this.form.patchValue({
        OnlineDbOid: null,
        ControlInterventionId: null,
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
        OnlineDbOid: this.existingRecords?.[0].OnlineDbOid,
        ControlInterventionId: this.existingRecords?.[0].ControlInterventionId,
        TransactionId: this.existingRecords?.[0].TransactionId,
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
        let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;
        const HouseholdControlInterventionArray: HouseholdControlIntervention[] = this.member.map((member) => {
          const HouseholdControlInterventionPayload: HouseholdControlIntervention = {
            TransactionId: this.form.value.TransactionId,
            ControlInterventionId: this.form.value.ControlInterventionId,
            OnlineDbOid: this.form.value.OnlineDbOid,
            ClientId: member.Oid,
            CreatedBy: currentUser.Oid,
            IsDeleted: false,
            MatchId: matchId,
            CreatedAt: dayjs().format(),
          };
          return HouseholdControlInterventionPayload;
        });

        const responses = await this.householdControlInterventionService.addHouseholdControlIntervention(
          HouseholdControlInterventionArray
        );
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
