import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import {
  FamilyPlan,
  FamilyPlanningMethod,
  UsedFamilyPlanMethod,
} from 'src/app/modules/client/models/service-models/family-planning';
import { FamilyPlanningStorageService } from 'src/app/modules/client/services/family-planning/family-planning-storage.service';
import { UsedFamilyPlanningStorageService } from 'src/app/modules/client/services/family-planning/used-family-planning-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-family-planning-service-wizard',
  templateUrl: './family-planning-service-wizard.component.html',
  styleUrls: ['./family-planning-service-wizard.component.scss'],
})
export class FamilyPlanningServiceWizardComponent implements OnInit {
  usedBirthControlMethods!: FamilyPlanningMethod[];

  // Initialize the form
  form: FormGroup = new FormGroup({
    TransactionId: new FormControl(null),
    IsPlanningToBePregnant: new FormControl(),
    OnlineDbOid: new FormControl(null),
  });
  isFormValid: boolean = true;
  @Input() head!: Client;
  @Input() member!: Client[];
  selectedItems: number[] = [];
  isEnabled: boolean = false;

  constructor(
    private modalService: ModalService,
    private FamilyPlanningService: FamilyPlanningStorageService,
    private UsedFamilyPlanningStorageService: UsedFamilyPlanningStorageService,
    private toast: ToastService,
    private authStorageService: AuthStorageService
  ) {}

  // * Initialize the component
  ngOnInit() {
    console.log(this.member);

    if (this.selectedItems?.length === 0) {
      this.isEnabled = true;
    }
    // Fetch the family planning methods
    this.UsedFamilyPlanningStorageService.fetchFamilyPlanMethods().subscribe((methods) => {
      this.usedBirthControlMethods = methods;
    });

    if (this.member && this.member?.[0]?.Oid) {
      this.FamilyPlanningService.getFamilyPlanningByClientId(this.member?.[0]?.Oid).then((data: FamilyPlan[]) => {
        if (data.length > 0) {
          this.form.patchValue({
            TransactionId: data?.[0].TransactionId,
            IsPlanningToBePregnant: data?.[0].IsPlanningToBePregnant,
            OnlineDbOid: data?.[0].OnlineDbOid || null,
          });
        }
      });

      // fetch used family planning methods for single client
      if (this.member.length === 1) {
        this.UsedFamilyPlanningStorageService.getUsedFamilyPlanMethodByClientId(this.member?.[0]?.Oid).then((data) => {
          this.selectedItems = data.map((method) => method.FPMethodId);
        });
      } else {
      }
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
    if (this.selectedItems.length) {
      this.isEnabled = false;
    } else {
      this.isEnabled = true;
    }
  }

  // For submitting the form
  async onSubmit() {
    // if (this.form.valid) {
    console.log(this.form.value.FPMethodId);

    let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    const UsedFamilyPlanningMethodArray: UsedFamilyPlanMethod[] = [];

    if (this.selectedItems.length && currentUser && currentUser.Oid) {
      // if (this.form.get('FPMethodId')?.value) {

      // for multiple clients
      this.member.map((member) => {
        this.selectedItems.map((method) => {
          UsedFamilyPlanningMethodArray.push({
            FPMethodId: method,
            ClientId: member.Oid,
            IsDeleted: false,
            CreatedBy: currentUser.Oid,
          });
        });
      });

      const response2 = await this.UsedFamilyPlanningStorageService.addUsedFamilyPlanMethod(
        UsedFamilyPlanningMethodArray
      );

      if (response2?.changes?.changes === UsedFamilyPlanningMethodArray.length) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 1000,
          position: 'bottom',
          color: 'success',
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
    if (this.form.get('IsPlanningToBePregnant')?.value && currentUser && currentUser?.Oid) {
      const FamilyPlanningArray: FamilyPlan[] = this.member.map((member) => {
        const FamilyPlaningPayload: FamilyPlan = {
          TransactionId: this.form.value?.TransactionId,
          IsPlanningToBePregnant: this.form.value?.IsPlanningToBePregnant,
          ClientId: member.Oid,
          IsDeleted: false,
          CreatedBy: currentUser.Oid,
          OnlineDbOid: this.form.value?.OnlineDbOid,
        };
        return FamilyPlaningPayload;
      });

      const response = await this.FamilyPlanningService.addItems(FamilyPlanningArray);

      if (response?.changes?.changes === FamilyPlanningArray.length) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 1000,
          position: 'bottom',
          color: 'success',
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

    // } else {
    //   this.toast.openToast({
    //     message: 'Please fill in all required fields',
    //     duration: 1000,
    //     position: 'bottom',
    //     color: 'warning',
    //   });
    //   this.isFormValid = false;
    // }
    this.form.reset();
    this.modalService.dismissModal();
  }

  // For dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
