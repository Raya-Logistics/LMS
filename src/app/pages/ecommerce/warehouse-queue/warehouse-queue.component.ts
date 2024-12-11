import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { LookupVM } from 'src/app/models/LookupVM';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import { UniqueValidator } from './UniqueValidator';
import { TruckTypeLookupVM } from 'src/app/models/TruckTypeLookupVM';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-warehouse-queue',
  templateUrl: './warehouse-queue.component.html',
  styleUrls: ['./warehouse-queue.component.scss']
})
export class WarehouseQueueComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  warehouseData!: CustomStore;
  companyData!: CustomStore;
  vendorData!: CustomStore;
  transactionTypeData!: CustomStore;
  truckTypeData!: CustomStore;
  statusData!: any;
  requests: string[] = [];
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  warehouseQueueForm!: FormGroup;
  warehouseLookup!:LookupVM[];
  companyLookup!:LookupVM[];
  vendorLookup!:LookupVM[];
  transactionTypeLookup!:LookupVM[];
  truckTypeLookup!:TruckTypeLookupVM[];
  shiftsUserDetails:any;
  newVendorName: string = '';
  visible: boolean = false;
  vendorForm!: FormGroup;
  TransactionTypeIsIn:boolean = false;
  transactionTypeValue:(number | null) = null;
  permissionIsLoadded:boolean = false;

  constructor(private fb: FormBuilder, private authentication:AuthenticationService, 
    private _apihandler : ApihandlerService, private _filehandler : FilehandlerService,
    private toastService: ToastrService, private _router:Router
  ) {
  }
  ngOnInit(): void {
    this.InitialVendorForm();
    this.InitialShiftsDetails();
    this.InitialWarehouseQueueForm();
    this.LoadDropDownsData();
    this.LoadDataGridInfo();

      this.breadCrumbItems = [
          { label: 'Home' },
          { label: 'Warehouse Queue', active: true }
      ];
      // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Brand);
      this.authentication.getInternalPermissionss(this.pagesname.WarehouseQueue).subscribe({
        next:(permissions) => {
          this.internalPermission = permissions;
          this.permissionIsLoadded = true;

        },
        error:(error) => {
          this.toastService.error('Failed to retrieve permissions');
          console.error('Error retrieving permissions:', error);
        }
      })
    }
InitialVendorForm() {
  this.vendorForm = this.fb.group({
    vendors: this.fb.array([this.createVendorInput()])
  });

}
createVendorInput(): FormGroup {
  return this.fb.group({
    vendorName: ['', Validators.required]
  });
}

addVendorInput(): void {
  this.vendors.push(this.createVendorInput());
}
removeVendorInput(index: number): void {
  if (this.vendors.length > 1) {
    this.vendors.removeAt(index);
  }
}
cancel(): void {
  this.vendorForm.reset();
  this.vendors.clear();

  this.addVendorInput();

  this.visible = false;
}
saveVendors(): void {
  if (this.vendorForm.valid) {
    console.log(this.vendorForm.value)
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.VENDOR.NAME}/${GlobalComponent.Controllers.VENDOR.API_ACTIONS.CREATE_VENDORS}`,this.vendorForm.value.vendors).subscribe({
      next:(response) => {
        if(response.success) {
          this.vendorLookup = response.returnObject;
          this.visible = false;
          this.cancel();  
        }
      },
      error:(err) => {
        this.visible = false;  
      }
    })
  }
}
    showDialog() {
      console.log("Icons Clicked")
        this.visible = true;
    }
LoadDataGridInfo() {
  this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}`,
    `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_ALL}`,
    `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_BY_ID}`,
    `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.CREATE}`,
   `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.EDIT}`,
   `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.DELETE}`)
  this.warehouseData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Warehouse`, 'get-all-Warehouse_lookups',"","",
    "","")
this.companyData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, 'get-all-company_lookups',"","",
      "","")
this.vendorData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.VENDOR.NAME}`,
         GlobalComponent.Controllers.VENDOR.API_ACTIONS.GET_LOOKUP,"","",
        "","")
this.transactionTypeData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRANSACTION_TYPE.NAME}`,
          GlobalComponent.Controllers.TRANSACTION_TYPE.API_ACTIONS.GET_LOOKUP,"","",
         "","")
this.truckTypeData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRUCK_TYPE.NAME}`,
          GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_LOOKUP,"","",
         "","")
