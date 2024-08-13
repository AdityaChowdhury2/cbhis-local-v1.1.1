import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import {
  FeedingMethod,
  PostNatal,
  PostNatalFeedingMethod,
} from 'src/app/modules/client/models/service-models/postnatal';
import { PostnatalFeedingsMethodStorageService } from 'src/app/modules/client/services/postnatal/postnatal-feedings-method-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-postnatal-feeding-wizard',
  templateUrl: './postnatal-feeding-wizard.component.html',
  styleUrls: ['./postnatal-feeding-wizard.component.scss'],
})
export class PostnatalFeedingWizardComponent implements OnInit {
  @Input() PostNatalData!: PostNatal;
  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  PostNatalFeedingMethodData!: FeedingMethod[];
  member!: Client[];
  head!: Client;
  selectedItems: number[] = [];
  isDisable: boolean = false;

  constructor(
    private modalService: ModalService,
    private PostNatalFeedingMethodService: PostnatalFeedingsMethodStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      FeedingMethodId: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.isDisable = this.selectedItems.length < 1;

    if (this.PostNatalData?.TransactionId) {
      this.PostNatalFeedingMethodService.getPostNatalFeedingMethodByPostNatalId(this.PostNatalData.TransactionId).then(
        (feedingMethod) => {
          if (feedingMethod?.length) {
            this.selectedItems = feedingMethod.map((item) => item.FeedingMethodId);
          }
        }
      );
    }

    this.PostNatalFeedingMethodService.fetchFeedingMethods().subscribe((data) => {
      this.PostNatalFeedingMethodData = data;
    });

    // if (this.member && this.member?.[0]?.Oid) {
    //   this.PostNatalFeedingMethodService.getPostNatalFeedingMethodByPostNatalId(this.member?.[0]?.Oid).then((data) => {
    //     if (data?.length) {
    //       this.selectedItems = data.map((method) => method.FeedingMethodId);
    //     }
    //   });
    // }
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

    if (this.selectedItems.length && this.member.length === 1) {
      let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

      const postNatalFeedingMethodArray: PostNatalFeedingMethod[] = this.selectedItems.map((item) => ({
        FeedingMethodId: item,
        IsDeleted: false,
        PostNatalId: this.PostNatalData.TransactionId as string,
        CreatedBy: currentUser.Oid,
      }));

      const response = await this.PostNatalFeedingMethodService.addPostNatalFeedingMethod(postNatalFeedingMethodArray);

      if (response?.changes?.changes === postNatalFeedingMethodArray.length) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 2000,
          position: 'bottom',
          color: 'success',
        });
        this.dismissModal();
        this.form.reset();
      } else {
        this.toast.openToast({
          message: 'Failed to save the data',
          duration: 1000,
          position: 'bottom',
          color: 'danger',
        });
      }
    } else if (this.member.length !== 1) {
      this.toast.openToast({
        message: 'Select only one client to save the data.',
        position: 'bottom',
        duration: 1000,
        color: 'danger',
      });
    } else {
      this.toast.openToast({
        message: 'Select at least one topic to save.',
        position: 'bottom',
        duration: 1000,
        color: 'danger',
      });
    }

    this.submitLoading = false;
  }
  // async onSubmit() {
  //   this.submitLoading = true;

  //   if (this.selectedItems.length && this.member.length === 1) {
  //     const postNatalFeedingMethodArray: PostNatalFeedingMethod[] = this.selectedItems.map((item) => ({
  //       FeedingMethodId: item,
  //       IsDeleted: false,
  //       PostNatalId: this.PostNatalId,
  //     }));

  //     const response = await this.PostNatalFeedingMethodService.addPostNatalFeedingMethod(postNatalFeedingMethodArray);

  //     if (response?.changes?.changes === postNatalFeedingMethodArray.length) {
  //       this.toast.openToast({
  //         message: 'Successfully recorded',
  //         duration: 2000,
  //         position: 'bottom',
  //         color: 'success',
  //       });
  //       this.form.reset();
  //       this.dismissModal();
  //     } else {
  //       this.toast.openToast({
  //         message: 'Failed to save the data',
  //         duration: 1000,
  //         position: 'bottom',
  //         color: 'danger',
  //       });
  //     }
  //   } else if (this.member.length !== 1) {
  //     this.toast.openToast({
  //       message: 'Select only one client to save the data.',
  //       position: 'bottom',
  //       duration: 1000,
  //       color: 'danger',
  //     });
  //   } else {
  //     this.toast.openToast({
  //       message: 'Select at least one topic to save.',
  //       position: 'bottom',
  //       duration: 1000,
  //       color: 'danger',
  //     });
  //   }

  //   this.submitLoading = false;
  // }
  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
