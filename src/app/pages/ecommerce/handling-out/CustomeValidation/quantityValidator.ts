import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function quantityValidator(onhandControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const inputQuantity = control.value;
    const onhand = onhandControl.value;
    return inputQuantity > onhand ? { quantityExceeds: true } : null;
  };
}