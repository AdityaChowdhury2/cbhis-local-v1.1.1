import { Component, Input, OnInit } from '@angular/core';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import { TBControlAssessment } from 'src/app/modules/client/models/service-models/tb';
import { AffectedClientStorageService } from 'src/app/modules/client/services/tb/affected-client-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TBKeyAffectedClient } from './../../../../../models/service-models/tb';

@Component({
  selector: 'app-infection-control-assessment-wizard',
  templateUrl: './infection-control-assessment-wizard.component.html',
  styleUrls: ['./infection-control-assessment-wizard.component.scss'],
})
export class InfectionControlAssessmentWizardComponent implements OnInit {
  submitLoading: boolean = false;
  isValid = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  tbControlAssessmentArray: TBControlAssessment[] = [];
  selectedItems: number[] = [];
  isDisable: boolean = false;

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private TBControlAssessmentService: AffectedClientStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
  }

  ngOnInit() {
    this.isDisable = this.selectedItems.length < 1;

    this.TBControlAssessmentService.fetchTBControlAssessment().subscribe((response) => {
      this.tbControlAssessmentArray = response;
    });

    if (this.member.length === 1) {
      this.TBControlAssessmentService.getTBKeyAffectedClientByClientId(this.member[0].Oid).then((response) => {
        console.log(response);
        if (response) {
          this.selectedItems = response.map((item) => item.TBControlAssessmentId);
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

  // * For submitting the form
  async onSubmit() {
    const TBKeyAffectedClientArray: TBKeyAffectedClient[] = [];
    const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;
    if (this.selectedItems.length) {
      this.member.map((member) => {
        this.selectedItems.map((item) => {
          const TBKeyAffectedClientPayload: TBKeyAffectedClient = {
            ClientId: member.Oid,
            TBControlAssessmentId: item,
            IsDeleted: false,
            CreatedBy: currentUser.Oid,
          };
          TBKeyAffectedClientArray.push(TBKeyAffectedClientPayload);
        });
      });

      const response = await this.TBControlAssessmentService.addTBKeyAffectedClient(TBKeyAffectedClientArray);

      if (response?.changes?.changes) {
        this.modalService.dismissModal();
        this.toast.openToast({
          message: 'Successfully recorded',
          position: 'bottom',
          duration: 1000,
          color: 'success',
        });
      } else {
        this.toast.openToast({
          message: 'Select at least one topic to save.',
          position: 'bottom',
          duration: 1000,
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
  }

  // async onSubmit() {
  //   this.submitLoading = true;
  //   const isFormValid = this.form.valid;
  //   // * Validation Check
  //   if (!isFormValid) {
  //     this.isValid = true;
  //     this.submitLoading = false;
  //     return;
  //   } else {
  //     if (this.form.valid) {
  //       const TTBKeyAffectedClientArray: TBKeyAffectedClient[] = this.member.map((member) => {
  //         const TBKeyAffectedClientPayload: TBKeyAffectedClient = {
  //           ...this.form.value,
  //           ClientId: member.Oid,
  //           IsDeleted: 0,
  //         };
  //         return TBKeyAffectedClientPayload;
  //       });

  //       const response = await this.TBControlAssessmentService.addTBKeyAffectedClient(TTBKeyAffectedClientArray);
  //       if (response?.changes?.changes === TTBKeyAffectedClientArray.length) {
  //         this.toast.openToast({
  //           message: 'Successfully recorded',
  //           duration: 1000,
  //           position: 'bottom',
  //           color: 'success',
  //         });
  //         this.form.reset();
  //       } else {
  //         this.toast.openToast({
  //           message: 'Failed to save the data',
  //           duration: 1000,
  //           position: 'bottom',
  //           color: 'danger',
  //         });
  //       }
  //     } else {
  //       this.toast.openToast({
  //         message: 'Please fill in all required fields',
  //         duration: 1000,
  //         position: 'bottom',
  //         color: 'warning',
  //       });
  //     }
  //     this.submitLoading = false;
  //     this.dismissModal();
  //   }
  // }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
