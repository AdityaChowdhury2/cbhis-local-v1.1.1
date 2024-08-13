import { Component, Input, OnInit } from '@angular/core';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import { TBDiscussedTopic, TBEducationTopic } from 'src/app/modules/client/models/service-models/tb';
import { DiscussedTopicStorageService } from 'src/app/modules/client/services/tb/discussed-topic-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-tb-discussed-topic-wizard',
  templateUrl: './tb-discussed-topic-wizard.component.html',
  styleUrls: ['./tb-discussed-topic-wizard.component.scss'],
})
export class TBDiscussedTopicWizardComponent implements OnInit {
  data!: TBEducationTopic[];
  selectedTopics: number[] = [];
  @Input() head!: Client;
  @Input() member!: Client[];
  isDisabled: boolean = false;
  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private tbDiscussedTopicsStorageService: DiscussedTopicStorageService,
    private authStorageService: AuthStorageService
  ) {}

  ngOnInit() {
    this.isDisabled = this.selectedTopics.length < 1;

    // Fetch the TB education topics
    this.tbDiscussedTopicsStorageService.fetchTBTopics().subscribe((data) => {
      this.data = data;
    });

    this.tbDiscussedTopicsStorageService.getTBDiscussedTopicByClientId(this.member[0].Oid).then((data) => {
      if (data) {
        this.selectedTopics = data.map((topic) => topic.TBTopicId);
      }
    });
  }

  // For submitting the form
  async onSubmit() {
    if (this.selectedTopics.length === 0) {
      this.toast.openToast({
        message: 'Select at least one topic to save.',
        color: 'danger',
        duration: 1000,
      });
      return;
    } else {
      const discussedTopics: TBDiscussedTopic[] = [];

      const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

      // Check if there are any selected topics
      if (this.selectedTopics.length) {
        // Iterate over each selected member
        this.member.map((member) => {
          // For each member, iterate over each selected topic
          this.selectedTopics.map((topic) => {
            // Push a new object into the discussedTopics array for each combination of member and topic
            // This object includes the topic ID, client ID, and a flag indicating the topic is not deleted
            discussedTopics.push({
              TBTopicId: topic,
              ClientId: member.Oid,
              IsDeleted: false,
              CreatedBy: currentUser.Oid,
            });
          });
        });

        const response = await this.tbDiscussedTopicsStorageService.addTBDiscussedTopic(discussedTopics);

        console.log(response);
        if (response?.changes?.changes) {
          this.modalService.dismissModal();
          this.toast.openToast({
            message: 'Successfully recorded',
            position: 'bottom',
            duration: 1000,
            color: 'success',
          });
        }
      } else {
        this.toast.openToast({
          message: 'Select at least one topic to save.',
          position: 'bottom',
          duration: 1000,
        });
      }
    }
    console.log(this.selectedTopics);
    this.dismissModal();
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
    this.isDisabled = this.selectedTopics.length < 1;
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
