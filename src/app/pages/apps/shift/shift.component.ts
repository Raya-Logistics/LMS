import { Component, Input, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { saveAs } from 'file-saver-es';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateShiftTransactionCommand } from 'src/app/models/create-shift-transaction-command';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { minQuantityValidator } from './minQuantityValidator';
import Swal from 'sweetalert2';
const BaseURL_GetAll = 'get-all-shifts';
const BaseURL_GetAttributeAll = 'get-all-shiftAttribute_lookups';
const BaseURL_GetAttributeByShiftTypeAll = 'get-all-shiftAttribute_byshiftType_lookups';
const BaseURL_GetWarehouseForUser = 'getAllWarehousesForUser';
const BaseURL_GetById = 'get-shifts-by-id';
const BaseURL_Post = 'Create-shifts';
const BaseURL_PostAll = 'Create-list-shifts';
const BaseURL_Update = 'edit-shifts';
const BaseURL_Delete = 'deleted-shifts';
@Component({
  selector: 'app-shift',
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.scss']
})
export class ShiftComponent {
  @Input() isChildComponent: boolean = false;
//DevExpress And Template Definations
readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [
    { text: "Display Mode 'full'", value: 'full' },
    { text: "Display Mode 'compact'", value: 'compact' }
  ];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;

  dataSource!: CustomStore;
  attributeDta!: CustomStore;
  shiftTypeValueSelected:(number|null) = null;
  warehouseValueSelected:(number|null) = null;
  // shiftType: any;
  warehouseLookup:any;
  AttributeBasedOnShiftType: any;
  shiftForm!: FormGroup;
  shiftTypeOptions: any[] = [];
  customerOptions: any[] = [];
  companyOptions: any[] = [];
  attributeOptions: any = {};
  isLoading:boolean = false;
  shiftIsFixed:boolean = true;
  totalQuantitySum: number = 0;
  totalShiftHour: number = 0;
  selectedFile: File | null = null;
  shiftTypeIsSelected:boolean = false;
  visible:boolean = false;
  adjustmentForm!: FormGroup;
  attributeData: any[] = [];
  constructor(
    private fb: FormBuilder,
    private _apihandler: ApihandlerService,
    private _filehandler: FilehandlerService,
    private toaster: ToastrService,
    private authentication:AuthenticationService
  ) {}

