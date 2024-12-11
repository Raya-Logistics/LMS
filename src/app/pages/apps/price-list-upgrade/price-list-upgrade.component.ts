import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pruce-list-upgrade',
  templateUrl: './price-list-upgrade.component.html',
  styleUrls: ['./price-list-upgrade.component.scss']
})
export class PriceListUpgradeComponent{
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  requests: string[] = [];
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;
  priceListForm!: FormGroup;
  companyLookup:any;
  warehouseLookup:any;
  priceListServiceLookup:any;
  priceListTypeLookup:any;
  priceListDetailsTypeLookup:any;
  palletCategoryLookup:any;
  TruckTypeLookup:any;
  currencyLookup:any;
  isImplemented:any;
  isHandling:any;
  isStorage:any;
  isTruck:any = false;
  detailsTypeValue:any;
  selectedPriceListService:any;
  dataSource!:CustomStore;
  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService,private fb: FormBuilder,
    private spinner: NgxSpinnerService,private cdRef: ChangeDetectorRef) {
    
  }
  ngOnInit(): void {
    this.initializeForm2();
    this.initialLookupsData();
    // this.addDetail();
    // this.cdRef.detectChanges();
    // this.cdRef.markForCheck();
    this.dataSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/PriceList`,
      'GetAllPriceList','','','',''
    );
    this.authentication.getInternalPermissionss(this.pagesname.PriceListUpgrade).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },});
      this.breadCrumbItems = [
        { label: "Home" },
        { label: "Price List", active: true },
      ];
  }

  initializeForm2(): void {
    this.priceListForm = this.fb.group({
      companyId: ['', Validators.required],
        warehouseId: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        evidence: ['', Validators.required],
        priceListTypeId: ['', Validators.required],
      details: this.fb.array([]),
    });
    this.addDetail();
  }
  addDetail(): void {
    const detailsFormGroup = this.fb.group({
      minimumPalletRate: [''],
      minimumPallets: [''],
      fixedStorageAmount: [''],
      fixedAreaCm: [''],
      partialMonth15: [false],
      partialMonth30: [false],
      isMonthly: [false],
      isOnTime: [false],
      truckTypeId: [''],
      rate: ['', Validators.required],
      priceListDetailsTypeId: [''],
      freeStorageDays: [''],
      palletCategoryId: [''],
      priceListServiceId: ['', Validators.required],
      currencyId: ['', Validators.required],
      isImplemented: [false],
      isHandling: [false],
      isStorage: [false],   
      isFixedStorage: [false],   
      isTruck: [false],   
      isPallet: [false],   
      priceListDetailsTypeLookup: [false],   
    });
    this.details.push(detailsFormGroup);
    this.cdRef.detectChanges();
    this.cdRef.markForCheck();
  }
  removeDetail(index: number): void {
    this.details.removeAt(index);
  }
  get details(): FormArray {
    return (this.priceListForm.get('details') as FormArray);
  }
  initialLookupsData(): void {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/company/get-all-company_lookups`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.companyLookup = response.returnObject;
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/warehouse/get-all-Warehouse_lookups`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.warehouseLookup = response.returnObject;
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PriceListService/GetAllPriceListServiceLookup`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.priceListServiceLookup = response.returnObject;
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PriceListType/GetAllPriceListTypeLookup?isActiveOnly=true`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.priceListTypeLookup = response.returnObject;
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PalletCategory/GetPalletCategoryLookup?IsActiveOnly=true`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.palletCategoryLookup = response.returnObject;
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Currency/GetAllCurrencyLookup`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.currencyLookup = response.returnObject;
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRUCK_TYPE.NAME}/GetAllTruckTypeLookupWithContainer`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.TruckTypeLookup = response.returnObject
        }
      },
    })
  }
  onOpenFiles = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    const evidence = e.row?.data.evidence;
  
    if (evidence) {
      // Split the string into an array of file paths
      const files = evidence.split(',');
  
      // Open a new tab for each file
      files.forEach((file: string) => {
        console.log(file, " file");
        const fileUrl = file.trim().replace('d:\\WebApplications\\WmsUpload\\Price\\', 'https://rayalogistics.com.eg/WmsUpload/Price/');
        console.log(fileUrl, " fileUrl");
  
        // Open the file URL in a new tab
        window.open(fileUrl.toLowerCase(), '_blank');
      });
    } else {
      console.log("No evidence found");
    }
  };
  onCopyHeader = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    const headerData = e.row?.data;
  console.log(headerData, " headerData")
  this.priceListForm.get('companyId')?.setValue(headerData.companyId);
  this.priceListForm.get('warehouseId')?.setValue(headerData.warehouseId);
  this.priceListForm.get('startDate')?.setValue(headerData.startDate.split("T")[0]);
  this.priceListForm.get('endDate')?.setValue(headerData.endDate.split("T")[0]);
  this.priceListForm.get('priceListTypeId')?.setValue(headerData.priceListTypeId);
  };
  detailsTypeChanged(index:number) {
    this.details.at(index).get('truckTypeId')?.setValue(null);

    if(this.details.at(index).get('priceListDetailsTypeId')?.value == 6) {
      this.details.at(index).get('isPallet')?.setValue(false);
      this.details.at(index).get('isTruck')?.setValue(true);
      this.details.at(index).get('truckTypeId')?.setValidators([Validators.required]);
    }else if(this.details.at(index).get('priceListDetailsTypeId')?.value == 2) {
      this.details.at(index).get('isPallet')?.setValue(true);
      this.details.at(index).get('isTruck')?.setValue(false);
      this.details.at(index).get('truckTypeId')?.removeValidators([Validators.required]);
    }
    else {
      this.details.at(index).get('isPallet')?.setValue(false);
      this.details.at(index).get('isTruck')?.setValue(false);
      this.details.at(index).get('truckTypeId')?.removeValidators([Validators.required]);
    }
    this.details.at(index).get('truckTypeId')?.updateValueAndValidity();
    this.details.at(index).get('isPallet')?.updateValueAndValidity();

  }
  onPriceListServiceChange(index: number) {
    const selectedServiceId = this.details.at(index).get('priceListServiceId')?.value;
    this.selectedPriceListService = this.priceListServiceLookup.find(
      (service: any) => service.id == selectedServiceId
    );
    if (this.selectedPriceListService) {
      if (this.selectedPriceListService.isImplemented) {
        this.details.at(index).get('isImplemented')?.setValue(true);
        this.details.at(index).get('isHandling')?.setValue(this.selectedPriceListService.isHandling);
        this.details.at(index).get('isStorage')?.setValue(this.selectedPriceListService.isStorage);
        this.details.at(index).get('isFixedStorage')?.setValue(this.selectedPriceListService.isFixedStorage);
        this.details.at(index).get('priceListDetailsTypeId')?.setValidators([Validators.required]);
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PriceListDetailsType/GetAllPriceListDetailsTypeLookup?isHandling=${this.selectedPriceListService.isHandling}&isStorage=${this.selectedPriceListService.isStorage}&isFixedStorage=${this.selectedPriceListService.isFixedStorage}`).subscribe({
          next: (response) => {
            if (response.success) {
              this.priceListDetailsTypeLookup = response.returnObject;
              this.details.at(index).get('priceListDetailsTypeLookup')?.setValue(response.returnObject);
            }
          }
        });
  
        if (this.selectedPriceListService.isHandling) {
          this.details.at(index).get('palletCategoryId')?.setValue(null);
          this.details.at(index).get('freeStorageDays')?.setValue(null);
          this.details.at(index).get('fixedAreaCm')?.setValue(null);
          this.details.at(index).get('fixedStorageAmount')?.setValue(null);
          this.details.at(index).get('palletCategoryId')?.removeValidators([Validators.required]);
          this.details.at(index).get('freeStorageDays')?.removeValidators([Validators.required]);
          this.details.at(index).get('fixedAreaCm')?.removeValidators([Validators.required]);
          this.details.at(index).get('fixedStorageAmount')?.removeValidators([Validators.required]);
          this.details.at(index).get('partialMonth15')?.setValue(false);
          this.details.at(index).get('partialMonth30')?.setValue(false);

        } else if(this.selectedPriceListService.isStorage){
          this.details.at(index).get('palletCategoryId')?.setValidators([Validators.required]);
          this.details.at(index).get('isOnTime')?.setValue(false);
          this.details.at(index).get('isMonthly')?.setValue(false);
        }else {
          this.details.at(index).get('freeStorageDays')?.setValue(null);
          this.details.at(index).get('fixedAreaCm')?.setValue(null);
          this.details.at(index).get('fixedStorageAmount')?.setValue(null);
          this.details.at(index).get('palletCategoryId')?.setValue(null);
          this.details.at(index).get('palletCategoryId')?.removeValidators([Validators.required]);
          this.details.at(index).get('freeStorageDays')?.setValidators([Validators.required]);
          this.details.at(index).get('fixedAreaCm')?.setValidators([Validators.required]);
          this.details.at(index).get('fixedStorageAmount')?.setValidators([Validators.required]);
        }
      } else {
        this.details.at(index).get('isImplemented')?.setValue(false);
        this.details.at(index).get('isHandling')?.setValue(false);
        this.details.at(index).get('isStorage')?.setValue(false);
        this.details.at(index).get('isFixedStorage')?.setValue(false);
        this.details.at(index).get('palletCategoryId')?.setValue(null);
        this.details.at(index).get('palletCategoryId')?.removeValidators([Validators.required]);
        this.details.at(index).get('priceListDetailsTypeId')?.setValue(null);
        this.details.at(index).get('priceListDetailsTypeId')?.removeValidators([Validators.required]);
        this.details.at(index).get('freeStorageDays')?.setValue(null);
        this.details.at(index).get('fixedAreaCm')?.setValue(null);
        this.details.at(index).get('fixedStorageAmount')?.setValue(null);
        this.details.at(index).get('freeStorageDays')?.removeValidators([Validators.required]);
        this.details.at(index).get('fixedAreaCm')?.removeValidators([Validators.required]);
        this.details.at(index).get('fixedStorageAmount')?.removeValidators([Validators.required]);
        this.details.at(index).get('partialMonth15')?.setValue(false);
        this.details.at(index).get('partialMonth30')?.setValue(false);
        this.details.at(index).get('isOnTime')?.setValue(false);
        this.details.at(index).get('isMonthly')?.setValue(false);
      }
    }
  
    this.details.at(index).get('palletCategoryId')?.updateValueAndValidity();
    this.details.at(index).get('freeStorageDays')?.updateValueAndValidity();
    this.details.at(index).get('fixedAreaCm')?.updateValueAndValidity();
    this.details.at(index).get('fixedStorageAmount')?.updateValueAndValidity();
    this.details.at(index).get('priceListDetailsTypeId')?.updateValueAndValidity();
    this.details.at(index).get('isOnTime')?.updateValueAndValidity();
    this.details.at(index).get('isMonthly')?.updateValueAndValidity();
    this.details.at(index).get('partialMonth15')?.updateValueAndValidity();
    this.details.at(index).get('partialMonth30')?.updateValueAndValidity();
    
    this.cdRef.detectChanges();
  }
  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.priceListForm.patchValue({ evidence: files });
    }
  }
  onSubmit(form:FormGroup) {
    console.log(form, " FormBuilder")
    const formData = new FormData();

    // Append each field in the form
    formData.append('header.companyId', form.get('companyId')?.value);
    formData.append('header.warehouseId', form.get('warehouseId')?.value);
    formData.append('header.startDate', form.get('startDate')?.value);
    formData.append('header.endDate', form.get('endDate')?.value);
    formData.append('header.priceListTypeId', form.get('priceListTypeId')?.value);
    const detailsData = form.value.details;
    console.log(detailsData, " detailsData")
    detailsData.forEach((detail: any, index: number) => {
      formData.append(`details[${index}].currencyId`, detail.currencyId);
      formData.append(`details[${index}].priceListServiceId`, detail.priceListServiceId);
      formData.append(`details[${index}].rate`, detail.rate || '');
      formData.append(`details[${index}].palletCategoryId`, detail.palletCategoryId || '');
      formData.append(`details[${index}].isOnTime`, detail.isOnTime ? 'true' : 'false');
      formData.append(`details[${index}].isMonthly`, detail.isMonthly ? 'true' : 'false');
      formData.append(`details[${index}].partialMonth15`, detail.partialMonth15 ? 'true' : 'false');
      formData.append(`details[${index}].partialMonth30`, detail.partialMonth30 ? 'true' : 'false');
      formData.append(`details[${index}].priceListDetailsTypeId`, detail.priceListDetailsTypeId || '');
      formData.append(`details[${index}].truckTypeId`, detail.truckTypeId || '');
      formData.append(`details[${index}].freeStorageDays`, detail.freeStorageDays || '');
      formData.append(`details[${index}].fixedStorageAmount`, detail.fixedStorageAmount || '');
      formData.append(`details[${index}].fixedAreaCm`, detail.fixedAreaCm || '');
      formData.append(`details[${index}].minimumPalletRate`, detail.minimumPalletRate || '');
      formData.append(`details[${index}].minimumPallets`, detail.minimumPallets || '');
      
      // For other properties, follow the same pattern
    });
    // Append multiple files from the evidence field
    const evidenceFiles: FileList = form.get('evidence')?.value;
    console.log(evidenceFiles, " evidenceFiles")
    if (evidenceFiles) {
      for (let i = 0; i < evidenceFiles.length; i++) {
        formData.append('header.evidence', evidenceFiles[i]);
      }
    }
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/PriceList/CreatePriceList`,formData).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success', // You can change this to 'success', 'warning', etc.
            title: 'نجاح',
            text: response.mesage,
            // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
            confirmButtonText: 'close',
            confirmButtonColor: '#3085d6'
          });
          this.dataSource = this._apihandler.getStore(
            `${GlobalComponent.BASE_API}/PriceList`,
            'GetAllPriceList','','','',''
          );
        }else {
          Swal.fire({
            icon: 'error', // You can change this to 'success', 'warning', etc.
            title: 'خطأ',
            text: response.mesage,
            // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
            confirmButtonText: 'close',
            confirmButtonColor: '#3085d6'
          });
          this.dataSource = this._apihandler.getStore(
            `${GlobalComponent.BASE_API}/PriceList`,
            'GetAllPriceList','','','',''
          );
        }
      }
    });
  }
  exportGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.PriceListUpgrade);
   }
}
