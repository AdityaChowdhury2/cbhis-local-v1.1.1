import { Component, Input, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../models/client';
import { ClientMalariaSymptom, MalariaSymptom } from '../../models/service-models/malaria';
import { MalariaSymptomsStorageService } from '../../services/malaria/malaria-symptoms-storage.service';
@Component({
  selector: 'app-malaria-symptoms-wizard',
  templateUrl: './malaria-symptoms-wizard.component.html',
  styleUrls: ['./malaria-symptoms-wizard.component.scss'],
})
export class MalariaSymptomsWizardComponent implements OnInit {
  // form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  malariaSymptomsArray: MalariaSymptom[] = [];
  selectedItems: number[] = [];
  isDisabled: boolean = false;
  existingRecords: ClientMalariaSymptom[] = [];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private ClientMalariaSymptomService: MalariaSymptomsStorageService,
    private authStorageService: AuthStorageService
  ) {
    // // * Form Validations
    // this.form = new FormGroup({
    //   MalariaSymptomId: new FormControl('', Validators.required),
    // });
  }

  async ngOnInit() {
    this.selectedItems.length ? (this.isDisabled = false) : (this.isDisabled = true);
    this.existingRecords = await this.ClientMalariaSymptomService.getClientMalariaSymptomsByClientIds(
      this.member.map((member) => member.Oid)
    );

    // Get client IDs from the existing records
    let clientsFromExistingRecords = this.existingRecords.map((record) => record.ClientId);

    // Check if the clients from the existing records are the same as the selected clients
    let isSameClients = this.member.every((client) => clientsFromExistingRecords.includes(client.Oid));
    let isSameMatchId = this.existingRecords.every((record) => record.MatchId === this.existingRecords[0]?.MatchId);

    this.ClientMalariaSymptomService.fetchMalariaSymptoms().subscribe((response) => {
      this.malariaSymptomsArray = response;
    });

    // Handle the case where a single client is selected
    if (this.member.length === 1) {
      const singleClientData = this.existingRecords.find((record) => record.ClientId === this.member[0].Oid);
      if (singleClientData) {
        this.selectedItems = this.existingRecords.map((record) => record.MalariaSymptomId);
        this.isDisabled = false;
      } else {
        this.selectedItems = [];
        this.isDisabled = true;
      }
    } else if (this.member.length > 1) {
      // Handle the case where multiple clients are selected
      if (!this.existingRecords.length) {
        // No data for any selected clients
        this.selectedItems = [];
        this.isDisabled = true;
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
        this.selectedItems = [...new Set(this.existingRecords.map((record) => record.MalariaSymptomId))];
        this.isDisabled = false;
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
    this.isDisabled = this.selectedItems.length < 1;
  }

  // * For submitting the form
  async onSubmit() {
    this.submitLoading = true;
    let matchId = uuidv4();
    const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    if (this.selectedItems.length) {
      const ClientMalariaSymptomArray: ClientMalariaSymptom[] = [];
      this.member.map((member) => {
        this.selectedItems.map((item) => {
          const ClientMalariaSymptomPayload: ClientMalariaSymptom = {
            ClientId: member.Oid,
            MalariaSymptomId: item,
            IsDeleted: false,
            MatchId: matchId,
            CreatedBy: currentUser.Oid,
            CreatedAt: dayjs().format(),
          };
          ClientMalariaSymptomArray.push(ClientMalariaSymptomPayload);
        });
      });

      const response = await this.ClientMalariaSymptomService.addClientMalariaSymptoms(ClientMalariaSymptomArray);

      if (response?.changes?.changes === ClientMalariaSymptomArray.length) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 1000,
          position: 'bottom',
          color: 'success',
        });
        // this.form.reset();
      } else {
        this.toast.openToast({
          message: 'Failed to save the data',
          duration: 1000,
          position: 'bottom',
          color: 'danger',
        });
      }
    }

    // }
    // else {
    //   this.toast.openToast({
    //     message: 'Please fill in all required fields',
    //     duration: 1000,
    //     position: 'bottom',
    //     color: 'warning',
    //   });
    // }

    this.submitLoading = false;
    this.dismissModal();
    // }
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
