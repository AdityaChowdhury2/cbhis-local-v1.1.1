import { Component, Input, OnInit } from '@angular/core';
import { capSQLiteChanges } from '@capacitor-community/sqlite';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { Client } from 'src/app/modules/client/models/client';
import { GivenHBCService, HBCService, ServiceCategory } from 'src/app/modules/client/models/service-models/hbc';
import { GivenHBCServiceStorageService } from 'src/app/modules/client/services/hbc/client-hbc-services-storage.service';
import { HBCServiceCategoryStorageService } from 'src/app/modules/client/services/hbc/hbc-service-category-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-hbc-services-wizard',
  templateUrl: './hbc-services-wizard.component.html',
  styleUrls: ['./hbc-services-wizard.component.scss'],
})
export class HbcServicesWizardComponent implements OnInit {
  // form: FormGroup;
  isValid: boolean = false;
  submitLoading: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];
  hbcServices: HBCService[] = [];
  hbcServiceCategories: ServiceCategory[] = [];
  selectedItems: number[] = [];
  isDisable: boolean = false;

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private GivenHBCServiceService: GivenHBCServiceStorageService,
    private HBCServiceCategoryService: HBCServiceCategoryStorageService,
    private authStorageService: AuthStorageService
  ) {
    // * Form Validations
    // this.form = new FormGroup({
    //   HBCServiceId: new FormControl(null, [Validators.required]),
    //   CategoryId: new FormControl(null, [Validators.required]),
    // });
  }

  ngOnInit() {
    // * fetching hbc

    this.isDisable = this.selectedItems.length < 1;

    this.GivenHBCServiceService.getGivenHBCServiceByClientId(this.member?.[0]?.Oid).then((data) => {
      if (data?.length) {
        this.selectedItems = data.map((service) => service.HBCServiceId);
        // this.form.patchValue({
        //   HBCServiceId: data[0].HBCServiceId,
        // });
      }
    });
    // this.HBCServiceCategoryService.getHBCServiceCategoryByClientId(this.member?.[0]?.Oid).then((data) => {
    //   if (data?.length) {
    //     this.form.patchValue({
    //       CategoryId: data[0].ServiceCategoryId,
    //     });
    //   }
    // });

    // * Fetching HBC Services and HBC Service Categories
    this.GivenHBCServiceService.fetchHBCServices().subscribe((hbcServices) => {
      console.log('HBC service categories', hbcServices);
      this.hbcServices = hbcServices;
    });

    // this.HBCServiceCategoryService.fetchServiceCategories().subscribe((hbcServiceCategories) => {
    //   console.log('HBC service categories', hbcServiceCategories);
    //   this.hbcServiceCategories = hbcServiceCategories;
    // });
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
    this.submitLoading = true;
    // const isFormValid = this.form.valid;

    // get id's of selected member
    const selectedMemberIds = this.member.map((member) => member.Oid);

    let HBCServiceCategoryResponse: capSQLiteChanges | null = null;
    let GivenHBCServiceResponse: capSQLiteChanges | null = null;

    const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;

    if (this.selectedItems.length) {
      const GivenHBCServiceArray: GivenHBCService[] = [];
      this.member.map((member) => {
        this.selectedItems.map((item) => {
          const GivenHBCServicePayload: GivenHBCService = {
            ClientId: member.Oid,
            HBCServiceId: item,
            IsDeleted: false,
            CreatedBy: currentUser.Oid,
          };
          GivenHBCServiceArray.push(GivenHBCServicePayload);
        });
      });
      GivenHBCServiceResponse = await this.GivenHBCServiceService.addGivenHBCService(GivenHBCServiceArray);
      if (GivenHBCServiceResponse?.changes?.changes) {
        this.toast.openToast({
          message: 'Successfully recorded',
          duration: 1000,
          position: 'bottom',
          color: 'success',
        });
        this.submitLoading = false;
        this.dismissModal();
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
    //   // * HBC Service Category
    //   if (!this.form.invalid) {
    //     if (this.form.value.CategoryId) {
    //       try {
    //         const HBCServiceCategoryArray: HBCServiceCategory[] = this.member.map((member) => {
    //           const HBCServiceCategoryPayload: HBCServiceCategory = {
    //             ServiceCategoryId: this.form.value.CategoryId,
    //             ClientId: member.Oid,
    //             IsDeleted: false,
    //           };
    //           return HBCServiceCategoryPayload;
    //         });
    //         console.log('HBCServiceCategory ', HBCServiceCategoryArray);
    //         HBCServiceCategoryResponse = await this.HBCServiceCategoryService.addHBCServiceCategory(
    //           HBCServiceCategoryArray
    //         );
    //       } catch (error) {
    //         console.log('error found in add HBC Service Category', error);
    //       }
    //     } else {
    //       // delete HBCServiceCategory by client id for all client
    //       HBCServiceCategoryResponse = await this.HBCServiceCategoryService.deleteHBCServiceCategoryByClientId(
    //         selectedMemberIds
    //       );
    //     }

    //     // * Given HBC Service
    //     if (this.form.value.HBCServiceId) {
    //       // * Given HBC Service Service
    //       try {
    //         const GivenHBCServiceServiceArray: GivenHBCService[] = this.member.map((member) => {
    //           const GivenHBCServiceServiceArrayPayload: GivenHBCService = {
    //             HBCServiceId: this.form.value.HBCServiceId,
    //             ClientId: member.Oid,
    //             IsDeleted: false,
    //           };
    //           return GivenHBCServiceServiceArrayPayload;
    //         });

    //         GivenHBCServiceResponse = await this.GivenHBCServiceService.addGivenHBCService(GivenHBCServiceServiceArray);
    //       } catch (error) {
    //         console.log('error found in add Given HBC Service', error);
    //       }
    //     } else {
    //       // delete GivenHBCService by client id for all client
    //       GivenHBCServiceResponse = await this.GivenHBCServiceService.deleteGivenHBCServiceByClientId(
    //         selectedMemberIds
    //       );
    //     }

    //     console.log(GivenHBCServiceResponse, HBCServiceCategoryResponse);
    //     if (GivenHBCServiceResponse?.changes?.changes && HBCServiceCategoryResponse?.changes?.changes) {
    //       this.toast.openToast({
    //         message: 'Successfully recorded',
    //         duration: 1000,
    //         position: 'bottom',
    //         color: 'success',
    //       });
    //       this.form.reset();
    //     } else {
    //       this.toast.openToast({
    //         message: 'Failed to save the data',
    //         duration: 1000,
    //         position: 'bottom',
    //         color: 'danger',
    //       });
    //     }

    //     this.submitLoading = false;
    //     this.dismissModal();
    //   }
    // }
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
