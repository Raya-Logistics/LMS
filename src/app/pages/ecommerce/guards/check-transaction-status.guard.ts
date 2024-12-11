import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from "src/app/services/apihandler.service";
import Swal from 'sweetalert2';

export const checkTransactionStatusGuard: CanActivateFn = (route, state) => {
  const _apihandler = inject(ApihandlerService);
  const transactionNumber = route.params['transactionNumber'];

  // Perform the API check for transaction status
  return _apihandler
    .GetItem(`${GlobalComponent.BASE_API}/StockHeader/GetStockHeaderDetails/${transactionNumber}`)
    .pipe(
      map((response: any) => {
        if (response.success && (response.returnObject.statusId === 2 || response.returnObject.statusId === 7)) {
          return true;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'خطأ...',
            text: "Can't Make Any Action Because This Transaction Is Not In Progress Or Revoked, لا تستطيع عمل اي اضافه تاكد من حاله العمليه",
            confirmButtonText: 'close',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
          });
          return false;
        }
      }),
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'خطأ...',
          text: 'An error occurred while checking the transaction status.',
          confirmButtonText: 'close',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
        });
        return of(false); // Block navigation on error
      })
    );
};
