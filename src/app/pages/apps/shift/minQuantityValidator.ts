import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

// Validator to ensure the value is not less than the negative of the attributeQuantity
export function minQuantityValidator(minValue: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isNotLessThanMin = value >= -minValue; // Allow values down to negative minValue
    const errors: ValidationErrors = {};

    if (!isNotLessThanMin) {
      errors['minQuantityRequired'] = `Value must be at least ${-minValue}.`;
    }

    return Object.keys(errors).length ? errors : null;
  };
}
