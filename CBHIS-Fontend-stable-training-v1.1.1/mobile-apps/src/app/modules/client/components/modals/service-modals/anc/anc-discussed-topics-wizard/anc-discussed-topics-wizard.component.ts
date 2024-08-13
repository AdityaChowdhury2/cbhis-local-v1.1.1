import { Component, Input, OnInit } from '@angular/core';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { JobAidPopoverComponent } from 'src/app/modules/client/components/modals/job-aid-popover/job-aid-popover.component';
import { ANCTopic } from 'src/app/modules/client/models/anc-topics';
import { Client } from 'src/app/modules/client/models/client';
import { ANCDiscussedTopics } from 'src/app/modules/client/models/discussed-anc-topics';
import { DiscussedANCTopicsStorageService } from 'src/app/modules/client/services/discussed-anc-topics-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-anc-discussed-topics-wizard',
  templateUrl: './anc-discussed-topics-wizard.component.html',
  styleUrls: ['./anc-discussed-topics-wizard.component.scss'],
})
export class AncDiscussedTopicsWizardComponent implements OnInit {
  @Input()
  head!: Client;
  @Input() member!: Client[];
  @Input() options!: ANCTopic[];
  isDisable: boolean = false;
  // Local Variables
  selectedANCTopics: number[] = [];

  // Constructor
  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private discussedANCTopicsStorageService: DiscussedANCTopicsStorageService,
    private authStorageService: AuthStorageService
  ) {}

  // Initialize the component
  ngOnInit() {
    if (this.selectedANCTopics?.length === 0) {
      this.isDisable = true;
    }
    // fetch anc topics list
    this.discussedANCTopicsStorageService.fetchANCTopics().subscribe((data) => {
      if (data.length) {
        this.options = data;
      }
    });

    if (this.member && this.member?.[0]?.Oid) {
      this.discussedANCTopicsStorageService.getANCDiscussedTopicsByClientId(this.member?.[0].Oid).then((data) => {
        this.selectedANCTopics = data.map((topic) => topic.ANCTopicId);
      });
    }
  }

  // Open a popover with the job aid description
  openPopover(event: any, index: number) {
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

  // On submit, save the selected options to the database
  async onSubmit() {
    if (this.selectedANCTopics.length === 0) {
      this.toast.openToast({
        message: 'Select at least one topic to save.',
        color: 'danger',
        duration: 1000,
      });
      return;
    }

    let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    if (this.selectedANCTopics.length && currentUser && currentUser.Oid) {
      const discussedANCTopics: ANCDiscussedTopics[] = this.selectedANCTopics.map((topic) => {
        return { ANCTopicId: topic, ClientId: this.member?.[0].Oid, IsDeleted: false, CreatedBy: currentUser.Oid };
      });
      const response = await this.discussedANCTopicsStorageService.addDiscussedANCTopic(discussedANCTopics);
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
          message: JSON.stringify(response),
          position: 'bottom',
          duration: 1000,
          color: 'success',
        });
      }
    }
  }

  // On toggle, update the selected options
  handleSelectionChange(event: any, value: number) {
    this.isDisable = false;
    if (event.detail.checked) {
      // Add the value if it's not already in the array
      if (!this.selectedANCTopics.includes(value)) {
        this.selectedANCTopics.push(value);
      }
    } else {
      // Remove the value if the checkbox is unchecked
      const index = this.selectedANCTopics.indexOf(value);
      if (index > -1) {
        this.selectedANCTopics.splice(index, 1);
      }
    }
  }

  // Dismiss the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
