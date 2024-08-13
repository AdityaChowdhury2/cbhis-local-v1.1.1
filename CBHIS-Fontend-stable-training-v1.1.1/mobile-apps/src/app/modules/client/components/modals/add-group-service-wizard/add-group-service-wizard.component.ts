import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Client } from '../../../models/client';
import { HouseholdDrinkingWater } from '../../../models/household-drinking-water';
import { ClientStorageService } from '../../../services/client-storage.service';
import { HouseholdDrinkingWaterSourceStorageService } from '../../../services/household-drinking-water-source-storage.service';
import { HouseholdSafeWaterStorageService } from '../../../services/household-safe-water-storage.service';

import { capSQLiteChanges } from '@capacitor-community/sqlite';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { DrinkingWaterSource } from '../../../models/drinking-water-source';
import { SafeWaterSource } from '../../../models/safe-water-source';
import { WASH } from '../../../models/wash';
import { HouseholdWASHStorageService } from '../../../services/household-wash-storage.service';
import { HouseholdSafeWaterSource } from './../../../models/household-safe-water-source';
import { HouseholdWASHs } from './../../../models/household-wash';

@Component({
  selector: 'app-add-group-service-wizard',
  templateUrl: './add-group-service-wizard.component.html',
  styleUrls: ['./add-group-service-wizard.component.scss'],
})
export class AddGroupServiceWizardComponent implements OnInit {
  // Local variables
  contents: boolean[] = [false];
  toiletForm: FormGroup = new FormGroup({});
  gridRows: any[] = [];
  currentIndex = 0;
  contentLength: number = this.contents.length;
  drinkingWaterSources!: DrinkingWaterSource[];
  safeWaterSources!: SafeWaterSource[];
  washs!: WASH[];
  selectedDrinkingWaterSources: number[] = [];
  selectedSafeWaterSources: number[] = [];
  selectedWASHs: number[] = [];
  submitLoading: boolean = false;
  head: Client | undefined;
  isDisabled: boolean = false;
  currentUser!: UserAccount;

  // input from parent component
  @Input() familyHeadId!: string;

  constructor(
    private modalService: ModalService,
    private householdDrinkingWaterSourceService: HouseholdDrinkingWaterSourceStorageService,
    private householdSafeWaterSourceService: HouseholdSafeWaterStorageService,
    private householdWASHService: HouseholdWASHStorageService,
    private toaster: ToastService,
    private clientStorageService: ClientStorageService,
    private authService: AuthStorageService
  ) {}

  ngOnInit() {
    // this.authService.getCurrentUser().subscribe(
    //   (user) => {
    //     if (user) {
    //       console.log(user);
    //       this.currentUser = user;
    //     }
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // );
    this.contents[this.currentIndex] = true;
    console.log('House Head ID: ', this.familyHeadId);

    if (
      this.selectedDrinkingWaterSources?.length === 0 &&
      this.selectedSafeWaterSources?.length === 0 &&
      this.selectedWASHs?.length === 0
    ) {
      this.isDisabled = true;
    }

    this.householdDrinkingWaterSourceService.fetchDrinkingWaterSources().subscribe((data) => {
      console.log('drinking water sources: ', data);
      this.drinkingWaterSources = data;
    });

    this.householdSafeWaterSourceService.fetchSafeWaterData().subscribe((data) => {
      this.safeWaterSources = data;
    });

    this.householdWASHService.fetchWASHData().subscribe((data) => {
      console.log(data);
      this.washs = data;
    });

    this.clientStorageService.fetchClients().subscribe((clients: Client[]) => {
      this.head = clients?.find((client) => client.Oid === this.familyHeadId);
    });

    // get the household drinking water
    this.householdDrinkingWaterSourceService.getHouseholdDrinkingWaterByFamilyHeadId(this.familyHeadId).then((data) => {
      console.log('Drinking Water Sources: ', data);
      if (data && data.length > 0) {
        data.forEach((item) => {
          this.selectedDrinkingWaterSources.push(item.DrinkingWaterSourceId);
        });
      }
    });

    // get the household safe water
    this.householdSafeWaterSourceService.getHouseholdSafeWaterByFamilyHeadId(this.familyHeadId).then((data) => {
      console.log('Safe Water Sources: ', data);
      if (data && data.length > 0) {
        data.forEach((item) => {
          this.selectedSafeWaterSources.push(item.SafeWaterSourceId);
        });
      }
    });

    // get the household wash
    this.householdWASHService.getHouseholdWASHByFamilyHeadId(this.familyHeadId).then((data) => {
      console.log('Wash Sources: ', data);
      if (data && data.length > 0) {
        data.forEach((item) => {
          this.selectedWASHs.push(item.WASHId);
        });
      }
    });

    this.householdSafeWaterSourceService.fetchData().subscribe((data) => {
      console.log('Safe Water Sources: ', data);
    });
    this.householdWASHService.fetchData().subscribe((data) => {
      console.log('Wash Sources: ', data);
    });
  }

