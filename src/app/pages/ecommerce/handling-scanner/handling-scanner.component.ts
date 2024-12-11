import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-handling-scanner',
  templateUrl: './handling-scanner.component.html',
  styleUrls: ['./handling-scanner.component.scss']
})
export class HandlingScannerComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  requests: string[] = [];
  isLoading:boolean = false;
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission: (string[] | null) = [];
  scanWhQueueBarcode!:string;

  constructor(private _apihandler : ApihandlerService,
    private toastService: ToastrService,
    private _router:Router,
    private authentication:AuthenticationService) {
    
  }
  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Home' },
      { label: 'Handling Scanner', active: true }
  ];
  this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.UnitOfMeasure)
  }

  scanWhQueueBarcodeOperation() {
    if(this.scanWhQueueBarcode) {
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_BY_BARCODE}/${this.scanWhQueueBarcode.split("-")[2]}`).subscribe({
          next:(response) => {
            if(response.success) {
              console.log(response)
              if(response.returnObject.whqueueTransactionTypeId == 1) {
                this._router.navigate(['/handlingin'], { queryParams: { qrCode: this.scanWhQueueBarcode } });
              }else {
                this._router.navigate(['/handlingout'], { queryParams: { qrCode: this.scanWhQueueBarcode } })
              }
              // console.log('Before patchValue:', this.headerTransactionForm.value);
              // // Check if the form control exists and is not disabled
              // const companyIdControl = this.headerTransactionForm.get('companyId');
              // console.log('companyId control:', companyIdControl);
              // console.log('whqueueCompanyId:', response.returnObject.whqueueCompanyId);
              // this.headerTransactionForm.patchValue({
              //   companyId: +response.returnObject.whqueueCompanyId,
              //   warehouseId: response.returnObject.whqueueWarehouseId,
              //   truckType: response.returnObject.whqueueTruckTypeId
              // });
              // console.log('after patchValue:', this.headerTransactionForm.value);

              // this.whQueueIsScaned = true;
            }else {
              this.toastService.error(response.message)
            }
          }
        })
    }
  }
}
