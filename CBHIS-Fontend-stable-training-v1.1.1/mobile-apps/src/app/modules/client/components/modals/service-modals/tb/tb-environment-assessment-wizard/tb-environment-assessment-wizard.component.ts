import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import {
  ClientTBEnvironmentalAssessment,
  TBEnvironmentalAssessment,
} from 'src/app/modules/client/models/service-models/tb';
import { EnvironmentAssessmentStorageService } from 'src/app/modules/client/services/tb/environment-assessment-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-tb-environment-assessment-wizard',
  templateUrl: './tb-environment-assessment-wizard.component.html',
  styleUrls: ['./tb-environment-assessment-wizard.component.scss'],
})
export class TbEnvironmentAssessmentWizardComponent implements OnInit {
  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  tbEnvironmentAssessmentArray: TBEnvironmentalAssessment[] = [];
  isUpdate: boolean = false;
  selectedItems: number[] = [];
  isEnabled: boolean = false;

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private TBEnvironmentalAssessmentService: EnvironmentAssessmentStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      TBEnvironmentalAssessmentId: new FormControl(),
      OthersObserved: new FormControl(),
      OnlineDbOid: new FormControl(null),
    });
  }

  ngOnInit() {
    this.TBEnvironmentalAssessmentService.fetchTBEnvironmentalAssessment().subscribe((data) => {
      this.tbEnvironmentAssessmentArray = data;
    });

    this.TBEnvironmentalAssessmentService.getClientTBEnvironmentalAssessmentByClientId(this.member[0].Oid).then(
      (data) => {
        console.log(data);
        if (data) {
          this.isUpdate = true;
          this.form.patchValue({
            TransactionId: data.TransactionId,
            TBEnvironmentalAssessmentId: data.TBEnvironmentalAssessmentId,
            OthersObserved: data.OthersObserved,
            OnlineDbOid: data?.OnlineDbOid || null,
          });
        }
      }
    );
  }

  // * Handle Select
  handleSelectionChange(event: any, value: number) {
    this.isEnabled = false;
    if (event.detail.checked) {
      this.selectedItems.push(value);
    } else {
      const index = this.selectedItems.indexOf(value);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      }
    }
  }

  // * For submitting the form
  async onSubmit() {
    this.submitLoading = true;

    if (
      this.form.get('TBEnvironmentalAssessmentId')?.value ||
      this.form.get('OthersObserved')?.value ||
      this.isUpdate
    ) {
      const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

      const TBEnvironmentalAssessmentArray: ClientTBEnvironmentalAssessment[] = this.member.map((member) => {
        const TBEnvironmentalAssessmentPayload: ClientTBEnvironmentalAssessment = {
          TransactionId: this.form.get('TransactionId')?.value,
          TBEnvironmentalAssessmentId: this.form.get('TBEnvironmentalAssessmentId')?.value,
          OthersObserved: this.form.get('OthersObserved')?.value,
          CreatedBy: currentUser.Oid,
          OnlineDbOid: this.form.get('OnlineDbOid')?.value || null,
          ClientId: member.Oid,
          IsDeleted: false,
        };
        return TBEnvironmentalAssessmentPayload;
      });

      const response = await this.TBEnvironmentalAssessmentService.addClientTBEnvironmentalAssessment(
        TBEnvironmentalAssessmentArray
      );

      if (response?.changes?.changes === TBEnvironmentalAssessmentArray.length) {
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
    }

    this.submitLoading = false;
    this.dismissModal();
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
