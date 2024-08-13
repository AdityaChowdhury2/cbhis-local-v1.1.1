import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import { ClientTBSymptom, TBSymptom } from 'src/app/modules/client/models/service-models/tb';
import { ClientTbSymptomsStorageService } from 'src/app/modules/client/services/tb/client-tb-symptoms-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-symptoms-screening-wizard',
  templateUrl: './symptoms-screening-wizard.component.html',
  styleUrls: ['./symptoms-screening-wizard.component.scss'],
})
export class SymptomsScreeningWizardComponent implements OnInit {
  tbSymptoms: TBSymptom[] = [];

  form: FormGroup;
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  isUpdate: boolean = false;

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private ClientTBSymptomsService: ClientTbSymptomsStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    this.form = new FormGroup({
      TransactionId: new FormControl(null),
      TBSymptomId: new FormControl(),
      IsSputumCollected: new FormControl(),
      IsTBContact: new FormControl(),
      IsPresumptive: new FormControl(),
      OnlineDbOid: new FormControl(null),
    });
  }

  ngOnInit() {
    this.ClientTBSymptomsService.getClientTBSymptomsByClientId(this.member?.[0].Oid).then((clientTBSymptoms) => {
      console.log(clientTBSymptoms);
      if (clientTBSymptoms) {
        this.isUpdate = true;
        this.form.patchValue({
          TransactionId: clientTBSymptoms.TransactionId,
          TBSymptomId: clientTBSymptoms.TBSymptomId,
          IsSputumCollected: clientTBSymptoms.IsSputumCollected,
          IsTBContact: clientTBSymptoms.IsTBContact,
          IsPresumptive: clientTBSymptoms.IsPresumptive,
          OnlineDbOid: clientTBSymptoms?.OnlineDbOid || null,
        });
      }
    });

    this.ClientTBSymptomsService.fetchTBSymptoms().subscribe((tbSymptoms) => {
      console.log('TB symptomps ', tbSymptoms);
      this.tbSymptoms = tbSymptoms;
    });
  }

  // * For submitting the form
  async onSubmit() {
    this.submitLoading = true;

    console.log(this.form.value);
    if (
      this.form.get('TBSymptomId')?.value ||
      this.form.get('IsSputumCollected')?.value ||
      this.form.get('IsTBContact')?.value ||
      this.form.get('IsPresumptive')?.value ||
      this.isUpdate
    ) {
      const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

      const ClientTBSymptomsArray: ClientTBSymptom[] = this.member.map((member) => {
        const ClientTBSymptomsPayload: ClientTBSymptom = {
          TransactionId: this.form.get('TransactionId')?.value,
          IsPresumptive: this.form.get('IsPresumptive')?.value,
          IsSputumCollected: this.form.get('IsSputumCollected')?.value,
          IsTBContact: this.form.get('IsTBContact')?.value,
          TBSymptomId: this.form.get('TBSymptomId')?.value,
          ClientId: member.Oid,
          CreatedBy: currentUser.Oid,
          IsDeleted: false,
          OnlineDbOid: this.form.get('OnlineDbOid')?.value || null,
        };
        return ClientTBSymptomsPayload;
      });

      const response = await this.ClientTBSymptomsService.addClientTBSymptoms(ClientTBSymptomsArray);

      if (response?.changes?.changes === ClientTBSymptomsArray.length) {
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
      console.log('Form not submitted');
    }

    this.submitLoading = false;
    this.dismissModal();
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
