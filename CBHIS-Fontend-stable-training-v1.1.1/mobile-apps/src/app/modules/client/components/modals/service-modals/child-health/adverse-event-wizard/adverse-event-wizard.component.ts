import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import {
  AdverseEvent,
  ChildImmunization,
  ImmunizationAdverseEvent,
} from 'src/app/modules/client/models/service-models/child-health';
import { ChildImmunizationStorageService } from 'src/app/modules/client/services/child-health/child-immunization-storage.service';
import { AdverseEventStorageService } from 'src/app/modules/client/services/child-health/immunization-adverse-events-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-adverse-event-wizard',
  templateUrl: './adverse-event-wizard.component.html',
  styleUrls: ['./adverse-event-wizard.component.scss'],
})
export class AdverseEventWizardComponent implements OnInit {
  adverseEvents: AdverseEvent[] = [];
  form: FormGroup;
  isValid: boolean = false;
  submitLoading: boolean = false;

  @Input() ImmunizationData!: ChildImmunization;
  @Input() head!: any;
  @Input() member!: any;
  selectedItems: number[] = [];
  isDisable: boolean = false;

  constructor(
    private toast: ToastService,
    private modalService: ModalService,
    private AdverseEventStorageService: AdverseEventStorageService,
    private authStorageService: AuthStorageService,
    private syncStorageService: SyncStorageService,
    private ChildImmunizationStorageService: ChildImmunizationStorageService
  ) {
    this.form = new FormGroup({
      Oid: new FormControl(null),
      adverseEventId: new FormControl(null, [Validators.required]),
      OnlineDbOid: new FormControl(null),
    });
  }

  ngOnInit() {
    this.AdverseEventStorageService.fetchAdverseEvents().subscribe((data) => {
      console.log(data);
      this.adverseEvents = data;
    });
    console.log(this.ImmunizationData);
    this.selectedItems.length ? (this.isDisable = false) : (this.isDisable = true);

    if (this.member.length === 1 && this.ImmunizationData?.TransactionId) {
      this.AdverseEventStorageService.getImmunizationAdverseEventByImmunizationId(
        this.ImmunizationData.TransactionId
      ).then((data) => {
        if (data.length) {
          this.selectedItems = data.map((item) => item.AdverseEventId);
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

  async onSubmit() {
    this.submitLoading = true;
    const isFormValid = this.form.valid;
    let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    if (this.selectedItems.length && currentUser?.Oid) {
      if (!!this.ImmunizationData?.OnlineDbOid && !!this.ImmunizationData?.TransactionId) {
        // this.syncStorageService.getSyncQueueDataByTransactionId(this.ImmunizationData.TransactionId)
        await this.ChildImmunizationStorageService.addChildImmunization([this.ImmunizationData]);
      }

      const AdverseEventArray: ImmunizationAdverseEvent[] = this.selectedItems.map((item) => {
        return {
          ImmunizationId: this.ImmunizationData.TransactionId as string,
          AdverseEventId: item,
          IsDeleted: false,
          CreatedBy: currentUser.Oid,
        };
      });

      const response = await this.AdverseEventStorageService.addImmunizationAdverseEvent(AdverseEventArray);

      console.log(response);
      if (response?.changes?.changes) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 1000,
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

    // * Validation Check
    // if (!isFormValid) {
    //   this.isValid = true;
    //   this.submitLoading = false;
    //   return;
    // } else {
    //   if (this.member?.length === 1) {
    //     const AdverseEventArray: ImmunizationAdverseEvent[] = [
    //       {
    //         ImmunizationId: this.ImmunizationId,
    //         AdverseEventId: this.form.value.adverseEventId,
    //         IsDeleted: false,
    //       },
    //     ];

    //     const response = await this.AdverseEventStorageService.addImmunizationAdverseEvent(AdverseEventArray);

    //     console.log(response);
    //     if (response?.changes?.changes) {
    //       this.toast.openToast({
    //         message: 'Successfully recorded',
    //         duration: 1000,
    //         position: 'bottom',
    //         color: 'success',
    //       });
    //       this.dismissModal();
    //       this.form.reset();
    //     } else {
    //       this.toast.openToast({
    //         message: 'Failed to save the data',
    //         duration: 1000,
    //         position: 'bottom',
    //         color: 'danger',
    //       });
    //     }
    //   } else {
    //     this.toast.openToast({
    //       message: 'Select only one client to save the data',
    //       color: 'danger',
    //       duration: 1000,
    //     });
    //   }
    // }
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
