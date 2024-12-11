import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import CustomStore from 'devextreme/data/custom_store';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ChangeDetectorRef } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';

@Component({
  selector: 'app-transaction-summery',
  templateUrl: './transaction-summery.component.html',
  styleUrls: ['./transaction-summery.component.scss']
})
export class TransactionSummeryComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [
    { text: "Display Mode 'full'", value: 'full' },
    { text: "Display Mode 'compact'", value: 'compact' }
  ];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  companyLookUp: any;
  warehouseLookUp: any;
  customerLookUp: any;
  itemStatusLookup: any;
  typeLookUp: any;
  SelectedTypeValue: number = 0;
  companySelectedValue: number = 0;
  transActionId: number = 0;
  requests: string[] = [];
  isDisaled: boolean = true;
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  internalPermission: (string[] | null) = [];
  transactionSummeryForm!: FormGroup;
  isLoading: boolean = false;
  dataSource!: any[];
  LastDataForm:any;
  constructor(
    private _apihandler: ApihandlerService,
    private _filehandler: FilehandlerService,
    private toaster: ToastrService,
    private httpClient:HttpClient,
    private authentication: AuthenticationService,
    private fb: FormBuilder // Inject FormBuilder
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Home' },
      { label: 'Transaction Summery', active: true }
    ];
    
    this.transactionSummeryForm = this.fb.group({
      companyId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      DateFrom: [null, Validators.required],
      DateTo: [null, Validators.required],
    });

    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/getAllCompaniesForUser?assignedCompany=true`).subscribe({
      next: response => {
        if (response.success) {
          this.companyLookUp = response.returnObject;
        }
      }
    });

    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesForUser?assignedWarehouse=true`).subscribe({
      next: response => {
        if (response.success) {
          this.warehouseLookUp = response.returnObject;
        }
      }
    });
  }

  // GetTransactions(form: FormGroup) {
  //   if (form.valid) {
  //     console.log(form.value);
  //     console.log
  //     this._apihandler.AddItem(`${GlobalComponent.BASE_API}/OperationManager/GetAllTransactions`, form.value).subscribe({
  //       next:(response) => {
  //         console.log(response.returnObject, "hello");
  //         this.dataSource = response.returnObject;
  //       }
  //     })
  //   }
  // }
  GetTransactions(form: FormGroup) {
    if (form.valid) {
      this.isLoading = true;
      this.LastDataForm = form.value;
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Report/GetAllTransactionSummery?companyId=${this.LastDataForm.companyId}&warehouseId=${this.LastDataForm.warehouseId}&fromDate=${this.LastDataForm.DateFrom}&toDate=${this.LastDataForm.DateTo}`).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dataSource = response.returnObject;
        },
        error: (error) => {
          console.error("API call error:", error);
        }
      });
    }
  }

}
