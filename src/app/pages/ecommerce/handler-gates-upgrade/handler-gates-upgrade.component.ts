import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { el } from '@fullcalendar/core/internal-common';
import CustomStore from 'devextreme/data/custom_store';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { LookupVM } from 'src/app/models/LookupVM';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { CustomValidators } from '../handling-in/CustomValidators';
import { Console } from 'console';

@Component({
  selector: 'app-handler-gates-upgrade',
  templateUrl: './handler-gates-upgrade.component.html',
  styleUrls: ['./handler-gates-upgrade.component.scss']
})
export class HandlerGatesUpgradeComponent {
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
  transactionsTypeLookup!:LookupVM[];
  companyLookup!:LookupVM[];
  warehouseLookup!:LookupVM[];
  codeLookup!:any[];
  form!: FormGroup;
  typeIsSelected:boolean = false;
  SerialIsScan:boolean = false;
  typeSelectedValue:any = null;
  companyIsSelected:boolean = false;
  minDate!: string;
  dataSource!:CustomStore;
  firstSerialDetails: { warehouse: number; company: number; item: number; category: number } | null = null;

  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService,private fb: FormBuilder,
    private spinner: NgxSpinnerService) {
    
  }
  ngOnInit(): void {
    this.loadData();
    this.initialForm();
    this.dataSource = this._apihandler.getStoreWithList(
      `${GlobalComponent.BASE_API}/StockDetails`,
      'Get-Yard-Details-By-Status?status=1',
      'Get-Yard-By-Id',
      'Create-Yard-Handling',
      'EditFreeTime',
      GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
    );
    this.authentication.getInternalPermissionss(this.pagesname.GatesHandler).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },});
  }
  private loadData() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRANSACTION_TYPE.NAME}/${GlobalComponent.Controllers.TRANSACTION_TYPE.API_ACTIONS.GET_LOOKUP}`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.transactionsTypeLookup = response.returnObject;
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesYardForUser?assignedWarehouse=true`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.warehouseLookup = response.returnObject;
          // if (this.warehouseLookup?.length) {
          //   this.form.get('WarehouseId')?.setValue(this.warehouseOptions[0].id);
          // }
          if (this.warehouseLookup.length > 0) {
            const defaultWarehouseId = this.warehouseLookup[0].id;
            this.form.get('WarehouseId')?.setValue(defaultWarehouseId);
          }
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/getAllCompaniesForUser?assignedCompany=true`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.companyLookup = response.returnObject;
    
        }
      }
    })
    }
    private initialForm() {
      this.form = this.fb.group({
        TransactionsType: [null, Validators.required],
        CategoryId: [null, Validators.required],
        containerNumber: [null, Validators.required],
        Patch_BookinkRefrence: ['', Validators.required,[CustomValidators.uniqueBookingNumber(this._apihandler)]],
        freeTime: ['', [Validators.required]],
        SerialNumber: this.fb.array([], Validators.required), 
        ExistingDetailsId: this.fb.array([]), 
        CompanyId: [null, Validators.required],
        WarehouseId: [null, Validators.required],
        ItemId: [null, Validators.required]
      });
      const today = new Date();
        this.minDate = today.toISOString().slice(0, 16);
    }
      oncontainerNumberChange() {
    // const count = this.form.get('containerNumber')?.value || 0;
    // this.updateSerials(count);
    const count = this.form.get('containerNumber')?.value || 0;
  
    if (this.typeSelectedValue == 1) {
      // Show serial inputs and validate
      this.updateSerials(count);
    } else if (this.typeSelectedValue == 2) {
      // Hide serial inputs and populate with empty values
      this.updateSerials(count, true);
    }
  }
  //new
  private updateSerials(count: number, isEmpty = false) {
    const serialsArray = this.SerialNumber;
    serialsArray.clear();
  
    if (isEmpty) {
      // Add empty values without creating validations or controls
      for (let i = 0; i < count; i++) {
        serialsArray.push(this.fb.control('')); // Add an empty string without any validators
      }
    } else {
      // Add form controls with validation
      for (let i = 0; i < count; i++) {
        serialsArray.push(
          this.fb.control('', [
            Validators.required,
            Validators.pattern(/^[A-Z]{4}\d{7}$/),
            this.serialNumberValidators(),
          ])
        );
      }
    }
  }
  
  // private updateSerials(count: number, isEmpty = false) {
  //   const serialsArray = this.SerialNumber;
  //   serialsArray.clear();
  
  //   for (let i = 0; i < count; i++) {
  //     serialsArray.push(
  //       this.fb.control(
  //         isEmpty ? '' : '', // Add empty string for type 2
  //         isEmpty
  //           ? [] // No validations when TransactionsType = 2
  //           : [
  //               Validators.required,
  //               Validators.pattern(/^[A-Z]{4}\d{7}$/),
  //               this.serialNumberValidators(),
  //             ]
  //       )
  //     );
  //   }
  // }
  // private updateSerials(count: number) {
  //   const serialsArray = this.SerialNumber;
  //   serialsArray.clear();
  
  //   for (let i = 0; i < count; i++) {
  //     serialsArray.push(
  //       this.fb.control('', [
  //         Validators.required,
  //         Validators.pattern(/^[A-Z]{4}\d{7}$/),
  //         this.serialNumberValidators(),
  //       ])
  //     );
  //   }
  // }
//new
typeIsChange() {
  const typeValue = this.form.get('TransactionsType')?.value;
  this.typeSelectedValue = typeValue;
  const count = this.form.get('containerNumber')?.value || 0;

  if (typeValue == 1) {
    this.typeIsSelected = true;
    // Revalidate all serials
    this.SerialNumber.clear();
    for (let i = 0; i < count; i++) {
      this.SerialNumber.push(
        this.fb.control('', [
          Validators.required,
          Validators.pattern(/^[A-Z]{4}\d{7}$/),
          this.serialNumberValidators(),
        ])
      );
    }
    this.SerialNumber.controls.forEach(control => control.updateValueAndValidity());
  } else if (typeValue && typeValue == 2) {
        this.typeSelectedValue = 2;
        this.typeIsSelected = true;
        this.SerialNumber.clear();
          for (let i = 0; i < count; i++) {
            this.SerialNumber.push(this.fb.control('')); // Add empty controls without validations
          }
        // this.form.get('CompanyId')?.setValue(null);
        // this.form.get('WarehouseId')?.setValue(null);
        // this.form.get('ItemId')?.setValue(null);
        // this.form.get('CategoryId')?.setValue(null);

      }else {
        this.typeSelectedValue = typeValue;
        this.typeIsSelected = false;
      }
}
    companyIschnage() {
      const companyValue = this.form.get('CompanyId')?.value;
      if(companyValue) {
        this.companyIsSelected = true;
        this.loadItemsForCompany(companyValue).subscribe();
      }else {
        this.companyIsSelected = false;
        this.codeLookup = [];
      }
    }
    private loadItemsForCompany(companyId: number): Observable<any> {
      return this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}/GetAllItemForCompany?companyId=${companyId}`).pipe(
        tap((response:any) => {
          if (response.success) {
            this.codeLookup = response.returnObject;
          }
        })
      );
    }
    itemIschnage() {
      const codeValue = this.form.get('ItemId')?.value;
      if(codeValue) {
        const itemFound = this.codeLookup?.filter((item) => item.id == codeValue)
        this.form.get('CategoryId')?.setValue(itemFound[0]?.itemDetails[0]?.itemDetailPalletCategoryId);
      }else {
        this.form.get('CategoryId')?.setValue(null);
      }
    }
    private clearSerialNumberArray() {
      const serialNumberArray = this.form.get('SerialNumber') as FormArray;
      while (serialNumberArray.length) {
        serialNumberArray.removeAt(0);
      }
    }
    onInputChange(event: any, index: number): void {
      // let value = event.target.value;
      // console.log(value, " value1");
    
      // // Remove any non-alphanumeric characters (force upper case)
      // value = value.replace(/[^A-Z0-9]/g, '').toUpperCase();  
      // console.log(value, " value2");
    
      // // Limit to only 4 uppercase letters
      // value = value.substring(0, 4);
      // console.log(value, " value3");
    
      // // Limit to 4 letters and 7 digits (if more than 4 letters, take digits only)
      // if (value.length >= 4) {
      //   // After the 4 letters, allow only digits
      //   value = value + event.target.value.substring(value.length, value.length + 7).replace(/[^0-9]/g, '');
      // }
      
      // // Limit to 11 characters (4 letters + 7 digits)
      // value = value.slice(0, 11);
      // console.log(value, " value5");
      let value = event.target.value;
      console.log(value, " value1");
    
      // Automatically capitalize all characters and remove non-alphanumeric characters
      value = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      console.log(value, " value2");
    
      // Limit to only 4 uppercase letters
      value = value.substring(0, 4);
      console.log(value, " value3");
    
      // Allow only digits after the first 4 characters
      if (value.length >= 4) {
        // Get the remaining value after the first 4 characters and allow only digits (up to 7 digits)
        value = value + event.target.value.substring(4).replace(/[^0-9]/g, '').slice(0, 7);
      }
    
      // Ensure the total length is no more than 11 characters (4 letters + 7 digits)
      value = value.slice(0, 11);
      console.log(value, " value5");

      this.SerialNumber.at(index).setValue(value);
    }
    onSubmit() {
      console.log(this.form)
      if(this.form.valid) {
        this.spinner.show();
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/Create-Yard-Handling`, [this.form.value]).subscribe({
          next:(response) => {
            if(response.success) {
              this.spinner.hide();
              Swal.fire({
                icon: 'success', // Icon type: 'success', 'warning', etc.
                title: 'success',
                text: "Your work has been saved",
                confirmButtonText: 'Close',
                confirmButtonColor: '#3085d6',
                allowOutsideClick: false, // Prevents closing when clicking outside
                allowEscapeKey: false,    // Prevents closing with the Escape key
                allowEnterKey: false  
              })
              this.dataSource = this._apihandler.getStoreWithList(
                `${GlobalComponent.BASE_API}/StockDetails`,
                'Get-Yard-Details-By-Status?status=1',
                'Get-Yard-By-Id',
                'Create-Yard-Handling',
                'EditFreeTime',
                GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
              );
              this.form.reset();
              this.clearSerialNumberArray();
              this.form.get("containerNumber")?.setValue(0);
            }else {
              this.spinner.hide();
              Swal.fire({
                icon: 'error', // Icon type: 'success', 'warning', etc.
                title: 'خطأ',
                text: response.message + "/" + response.arabicMessage,
                confirmButtonText: 'Close',
                confirmButtonColor: '#3085d6',
                allowOutsideClick: false, // Prevents closing when clicking outside
                allowEscapeKey: false,    // Prevents closing with the Escape key
                allowEnterKey: false  
              })
            }
          }
        })
      }
    }
    //New
    private serialNumberValidators(): ValidatorFn {
      
      return (control: AbstractControl): ValidationErrors | null => {
        const serials = this.SerialNumber.value;
        const currentIndex = this.SerialNumber.controls.indexOf(control);
    
        // Check for duplicate serials
        if (serials.filter((s: string, i: number) => s == control.value && i != currentIndex).length > 0) {
          return { duplicate: true };
        }
    
        // Check database for existing serial
        if (control.value) {
          this._apihandler
            .GetItem(`${GlobalComponent.BASE_API}/StockDetails/GetYardSerialDetailsByType?serial=${control.value}&type=${this.typeSelectedValue}`)
            .subscribe({
              next: (response: any) => {
                if (!response.success) {
                  control.setErrors({ existsInDatabase: true });
                }
              },
            });
        }
    
        return null; // No errors
      };
    }
    get SerialNumber(): FormArray {
      return this.form.get('SerialNumber') as FormArray;
    }
    get containerNumber() {
      return this.form.get('containerNumber');
    }
    exportGrid(e:any) {
      this._filehandler.exportGrid(e, this.pagesname.TruckType);
     }
}
