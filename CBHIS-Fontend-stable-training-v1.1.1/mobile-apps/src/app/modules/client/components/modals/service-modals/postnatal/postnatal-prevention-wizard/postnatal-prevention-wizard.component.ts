import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import {
  HivPreventativeService,
  PostNatal,
  PostNatalPreventativeService,
} from 'src/app/modules/client/models/service-models/postnatal';
import { PostnatalPreventiveStorageService } from 'src/app/modules/client/services/postnatal/postnatal-preventive-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-postnatal-prevention-wizard',
  templateUrl: './postnatal-prevention-wizard.component.html',
  styleUrls: ['./postnatal-prevention-wizard.component.scss'],
})
export class PostnatalPreventionWizardComponent implements OnInit {
  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  preventativeServices: HivPreventativeService[] = [];
  @Input() head!: Client;
  @Input() member!: Client[];
  @Input() PostNatalData!: PostNatal;
  selectedItems: number[] = [];
  isDisable: boolean = false;

  constructor(
    private modalService: ModalService,
    private PreventativeServiceStorageService: PostnatalPreventiveStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      PreventativeServiceId: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.selectedItems.length ? (this.isDisable = false) : (this.isDisable = true);
    if (this.PostNatalData?.TransactionId) {
      this.PreventativeServiceStorageService.getPostNatalPreventativeServiceByPostNatalId(
        this.PostNatalData.TransactionId
      ).then((preventativeService) => {
        console.log('postnatal:', preventativeService);
        if (preventativeService?.length) {
          this.selectedItems = preventativeService.map((item) => item.PreventativeServiceId);
        }
      });
    }

    this.PreventativeServiceStorageService.fetchHivPreventativeServices().subscribe((data) => {
      this.preventativeServices = data;
    });
  }

  // * Handle Select
  handleSelectionChange(event: any, value: number) {
    if (event.detail.checked) {
      this.selectedItems.push(value);
      console.log(this.selectedItems);
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

      const PostNatalPreventativeServiceArray: PostNatalPreventativeService[] = this.selectedItems.map((item) => ({
        PreventativeServiceId: item,
        IsDeleted: false,
        PostNatalId: this.PostNatalData.TransactionId as string,
        CreatedBy: currentUser.Oid,
      }));

      const response = await this.PreventativeServiceStorageService.addPostNatalPreventativeService(
        PostNatalPreventativeServiceArray
      );

      if (response?.changes?.changes === PostNatalPreventativeServiceArray.length) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 2000,
          position: 'bottom',
          color: 'success',
        });
        this.form.reset();
        this.dismissModal();
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

  //   // * Validation Check

  //   const PostNatalPreventativeServiceArray: PostNatalPreventativeService[] = [];
  //   if (this.selectedItems.length) {
  //     if (this.member.length === 1) {
  //       this.selectedItems.forEach((item) => {
  //         const PostNatalPreventativeServicePayload: PostNatalPreventativeService = {
  //           PreventativeServiceId: item,
  //           IsDeleted: false,
  //           PostNatalId: this.PostNatalId,
  //         };
  //         PostNatalPreventativeServiceArray.push(PostNatalPreventativeServicePayload);
  //       });
  //       const response = await this.PreventativeServiceStorageService.addPostNatalPreventativeService(
  //         PostNatalPreventativeServiceArray
  //       );
  //       if (response?.changes?.changes === PostNatalPreventativeServiceArray.length) {
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

  //   // const PostNatalPreventativeServiceArray: PostNatalPreventativeService[] = this.member.map((member) => {
  //   //   const PostNatalPreventativeServicePayload: PostNatalPreventativeService = {
  //   //     PreventativeServiceId: this.form.value.PreventativeServiceId,
  //   //     IsDeleted: false,
  //   //     PostNatalId: this.PostNatalId,
  //   //   };
  //   //   return PostNatalPreventativeServicePayload;
  //   // });
  // }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
