import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Client } from 'src/app/modules/client/models/client';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { FrequencyOfMalariaTherapy } from 'src/app/modules/client/enums/anc.enum';
import { ANC } from 'src/app/modules/client/models/anc';
import { AncStorageService } from '../../../../../services/anc-storage.service';

@Component({
  selector: 'app-anc-initiation-wizard',
  templateUrl: './anc-initiation-wizard.component.html',
  styleUrls: ['./anc-initiation-wizard.component.scss'],
})
export class AncInitiationWizardComponent implements OnInit {
  // Local variables
  ANCForm: FormGroup;
  familyHeadId!: string;
  individualId!: string;
  familyMemberIds!: number[];
  selectedMember!: Observable<Client[]>;
  FrequencyOfMalariaTherapyOptionsEnum: { [key: number]: string } = {
    [FrequencyOfMalariaTherapy.Daily]: 'Daily',
    [FrequencyOfMalariaTherapy.Weekly]: 'Weekly',
    [FrequencyOfMalariaTherapy.Monthly]: 'Monthly',
    [FrequencyOfMalariaTherapy.Quarterly]: 'Quarterly',
    [FrequencyOfMalariaTherapy.Yearly]: 'Yearly',
  };

  get FrequencyOfMalariaTherapyOptions() {
    return Object.entries(this.FrequencyOfMalariaTherapyOptionsEnum).map(([key, value]) => {
      return { key: value, value: +key };
    });
  }

  @Input() head!: Client;
  @Input() member!: Client[];
  isValid: boolean = false;

  constructor(
    private toast: ToastService,
    private modalService: ModalService,
    private ancStorageService: AncStorageService,
    private authStorageService: AuthStorageService
  ) {
    this.ANCForm = new FormGroup({
      OnlineDbOid: new FormControl(null),
      IsCounselled: new FormControl(0),
      IsANCInitiated: new FormControl(0),
      IsMalariaDrugTaken: new FormControl(0),
      FrequencyOfMalariaTherapy: new FormControl('', [Validators.required]),
      TransactionId: new FormControl(null),
    });
  }

  ngOnInit() {
    if (this.member && this.member?.[0]?.Oid && this.member.length === 1) {
      this.ancStorageService.getANCByClientId(this.member?.[0]?.Oid).then((ancData: ANC) => {
        if (ancData) {
          this.ANCForm.patchValue({
            OnlineDbOid: ancData?.OnlineDbOid || null,
            IsCounselled: ancData.IsCounselled,
            IsANCInitiated: ancData.IsANCInitiated,
            IsMalariaDrugTaken: ancData.IsMalariaDrugTaken,
            FrequencyOfMalariaTherapy: ancData.FrequencyOfMalariaTherapy,
            TransactionId: ancData.TransactionId,
          });
        }
      });
    }
  }

  // * save the data
  async onSubmit() {
    const isFormValid = this.ANCForm.valid;

    if (!isFormValid) {
      this.isValid = true;
      return;
    }
    let currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    if (this.ANCForm.valid && currentUser) {
      if (currentUser?.Oid) {
        const ancValuesArray: ANC[] = this.member.map((member) => {
          const ANCValues: ANC = {
            TransactionId: this.ANCForm.value.TransactionId,
            IsANCInitiated: this.ANCForm.value.IsANCInitiated,
            IsCounselled: this.ANCForm.value.IsCounselled,
            IsMalariaDrugTaken: this.ANCForm.value.IsMalariaDrugTaken,
            FrequencyOfMalariaTherapy: this.ANCForm.value.FrequencyOfMalariaTherapy,
            ClientId: member.Oid,
            IsDeleted: false,
            CreatedBy: currentUser.Oid,
            OnlineDbOid: this.ANCForm.value.OnlineDbOid,
          };
          return ANCValues;
        });

        const response = await this.ancStorageService.addItems(ancValuesArray);
        console.log(response);

        if (response?.changes?.changes === ancValuesArray.length) {
          this.dismissModal();
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
    }
  }

  // async onSubmit() {
  //   if (this.ANCForm.valid) {
  //     console.log(this.ANCForm.value);
  //     const ANCValues: ANC = {} as ANC;
  //     Object.assign(ANCValues, this.ANCForm.value);
  //     ANCValues.ClientId = this.member?.[0]?.Oid;
  //     ANCValues.IsDeleted = 0;
  //     const response = await this.ancStorageService.addItems(ANCValues);
  //     if (response?.changes?.changes === 1) {
  //       this.dismissModal();
  //       this.toast.openToast({
  //         message: 'Successfully recorded',
  //         duration: 1000,
  //         position: 'bottom',
  //         color: 'success',
  //       });
  //     } else {
  //       this.toast.openToast({
  //         message: 'Failed to save the data',
  //         duration: 1000,
  //         position: 'bottom',
  //         color: 'danger',
  //       });
  //     }
  //   }
  // }

  dismissModal() {
    this.modalService.dismissModal();
  }
}