this.statusData = [{id: 1, name : "Waiting"},{id: 3, name : "Done"},{id: 4, name : "Close"}]
}
InitialWarehouseQueueForm() {
  this.warehouseQueueForm = this.fb.group({
    WhqueueWarehouseId: ['', Validators.required],
    WhqueueCompanyId: ['', Validators.required],
    WhqueueVendorId: [null],
    WhqueueTransactionTypeId: [null, Validators.required],
    numberOfTrucks: [null, [Validators.required, Validators.min(1)]],
    WhqueueTruckTypeIds: this.fb.array([]),
    WhqueueDriverNames: this.fb.array([]),
    WhqueueDriverIds: this.fb.array([],[UniqueValidator.uniqueArrayValues]),
    WhqueueDriverPhoneNumbers: this.fb.array([],[UniqueValidator.uniqueArrayValues]),
    WhqueuePalletNumbers: this.fb.array([], [UniqueValidator.uniquePalletNumbers]),
    WhqueueContainerNumbers: this.fb.array([])
  });
}

InitialShiftsDetails() {
  const userShiftsDetails = localStorage.getItem("userShiftsDetails");
  if(userShiftsDetails != null) {
    this.shiftsUserDetails = JSON.parse(userShiftsDetails);
  }
}
  LoadDropDownsData(): Promise<void> {
    return new Promise((resolve, reject) => {
      let completedCalls = 0;
      const totalCalls = 5;
  
      const checkCompletion = () => {
        completedCalls++;
        if (completedCalls === totalCalls) {
          resolve(); 
        }
      };
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesForUser?assignedWarehouse=true`).subscribe({
        next:(response)=>{
          if(response.success) {
            this.warehouseLookup = response.returnObject
            if (this.warehouseLookup.length > 0) {
              const selectedWarehouse = this.shiftsUserDetails[0];

              this.warehouseQueueForm.get('WhqueueWarehouseId')?.setValue(selectedWarehouse.warehouseId);
            }
          }
          checkCompletion();
        },
        error: reject
      })
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/getAllCompaniesForUser?assignedCompany=true`).subscribe({
        next:(response)=>{
          if(response.success) {
            this.companyLookup = response.returnObject;
            if (this.companyLookup.length > 0) {
              const selectedWarehouse = this.shiftsUserDetails[0];

              this.warehouseQueueForm.get('WhqueueCompanyId')?.setValue(selectedWarehouse.companyId);
            }
          }
          checkCompletion();
        },
        error: reject
      })
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.VENDOR.NAME}/${GlobalComponent.Controllers.VENDOR.API_ACTIONS.GET_LOOKUP}`).subscribe({
        next:(response)=>{
          if(response.success) {
            this.vendorLookup = response.returnObject
          }
          checkCompletion();
        },
        error: reject
      })
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRANSACTION_TYPE.NAME}/${GlobalComponent.Controllers.TRANSACTION_TYPE.API_ACTIONS.GET_LOOKUP}`).subscribe({
        next:(response)=>{
          if(response.success) {
            this.transactionTypeLookup = response.returnObject
          }
          checkCompletion();
        },
        error: reject
      })
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRUCK_TYPE.NAME}/GetAllTruckTypeLookupWithContainer`).subscribe({
        next:(response)=>{
          if(response.success) {
            this.truckTypeLookup = response.returnObject
            console.log(this.truckTypeLookup, " trucktype")
          }
          checkCompletion();
        },
        error: reject
      })
    });
  }
  // onTrucksNumberChange(): void {
  //   const numberOfTrucksValue = this.numberOfTrucks?.value || 0;
  
  //   // Clear existing form arrays
  //   this.WhqueueTruckTypes.clear();
  //   this.WhqueuePalletNumbers.clear();
  //   this.WhqueueContainerNumbers.clear();
  
  //   for (let i = 0; i < numberOfTrucksValue; i++) {
  //     const truckTypeControl = this.fb.control('', Validators.required);
  //     const palletNumberControl = this.fb.control('', Validators.required);
  //     const containerNumberControl = this.fb.control('');
  
  //     // Listen for value changes in truck type to conditionally show and require container number
  //     truckTypeControl.valueChanges.subscribe((value) => {
  //       if (value === '5') {  // Assuming '5' is the ID for the truck type "Container"
  //         containerNumberControl.setValidators([Validators.required]);
  //         containerNumberControl.updateValueAndValidity();
  //       } else {
  //         containerNumberControl.clearValidators();
  //         containerNumberControl.updateValueAndValidity();
  //       }
  //     });
  
  //     this.WhqueueTruckTypes.push(truckTypeControl);
  //     this.WhqueuePalletNumbers.push(palletNumberControl);
  //     this.WhqueueContainerNumbers.push(containerNumberControl);
  //   }
  // }
  onCloneIconClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    // console.log(e, " all data");
    // var code = e.row?.data.id;
    // this._router.navigate([]).then((result) => {
    //   const basePath = window.location.origin + window.location.pathname;
    //   const barcodePath = `#/qrcode/RAYA-${code}`;
    //   const fullUrl = `${basePath}${barcodePath}`;
    //   window.open(fullUrl, '_blank');
    // });
    console.log(e, " all data");

    const warehouseId = e.row?.data.whqueueWarehouseId;
    const transactionTypeId = e.row?.data.whqueueTransactionTypeId;
    const code = e.row?.data.id;
    // Load the specific warehouse from the store based on ID
    this.warehouseData.load().then((data: any) => {
        // Find the warehouse by ID
        const warehouse = data.find((w: any) => w.id === warehouseId);
        const warehouseName = warehouse ? warehouse.name.replace(/\s+/g, '') : 'Unknown Warehouse';
        const transactionType = transactionTypeId == 1 ? "IN" : "OUT";
        const path = `${warehouseName}-${transactionType}-${code}`;

        // Generate barcode based on the row data
        this._router.navigate([]).then((result) => {
            const basePath = window.location.origin + window.location.pathname;
            const barcodePath = `#/qrcode/${path}`;
            const fullUrl = `${basePath}${barcodePath}`;
            window.open(fullUrl, '_blank');
        });
    }).catch((error: any) => {
        console.error('Error loading warehouse data:', error);
    });
  };


  onWarehouseSelected() {
    const selectedWarehouseId = this.warehouseQueueForm.get('WhqueueWarehouseId')?.value;

    const selectedWarehouseIndex = this.shiftsUserDetails.findIndex((warehouse: any) => warehouse.warehouseId == selectedWarehouseId);
    const selectedWarehouse = this.shiftsUserDetails[selectedWarehouseIndex];
    
    this.warehouseQueueForm.get('WhqueueCompanyId')?.setValue(selectedWarehouse.companyId);

 }
 onTransactionTypeSelected() {
  if(this.transactionTypeValue == 1) {
    this.TransactionTypeIsIn = true;
    this.WhqueueVendorId?.setValidators(Validators.required);
    this.WhqueueVendorId?.updateValueAndValidity(); 
  }else {
    this.TransactionTypeIsIn = false;
    this.WhqueueVendorId?.setValue(null);
    this.WhqueueVendorId?.clearValidators();
    this.WhqueueVendorId?.updateValueAndValidity(); 
  }
 }
 
