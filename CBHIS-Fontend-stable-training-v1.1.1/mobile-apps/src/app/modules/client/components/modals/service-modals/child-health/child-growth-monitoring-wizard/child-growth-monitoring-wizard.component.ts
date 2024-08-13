import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { MUCStatus, WastingNutritionalOedema } from 'src/app/modules/client/enums/child-health.enum';
import { Client } from 'src/app/modules/client/models/client';
import { ChildGrowthMonitoring } from 'src/app/modules/client/models/service-models/child-health';
import { ChildGrowthMonitoringStorageService } from 'src/app/modules/client/services/child-health/child-growth-monitoring-storage.service';

import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-child-growth-monitoring-wizard',
  templateUrl: './child-growth-monitoring-wizard.component.html',
  styleUrls: ['./child-growth-monitoring-wizard.component.scss'],
})
export class ChildGrowthMonitoringWizardComponent implements OnInit {
  // * Local variables
  ChildGrowthMonitoringForm: FormGroup;
  isValid: boolean = false;
  submitLoading: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];

  MUCEnumOptions = {
    [MUCStatus.Red]: 'Red',
    [MUCStatus.Yellow]: 'Yellow',
    [MUCStatus.Green]: 'Green',
  };

  get MUCEnumOptionsArray() {
    return Object.entries(this.MUCEnumOptions).map(([key, value]) => ({ value: +key, label: value }));
  }

  WastingNutritionalOedemaEnum = {
    [WastingNutritionalOedema.NoOedema]: 'No oedema',
    [WastingNutritionalOedema.MildModerateOedema]: 'Mild / Moderate oedema',
    [WastingNutritionalOedema.SevereOedema]: 'Severe oedema',
  };

  get WastingNutritionalOedemaEnumArray() {
    return Object.entries(this.WastingNutritionalOedemaEnum).map(([key, value]) => ({
      value: +key,
      label: value,
    }));
  }

  // * Form Validation
  constructor(
    private modalService: ModalService,
    private childGrowthMonitoringService: ChildGrowthMonitoringStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.ChildGrowthMonitoringForm = new FormGroup({
      OnlineDbOid: new FormControl(null),
      MAUCStatus: new FormControl('', [Validators.required]),
      WastingNutritionalOedem: new FormControl('', [Validators.required]),
      Height: new FormControl(''),
      Weight: new FormControl(''),
      IsVitaminAGiven: new FormControl(false),
      IsDewormingPillGiven: new FormControl(false),
      TransactionId: new FormControl(null),
    });
  }

  ngOnInit() {
    this.childGrowthMonitoringService
      .getChildGrowthMonitoringByClientId(this.member[0].Oid)
      .then((childGrowthMonitoring) => {
        console.log('childGrowthMonitoring ===> ', childGrowthMonitoring);
        if (childGrowthMonitoring) {
          this.ChildGrowthMonitoringForm.patchValue({
            OnlineDbOid: childGrowthMonitoring.OnlineDbOid || null,
            MAUCStatus: childGrowthMonitoring.MAUCStatus,
            WastingNutritionalOedem: childGrowthMonitoring.WastingNutritionalOedem,
            Height: childGrowthMonitoring.Height,
            Weight: childGrowthMonitoring.Weight,
            IsVitaminAGiven: childGrowthMonitoring.IsVitaminAGiven,
            IsDewormingPillGiven: childGrowthMonitoring.IsDewormingPillGiven,
            TransactionId: childGrowthMonitoring.TransactionId,
          });
        }
      });
  }

  // * For submitting the form
  async onSubmit() {
    this.submitLoading = true;
    const isFormValid = this.ChildGrowthMonitoringForm.valid;

    // * Validation Check
    if (!isFormValid) {
      this.isValid = true;
      this.submitLoading = false;
      return;
    }
    let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;
    console.log('Child Growth Monitoring form ===> ', this.ChildGrowthMonitoringForm.value);
    this.submitLoading = false;

    if (this.ChildGrowthMonitoringForm.valid && currentUser) {
      if (currentUser?.Oid) {
        const childGrowthMonitoringArray: ChildGrowthMonitoring[] = this.member.map((member) => {
          const childGrowthMonitoring: ChildGrowthMonitoring = {
            TransactionId: this.ChildGrowthMonitoringForm.value.TransactionId,
            MAUCStatus: this.ChildGrowthMonitoringForm.value.MAUCStatus,
            WastingNutritionalOedem: this.ChildGrowthMonitoringForm.value.WastingNutritionalOedem,
            Height: this.ChildGrowthMonitoringForm.value.Height,
            Weight: this.ChildGrowthMonitoringForm.value.Weight,
            IsVitaminAGiven: this.ChildGrowthMonitoringForm.value.IsVitaminAGiven,
            IsDewormingPillGiven: this.ChildGrowthMonitoringForm.value.IsDewormingPillGiven,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            IsDeleted: false,
            OnlineDbOid: this.ChildGrowthMonitoringForm.value.OnlineDbOid,
          };
          return childGrowthMonitoring;
        });

        const response = await this.childGrowthMonitoringService.addItems(childGrowthMonitoringArray);
        if (response?.changes?.changes === childGrowthMonitoringArray.length) {
          this.toast.openToast({
            message: 'Successfully recorded',
            duration: 1000,
            position: 'bottom',
            color: 'success',
          });
          this.ChildGrowthMonitoringForm.reset();
        } else {
          this.toast.openToast({
            message: 'Failed to save the data',
            duration: 1000,
            position: 'bottom',
            color: 'danger',
          });
        }
      }
    } else {
      this.toast.openToast({
        message: 'Please fill in all required fields',
        duration: 1000,
        position: 'bottom',
        color: 'warning',
      });
    }

    this.dismissModal();
  }

  // * For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
