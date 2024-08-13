import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import { DangerSign, PostNatal, PostNatalDangerSign } from 'src/app/modules/client/models/service-models/postnatal';
import { PostnatalDangerSignsStorageService } from 'src/app/modules/client/services/postnatal/postnatal-danger-signs-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-postnatal-danger-wizard',
  templateUrl: './postnatal-danger-wizard.component.html',
  styleUrls: ['./postnatal-danger-wizard.component.scss'],
})
export class PostnatalDangerWizardComponent implements OnInit {
  form: FormGroup;
  submitLoading: boolean = false;
  isValid: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  @Input() PostNatalData!: PostNatal;
  dangerSigns: DangerSign[] = [];
  selectedItems: number[] = [];
  isDisable: boolean = false;

  constructor(
    private modalService: ModalService,
    private PostNatalDangerSignService: PostnatalDangerSignsStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      DangerSignId: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.isDisable = this.selectedItems.length < 1;

    this.PostNatalDangerSignService.fetchDangerSigns().subscribe((data) => {
      this.dangerSigns = data;
    });

    if (this.PostNatalData?.TransactionId) {
      this.PostNatalDangerSignService.getPostNatalDangerSignByPostNatalId(this.PostNatalData.TransactionId).then(
        (data) => {
          if (data.length) {
            this.selectedItems = data.map((item) => item.DangerSignId);
          }
        }
      );
    }

    // if (this.member && this.member?.[0]?.Oid) {
    //   this.PostNatalDangerSignService.getPostNatalDangerSignByPostNatalId(this.PostNatalId).then((data) => {
    //     if (data.length) {
    //       this.selectedItems = data.map((item) => item.DangerSignId);

    //       console.log(data);
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

      const postNatalDangerSignArray: PostNatalDangerSign[] = this.selectedItems.map((item) => ({
        DangerSignId: item,
        IsDeleted: false,
        PostNatalId: this.PostNatalData?.TransactionId as string,
        CreatedBy: currentUser.Oid,
      }));

      const response = await this.PostNatalDangerSignService.addPostNatalDangerSign(postNatalDangerSignArray);

      if (response?.changes?.changes) {
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
  //   if (this.selectedItems.length) {
  //     const PostNatalDangerSignServiceArray: PostNatalDangerSign[] = [];
  //     if (this.member.length === 1) {
  //       this.selectedItems.forEach((item) => {
  //         const PostNatalDangerSignServicePayload: PostNatalDangerSign = {
  //           DangerSignId: item,
  //           IsDeleted: false,
  //           PostNatalId: this.PostNatalId,
  //         };
  //         PostNatalDangerSignServiceArray.push(PostNatalDangerSignServicePayload);
  //       });
  //       const response = await this.PostNatalDangerSignService.addPostNatalDangerSign(PostNatalDangerSignServiceArray);
  //       if (response?.changes?.changes === PostNatalDangerSignServiceArray.length) {
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