  ngOnInit(): void {
    this.adjustmentForm = this.fb.group({
      id: ['', Validators.required], // Include the shift ID
      attributes: this.fb.array([]), // Initialize attributes array
    });
    this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Shift`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete)
    this.attributeDta = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAttributeAll,"","",
    "","")      
    this.breadCrumbItems = [
      { label: 'Home' },
      { label: 'Shift', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Shift)
    this.authentication.getInternalPermissionss(this.pagesname.Shift).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },
      error:(error) => {
        this.toaster.error('Failed to retrieve permissions');
        console.error('Error retrieving permissions:', error);
      }
    })
    this.shiftForm = this.fb.group({
      shiftHeader: this.fb.group({
        shiftStartingDate: [null],
        shiftEndDate: [null],
        shiftShiftTypeId: [null, Validators.required],
        shiftComment: [''],
        shiftRequestBy: [''],
        shiftRequestsEvedance: [''],
        shiftCompanyId: [null],
        shiftCustomerId: [null],
        shiftIsactive: [false],
        shiftWarehouseId: [null, Validators.required]
      }),
      shiftDetails: this.fb.array([])
    });
    // this.addShiftDetail(); // Initialize with one empty shift detail
    // this.fetchShiftTypes();
    // this.fetchCustomers();
      // Subscribe to changes in shiftDetailsValue
  this.shiftDetails.valueChanges.subscribe(() => {
    this.updateTotalQuantitySum();
  });
    this.fetchCompanies();
    this.fetchWarehouses();
  }
  get shiftDetails(): FormArray {
    return this.shiftForm.get('shiftDetails') as FormArray;
  }
  addShiftDetail() {
    const shiftDetail = this.fb.group({
      shiftDetailsHeaderId: [null, Validators.required],
      shiftDetailsAttributeId: [null, Validators.required],
      shiftDetailsValue: [null, Validators.required],
      shiftDetailsIsActive: [false],
      shiftDetailsComment: [''],
      shitDetailsSellingRate: [null, Validators.required],
      shiftDetailsTotalAmout: [null, Validators.required]
    });

    this.shiftDetails.push(shiftDetail);
    // Also subscribe to the value changes of the newly added shift detail's quantity
  shiftDetail.get('shiftDetailsValue')?.valueChanges.subscribe(() => {
    this.updateTotalQuantitySum();
  });
  }
  updateTotalQuantitySum() {
    if(this.totalQuantitySum == 0) {
      const startDateTime = this.shiftForm.get('shiftHeader.shiftStartingDate')?.value;
      const endDateTime = this.shiftForm.get('shiftHeader.shiftEndDate')?.value;
    
      if (startDateTime && endDateTime) {
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);
        const diffInMs = endDate.getTime() - startDate.getTime();
        this.totalShiftHour = diffInMs / (1000 * 60 * 60);
    }
  }
    const totalQuantity = this.shiftDetails.controls
      .map(control => control.get('shiftDetailsValue')?.value || 0)
      .reduce((sum, current) => sum + current, 0);
  
    // Multiply by 10
    this.totalQuantitySum = totalQuantity * this.totalShiftHour;
  }
  removeShiftDetail(index: number) {
    this.shiftDetails.removeAt(index);
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  // onSubmit() {
  //   if (this.shiftForm.valid) {
  //     this.isLoading = true;
  //     const shiftTransaction: CreateShiftTransactionCommand = this.shiftForm.value;
  //     // // console.log("internal => ", shiftTransaction);

  //     //       // Create a FormData object
  //     //       const formData = new FormData();

  //     //       // Append all form fields except the file
  //     //       const shiftTransaction = this.shiftForm.value;
  //     //       console.log("internal => ", shiftTransaction);

  //     //       // for (const key in shiftTransaction.shiftHeader) {
  //     //       //   if (shiftTransaction.shiftHeader.hasOwnProperty(key)) {
  //     //       //     formData.append(`shiftHeader.${key}`, shiftTransaction.shiftHeader[key]);
  //     //       //     console.log(`shiftHeader.${key}`, shiftTransaction.shiftHeader[key]); // Log the keys for debugging
  //     //       //   }
  //     //       // }
  //     //       formData.append(`shiftHeader`, shiftTransaction.shiftHeader);
  //     //       // Append shift details if any
  //     //       shiftTransaction.shiftDetails.forEach((detail: any, index: number) => {
  //     //         for (const key in detail) {
  //     //           if (detail.hasOwnProperty(key)) {
  //     //             formData.append(`shiftDetails[${index}][${key}]`, detail[key]);
  //     //           }
  //     //         }
  //     //       });

  //     //       // // Append the file if it exists
  //     //       // if (this.selectedFile) {
  //     //       //   formData.append('shiftRequestsEvedance', this.selectedFile);
  //     //       // }

  //     this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Shift/Createshift`, shiftTransaction).subscribe({
  //       next:(response) => {
  //         if(response.success) {
  //           this.isLoading = false;
  //           this.shiftForm.reset();
  //           this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Shift`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
  //   BaseURL_Update,BaseURL_Delete)
  //           this.toaster.success("Shift Added Success");
  //         }else {
  //           this.isLoading = false;
  //           this.toaster.error(response.message);
  //         }
  //       }
  //     }
  //     );
  //   } else {
  //     console.log('Form is invalid', this.shiftForm);
  //   }
  // }
  onSubmit() {
    if (this.shiftForm.valid) {
        this.isLoading = true;

        // Create a FormData object
        const formData = new FormData();
        const shiftTransaction = this.shiftForm.value;
        console.log(shiftTransaction, " shiftTransaction")
        // Append shiftHeader fields
        formData.append('shiftHeader.shiftStartingDate', shiftTransaction.shiftHeader.shiftStartingDate ? shiftTransaction.shiftHeader?.shiftStartingDate : '');
        formData.append('shiftHeader.shiftEndDate', shiftTransaction.shiftHeader.shiftEndDate ? shiftTransaction.shiftHeader.shiftEndDate : '');
        formData.append('shiftHeader.shiftShiftTypeId', shiftTransaction.shiftHeader.shiftShiftTypeId.toString());
        formData.append('shiftHeader.shiftComment', shiftTransaction.shiftHeader.shiftComment);
        formData.append('shiftHeader.shiftRequestBy', shiftTransaction.shiftHeader.shiftRequestBy || '');
        formData.append('shiftHeader.shiftIsactive', shiftTransaction.shiftHeader.shiftIsactive.toString());
        formData.append('shiftHeader.shiftCompanyId', shiftTransaction.shiftHeader.shiftCompanyId?.toString() || '');
        formData.append('shiftHeader.shiftCustomerId', shiftTransaction.shiftHeader.shiftCustomerId?.toString() || '');
        formData.append('shiftHeader.shiftWarehouseId', shiftTransaction.shiftHeader.shiftWarehouseId?.toString() || '');

        // Append the file (if selected)
        if (this.selectedFile) {
            formData.append('shiftHeader.shiftRequestsEvedance', this.selectedFile, this.selectedFile.name);
        }

        // Append shiftDetails fields
        shiftTransaction.shiftDetails.forEach((detail: any, index: number) => {
            formData.append(`shiftDetails[${index}].shiftDetailsAttributeId`, detail.shiftDetailsAttributeId.toString());
            formData.append(`shiftDetails[${index}].shiftDetailsValue`, detail.shiftDetailsValue.toString());
            formData.append(`shiftDetails[${index}].shiftDetailsIsActive`, detail.shiftDetailsIsActive.toString());
            formData.append(`shiftDetails[${index}].shiftDetailsComment`, detail.shiftDetailsComment || '');
            formData.append(`shiftDetails[${index}].shitDetailsSellingRate`, detail.shitDetailsSellingRate?.toString() || '');
            formData.append(`shiftDetails[${index}].shiftDetailsTotalAmout`, detail.shiftDetailsTotalAmout?.toString() || '');
        });

        // Send the FormData object via the API handler
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Shift/Createshift`, formData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.isLoading = false;
                    this.shiftForm.reset();
                    this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Shift`, BaseURL_GetAll, BaseURL_GetById, BaseURL_Post, BaseURL_Update, BaseURL_Delete);
                    this.toaster.success("Shift Added Successfully");
                } else {
                  Swal.fire({
                    icon: 'error', // You can change this to 'success', 'warning', etc.
                    title: 'خطأ...',
                    text: response.message + "\n" + response.arabicMessage,
                    // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
                    confirmButtonText: 'close',
                    confirmButtonColor: '#3085d6'
                  });
                  this.isLoading = false;
                }
            },
            error: (err) => {
                this.isLoading = false;
                Swal.fire({
                  icon: 'error', // You can change this to 'success', 'warning', etc.
                  title: 'خطأ...',
                  text: "Error occurred while creating the shift.",
                  // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
                  confirmButtonText: 'close',
                  confirmButtonColor: '#3085d6'
                });
            }
        });
    } else {
        console.log('Form is invalid', this.shiftForm);
    }
}

