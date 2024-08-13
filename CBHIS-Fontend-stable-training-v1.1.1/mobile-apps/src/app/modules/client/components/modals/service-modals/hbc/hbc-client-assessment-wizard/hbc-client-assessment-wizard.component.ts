import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Condition } from 'src/app/modules/client/enums/hbc.enum';
import { Client } from 'src/app/modules/client/models/client';
import { HBCClientAssessment } from 'src/app/modules/client/models/service-models/hbc';
import { HbcClientAssessmentStorageService } from 'src/app/modules/client/services/hbc/hbc-client-assessment-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ReasonForDischarge } from './../../../../../enums/hbc.enum';

@Component({
  selector: 'app-hbc-client-assessment-wizard',
  templateUrl: './hbc-client-assessment-wizard.component.html',
  styleUrls: ['./hbc-client-assessment-wizard.component.scss'],
})
export class HBCClientAssessmentWizardComponent implements OnInit {
  // ReasonForDischargeEnum = [
  //   { value: ReasonForDischarge.Recovered, label: 'Recovered' },
  //   { value: ReasonForDischarge.Died, label: 'Died' },
  //   { value: ReasonForDischarge.Relocated, label: 'Relocated' },
  // ];

  ReasonForDischargeEnum = {
    [ReasonForDischarge.Recovered]: 'Recovered',
    [ReasonForDischarge.Died]: 'Died',
    [ReasonForDischarge.Relocated]: 'Relocated',
  };

  get ReasonForDischargeArray() {
    return Object.entries(this.ReasonForDischargeEnum).map(([key, value]) => ({ value: +key, label: value }));
  }

  // ConditionEnum = [
  //   { value: Condition.LooksHealthy, label: 'Looks Healthy' },
  //   { value: Condition.LooksWeak, label: 'Looks Weak' },
  //   { value: Condition.LooksThin, label: 'Looks Thin' },
  //   { value: Condition.Bedridden, label: 'Bedridden' },
  //   { value: Condition.NotHome, label: 'Not Home' },
  //   { value: Condition.TransferredOut, label: 'Transferred Out' },
  //   { value: Condition.WantsToStopVisits, label: 'Wants to Stop Visits' },
  //   { value: Condition.Died, label: 'Died' },
  //   { value: Condition.Unknown, label: 'Unknown' },
  // ];

  ConditionEnum = {
    [Condition.LooksHealthy]: 'Looks Healthy',
    [Condition.LooksWeak]: 'Looks Weak',
    [Condition.LooksThin]: 'Looks Thin',
    [Condition.Bedridden]: 'Bedridden',
    [Condition.NotHome]: 'Not Home',
    [Condition.TransferredOut]: 'Transferred Out',
    [Condition.WantsToStopVisits]: 'Wants to Stop Visits',
    [Condition.Died]: 'Died',
    [Condition.Unknown]: 'Unknown',
  };

  get ConditionArray() {
    return Object.entries(this.ConditionEnum).map(([key, value]) => ({ value: +key, label: value }));
  }

  form: FormGroup;
  isValid: boolean = false;
  submitLoading: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private HBCClientAssessmentService: HbcClientAssessmentStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      Condition: new FormControl(null, [Validators.required]),
      ReasonForDischarge: new FormControl(),
      IsDischargedFromHBC: new FormControl(false),
      OnlineDbOid: new FormControl(null),
    });
  }

  ngOnInit() {
    // * Setting the default value of the form
    this.HBCClientAssessmentService.getHBCClientAssessmentByClientId(this.member[0].Oid).then((response) => {
      if (response) {
        console.log(response);
        this.form.patchValue({
          TransactionId: response.TransactionId,
          Condition: response.Condition,
          ReasonForDischarge: response.ReasonForDischarge,
          IsDischargedFromHBC: response.IsDischargedFromHBC,
          OnlineDbOid: response.OnlineDbOid || null,
        });
      }
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
    } else {
      if (this.form.valid) {
        let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

        const HBCClientAssessmentArray: HBCClientAssessment[] = this.member.map((member) => {
          const HBCClientAssessmentPayload: HBCClientAssessment = {
            TransactionId: this.form.value.TransactionId,
            ReasonForDischarge: this.form.value.ReasonForDischarge,
            IsDischargedFromHBC: this.form.value.IsDischargedFromHBC,
            Condition: this.form.value.Condition,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            IsDeleted: false,
            OnlineDbOid: this.form.value.OnlineDbOid || null,
          };
          return HBCClientAssessmentPayload;
        });
        const response = await this.HBCClientAssessmentService.addHBCClientAssessment(HBCClientAssessmentArray);
        if (response?.changes?.changes === HBCClientAssessmentArray.length) {
          this.toast.openToast({
            message: 'Successfully recorded',
            duration: 1000,
            position: 'bottom',
            color: 'success',
          });
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
          message: 'Please fill in all required fields',
          duration: 1000,
          position: 'bottom',
          color: 'warning',
        });
      }

      this.submitLoading = false;
      this.dismissModal();
    }
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
