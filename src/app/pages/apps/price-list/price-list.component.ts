import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GlobalComponent } from 'src/app/global-component';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL_GetAll = 'get-all-pallettype';
const BaseCompanyURL_LookUp = 'get-all-company_lookups';
const BaseStorageTypeURL_LookUp = 'get-all-storageType_lookups';
const BasePalletCategoryURL_LookUp = 'get-all-palletCategory_lookups';
const BaseWarehouseURL_LookUp = 'get-all-Warehouse_lookups';
const BaseURL_GetById = 'get-pallettype-by-id';
const BaseURL_Post = 'Create-pallettype';
const BaseURL_Update = 'edit-pallettype';
const BaseURL_Delete = 'deleted-pallettype';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data'
  })
};
@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.scss']
})
export class PriceListComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  companyData!: CustomStore;
  palletCategoryData!: CustomStore;
  companyLookUp:any;
  storageTypeLookUp:any;
  palletCategoryLookUp:any;
  warehouseLookUp:any;
  palletCategory99SelectedValue:any;
  storageTypeSelectedValue:any;
  palletCategory1SelectedValue:any;
  palletCategory2SelectedValue:any;
  palletCategory3SelectedValue:any;
  selectStorageTypeValue:any;
  isFixedValue:any;
  requests: string[] = [];
  isDisaled:boolean = true;
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  priceListForm!:FormGroup;
  isLoading:boolean = false;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;

  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService) {
    
  }
  ngOnInit(): void {
    this.priceListForm = new FormGroup({
      code: new FormControl(null, Validators.required),
      companyId: new FormControl(null, Validators.required),
      contractLink: new FormControl(null, Validators.required),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      storagePrice: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      rentPalletRate: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      buildPalletRate: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      width: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      height: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      depth: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      descriptions: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      categoryIdHandlingIn : new FormControl(null, Validators.required),
      storageType : new FormControl(null, Validators.required),
      handlingInPrice : new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      categoryIdHandlingOut : new FormControl(null, Validators.required),
      handlingOutPrice : new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      categoryIdAllocation : new FormControl(null, Validators.required),
      allocationRate : new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      partialMonthStorage30 : new FormControl(false),
      partialMonthStorage15 : new FormControl(false),
      fixedAmount : new FormControl(null),
      monthlyFixedCost: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      monthlyFixedAdditionalCost: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      monthlyFixedAreaM: new FormControl({ value: null, disabled: this.isDisaled }, Validators.required),
      adminFees: new FormControl(0, Validators.min(0)),
      gatePassfees: new FormControl(0, Validators.min(0)),
      freeStorageDays: new FormControl(0, Validators.min(0)),
      warehouseId: new FormControl(null)
    });
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PalletType`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete);
    this.companyData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, BaseCompanyURL_LookUp,"","","","");
    this.palletCategoryData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PalletCategory`, BasePalletCategoryURL_LookUp,"","","","");
    
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/${BaseCompanyURL_LookUp}`).subscribe({
      next:(response)=>{
        if(response.success){
          this.companyLookUp = response.returnObject
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StorageType/${BaseStorageTypeURL_LookUp}`).subscribe({
      next:(response)=>{
        if(response.success){
          this.storageTypeLookUp = response.returnObject
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PalletCategory/get-all-palletTypeLookup`).subscribe({
      next:(response)=>{
        if(response.success){
          this.palletCategoryLookUp = response.returnObject
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/${BaseWarehouseURL_LookUp}`).subscribe({
      next:(response)=>{
        if(response.success){
          this.warehouseLookUp = response.returnObject
        }
      }
    })
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Price List', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.PriceList)
    this.authentication.getInternalPermissionss(this.pagesname.PriceList).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },
      error:(error) => {
        this.toaster.error('Failed to retrieve permissions');
        console.error('Error retrieving permissions:', error);
      }
    })
  }
  // onFileSelected(event: any) {
  //   const files = event.value;
  //   for (const file of files) {
  //     this._filehandler.getjsonDataFromFile(file)
  //       .then(jsonData => {
  //         console.log('JSON data:', jsonData);
  //         this._apihandler.AddItem(`${BaseURL}/${BaseURL_PostAll}`, jsonData).subscribe({
  //           next:(response)=>{
  //             if(response.success)
  //               this.toaster.success(response.message);
  //             else
  //             this.toaster.error(response.message)
  //           },
  //           error:(e) =>{
  //             this.toaster.error(e);
  //           }
  //         })
  //       })
  //       .catch(error => {
  //         console.error('Error processing file:', error);
  //       });
  //   }
  // }
  exportGrid(e:any) {
    this._filehandler.exportGrid(e, "Price List");
   }
   addPriceList(_formGroup: FormGroup) {
    const formData = new FormData();
    const fileInput = document.getElementById('contractLink') as HTMLInputElement;
    Object.keys(_formGroup.value).forEach(key => {
      const value = _formGroup.value[key];
      if (value === null || value === undefined) {
          formData.append(key, "");
      } else {
          formData.append(key, value);
      }
    });

    // Append the file if it exists
    if (fileInput.files && fileInput.files[0]) {
        formData.append('contractLink2', fileInput.files[0]);
    }
    console.log(formData.get("contractLink")); // To check the FormData values
    console.log(formData.get("contractLink2")); // To check the FormData values
    console.log(formData.get("warehouseId"))
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/PalletType/${BaseURL_Post}`, formData).subscribe({
        next: (response) => {
            if(response.success) {
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PalletType`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
              BaseURL_Update,BaseURL_Delete);
            }
        },
        error: (error) => {
            console.error(error);
        }
    });
}
  // addPriceList(_formGroup:FormGroup) {
  //   const formData = new FormData();
  //   formData.append('code', this.priceListForm.get('code')?.value);
  //   formData.append('companyId', this.priceListForm.get('companyId')?.value);
  //   formData.append('startDate', this.priceListForm.get('startDate')?.value);
  //   formData.append('contractLink', this.priceListForm.get('contractLink')?.value);
  //   formData.append('endDate', this.priceListForm.get('endDate')?.value);
  //   formData.append('rentPalletRate', this.priceListForm.get('rentPalletRate')?.value);
  //   formData.append('buildPalletRate', this.priceListForm.get('buildPalletRate')?.value);
  //   formData.append('width', this.priceListForm.get('width')?.value);
  //   formData.append('height', this.priceListForm.get('height')?.value);
  //   formData.append('depth', this.priceListForm.get('depth')?.value);
  //   formData.append('descriptions', this.priceListForm.get('descriptions')?.value);
  //   formData.append('categoryIdHandlingIn', this.priceListForm.get('categoryIdHandlingIn')?.value);
  //   formData.append('storageType', this.priceListForm.get('storageType')?.value);
  //   formData.append('handlingInPrice', this.priceListForm.get('handlingInPrice')?.value);
  //   formData.append('categoryIdHandlingOut', this.priceListForm.get('categoryIdHandlingOut')?.value);
  //   formData.append('handlingOutPrice', this.priceListForm.get('handlingOutPrice')?.value);
  //   formData.append('categoryIdAllocation', this.priceListForm.get('categoryIdAllocation')?.value);
  //   formData.append('allocationRate', this.priceListForm.get('allocationRate')?.value);
  //   formData.append('partialMonthStorage30', this.priceListForm.get('partialMonthStorage30')?.value);
  //   formData.append('partialMonthStorage15', this.priceListForm.get('partialMonthStorage15')?.value);
  //   formData.append('fixedAmount', this.priceListForm.get('fixedAmount')?.value);
  //   formData.append('monthlyFixedCost', this.priceListForm.get('monthlyFixedCost')?.value);
  //   formData.append('monthlyFixedAdditionalCost', this.priceListForm.get('monthlyFixedAdditionalCost')?.value);
  //   formData.append('monthlyFixedAreaM', this.priceListForm.get('monthlyFixedAreaM')?.value);
  //   const fileInput = document.getElementById('contractLink') as HTMLInputElement;
  //   if (fileInput.files && fileInput.files[0]) {
  //     formData.append('contractLink2', fileInput.files[0]);
  //   }
  //   this._apihandler.AddItemWithOption(`${GlobalComponent.BASE_API}/PalletType/${BaseURL_Post}`, formData, httpOptions).subscribe({
  //     next:(response)=>{
  //       console.log(response)
  //     }
  //   })
  // }

  storageTypeSelectChanged() {
    console.log(this.storageTypeSelectedValue)
  }
  palletCategory1SelectChanged() {
    if(this.palletCategory1SelectedValue == null) {
      this.priceListForm.get('handlingInPrice')?.disable();
      this.priceListForm.get('handlingInPrice')?.setValue(null);
    }else {
      this.priceListForm.get('handlingInPrice')?.enable();
    }
  }
  palletCategory2SelectChanged() {
    if(this.palletCategory2SelectedValue == null) {
      this.priceListForm.get('handlingOutPrice')?.disable();
      this.priceListForm.get('handlingOutPrice')?.setValue(null);
    }else {
      this.priceListForm.get('handlingOutPrice')?.enable();
    }
  }
  isFixedCheck() {
  if(this.isFixedValue) {
    this.priceListForm.get('monthlyFixedAreaM')?.enable();
    this.priceListForm.get('monthlyFixedCost')?.enable();
    this.priceListForm.get('monthlyFixedAdditionalCost')?.enable();
  }else {
    this.priceListForm.get('monthlyFixedAreaM')?.disable();
    this.priceListForm.get('monthlyFixedCost')?.disable();
    this.priceListForm.get('monthlyFixedAdditionalCost')?.disable();
    this.priceListForm.get('monthlyFixedAreaM')?.setValue(null);
    this.priceListForm.get('monthlyFixedCost')?.setValue(null);
    this.priceListForm.get('monthlyFixedAreaM')?.setValue(null);
  }
  }
  palletCategory3SelectChanged() {
    if(this.palletCategory3SelectedValue == null) {
      this.priceListForm.get('allocationRate')?.disable();
      this.priceListForm.get('allocationRate')?.setValue(null);
    }else {
      this.priceListForm.get('allocationRate')?.enable();
    }
  }
  selectStorageTypeChanged() {
    if(this.selectStorageTypeValue == null) {
      this.priceListForm.get('storagePrice')?.disable();
      this.priceListForm.get('rentPalletRate')?.disable();
      this.priceListForm.get('buildPalletRate')?.disable();
      this.priceListForm.get('depth')?.disable();
      this.priceListForm.get('descriptions')?.disable();
      this.priceListForm.get('height')?.disable();
      this.priceListForm.get('width')?.disable();
      this.priceListForm.get('storagePrice')?.setValue(null);
      this.priceListForm.get('rentPalletRate')?.setValue(null);
      this.priceListForm.get('buildPalletRate')?.setValue(null);
      this.priceListForm.get('depth')?.setValue(null);
      this.priceListForm.get('descriptions')?.setValue(null);
      this.priceListForm.get('height')?.setValue(null);
      this.priceListForm.get('width')?.setValue(null);
    }else {
      this.priceListForm.get('storagePrice')?.enable();
      this.priceListForm.get('rentPalletRate')?.enable();
      this.priceListForm.get('buildPalletRate')?.enable();
      this.priceListForm.get('depth')?.enable();
      this.priceListForm.get('descriptions')?.enable();
      this.priceListForm.get('height')?.enable();
      this.priceListForm.get('width')?.enable();
    }
  }
  get code() {
    return this.priceListForm.get('code');
  }
  get companyId() {
    return this.priceListForm.get('companyId');
  }
  get contractLink() {
    return this.priceListForm.get('contractLink');
  }
  get startDate() {
    return this.priceListForm.get('startDate');
  }
  get endDate() {
    return this.priceListForm.get('endDate');
  }
  get storagePrice() {
    return this.priceListForm.get('storagePrice');
  }
  get rentPalletRate() {
    return this.priceListForm.get('rentPalletRate');
  }
  get buildPalletRate() {
    return this.priceListForm.get('buildPalletRate');
  }
  get width() {
    return this.priceListForm.get('width');
  }
  get height() {
    return this.priceListForm.get('height');
  }
  get depth() {
    return this.priceListForm.get('depth');
  }
  get descriptions() {
    return this.priceListForm.get('descriptions');
  }
  get categoryIdHandlingIn() {
    return this.priceListForm.get('categoryIdHandlingIn');
  }
  get handlingInPrice() {
    return this.priceListForm.get('handlingInPrice');
  }
  get categoryIdHandlingOut() {
    return this.priceListForm.get('categoryIdHandlingOut');
  }
  get handlingOutPrice() {
    return this.priceListForm.get('handlingOutPrice');
  }
  get categoryIdAllocation() {
    return this.priceListForm.get('categoryIdAllocation');
  }
  get allocationRate() {
    return this.priceListForm.get('allocationRate');
  }
  get partialMonthStorage15() {
    return this.priceListForm.get('partialMonthStorage15');
  }
  get partialMonthStorage30() {
    return this.priceListForm.get('partialMonthStorage30');
  }
  get fixedAmount() {
    return this.priceListForm.get('fixedAmount');
  }
  get monthlyFixedCost() {
    return this.priceListForm.get('monthlyFixedCost');
  }
  get monthlyFixedAdditionalCost() {
    return this.priceListForm.get('monthlyFixedAdditionalCost');
  }
  get monthlyFixedAreaM() {
    return this.priceListForm.get('monthlyFixedAreaM');
  }
  get name() {
    return this.priceListForm.get('name');
  }
  get basicUomId() {
    return this.priceListForm.get('basicUomId');
  }
  get conversionValue() {
    return this.priceListForm.get('conversionValue');
  }
  get adminFees() {
    return this.priceListForm.get('adminFees');
  }
  get gatePassfees() {
    return this.priceListForm.get('gatePassfees');
  }
  get freeStorageDays() {
    return this.priceListForm.get('freeStorageDays');
  }
}
