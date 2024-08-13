import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import { PostNatal, PostNatalDepression } from 'src/app/modules/client/models/service-models/postnatal';
import { PostnatalDepressionsStorageService } from 'src/app/modules/client/services/postnatal/postnatal-depressions-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-postnatal-depressions-wizard',
  templateUrl: './postnatal-depressions-wizard.component.html',
  styleUrls: ['./postnatal-depressions-wizard.component.scss'],
})
export class PostnatalDepressionsWizardComponent implements OnInit {
  form: FormGroup;
  submitLoading: boolean = false;
  isValid: boolean = false;
  preventativeDepression: any = [];
  @Input() head!: Client;
  @Input() member!: Client[];
  @Input() PostNatalData!: PostNatal;
  selectedItems: number[] = [];
  isDisable: boolean = false;

  constructor(
    private modalService: ModalService,
    private PostnatalDepressionsStorageService: PostnatalDepressionsStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      PostpartumDepressionId: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.isDisable = this.selectedItems.length < 1;

    this.PostnatalDepressionsStorageService.fetchPostPartumDepressions().subscribe((data) => {
      this.preventativeDepression = data;
    });

    if (this.PostNatalData?.TransactionId) {
      this.PostnatalDepressionsStorageService.getPostNatalDepressionByPostNatalId(
        this.PostNatalData.TransactionId
      ).then((data) => {
        if (data.length) {
          this.selectedItems = data.map((item) => item.PostPartumDepressionId);
        }
      });
    }
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

      const postNatalDepressionArray: PostNatalDepression[] = this.selectedItems.map((item) => ({
        PostPartumDepressionId: item,
        IsDeleted: false,
        PostNatalId: this.PostNatalData.TransactionId as string,
        CreatedBy: currentUser.Oid,
      }));

      const response = await this.PostnatalDepressionsStorageService.addPostNatalDepression(postNatalDepressionArray);

      if (response?.changes?.changes === postNatalDepressionArray.length) {
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

  //   const PostNatalDepressionServiceArray: PostNatalDepression[] = [];
  //   if (this.selectedItems.length) {
  //     if (this.member.length === 1) {
  //       this.selectedItems.forEach((item) => {
  //         const PostNatalDepressionServicePayload: PostNatalDepression = {
  //           PostPartumDepressionId: item,
  //           IsDeleted: false,
  //           PostNatalId: this.PostNatalId,
  //         };
  //         PostNatalDepressionServiceArray.push(PostNatalDepressionServicePayload);
  //       });
  //       const response = await this.PostNatalDepressionService.addPostNatalDepression(PostNatalDepressionServiceArray);
  //       if (response?.changes?.changes === PostNatalDepressionServiceArray.length) {
  //         this.toast.openToast({
  //           message: 'Successfully recorded',
  //           duration: 2000,
  //           position: 'bottom',
  //           color: 'success',
  //         });
  //         this.form.reset();
  //       }

  //       this.submitLoading = false;
  //       this.dismissModal();
  //     } else {
  //       this.toast.openToast({
  //         message: 'Select only one client to save the data.',
  //         position: 'bottom',
  //         duration: 1000,
  //         color: 'danger',
  //       });
  //       this.submitLoading = false;
  //     }
  //   } else {
  //     this.toast.openToast({
  //       message: 'Select at least one topic to save.',
  //       position: 'bottom',
  //       duration: 1000,
  //       color: 'danger',
  //     });
  //     this.submitLoading = false;
  //   }
  // }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
