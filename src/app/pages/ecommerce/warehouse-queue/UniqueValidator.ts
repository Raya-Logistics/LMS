import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup, FormArray } from '@angular/forms';
export class UniqueValidator {
    static uniqueArrayValues(control: AbstractControl): ValidationErrors | null {
      if (control instanceof FormArray) {
        const values = control.controls.map(c => c.value).filter(val => val !== null && val !== ''); // Filter out null or empty values
        const hasDuplicates = values.some((value, index) => values.indexOf(value) !== index);
        return hasDuplicates ? { notUnique: true } : null;
      }
      return null;
    }
  
    static uniquePalletNumbers(control: AbstractControl): ValidationErrors | null {
      if (control instanceof FormArray) {
        const palletNumbers = control.controls.map(group => {
          const groupValue = group.value;
          const fullPalletNumber = `${groupValue.letter1}${groupValue.letter2}${groupValue.letter3}${groupValue.number}`;
          return fullPalletNumber.trim() !== '' ? fullPalletNumber : null;
        }).filter(val => val !== null); 
        const hasDuplicates = palletNumbers.some((value, index) => palletNumbers.indexOf(value) !== index);
        return hasDuplicates ? { notUnique: true } : null;
      }
      return null;
    }
  }
  
// export class UniqueValidator {
//   // Validator for unique values in a FormArray
//   static uniqueArrayValues(control: AbstractControl): ValidationErrors | null {
//     if (control instanceof FormArray) {
//       const values = control.controls.map(c => c.value);
//       const hasDuplicates = values.some((value, index) => values.indexOf(value) !== index);
//       return hasDuplicates ? { notUnique: true } : null;
//     }
//     return null;
//   }

//   // Validator for unique pallet numbers (combining letter1, letter2, letter3, and number)
//   static uniquePalletNumbers(control: AbstractControl): ValidationErrors | null {
//     if (control instanceof FormArray) {
//       const palletNumbers = control.controls.map(group => {
//         const groupValue = group.value;
//         return `${groupValue.letter1}${groupValue.letter2}${groupValue.letter3}${groupValue.number}`;
//       });
//       const hasDuplicates = palletNumbers.some((value, index) => palletNumbers.indexOf(value) !== index);
//       return hasDuplicates ? { notUnique: true } : null;
//     }
//     return null;
//   }
// }
