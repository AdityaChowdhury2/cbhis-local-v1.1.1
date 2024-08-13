import { Component, Input, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../models/client';
import { HouseholdMalariaRisk, MalariaRisk } from '../../models/service-models/malaria';
import { HouseholdMalariaRiskStorageService } from '../../services/malaria/household-malaria-risk-storage.service';

@Component({
  selector: 'app-malaria-risk-wizard',
  templateUrl: './malaria-risk-wizard.component.html',
  styleUrls: ['./malaria-risk-wizard.component.scss'],
})
export class MalariaRiskWizardComponent implements OnInit {
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  malariaRiskArray: MalariaRisk[] = [];
  selectedItems: number[] = [];
  isDisable: boolean = false;
  existingRecords: HouseholdMalariaRisk[] = [];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private authStorageService: AuthStorageService,
    private HouseholdMalariaRiskService: HouseholdMalariaRiskStorageService
  ) {}

  async ngOnInit() {
    // * Fetching the malaria risk list from the database
    this.HouseholdMalariaRiskService.fetchMalariaRisks().subscribe((response) => {
      this.malariaRiskArray = response;
    });
    this.existingRecords = await this.HouseholdMalariaRiskService.getHouseholdMalariaRiskByClientIds(
      this.member.map((member) => member.Oid)
    );

    console.log(this.existingRecords);

    this.isDisable = this.selectedItems.length < 1;

    // Get client IDs from the existing records
    let clientsFromExistingRecords = this.existingRecords.map((record) => record.ClientId);

    // Check if the clients from the existing records are the same as the selected clients
    let isSameClients = this.member.every((client) => clientsFromExistingRecords.includes(client.Oid));
    let isSameMatchId = this.existingRecords.every((record) => record.MatchId === this.existingRecords[0]?.MatchId);

    if (this.member.length === 1) {
      const singleClientData = this.existingRecords.find((record) => record.ClientId === this.member[0].Oid);
      if (singleClientData) {
        this.selectedItems = this.existingRecords.map((record) => record.MalariaRiskId);
        this.isDisable = false;
      } else {
        this.selectedItems = [];
        this.isDisable = true;
      }
    } else if (this.member.length > 1) {
      // Handle the case where multiple clients are selected
      if (!this.existingRecords.length) {
        // No data for any selected clients
        this.selectedItems = [];
        this.isDisable = true;
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
        this.selectedItems = [...new Set(this.existingRecords.map((record) => record.MalariaRiskId))];
        this.isDisable = false;
      }
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
    if (event.detail.checked) {
      this.selectedItems.push(value);
    } else {
      const index = this.selectedItems.indexOf(value);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      }
    }
    this.isDisable = this.selectedItems.length < 1;
  }

  // * For submitting the form
  async onSubmit() {
    this.submitLoading = true;
    let matchId = uuidv4();
    const HouseholdMalariaRiskArray: HouseholdMalariaRisk[] = [];
    const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    if (this.selectedItems.length) {
      this.member.map((member) => {
        this.selectedItems.map((item) => {
          const HouseholdMalariaRiskPayload: HouseholdMalariaRisk = {
            ClientId: member.Oid,
            MalariaRiskId: item,
            IsDeleted: false,
            CreatedBy: currentUser.Oid,
            MatchId: matchId,
            CreatedAt: dayjs().format(),
          };
          HouseholdMalariaRiskArray.push(HouseholdMalariaRiskPayload);
        });
      });

      const response = await this.HouseholdMalariaRiskService.addHouseholdMalariaRisk(HouseholdMalariaRiskArray);

      if (response?.changes?.changes === HouseholdMalariaRiskArray.length) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 1000,
          position: 'bottom',
          color: 'success',
        });
        this.submitLoading = false;
        this.dismissModal();
      } else {
        this.submitLoading = false;
        this.toast.openToast({
          message: 'Failed to save the data',
          duration: 1000,
          position: 'bottom',
          color: 'danger',
        });
        this.dismissModal();
      }
    } else {
      this.submitLoading = false;
      this.toast.openToast({
        message: 'Select at least one topic to save.',
        position: 'bottom',
        duration: 1000,
        color: 'danger',
      });
    }
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
