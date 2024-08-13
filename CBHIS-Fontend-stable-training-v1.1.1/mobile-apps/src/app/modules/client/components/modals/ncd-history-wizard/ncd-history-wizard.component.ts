import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ScreeningOutcome, TestOutcome } from '../../../enums/ncd.enum';
import { Client } from '../../../models/client';
import { ClientNCDHistory, NCDCondition } from '../../../models/service-models/ncd';
import { ClientNcdHistoryStorageService } from '../../../services/ncd/client-ncd-history-storage.service';

@Component({
  selector: 'app-ncd-history-wizard',
  templateUrl: './ncd-history-wizard.component.html',
  styleUrls: ['./ncd-history-wizard.component.scss'],
})
export class NCDHistoryWizardComponent implements OnInit {
  ScreeningOutcomeEnum = [
    { value: ScreeningOutcome.Presumptive, label: 'Presumptive' },
    { value: ScreeningOutcome.NonPresumptive, label: 'Non Presumptive' },
  ];

  TestOutcomeEnum = [
    { value: TestOutcome.Positive, label: 'Positive' },
    { value: TestOutcome.Negative, label: 'Negative' },
  ];

  ncdConditions: NCDCondition[] = [];

  form: FormGroup;
  isValid: boolean = false;
  submitLoading: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private ClientNCDHistoryService: ClientNcdHistoryStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      ScreeningOutcome: new FormControl(null, [Validators.required]),
      TestOutcome: new FormControl(),
      NCDConditionId: new FormControl(null, [Validators.required]),
      IsTestConducted: new FormControl(false),
      OnlineDbOid: new FormControl(null),
      TransactionId: new FormControl(null),
    });
  }

  ngOnInit() {
    console.log(this.member);

    // * Fetching NCD Conditions
    this.ClientNCDHistoryService.fetchNCDConditions().subscribe((ncdConditions) => {
      this.ncdConditions = ncdConditions;
    });

    // * Setting the default value of the form
    this.ClientNCDHistoryService.getClientNCDHistoryByClientId(this.member[0].Oid).then((clientNCDHistory) => {
      console.log('Client NCD History', clientNCDHistory);
      if (clientNCDHistory) {
        this.form.patchValue({
          TransactionId: clientNCDHistory.TransactionId,
          ScreeningOutcome: clientNCDHistory.ScreeningOutcome,
          TestOutcome: clientNCDHistory.TestOutcome,
          NCDConditionId: clientNCDHistory.NCDConditionId,
          IsTestConducted: clientNCDHistory.IsTestConducted,
          OnlineDbOid: clientNCDHistory.OnlineDbOid || null,
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
        const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

        const ClientNCDHistoryArray: ClientNCDHistory[] = this.member.map((member) => {
          const ClientNCDHistoryPayload: ClientNCDHistory = {
            TransactionId: this.form.value.TransactionId,
            ScreeningOutcome: this.form.value.ScreeningOutcome,
            TestOutcome: this.form.value.TestOutcome,
            NCDConditionId: this.form.value.NCDConditionId,
            IsTestConducted: this.form.value.IsTestConducted,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            IsDeleted: false,
            OnlineDbOid: this.form.value.OnlineDbOid,
          };
          return ClientNCDHistoryPayload;
        });

        const response = await this.ClientNCDHistoryService.addClientNCDHistory(ClientNCDHistoryArray);
        if (response?.changes?.changes === ClientNCDHistoryArray.length) {
          this.toast.openToast({
            message: 'Successfully recorded',
            duration: 2000,
            position: 'bottom',
            color: 'success',
          });
          this.form.reset();
        } else {
          this.toast.openToast({
            message: 'Failed to save the data',
            duration: 2000,
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
