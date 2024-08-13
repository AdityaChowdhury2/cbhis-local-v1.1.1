import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { PostpartumLossOfBlood } from 'src/app/modules/client/enums/pnc.enum';
import { Client } from 'src/app/modules/client/models/client';
import { PostNatal } from 'src/app/modules/client/models/service-models/postnatal';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { PostNatalStorageService } from 'src/app/modules/client/services/postnatal/postnatal-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { PlaceOfDelivery } from '../../../../../enums/pnc.enum';
import { PostnatalDangerWizardComponent } from '../postnatal-danger-wizard/postnatal-danger-wizard.component';
import { PostnatalDepressionsWizardComponent } from '../postnatal-depressions-wizard/postnatal-depressions-wizard.component';
import { PostnatalFeedingWizardComponent } from '../postnatal-feeding-wizard/postnatal-feeding-wizard.component';
import { PostnatalPreventionWizardComponent } from '../postnatal-prevention-wizard/postnatal-prevention-wizard.component';

@Component({
  selector: 'app-postnatal-wizard',
  templateUrl: './postnatal-wizard.component.html',
  styleUrls: ['./postnatal-wizard.component.scss'],
})
export class PostnatalWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client[];
  // * Local variables
  form: FormGroup;
  submitLoading: boolean = false;
  isChildVisible: boolean = false;
  isValid: boolean = false;
  pncData!: any;

  // PostpartumLossOfBloodEnum = [
  //   { value: PostpartumLossOfBlood.Spotting, label: 'Spotting' },
  //   { value: PostpartumLossOfBlood.Moderate, label: 'Moderate' },
  //   { value: PostpartumLossOfBlood.Heavy, label: 'Heavy' },
  //   { value: PostpartumLossOfBlood.AbnormallyExcessive, label: 'Abnormally Excessive' },
  //   { value: PostpartumLossOfBlood.None, label: 'None' },
  // ];

  PostpartumLossOfBloodEnum: { [key: number]: string } = {
    [PostpartumLossOfBlood.Spotting]: 'Spotting',
    [PostpartumLossOfBlood.Moderate]: 'Moderate',
    [PostpartumLossOfBlood.Heavy]: 'Heavy',
    [PostpartumLossOfBlood.AbnormallyExcessive]: 'Abnormally Excessive',
    [PostpartumLossOfBlood.None]: 'None',
  };

  get PostpartumLossOfBloodArray() {
    return Object.keys(this.PostpartumLossOfBloodEnum).map((key) => {
      return {
        value: +key,
        label: this.PostpartumLossOfBloodEnum[+key],
      };
    });
  }

  PlaceOfDeliveryEnum: { [key: number]: string } = {
    [PlaceOfDelivery.Hospital]: 'Hospital',
    [PlaceOfDelivery.Home]: 'Home',
    [PlaceOfDelivery.Clinic]: 'Clinic',
    [PlaceOfDelivery.Other]: 'Other',
  };

  get PlaceOfDeliveryArray() {
    return Object.keys(this.PlaceOfDeliveryEnum).map((key) => {
      return {
        value: +key,
        label: this.PlaceOfDeliveryEnum[+key],
      };
    });
  }

  constructor(
    private modalService: ModalService,
    private PostNatalStorageService: PostNatalStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      PostpartumLossOfBlood: new FormControl('', [Validators.required]),
      PlaceOfDelivery: new FormControl(''),
      OnlineDbOid: new FormControl(null),
    });
  }

  ngOnInit() {
    // * Setting the default value of the form
    if (this.member && this.member?.[0]?.Oid) {
      this.PostNatalStorageService.getPostNatalByClientId(this.member?.[0]?.Oid).then((data) => {
        console.log(data);
        if (data?.length) {
          this.isChildVisible = true;
          this.pncData = data?.[0];
          this.form.patchValue({
            TransactionId: this.pncData?.TransactionId,
            PostpartumLossOfBlood: this.pncData?.PostPartumLossOfBlood,
            PlaceOfDelivery: this.pncData?.PlaceOfDelivery,
            OnlineDbOid: this.pncData?.OnlineDbOid,
          });
        }
      });
    }
  }

  // * Edit Handler
  editHandler() {
    // * Setting the default value of the form
    if (this.member && this.member?.[0]?.Oid) {
      this.PostNatalStorageService.getPostNatalByClientId(this.member?.[0]?.Oid).then((data) => {
        console.log(data);
        if (data?.length) {
          this.isChildVisible = false;
          this.pncData = data?.[0];
          this.form.patchValue({
            TransactionId: this.pncData?.TransactionId,
            PostpartumLossOfBlood: this.pncData?.PostPartumLossOfBlood,
            PlaceOfDelivery: this.pncData?.PlaceOfDelivery,
            OnlineDbOid: this.pncData?.OnlineDbOid,
          });
        }
      });
    }
  }

  // * For submitting the form
  async onSubmit() {
    this.submitLoading = true;
    const isFormValid = this.form.valid;

    // * Validation Check
    if (!isFormValid) {
      this.isValid = true;
      this.submitLoading = false;
      return;
    } else {
      let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;
      if (currentUser && currentUser?.Oid) {
        const PostNatalStorageServiceArray: PostNatal[] = this.member.map((member) => {
          const PostNatalStorageServicePayload: PostNatal = {
            TransactionId: this.pncData?.TransactionId || this.form.value.TransactionId,
            PostPartumLossOfBlood: this.form.value.PostpartumLossOfBlood,
            PlaceOfDelivery: this.form.value.PlaceOfDelivery,
            ClientId: member.Oid,
            CreatedBy: currentUser.Oid,
            IsDeleted: false,
            OnlineDbOid: this.form.value.OnlineDbOid,
          };
          return PostNatalStorageServicePayload;
        });

        const response = await this.PostNatalStorageService.addPostNatal(PostNatalStorageServiceArray);
        if (response?.changes?.changes === PostNatalStorageServiceArray.length) {
          this.toast.openToast({
            message: 'Successfully recorded',
            duration: 2000,
            position: 'bottom',
            color: 'success',
          });
          this.isChildVisible = true;
          this.form.reset();

          // * Get Data
          this.PostNatalStorageService.getPostNatalByClientId(this.member[0].Oid).then((data) => {
            console.log('Post natal ', [...data]?.reverse()[0]);
            if (data?.length) {
              const item = [...data]?.reverse()[0];
              this.pncData = item;
              // this.isChildVisible = true;
              this.form.patchValue({
                TransactionId: item.TransactionId,
                PostpartumLossOfBlood: item.PostPartumLossOfBlood,
                PlaceOfDelivery: item.PlaceOfDelivery,
                OnlineDbOid: item.OnlineDbOid,
              });
            }
          });
        } else {
          this.toast.openToast({
            message: 'Failed to save the data',
            duration: 2000,
            position: 'bottom',
            color: 'danger',
          });
        }
      }

      this.submitLoading = false;
      // this.dismissModal();
    }
  }

  // Open Wizard
  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'postnatal-preventative':
        component = PostnatalPreventionWizardComponent;
        break;
      case 'postnatal-danger':
        component = PostnatalDangerWizardComponent;
        break;
      case 'postnatal-depressions':
        component = PostnatalDepressionsWizardComponent;
        break;
      case 'postnatal-feeding':
        component = PostnatalFeedingWizardComponent;
        break;
      default:
        component = null;
    }
    console.log(this.pncData);
    this.modalService.presentModal({
      component,
      componentProps: {
        children: item.children,
        head: this.head,
        member: this.member,
        PostNatalData: this.pncData,
      },
      cssClass: item.cssClass,
    });
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
