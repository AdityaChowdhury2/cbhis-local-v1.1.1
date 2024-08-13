import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthStorageService } from 'src/app/core/services/auth-storage.service';
import { UserAccount } from 'src/app/modules/auth/models/user';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import {
  AlcoholConsumption,
  BreathingDifficulty,
  Exercise,
  FruitConsumption,
  SaltIntake,
  VegetableConsumption,
  WaterIntake,
} from '../../../enums/ncd.enum';
import { Client } from '../../../models/client';
import { NCDScreening } from '../../../models/service-models/ncd';
import { NCDScreeningStorageService } from '../../../services/ncd/ncdscreening-storage.service';

@Component({
  selector: 'app-ncd-screening-wizard',
  templateUrl: './ncd-screening-wizard.component.html',
  styleUrls: ['./ncd-screening-wizard.component.scss'],
})
export class NCDScreeningWizardComponent implements OnInit {
  form: FormGroup;
  isValid: boolean = false;
  submitLoading: boolean = false;
  @Input() head!: Client;
  @Input() member!: Client[];

  waterInTakeEnum: { [key: number]: string } = {
    [WaterIntake.LessThan3Glasses]: 'Less than 3 glasses',
    [WaterIntake.ThreeTo5Glasses]: '3 to 5 glasses',
    [WaterIntake.MoreThan5Glasses]: 'More than 5 glasses',
  };

  get waterInTakeArray(): { value: number; label: string }[] {
    return Object.keys(this.waterInTakeEnum).map((key) => ({
      value: +key,
      label: this.waterInTakeEnum[+key],
    }));
  }

  breathingDifficulty: { [key: number]: string } = {
    [BreathingDifficulty.Never]: 'Never',
    [BreathingDifficulty.Rarely]: 'Rarely (1-2 times a week)',
    [BreathingDifficulty.Sometimes]: 'Sometimes (3-4 times a week)',
    [BreathingDifficulty.Often]: 'Often (5 or more times a week)',
  };

  get breathingDifficultyArray(): { value: number; label: string }[] {
    return Object.keys(this.breathingDifficulty).map((key) => ({
      value: +key,
      label: this.breathingDifficulty[+key],
    }));
  }

  exerciseEnum: { [key: number]: string } = {
    [Exercise.None]: 'None',
    [Exercise.OneTo2Hours]: '1-2 hours',
    [Exercise.ThreeTo5Hours]: '3-5 hours',
    [Exercise.MoreThan5Hours]: 'More than 5 hours',
  };

  get exerciseArray(): { value: number; label: string }[] {
    return Object.keys(this.exerciseEnum).map((key) => ({
      value: +key,
      label: this.exerciseEnum[+key],
    }));
  }

  heartRateRaisingActivityEnum: { [key: number]: string } = {
    [Exercise.None]: 'None',
    [Exercise.OneTo2Hours]: '1-2 hours',
    [Exercise.ThreeTo5Hours]: '3-5 hours',
    [Exercise.MoreThan5Hours]: 'More than 5 hours',
  };

  get heartRateRaisingActivityArray(): { value: number; label: string }[] {
    return Object.keys(this.heartRateRaisingActivityEnum).map((key) => ({
      value: +key,
      label: this.heartRateRaisingActivityEnum[+key],
    }));
  }

  vegetableConsumptionEnum: { [key: number]: string } = {
    [VegetableConsumption.Daily]: 'Daily',
    [VegetableConsumption.Sometimes]: 'Sometimes',
    [VegetableConsumption.Often]: 'Often',
    [VegetableConsumption.Rarely]: 'Rarely',
  };

  get vegetableConsumptionArray(): { value: number; label: string }[] {
    return Object.keys(this.vegetableConsumptionEnum).map((key) => ({
      value: +key,
      label: this.vegetableConsumptionEnum[+key],
    }));
  }

  fruitConsumptionEnum: { [key: number]: string } = {
    [FruitConsumption.Daily]: 'Daily',
    [FruitConsumption.Sometimes]: 'Sometimes',
    [FruitConsumption.Often]: 'Often',
    [FruitConsumption.Rarely]: 'Rarely',
  };

  get fruitConsumptionArray(): { value: number; label: string }[] {
    return Object.keys(this.fruitConsumptionEnum).map((key) => ({
      value: +key,
      label: this.fruitConsumptionEnum[+key],
    }));
  }

