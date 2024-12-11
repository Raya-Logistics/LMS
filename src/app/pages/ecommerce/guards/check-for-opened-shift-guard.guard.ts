import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, of } from 'rxjs';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';

export const checkForOpenedShiftGuardGuard: CanActivateFn = (route, state) => {
  let _httpClient = inject(HttpClient)
  let _toaster = inject(ToastrService)
  let _apiService = inject(ApihandlerService)
  let _Router = inject(Router)
  // _httpClient.get(`${GlobalComponent.BASE_API}/Shift/GetOpentShiftForWarehouseUser`, _apiService.getTokenHeader()).subscribe({
  //   next: (response:any) => {
  //     if(response.success) {
  //       console.log(response.returnObject);
  //       return true;
  //     }else {
  //       _Router.navigate(['/']);
  //       return false;
  //     }
  //   },
  //   error:(err) => {
  //     _Router.navigate(['/']);
  //     return false;
  //   }
  // });
  return _httpClient.get(`${GlobalComponent.BASE_API}/Shift/GetOpentShiftForWarehouseUser`, _apiService.getTokenHeader()).pipe(
    map((response: any) => {
      if (response.success) {
        localStorage.setItem("userShiftsDetails", JSON.stringify(response.returnObject));
        return true;
      } else {
        _toaster.error(response.arabicMessage);
        _Router.navigate(['/']);
        return false;
      }
    }),
    catchError((err) => {
      _toaster.error(err.message);
      _Router.navigate(['/']);
      return of(false);
    })
  );
};
