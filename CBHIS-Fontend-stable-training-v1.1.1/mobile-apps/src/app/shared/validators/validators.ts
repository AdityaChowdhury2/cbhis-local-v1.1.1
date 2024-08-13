import { AbstractControl, ValidatorFn } from "@angular/forms";

export const compareValidator: ValidatorFn =  (control: AbstractControl) => {
  const passwordControl = control.get('password');
  const confirmPasswordControl = control.get('confirmPassword');

  if (!passwordControl || !confirmPasswordControl) {
    return null;
  }

  return passwordControl.value === confirmPasswordControl.value ? null : { compare: true };
};