onOpenFiles = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
  const file = e.row?.data;
  console.log(file, " file")
}
  onCloneIconClickAdjust = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    // Fetch the attribute data from the API
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/Shift/GetShiftAttributeWithUsed?shiftId=${e.row?.data.id}&shiftTypeId=${e.row?.data.shiftShiftTypeId}`
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.attributeData = response.returnObject; // Store the attribute data  
            // Reset the form and include the shift ID
            this.adjustmentForm = this.fb.group({
              id: [e.row?.data.id, Validators.required], // Include shift ID
              attributes: this.fb.array([]), // Initialize the array of attributes
            });
  
            // Reset the form array for attributes
            const attributeArray = this.adjustmentForm.get('attributes') as FormArray;
            attributeArray.clear();
  
            // For each attribute, create a form group with a dropdown and input field
            this.attributeData.forEach((attribute: any) => {
              const attributeForm = this.fb.group({
                attributeId: [attribute.atrributeId, Validators.required], // Dropdown value
                value: [0, [Validators.required, minQuantityValidator(attribute.attributeQuantity)]]
              });
              attributeArray.push(attributeForm); // Add form group to form array
            });
  
            // Show the dialog
            this.visible = true;
          }else {
            this.toaster.error(response.message);
          }
        },
        error: (error) => {
          console.log('Error loading attributes:', error);
        },
      });
  };
  

  // fetchShiftTypes() {
  //   // this._apihandler.GetItem(`${GlobalComponent.BASE_API}/ShiftsType/get-all-user-shiftsType`).subscribe({
  //   //   next:(response) => {
  //   //     this.shiftTypeOptions = response.returnObject;
  //   //   }
  //   // }
  //   // );
  //   this._apihandler.GetItem(`${GlobalComponent.BASE_API}/ShiftsType/getAllShiftsTypeForUserLookup?assignedWarehouse=true`).subscribe({
  //     next:(response) => {
  //       this.shiftTypeOptions = response.returnObject;
  //     }
  //   }
  //   );
  // }

  // fetchCustomers() {
  //   this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Customer/get-all-customer_lookups`).subscribe( {
  //     next:(response) => {
  //       this.customerOptions = response.returnObject;
  //     }
  //   }
  //   );
  // }
  fetchCustomers(companyId:number) {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Customer/get-all-customer_by_company_id_lookups?companyId=${companyId}`).subscribe( {
      next:(response) => {
        this.customerOptions = response.returnObject;
      }
    }
    );
  }
  fetchCompanies() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/getAllCompaniesForUser?assignedCompany=true`).subscribe({
      next:(response) => {
        this.companyOptions = response.returnObject;
        console.log(this.companyOptions);
      }
    }
    );
  }
  fetchWarehouses() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/${BaseURL_GetWarehouseForUser}?assignedWarehouse=true`).subscribe({
      next:(response) => {
        this.warehouseLookup = response.returnObject;
      }
    }
    );
  }
  warehouseChanged() {
    console.log(this.warehouseValueSelected, " warehouseSelected")
    this.shiftForm.get('shiftHeader.shiftShiftTypeId')?.setValue(null);
    if(this.warehouseValueSelected != null && this.warehouseValueSelected != 0) {
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/ShiftsType/getAllShiftsTypeForWarehouseLookup?warehouseId=${this.warehouseValueSelected}`).subscribe({
        next: (response) => {
            this.shiftTypeOptions = response.returnObject;
        }
    });
    }else {
      this.shiftTypeOptions = [];
    }
  }
  shiftTypeChanged() {
    console.log("Selected With All Option", this.shiftTypeValueSelected, this.shiftTypeOptions);
    let shifttypeData = this.shiftTypeOptions.find(s => s.id == this.shiftTypeValueSelected);
    if(this.shiftTypeValueSelected == null) {
      this.shiftTypeIsSelected = false
    }
    else if(shifttypeData.typeIsFixedHour) {
      this.shiftTypeIsSelected = true;
      this.totalShiftHour = shifttypeData.totalHours;
      this.shiftIsFixed = true;
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.setValue(null);
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.removeValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.updateValueAndValidity();
      this.shiftForm.get('shiftHeader.shiftEndDate')?.setValue(null);
      this.shiftForm.get('shiftHeader.shiftEndDate')?.removeValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftEndDate')?.updateValueAndValidity();
      this.shiftForm.get('shiftHeader.shiftCompanyId')?.setValue(null);
      this.shiftForm.get('shiftHeader.shiftCompanyId')?.removeValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftCompanyId')?.updateValueAndValidity();
      this.shiftForm.get('shiftHeader.shiftRequestsEvedance')?.setValue(null);
      this.shiftForm.get('shiftHeader.shiftRequestsEvedance')?.addValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftRequestsEvedance')?.updateValueAndValidity();
    }else {
      this.shiftTypeIsSelected = true;
      this.totalShiftHour = 0;
      this.shiftIsFixed = false;
      this.shiftForm.get('shiftHeader.shiftCompanyId')?.setValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftCompanyId')?.updateValueAndValidity();
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.setValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.updateValueAndValidity();
      this.shiftForm.get('shiftHeader.shiftEndDate')?.setValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftEndDate')?.updateValueAndValidity();
      this.shiftForm.get('shiftHeader.shiftRequestsEvedance')?.setValue(null);
      this.shiftForm.get('shiftHeader.shiftRequestsEvedance')?.removeValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftRequestsEvedance')?.updateValueAndValidity();
    }
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/ShiftsAttribute/${BaseURL_GetAttributeByShiftTypeAll}?shiftTypeId=${this.shiftTypeValueSelected}`).subscribe({
        next: (response) => {
            this.AttributeBasedOnShiftType = response.returnObject;

            // Clear existing shift details
            while (this.shiftDetails.length) {
                this.shiftDetails.removeAt(0);
            }

            // Add shift details based on the attributes
            this.AttributeBasedOnShiftType.forEach((attribute: any) => {
                const shiftDetail = this.fb.group({
                    shiftDetailsAttributeId: [attribute.id, Validators.required],
                    shiftDetailsValue: [null, Validators.required],
                    shiftDetailsIsActive: [false]
                });
                this.shiftDetails.push(shiftDetail);
            });
        }
    });
  }
  fetchAttributes(companyId: number) {
    console.log(companyId);
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/ShiftsAttribute/get-all-shiftAttributeBasedOnCompany_lookups?companyId=${companyId}`).subscribe({
      next:(response) => {
        this.attributeOptions[companyId] = response.returnObject;
        // Update each shift detail's attribute options based on the selected company
        this.updateAttributeOptionsForShiftDetails(companyId);
      }
    }
    );
  }
  // shiftTypeChanged() {
  //   console.log(this.shiftTypeValueSelected);
  //   this._apihandler.GetItem(`${GlobalComponent.BASE_API}/ShiftsAttribute/${BaseURL_GetAttributeByShiftTypeAll}?shiftTypeId=${this.shiftTypeValueSelected}`).subscribe({
  //     next:(response) => {
  //       this.AttributeBasedOnShiftType = response.returnObject;
  //     }
  //   }
  //   );
  // }
  isButtonVisible = (e: any): boolean => {
    return e.row?.data?.shiftStatus === 'Open';
  };
  updateAttributeOptionsForShiftDetails(companyId: number) {
    this.shiftDetails.controls.forEach(control => {
      if (control.get('shiftDetailsAttributeId')) {
        control.get('shiftDetailsAttributeId')?.reset();
      }
    });
  }
  onCompanyChange(event: any) {
    const companyId = event.target.value;
    console.log(event.target.value.split(": ")[1], "change");
    if (companyId) {
      // this.fetchAttributes(event.target.value.split(": ")[1]);
      this.fetchCustomers(event.target.value.split(": ")[1]);
    }
  }

exportGrid(e:any) {
  this._filehandler.exportGrid(e, "ShiftsType");
 }
   // Form array getter
   get attributes(): FormArray {
    return this.adjustmentForm.get('attributes') as FormArray;
  }
 saveAdjustments() {
  if (this.adjustmentForm.valid) {
    const attributes = this.adjustmentForm.value.attributes.filter((r:any) => r.value != 0);
    this.adjustmentForm.value.attributes = attributes;
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Shift/CreateAdjustShift`, this.adjustmentForm.value).subscribe({
      next:(response) => {
        if(response.success) {
          this.toaster.success("Added Successfuly");
          this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Shift`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
            BaseURL_Update,BaseURL_Delete)
            this.attributeDta = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAttributeAll,"","",
            "","")    
          this.visible = false;
        }else {
          this.toaster.error(response.message)
          this.visible = false;
        }
      }
    })
  }
}
}