isTruckTypeContainer(index: number): boolean {
  const truckTypeId = (this.warehouseQueueForm.get('WhqueueTruckTypeIds') as FormArray).at(index).value;
  console.log(truckTypeId, " truckTypeId")
  const truckType = this.truckTypeLookup.find(type => type.id == truckTypeId);
  console.log(truckType, " truckType")

  const containerControl = this.WhqueueContainerNumbers.at(index);
  console.log(containerControl, " containerControl")
  if (truckType?.isContainer) {
    containerControl.setValidators([Validators.required]);
    containerControl.updateValueAndValidity();
  } else {
    containerControl.setValidators(null);
    containerControl.updateValueAndValidity();
  }
  return truckType ? truckType.isContainer : false;
}

 CreateWhQueue(): void {
  if (this.warehouseQueueForm.valid) {
    console.log(this.warehouseQueueForm.value, " Warehouse Queue Value");
    const warehouse = this.warehouseLookup.find((w: any) => w.id === this.warehouseQueueForm.value.WhqueueWarehouseId);
    const warehouseName = warehouse ? warehouse.name.replace(/\s+/g, '') : 'Unknown Warehouse';
    const transactionType = this.warehouseQueueForm.value.WhqueueTransactionTypeId == 1 ? "IN" : "OUT";
    this.warehouseQueueForm.value.WhqueueBarCode = `${warehouseName}-${transactionType}-`;
    const transformedPalletNumbers = this.warehouseQueueForm.value.WhqueuePalletNumbers.map((pallet: any) => 
      `${pallet.letter1}${pallet.letter2}${pallet.letter3}${pallet.number}`
    );
    const formData = {
      ...this.warehouseQueueForm.value,
      WhqueuePalletNumbers: transformedPalletNumbers
    };
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.CREATE}`,formData).subscribe({
      next:(response) => {
        if(response.success) {
          this.toastService.success("Warehouse Queue Added Success");
          this._router.navigate([]).then((result) => {
            const warehouse = this.warehouseLookup.find((warehouse:LookupVM) => warehouse.id == this.warehouseQueueForm.value.WhqueueWarehouseId)
            const transactionType = this.warehouseQueueForm.value.WhqueueTransactionTypeId == 1 ? "IN" : "OUT";
            const basePath = window.location.origin + window.location.pathname;
            const formattedBarcodes = response.returnObject.map((item:any) => `${warehouse?.name}-${transactionType}-${item}`);
            console.log(formattedBarcodes, " formattedBarcodes")
            const barcodePath = `#/qrcode/${formattedBarcodes.join(',')}`;
            const fullUrl = `${basePath}${barcodePath}`;
            window.open(fullUrl, '_blank');
            this.WhqueueTruckTypes.clear();
            this.WhqueuePalletNumbers.clear();
            this.WhqueueContainerNumbers.clear();
            this.WhqueueDriverNames.clear();
            this.WhqueueDriverIds.clear();
            this.WhqueueDriverPhoneNumbers.clear();
          });
        }else {
          Swal.fire({
            icon: 'error',
            title: 'خطأ...',
            text: response.message,
            confirmButtonText: 'close',
            confirmButtonColor: '#3085d6'
          });
          // this.toastService.error(response.message);
          // console.log(response.returnObject , " error")
          if(response.returnObject.length > 0) {
            this._router.navigate([]).then((result) => {
              const warehouse = this.warehouseLookup.find((warehouse:LookupVM) => warehouse.id == this.warehouseQueueForm.value.WhqueueWarehouseId)
              const transactionType = this.warehouseQueueForm.value.WhqueueTransactionTypeId == 1 ? "IN" : "OUT";
              const basePath = window.location.origin + window.location.pathname;
              const formattedBarcodes = response.returnObject.map((item:any) => `${warehouse?.name}-${transactionType}-${item}`);
              console.log(formattedBarcodes, " formattedBarcodes")
              const barcodePath = `#/qrcode/${formattedBarcodes.join(',')}`;
              const fullUrl = `${basePath}${barcodePath}`;
              window.open(fullUrl, '_blank');
              // const basePath = window.location.origin + window.location.pathname;
              // const barcodePath = `#/qrcode/${response.returnObject.join(',')}`;
              // const fullUrl = `${basePath}${barcodePath}`;
              // window.open(fullUrl, '_blank');
              this.WhqueueTruckTypes.clear();
              this.WhqueuePalletNumbers.clear();
              this.WhqueueContainerNumbers.clear();
              this.WhqueueDriverNames.clear();
              this.WhqueueDriverIds.clear();
              this.WhqueueDriverPhoneNumbers.clear();
            });
          }
        }
      },
      complete:()=> {
        this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}`,
          `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_ALL}`,
          `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_BY_ID}`,
          `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.CREATE}`,
         `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.EDIT}`,
         `${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.DELETE}`)
      }
    });
  }
}
  exportGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.Dock);
   }
   get vendors(): FormArray {
    return this.vendorForm.get('vendors') as FormArray;
  }
  get WhqueueVendorId() {
    return this.warehouseQueueForm.get('WhqueueVendorId');
  }
  get numberOfTrucks() {
    return this.warehouseQueueForm.get('numberOfTrucks');
  }
  get WhqueueTruckTypes(): FormArray {
    return this.warehouseQueueForm.get('WhqueueTruckTypeIds') as FormArray;
  }

  get WhqueuePalletNumbers(): FormArray {
    return this.warehouseQueueForm.get('WhqueuePalletNumbers') as FormArray;
  }

  get WhqueueContainerNumbers(): FormArray {
    return this.warehouseQueueForm.get('WhqueueContainerNumbers') as FormArray;
  }
  get WhqueueDriverNames(): FormArray {
    return this.warehouseQueueForm.get('WhqueueDriverNames') as FormArray;
  }

  get WhqueueDriverIds(): FormArray {
    return this.warehouseQueueForm.get('WhqueueDriverIds') as FormArray;
  }
  get WhqueueDriverPhoneNumbers(): FormArray {
    return this.warehouseQueueForm.get('WhqueueDriverPhoneNumbers') as FormArray;
  }








  // onTrucksNumberChange(): void {
  //   const numberOfTrucksValue = this.numberOfTrucks?.value || 0;
  
  //   // Clear existing form arrays
  //   this.WhqueueTruckTypes.clear();
  //   this.WhqueuePalletNumbers.clear();
  //   this.WhqueueContainerNumbers.clear();
  //   this.WhqueueDriverNames.clear();
  //   this.WhqueueDriverIds.clear();
  //   this.WhqueueDriverPhoneNumbers.clear();
  //   for (let i = 0; i < numberOfTrucksValue; i++) {
  //     const truckTypeControl = this.fb.control('', Validators.required);
  //     const palletNumberGroup = this.createPalletNumberGroup(); // Call to the pallet number group
  //     const containerNumberControl = this.fb.control('');
  
  //     // Listen for value changes in truck type to conditionally show and require container number
  //     truckTypeControl.valueChanges.subscribe((value) => {
  //       if (value === '5') {  // Assuming '5' is the ID for the truck type "Container"
  //         containerNumberControl.setValidators([Validators.required]);
  //         containerNumberControl.updateValueAndValidity();
  //       } else {
  //         containerNumberControl.clearValidators();
  //         containerNumberControl.updateValueAndValidity();
  //       }
  //     });
  //     this.WhqueueDriverNames.push(this.fb.control('', Validators.required));
  //     this.WhqueueDriverIds.push(this.fb.control('', Validators.required));
  //     this.WhqueueDriverPhoneNumbers.push(this.fb.control('', Validators.required));
  //     this.WhqueueTruckTypes.push(truckTypeControl);
  //     this.WhqueuePalletNumbers.push(palletNumberGroup);
  //     this.WhqueueContainerNumbers.push(containerNumberControl);
  //   }
  // }
  onTrucksNumberChange(): void {
    const numberOfTrucksValue = this.numberOfTrucks?.value || 0;
  
    // Clear existing form arrays
    this.WhqueueTruckTypes.clear();
    this.WhqueuePalletNumbers.clear();
    this.WhqueueContainerNumbers.clear();
    this.WhqueueDriverNames.clear();
    this.WhqueueDriverIds.clear();
    this.WhqueueDriverPhoneNumbers.clear();
  
    for (let i = 0; i < numberOfTrucksValue; i++) {
      const truckTypeControl = this.fb.control('', Validators.required);
      const palletNumberGroup = this.createPalletNumberGroup();
      const containerNumberControl = this.fb.control('');
      this.WhqueueDriverNames.push(this.fb.control('', Validators.required));
      this.WhqueueDriverIds.push(this.fb.control('', [
        Validators.required,
        Validators.pattern(/^\d{14}$/)
      ]));
  
      this.WhqueueDriverPhoneNumbers.push(this.fb.control('', [
        Validators.required,
        Validators.pattern(/^01[0125][0-9]{8}$/)
      ]));
  
      this.WhqueueTruckTypes.push(truckTypeControl);
      this.WhqueuePalletNumbers.push(palletNumberGroup);
      this.WhqueueContainerNumbers.push(containerNumberControl);
    }
  }
  
  createPalletNumberGroup(): FormGroup {
    return this.fb.group({
      letter1: ['', [Validators.required, Validators.pattern('[\u0621-\u064A]')]],
      letter2: ['', [Validators.required, Validators.pattern('[\u0621-\u064A]')]],
      letter3: ['', [Validators.required, Validators.pattern('[\u0621-\u064A]')]],
      number: ['', [Validators.required, Validators.pattern('[0-9]+')]] 
    });
  }
  onArabicInput(event: any, index: number, controlName: string): void {
    const arabicPattern = /^[\u0621-\u064A]+$/;
    const inputValue = event.target.value;
  
    if (!arabicPattern.test(inputValue)) {
      this.WhqueuePalletNumbers.at(index).get(controlName)?.setValue('');
    }
  }
  onNumberInput(event: any, index: number, controlName: string): void {
    const numberPattern = /^[0-9]{0,4}$/; 
    let inputValue = event.target.value;
  
    if (!numberPattern.test(inputValue)) {
      inputValue = inputValue.replace(/[^0-9]/g, '').substring(0, 4);
    }
  
    this.WhqueuePalletNumbers.at(index).get(controlName)?.setValue(inputValue);
  }
  onDriverIdInput(event: any, index: number, controlName: string): void {
    const numberPattern = /^\d{0,14}$/;
    let inputValue = event.target.value;
  
    if (!numberPattern.test(inputValue)) {
      inputValue = inputValue.replace(/[^0-9]/g, '').substring(0, 14);
    }
  console.log(inputValue, " valueid")
    this.WhqueueDriverIds.at(index).setValue(inputValue);
  }
  onDriverPhoneNumberInput(event: any, index: number, controlName: string): void {
    const numberPattern = /^01[0125][0-9]{8}$/;
    let inputValue = event.target.value.trim();
    
    if (!numberPattern.test(inputValue)) {
      inputValue = inputValue.replace(/[^0-9]/g, '').substring(0, 11);
    }
    console.log(this.WhqueueDriverPhoneNumbers.at(index).get(controlName))
    console.log("hello")
    this.WhqueueDriverPhoneNumbers.at(index).setValue(inputValue);
  }

}
