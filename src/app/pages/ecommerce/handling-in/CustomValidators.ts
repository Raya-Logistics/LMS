import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from "src/app/services/apihandler.service";

export class CustomValidators {
  static uniqueReferenceNumber(apiService: ApihandlerService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      console.log(control.value, " control.value")
      if (!control.value) {
        return of(null);
      }

      return apiService.GetItem(`${GlobalComponent.BASE_API}/StockHeader/GetTransactionByReference/${control.value}`).pipe(
        map((response: any) => {
          console.log(response, "response ")
          console.log(response.success ? null : { notUnique: true }, "response.success ? null : { notUnique: true } ")
          return response.success ? null : { notUnique: true };
        }),
        catchError(() => of(null))
      );
    };
  }
  static uniqueBookingNumber(apiService: ApihandlerService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      console.log(control.value, "control.value ")
      return apiService.GetItem(`${GlobalComponent.BASE_API}/StockHeader/GetTransactionByReference/${control.value}`).pipe(
        map((response: any) => {
          console.log(response.success ? null : { notUnique: true }, "response.success ? null : { notUnique: true } ")
          return response.success ? null : { notUnique: true };
        }),
        catchError(() => of(null))
      );
    };
  }
  
}
