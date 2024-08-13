import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return control.value.NewPassword === control.value.ConfirmPassword ? null : { passwordMismatch: true };
};
