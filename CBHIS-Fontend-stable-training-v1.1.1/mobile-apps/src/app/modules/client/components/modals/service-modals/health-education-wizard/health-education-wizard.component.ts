import { Component, Input, OnInit } from '@angular/core';
import { AlertButton } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { v4 as uuidv4 } from 'uuid';
import { DiscussedHealthEducationTopic } from '../../../../models/discussed-topics';
import { HealthEducationTopics } from '../../../../models/health-education-topics';
import { HealthEducationDiscussedTopicsStorageService } from '../../../../services/health-education-discussed-topics-storage.service';
import { JobAidPopoverComponent } from '../../job-aid-popover/job-aid-popover.component';

@Component({
  selector: 'app-health-education-wizard',
  templateUrl: './health-education-wizard.component.html',
  styleUrls: ['./health-education-wizard.component.scss'],
})
export class HealthEducationWizardComponent implements OnInit {
  selectedTopics: number[] = [];
  options!: HealthEducationTopics[];
  isEnabled: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  existingRecords: DiscussedHealthEducationTopic[] = [];
  isOpen = false;
  okButton: AlertButton = {
    text: 'Ok',
    cssClass: 'alert-button-confirm',
    handler: () => {
      this.dismissModal();
    },
  };

  constructor(
    private modalService: ModalService,
    private healthEducationDiscussedTopicsStorageService: HealthEducationDiscussedTopicsStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {}

  async ngOnInit() {
    // Fetch health education topics
    this.healthEducationDiscussedTopicsStorageService.fetchHealthEducationTopics().subscribe((data) => {
      this.options = data;
    });

    // Fetch existing records for the selected members
    this.existingRecords =
      await this.healthEducationDiscussedTopicsStorageService.getDiscussedHealthEducationTopicsByClientIds(
        this.member.map((member) => member.Oid)
      );

    // Get client IDs from the existing records
    let clientsFromExistingRecords = this.existingRecords.map((record) => record.ClientId);

    // Check if the clients from the existing records are the same as the selected clients
    let isSameClients = this.member.every((client) => clientsFromExistingRecords.includes(client.Oid));
    let isSameMatchId = this.existingRecords.every((record) => record.MatchId === this.existingRecords[0]?.MatchId);

    // Handle the case where a single client is selected
    if (this.member.length === 1) {
      const singleClientData = this.existingRecords.find((record) => record.ClientId === this.member[0].Oid);
      if (singleClientData) {
        this.selectedTopics = this.existingRecords.map((record) => record.TopicId);
        this.isEnabled = false;
      } else {
        this.selectedTopics = [];
        this.isEnabled = true;
      }
    } else if (this.member.length > 1) {
      // Handle the case where multiple clients are selected
      if (!this.existingRecords.length) {
        // No data for any selected clients
        this.selectedTopics = [];
        this.isEnabled = true;
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
        this.selectedTopics = [...new Set(this.existingRecords.map((record) => record.TopicId))];
        this.isEnabled = false;
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
  // async ngOnInit() {
  //   this.healthEducationDiscussedTopicsStorageService.fetchHealthEducationTopics().subscribe((data) => {
  //     this.options = data;
  //   });

  //   this.existingRecords =
  //     await this.healthEducationDiscussedTopicsStorageService.getDiscussedHealthEducationTopicsByClientIds(
  //       this.member.map((member) => member.Oid)
  //     );

  //   // get clients from the existing records
  //   let clientsFromExistingRecords = this.existingRecords.map((record) => record.ClientId);

  //   // if (this.member.length === clientsFromExistingRecords.length) {
  //   // check if the clients from the existing records are the same as the selected clients
  //   let isSameClients = this.member.every((client) => clientsFromExistingRecords.includes(client.Oid));
  //   if (!isSameClients) {
  //     this.toast.openAlert({
  //       header: '',
  //       message:
  //         'Service records for the selected client already exist. Please choose the existing client to update their records or select a different client to create new records.',
  //       buttons: [this.okButton],
  //       cssClass: 'service-check-alert',
  //     });
  //   }

  //   console.log(this.existingRecords, 'existing records');

  //   let isSameMatchId = this.existingRecords.every((record) => record.MatchId === this.existingRecords[0].MatchId);

  //   if (this.member.length > 1 && !isSameMatchId) {
  //     this.toast.openAlert({
  //       header: '',
  //       message:
  //         'The selected client has different versions of records. Please select each client individually to create or update their records.',
  //       buttons: [this.okButton],
  //       cssClass: 'service-check-alert',
  //     });
  //   }

  //   if (this.member.length === 1 || isSameMatchId)
  //     this.healthEducationDiscussedTopicsStorageService
  //       .getDiscussedHealthEducationTopicsByClientId(this.member[0].Oid)
  //       .then((data) => {
  //         console.log('health education topic for 1st client', data);
  //         this.selectedTopics = data.map((topic) => topic.TopicId);
  //       });

  //   this.selectedTopics.length ? (this.isEnabled = false) : (this.isEnabled = true);
  // }

  openPopover(event: any, index: number) {
    console.log(this.options[index]?.Description);
    this.modalService.presentPopover({
      component: JobAidPopoverComponent,
      componentProps: {
        description: this.options[index]?.Description,
        jobAid: this.options[index]?.JobAid,
      },
      event: event,
      mode: 'ios',
      cssClass: 'job-aid-popover',
      side: 'bottom',
    });
  }

  handleSelectionChange(event: any, value: number) {
    if (event.detail.checked) {
      this.selectedTopics.push(value);
    } else {
      const index = this.selectedTopics.indexOf(value);
      if (index > -1) {
        this.selectedTopics.splice(index, 1);
      }
    }
    this.isEnabled = this.selectedTopics.length < 1;
  }

  async onSubmit() {
    // Initialize an empty array to hold the discussed health education topics
    const discussedTopics: DiscussedHealthEducationTopic[] = [];
    let matchId = uuidv4();
    let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;
    // Check if there are any selected topics
    if (this.selectedTopics.length) {
      // Iterate over each selected member
      this.member.map((member) => {
        // For each member, iterate over each selected topic
        this.selectedTopics.map((topic) => {
          // Push a new object into the discussedTopics array for each combination of member and topic
          // This object includes the topic ID, client ID, and a flag indicating the topic is not deleted
          discussedTopics.push({
            TopicId: topic,
            ClientId: member.Oid,
            IsDeleted: false,
            MatchId: matchId,
            CreatedBy: currentUser.Oid,
            CreatedAt: dayjs().format(),
          });
        });
      });
      const response = await this.healthEducationDiscussedTopicsStorageService.addDiscussedHealthEducationTopic(
        discussedTopics
      );

      console.log(response);
      if (response?.changes?.changes) {
        this.modalService.dismissModal();
        this.toast.openToast({
          message: 'Successfully recorded',
          position: 'bottom',
          duration: 1000,
          color: 'success',
        });
      } else {
        this.toast.openToast({
          message: 'Select at least one topic to save.',
          position: 'bottom',
          duration: 1000,
        });
      }
    } else {
      this.toast.openToast({
        message: 'Select at least one topic to save.',
        position: 'bottom',
        duration: 1000,
        color: 'danger',
      });
    }
  }

  dismissModal() {
    this.modalService.dismissModal();
  }
}