  saltIntakeEnum: { [key: number]: string } = {
    [SaltIntake.VeryLittle]: 'Very little',
    [SaltIntake.Moderate]: 'Moderate',
    [SaltIntake.High]: 'High',
  };

  get saltIntakeArray(): { value: number; label: string }[] {
    return Object.keys(this.saltIntakeEnum).map((key) => ({
      value: +key,
      label: this.saltIntakeEnum[+key],
    }));
  }

  alcoholConsumptionEnum: { [key: number]: string } = {
    [AlcoholConsumption.None]: 'None',
    [AlcoholConsumption.Occasional]: 'Occasional',
    [AlcoholConsumption.Regular]: 'Regular',
    [AlcoholConsumption.Heavy]: 'Heavy',
  };

  get alcoholConsumptionArray(): { value: number; label: string }[] {
    return Object.keys(this.alcoholConsumptionEnum).map((key) => ({
      value: +key,
      label: this.alcoholConsumptionEnum[+key],
    }));
  }

  constructor(
    private modalService: ModalService,
    private toast: ToastService,
    private authStorageService: AuthStorageService,
    private NCDScreeningStorageService: NCDScreeningStorageService
  ) {
    this.form = new FormGroup({
      WaterIntake: new FormControl(null, [Validators.required]),
      IsClientSmoking: new FormControl(null),
      BreathingDifficulty: new FormControl(null, [Validators.required]),
      Exercise: new FormControl(null, [Validators.required]),
      HeartRateRaisingActivity: new FormControl(null, [Validators.required]),
      VegetableConsumption: new FormControl(null),
      FruitConsumption: new FormControl(null),
      IsSweetenedFoodConsumed: new FormControl(null),
      IsRefinedWheatConsumed: new FormControl(null),
      SaltIntake: new FormControl(null, [Validators.required]),
      AlcoholConsumption: new FormControl(null, [Validators.required]),
      OnlineDbOid: new FormControl(null),
      TransactionId: new FormControl(null),
    });
  }

  ngOnInit() {
    // * Setting the default value of the form
    this.NCDScreeningStorageService.getNCDScreeningByClientId(this.member[0].Oid).then((data: NCDScreening[]) => {
      console.log('Client NCD History', data);
      if (data?.length) {
        console.log('NCDScreeningStorageService ==>', data);
        this.form.patchValue({
          WaterIntake: data[0].WaterIntake,
          IsClientSmoking: data[0].IsClientSmoking,
          BreathingDifficulty: data[0].BreathingDifficulty,
          Exercise: data[0].Exercise,
          HeartRateRaisingActivity: data[0].HeartRateRaisingActivity,
          VegetableConsumption: data[0].VegetableConsumption,
          FruitConsumption: data[0].FruitConsumption,
          IsSweetenedFoodConsumed: data[0].IsSweetenedFoodConsumed,
          IsRefinedWheatConsumed: data[0].IsRefinedWheatConsumed,
          SaltIntake: data[0].SaltIntake,
          AlcoholConsumption: data[0].AlcoholConsumption,
          TransactionId: data[0].TransactionId,
          OnlineDbOid: data[0].OnlineDbOid || null,
        });
      }
    });
  }

  // async _onSubmit() {}

  async onSubmit() {
    const isFormValid = this.form.valid;

    // * Validation Check
    if (!isFormValid) {
      this.isValid = true;
      this.submitLoading = false;
      return;
    } else {
      if (this.form.valid) {
        const currentUser = (await this.authStorageService.getCurrentLoginStatus()) as UserAccount;
        const NCDScreeningArray: NCDScreening[] = this.member.map((member) => {
          const NCDScreeningPayload: NCDScreening = {
            ...this.form.value,
            TransactionId: this.form.value.TransactionId,
            CreatedBy: currentUser.Oid,
            ClientId: member.Oid,
            IsDeleted: false,
            OnlineDbOid: this.form.value.OnlineDbOid,
          };
          return NCDScreeningPayload;
        });
        const response = await this.NCDScreeningStorageService.addNCDScreening(NCDScreeningArray);
        if (response?.changes?.changes === NCDScreeningArray.length) {
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
