import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent {
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
  StockForm!: FormGroup;
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
      { label: 'Stock', active: true }
    ];
    
    this.StockForm = this.fb.group({
      companyId: [null, Validators.required],
      warehouseId: [null, Validators.required]
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

  GetStock(form: FormGroup) {
    if (form.valid) {
      this.isLoading = true;
      this.LastDataForm = form.value;
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Report/GetAllStockDetails?companyId=${this.LastDataForm.companyId}&warehouseId=${this.LastDataForm.warehouseId}`).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dataSource = response.returnObject;
          console.log(response.returnObject);
        },
        error: (error) => {
          console.error("API call error:", error);
        }
      });
    }
  }
}
