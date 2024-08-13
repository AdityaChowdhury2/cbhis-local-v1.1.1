import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import { ChildImmunization } from 'src/app/modules/client/models/service-models/child-health';
import { ChildImmunizationStorageService } from 'src/app/modules/client/services/child-health/child-immunization-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Immunization } from '../../../../../enums/child-health.enum';
import { AdverseEventWizardComponent } from '../adverse-event-wizard/adverse-event-wizard.component';

@Component({
  selector: 'app-immunization-wizard',
  templateUrl: './immunization-wizard.component.html',
  styleUrls: ['./immunization-wizard.component.scss'],
})
export class ImmunizationWizardComponent implements OnInit {
  isChildrenShown: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  immunizationData!: ChildImmunization;

  immunizationStatusEnum: { [key: number]: string } = {
    [Immunization.FullyImmunized]: 'Fully Immunized',
    [Immunization.MissingImmunization]: 'Missing Immunization',
  };

  get immunizationStatusArray() {
    return Object.keys(this.immunizationStatusEnum).map((key) => {
      return {
        value: +key,
        label: this.immunizationStatusEnum[+key],
      };
    });
  }

  form: FormGroup;
  isValid: boolean = false;
  submitLoading: boolean = false;

  constructor(
    private modalService: ModalService,
    private ChildImmunizationStorageService: ChildImmunizationStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      ImmunizationStatus: new FormControl(null, [Validators.required]),
      OnlineDbOid: new FormControl(null),
    });
  }

  ngOnInit() {
    if (this.member && this.member?.[0]?.Oid) {
      this.ChildImmunizationStorageService.getChildImmunizationByClientId(this.member?.[0]?.Oid).then((data) => {
        console.log(data);
        if (data?.length) {
          this.isChildrenShown = true;
          console.log('Child Data ==>', data);
          this.immunizationData = data?.[0];
          this.form.patchValue({
            TransactionId: this.immunizationData.TransactionId || null,
            ImmunizationStatus: this.immunizationData.ImmunizationStatus,
            OnlineDbOid: this.immunizationData.OnlineDbOid || null,
          });
        }
      });
    }
  }

  editHandler() {
    if (this.member && this.member?.[0]?.Oid) {
      this.ChildImmunizationStorageService.getChildImmunizationByClientId(this.member?.[0]?.Oid).then((data) => {
        console.log(data);
        if (data?.length) {
          this.immunizationData = data?.[0];
          this.isChildrenShown = false;
          this.form.patchValue({
            TransactionId: this.immunizationData.TransactionId || null,
            ImmunizationStatus: this.immunizationData.ImmunizationStatus,
            OnlineDbOid: this.immunizationData.OnlineDbOid || null,
          });
        }
      });
    }
  }

  openWizard() {
    let component;
    component = AdverseEventWizardComponent;

    this.modalService.presentModal({
      component,
      componentProps: {
        head: this.head,
        member: this.member,
        ImmunizationData: this.immunizationData,
      },
      cssClass: 'service-card',
    });
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
    }
    let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    if (this.form.valid && currentUser) {
      if (currentUser?.Oid) {
        const ChildImmunizationArray: ChildImmunization[] = this.member.map((member) => {
          const ChildImmunizationPayload: ChildImmunization = {
            TransactionId: this.form.get('TransactionId')?.value,
            ImmunizationStatus: this.form.get('ImmunizationStatus')?.value,
            OnlineDbOid: this.form.get('OnlineDbOid')?.value,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            IsDeleted: false,
          };
          return ChildImmunizationPayload;
        });
        const response = await this.ChildImmunizationStorageService.addChildImmunization(ChildImmunizationArray);
        if (response?.changes?.changes === ChildImmunizationArray.length) {
          this.toast.openToast({
            message: 'Successfully recorded',
            duration: 1000,
            position: 'bottom',
            color: 'success',
          });
          this.isChildrenShown = true;
          this.form.reset();
          // * Get Data
          this.ChildImmunizationStorageService.getChildImmunizationByClientId(this.member?.[0]?.Oid).then((data) => {
            if (data.length) {
              const item = [...data]?.reverse()[0];
              this.immunizationData = item;
            }
          });
        } else {
          this.toast.openToast({
            message: 'Failed to save the data',
            duration: 1000,
            position: 'bottom',
            color: 'danger',
          });
        }
      }
    }

    this.submitLoading = false;
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
