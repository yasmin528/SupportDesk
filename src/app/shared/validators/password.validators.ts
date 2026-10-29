import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const strongPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) {
    return null;
  }
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  return hasLetter && hasNumber ? null : { weakPassword: true };
};

export function matchFields(field: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value = group.get(field)?.value;
    const confirm = group.get(confirmField)?.value;
    if (!confirm) {
      return null;
    }
    return value === confirm ? null : { fieldsMismatch: true };
  };
}