  // updateMissingChildrenCount() {
  //   const count = this.form.get('missingChildrenCount')?.value;
  //   this.gridRows = Array(count).fill(0);
  // }

  closeWizard() {
    this.modalService.dismissModal();
  }

  // next() {
  //   console.log(this.currentIndex);
  //   this.contents[this.currentIndex] = false;

  //   if (this.currentIndex < this.contentLength - 1) {
  //     this.currentIndex++;
  //     this.contents[this.currentIndex] = true;
  //   }
  //   console.log(this.contents);
  // }
  // previous() {
  //   console.log(this.currentIndex);
  //   this.contents[this.currentIndex] = false;
  //   if (0 < this.currentIndex) {
  //     this.currentIndex--;
  //     if (this.currentIndex >= 0) {
  //       this.contents[this.currentIndex] = true;
  //     }
  //   }
  // }

  async onSubmit() {
    this.submitLoading = true;
    let drinkingWaterSourceResponse: capSQLiteChanges | null = null;
    let safeWaterServiceSourceResponse: capSQLiteChanges | null = null;
    let washesResponse: capSQLiteChanges | null = null;

    const currentUser = (await this.authService.getCurrentLoginStatus()) as UserAccount;

    if (this.selectedDrinkingWaterSources.length !== 0 && currentUser && currentUser?.Oid) {
      console.log('selected drinking water sources ', this.selectedDrinkingWaterSources);
      const householdDrinkingWaterSources: HouseholdDrinkingWater[] = [];
      this.selectedDrinkingWaterSources.forEach((drinkingWaterSource) => {
        householdDrinkingWaterSources.push({
          FamilyHeadId: this.familyHeadId,
          DrinkingWaterSourceId: drinkingWaterSource,
          IsDeleted: false,
          CreatedBy: currentUser.Oid,
        });
      });
      drinkingWaterSourceResponse = await this.householdDrinkingWaterSourceService.addItem(
        householdDrinkingWaterSources
      );
      console.log('Drinking water source response: ', drinkingWaterSourceResponse);
    } else {
      drinkingWaterSourceResponse = await this.householdDrinkingWaterSourceService.deleteItemByFamilyHeadId(
        this.familyHeadId
      );
    }

    if (this.selectedSafeWaterSources.length !== 0 && currentUser && currentUser?.Oid) {
      console.log('selected safe water sources ', this.selectedSafeWaterSources);
      const householdSafeWaterSource: HouseholdSafeWaterSource[] = [];
      this.selectedSafeWaterSources.forEach((safeWaterSource) => {
        householdSafeWaterSource.push({
          FamilyHeadId: this.familyHeadId,
          SafeWaterSourceId: safeWaterSource,
          IsDeleted: false,
          CreatedBy: currentUser.Oid,
        });
      });
      safeWaterServiceSourceResponse = await this.householdSafeWaterSourceService.addItems(householdSafeWaterSource);
      console.log('Safe water source response: ', safeWaterServiceSourceResponse);
    } else {
      safeWaterServiceSourceResponse = await this.householdSafeWaterSourceService.deleteItemByFamilyHeadId(
        this.familyHeadId
      );
    }

    if (this.selectedWASHs.length !== 0 && currentUser && currentUser?.Oid) {
      console.log("selected Wash's water sources ", this.selectedWASHs);
      const householdWASHs: HouseholdWASHs[] = [];
      this.selectedWASHs.forEach((wash) => {
        householdWASHs.push({
          FamilyHeadId: this.familyHeadId,
          WASHId: wash,
          IsDeleted: false,
          CreatedBy: currentUser.Oid,
        });
      });
      washesResponse = await this.householdWASHService.addItems(householdWASHs);
      console.log('Wash response: ', washesResponse);
    } else {
      washesResponse = await this.householdWASHService.deleteItemByFamilyHeadId(this.familyHeadId);
    }

    if (drinkingWaterSourceResponse?.changes || safeWaterServiceSourceResponse?.changes || washesResponse?.changes) {
      this.modalService.dismissModal();
      this.submitLoading = false;
      this.toaster.openToast({
        message: 'Successfully recorded',
        position: 'bottom',
        duration: 1000,
        color: 'success',
      });
    }

    this.modalService.dismissModal();
    // if (
    //   this.selectedDrinkingWaterSources.length !== 0 &&
    //   this.selectedSafeWaterSources.length !== 0 &&
    //   this.selectedWASHs.length !== 0
    // ) {
    //   console.log('selected drinking water sources ', this.selectedDrinkingWaterSources);
    //   const householdDrinkingWaterSources: HouseholdDrinkingWater[] = [];
    //   this.selectedDrinkingWaterSources.forEach((drinkingWaterSource) => {
    //     householdDrinkingWaterSources.push({
    //       FamilyHeadId: this.familyHeadId,
    //       DrinkingWaterSourceId: drinkingWaterSource,
    //       IsDeleted: 0,
    //     });
    //   });
    //   const drinkingWaterSourceResponse = await this.householdDrinkingWaterSourceService.addItem(
    //     householdDrinkingWaterSources
    //   );
    //   console.log('selected safe water sources ', this.selectedSafeWaterSources);
    //   const householdSafeWaterSource: HouseholdSafeWaterSource[] = [];
    //   this.selectedSafeWaterSources.forEach((safeWaterSource) => {
    //     householdSafeWaterSource.push({
    //       FamilyHeadId: this.familyHeadId,
    //       SafeWaterSourceId: safeWaterSource,
    //       IsDeleted: 0,
    //     });
    //   });
    //   const safeWaterServiceSourceResponse = await this.householdSafeWaterSourceService.addItems(
    //     householdSafeWaterSource
    //   );

    //   console.log("selected Wash's water sources ", this.selectedWASHs);
    //   const householdWASHs: HouseholdWASHs[] = [];
    //   this.selectedWASHs.forEach((wash) => {
    //     householdWASHs.push({
    //       FamilyHeadId: this.familyHeadId,
    //       WASHId: wash,
    //       IsDeleted: 0,
    //     });
    //   });
    //   const washesResponse = await this.householdWASHService.addItems(householdWASHs);
    //   const query1 = `SELECT * FROM HouseholdDrinkingWater WHERE FamilyHeadId = ? AND IsDeleted = 0;`;
    //   const query2 = `SELECT * FROM HouseholdSafeWaterSource WHERE FamilyHeadId = ? AND IsDeleted = 0;`;
    //   const query3 = `SELECT * FROM HouseholdWASH WHERE FamilyHeadId = ? AND IsDeleted = 0;`;

    //   this.householdDrinkingWaterSourceService.db.query(query1, [this.familyHeadId]).then((result) => {
    //     console.log('Drinking Water Sources: ', result.values);
    //   });
    //   this.householdSafeWaterSourceService.db.query(query2, [this.familyHeadId]).then((result) => {
    //     console.log('Safe Water Sources: ', result.values);
    //   });
    //   this.householdWASHService.db.query(query3, [this.familyHeadId]).then((result) => {
    //     console.log('WASHs: ', result.values);
    //   });
    //   console.log(drinkingWaterSourceResponse);
    //   console.log(safeWaterServiceSourceResponse);
    //   console.log(washesResponse);
    //   if (drinkingWaterSourceResponse?.changes && safeWaterServiceSourceResponse?.changes && washesResponse?.changes) {
    //     this.modalService.dismissModal();
    //     this.submitLoading = false;
    //     this.toaster.openToast({
    //       message: 'Successfully recorded',
    //       position: 'bottom',
    //       duration: 1000,
    //       color: 'success',
    //     });
    //   }
    // }
  }

  // onCheckBoxChangeForDrinkingWaterSources(event: any, id: number) {}
  // onCheckBoxChangeForSafeWaterSources(event: any, id: number) {}
  // onCheckBoxChangeForWashs(event: any, id: number) {}

  handleSelectionChange(event: any, value: number, targetArray: number[]): void {
    console.log(targetArray);

    this.isDisabled = false;

    if (event.detail.checked) {
      // Add the value if it's not already in the array
      if (!targetArray.includes(value)) {
        targetArray.push(value);
      }
    } else {
      // Remove the value if the checkbox is unchecked
      const index = targetArray.indexOf(value);
      if (index > -1) {
        targetArray.splice(index, 1);
      }
    }
  }

  // addMissingChildren() {
  //   this.form.get('missingChildrenCount')?.enable();
  //   const count = this.form.get('missingChildrenCount')?.value;
  //   this.gridRows = Array(count).fill(0);
  // }
}
