import { Component, Input, OnInit } from '@angular/core';
import { AlertButton } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../../models/client';
import { DietaryDiversity, HouseholdDietaryDiversity } from '../../../models/service-models/household-nutrition';
import { DietaryDiversityStorageService } from '../../../services/household-nutrition/dietary-diversity-storage.service';

@Component({
  selector: 'app-dietary-diversity-wizard',
  templateUrl: './dietary-diversity-wizard.component.html',
  styleUrls: ['./dietary-diversity-wizard.component.scss'],
})
export class DietaryDiversityWizardComponent implements OnInit {
  // form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  selectedItems: number[] = [];
  isDisable: boolean = false;
  dietaryDiversityObjects: DietaryDiversity[] = [];
  existingRecords: HouseholdDietaryDiversity[] = [];
  okButton: AlertButton = {
    text: 'Ok',
    cssClass: 'alert-button-confirm',
    handler: () => {
      this.dismissModal();
    },
  };

  constructor(
    private modalService: ModalService,
    private dietaryDiversityStorageService: DietaryDiversityStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
  }

  async ngOnInit() {
    this.selectedItems.length ? (this.isDisable = false) : (this.isDisable = true);

    // Fetch dietary diversity data
    this.dietaryDiversityStorageService.fetchDietaryDiversity().subscribe((data) => {
      this.dietaryDiversityObjects = data;
    });

    // Fetch existing records for the selected members
    this.existingRecords = await this.dietaryDiversityStorageService.getHouseholdDietaryDiversityByClientIds(
      this.member.map((member) => member.Oid)
    );

    console.log(this.existingRecords, 'existing records');

    let clientsFromExistingRecords = this.existingRecords.map((record) => record.ClientId);
    let isSameClients = this.member.every((client) => clientsFromExistingRecords.includes(client.Oid));
    let isSameMatchId = this.existingRecords.every((record) => record.MatchId === this.existingRecords?.[0]?.MatchId);

    // Handle the case where a single client is selected
    if (this.member.length === 1) {
      const singleClientData = this.existingRecords.find((record) => record.ClientId === this.member[0].Oid);
      if (singleClientData) {
        this.selectedItems = this.existingRecords.map((record) => record.DietaryDiversityId);
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
        this.selectedItems = [...new Set(this.existingRecords.map((record) => record.DietaryDiversityId))];
        this.isDisable = false;
      }
    }
  }

  private showAlert(message: string) {
    this.toast.openAlert({
      header: '',
      message: message,
      buttons: [this.okButton],
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

  async onSubmit() {
    this.submitLoading = true;
    let matchId = uuidv4();
    // Initialize an empty array to hold the dietary diversity records
    const dietaryDiversityArray: HouseholdDietaryDiversity[] = [];
    let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    // Check if there are any selected items
    if (this.selectedItems.length) {
      // Iterate over each selected member
      this.member.forEach((member) => {
        // For each member, iterate over each selected item
        this.selectedItems.forEach((item) => {
          // Push a new object into the dietaryDiversityArray for each combination of member and item
          // This object includes the client ID, dietary diversity ID, and a flag indicating the item is not deleted
          dietaryDiversityArray.push({
            ClientId: member.Oid,
            DietaryDiversityId: item,
            IsDeleted: false,
            CreatedBy: currentUser?.Oid,
            MatchId: matchId,
            CreatedAt: dayjs().format(),
          });
        });
      });

      // Call the storage service to add the dietary diversity records
      const response = await this.dietaryDiversityStorageService.addHouseholdDietaryDiversity(dietaryDiversityArray);

      // Check if the response indicates successful changes
      if (response?.changes?.changes === dietaryDiversityArray.length) {
        // Show success message and dismiss modal
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 1000,
          position: 'bottom',
          color: 'success',
        });
        this.dismissModal();
      } else {
        // Show failure message
        this.toast.openToast({
          message: 'Failed to save the data',
          duration: 1000,
          position: 'bottom',
          color: 'danger',
        });
      }
    } else {
      // Show message indicating that at least one item should be selected
      this.toast.openToast({
        message: 'Select at least one item to save.',
        duration: 1000,
        position: 'bottom',
        color: 'danger',
      });
    }

    this.submitLoading = false;
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
