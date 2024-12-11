import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import CustomStore from 'devextreme/data/custom_store';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { LookupVM } from 'src/app/models/LookupVM';
import { saveAs } from 'file-saver-es';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { CreateShiftTransactionCommand } from 'src/app/models/create-shift-transaction-command';
const BaseURL_GetAll = 'get-all-shiftAttribute';
const BaseURL_GetById = 'get-shiftAttribute-by-id';
const BaseURL_Post = 'Create-shiftAttribute';
const BaseURL_PostAll = 'Create-list-shiftAttribute';
const BaseURL_Update = 'edit-shiftAttribute';
const BaseURL_Delete = 'deleted-shiftAttribute';

const BaseURL_GetAllType = 'get-all-shiftsType';
const BaseURL_GetWarehouseForUser = 'getAllWarehousesForUser';
const BaseURL_GetAttributeAll = 'get-all-shiftAttribute_lookups';
const BaseURL_GetByIdType = 'get-shiftsType-by-id';
const BaseURL_PostType = 'Create-shiftsType';
const BaseURL_UpdateType = 'edit-shiftsType';
const BaseURL_DeleteType = 'deleted-shiftsType';
const BaseURL_GetAttributeByShiftTypeAll = 'get-all-shiftAttribute_byshiftType_lookups';

const BaseURL_UpdateShift = 'edit-shifts';
const BaseURL_GetByIdShift = 'get-shifts-by-id';
const BaseURL_PostShift = 'Create-shifts';
const BaseURL_GetAllShift = 'get-all-shifts';

@Component({
  selector: 'app-shift-configuration',
  templateUrl: './shift-configuration.component.html',
  styleUrls: ['./shift-configuration.component.scss']
})
export class ShiftConfigurationComponent {
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
  internalPermission:(string[] | null) = [];
//   shiftForm!: FormGroup;
//   warehouseLookup!:LookupVM[];
//   shiftTypeLookup!:LookupVM[];
//   companyLookup!:LookupVM[];
//   customerLookup!:LookupVM[];
//   warehouseValueSelected:(number|null) = null;
//   shiftTypeValueSelected:(number|null) = null;
//   companySelectedValue:(number|null) = null;
//   shiftIsFixed:boolean = false;
//   shiftTypeIsSelected:boolean = false;
//   selectedFile: File | null = null;
//   numberOfAttributeValue: number | null = null;
//   attributeLookup!: LookupVM[];
dataSource!: CustomStore;
dropDownOptions = { width: 500 };
dataSourceType!: CustomStore;  
warehouseSource!: CustomStore;  
attributeDataStore!: CustomStore;  
shiftType: any;
dataSourceShift!: CustomStore;
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
    this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
     BaseURL_Update,BaseURL_Delete)
     this.dataSourceType = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsType`, BaseURL_GetAllType,BaseURL_GetByIdType,BaseURL_PostType,
      BaseURL_UpdateType,BaseURL_DeleteType)
      this.warehouseSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Warehouse`, `${BaseURL_GetWarehouseForUser}?assignedWarehouse=true`,BaseURL_GetByIdType,BaseURL_PostType,
      BaseURL_UpdateType,BaseURL_DeleteType)
      this.attributeDataStore = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAttributeAll,"","",
        "","") 
      this.shiftType = [{id:1, name:"Fixed"}, {id:0, name:"OverTime"}]

      this.adjustmentForm = this.fb.group({
        id: ['', Validators.required], // Include the shift ID
        attributes: this.fb.array([]), // Initialize attributes array
      });
      this.dataSourceShift = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Shift`, BaseURL_GetAllShift,BaseURL_GetByIdShift,BaseURL_PostShift,
      BaseURL_UpdateShift,BaseURL_Delete)
      this.attributeDta = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAttributeAll,"","",
      "","")
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
      this.shiftDetails.valueChanges.subscribe(() => {
        this.updateTotalQuantitySum();
      });
        this.fetchCompanies();
        this.fetchWarehouses();
     this.breadCrumbItems = [
         { label: 'Home' },
         { label: 'Shift Configuration', active: true }
     ];
     this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.ShiftAttribute)
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
  onSubmit() {
    if (this.shiftForm.valid) {
      this.isLoading = true;
      const shiftTransaction: CreateShiftTransactionCommand = this.shiftForm.value;
      // // console.log("internal => ", shiftTransaction);

      //       // Create a FormData object
      //       const formData = new FormData();

      //       // Append all form fields except the file
      //       const shiftTransaction = this.shiftForm.value;
      //       console.log("internal => ", shiftTransaction);

      //       // for (const key in shiftTransaction.shiftHeader) {
      //       //   if (shiftTransaction.shiftHeader.hasOwnProperty(key)) {
      //       //     formData.append(`shiftHeader.${key}`, shiftTransaction.shiftHeader[key]);
      //       //     console.log(`shiftHeader.${key}`, shiftTransaction.shiftHeader[key]); // Log the keys for debugging
      //       //   }
      //       // }
      //       formData.append(`shiftHeader`, shiftTransaction.shiftHeader);
      //       // Append shift details if any
      //       shiftTransaction.shiftDetails.forEach((detail: any, index: number) => {
      //         for (const key in detail) {
      //           if (detail.hasOwnProperty(key)) {
      //             formData.append(`shiftDetails[${index}][${key}]`, detail[key]);
      //           }
      //         }
      //       });

      //       // // Append the file if it exists
      //       // if (this.selectedFile) {
      //       //   formData.append('shiftRequestsEvedance', this.selectedFile);
      //       // }

      this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Shift/create-shift`, shiftTransaction).subscribe({
        next:(response) => {
          if(response.success) {
            this.isLoading = false;
            this.shiftForm.reset();
            this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Shift`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete)
            this.toaster.success("Shift Added Success");
          }else {
            this.isLoading = false;
            this.toaster.error(response.message);
          }
        }
      }
      );
    } else {
      console.log('Form is invalid', this.shiftForm);
    }
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
            console.log(response.returnObject);
            this.attributeData = response.returnObject; // Store the attribute data
            console.log(this.attributeData, ' attributeData');
  
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
                value: ['', Validators.required], // Input field for value
              });
              attributeArray.push(attributeForm); // Add form group to form array
            });
  
            // Show the dialog
            this.visible = true;
          }
        },
        error: (error) => {
          console.log('Error loading attributes:', error);
        },
      });
  };
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
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.removeValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.updateValueAndValidity();
      this.shiftForm.get('shiftHeader.shiftEndDate')?.removeValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftEndDate')?.updateValueAndValidity();
    }else {
      this.shiftTypeIsSelected = true;
      this.totalShiftHour = 0;
      this.shiftIsFixed = false;
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.setValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftStartingDate')?.updateValueAndValidity();
      this.shiftForm.get('shiftHeader.shiftEndDate')?.setValidators(Validators.required);
      this.shiftForm.get('shiftHeader.shiftEndDate')?.updateValueAndValidity();
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
  get attributes(): FormArray {
    return this.adjustmentForm.get('attributes') as FormArray;
  }
  saveAdjustments() {
    if (this.adjustmentForm.valid) {
      const formValue = this.adjustmentForm.value;
      console.log(formValue, " AdjustForm");
    }
  }
   onRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['attributeName'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
  }

  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/ShiftsAttribute/${BaseURL_PostAll}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success) {
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              }else {
                this.toaster.error(response.returnObject.split(",").join(" </br>"));
              }
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
              BaseURL_Update,BaseURL_Delete);
            },
            error:(e) =>{
              this.toaster.error(e);
            }
          })
        })
        .catch(error => {
          console.error('Error processing file:', error);
        });
    }
  }
  exportGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.ShiftAttribute);
   }
  // Function to handle file download
  downloadFile() {
    const filename = `${this.pagesname.ShiftAttribute}.xlsx`;
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }






  calculateFilterExpression(filterValue:any, selectedFilterOperation:any, target:any) {
    if (target === 'search' && typeof (filterValue) === 'string') {
      return [(this as any).dataField, 'contains', filterValue];
    }
    return function (rowData:any) {
      return (rowData.AssignedEmployee || []).indexOf(filterValue) !== -1;
    };
  }
  
  cellTemplate(container:any, options:any) {
    const noBreakSpace = '\u00A0';
  
    const assignees = (options.value || []).map(
      (assigneeId: number) => options.column!.lookup!.calculateCellValue!(assigneeId),
    );
    const text = assignees.join(', ');
  
    container.textContent = text || noBreakSpace;
    container.title = text;
  }
  
  onValueChanged(event: any, cellInfo: any) {
    console.log('Value changed:', event.value);
    cellInfo.setValue(event.value);
  }
  
  onSelectionChanged(event: any, cellInfo: any) {
    console.log('Selection changed:', event);
    cellInfo.component.updateDimensions();
  }
  
  onRowValidating2(e: any) {
    console.log(e, "validating");
    const data = { ...e.oldData, ...e.newData };
    if(data.typeIsFixedHour == undefined) {
        e.isValid = false;
        e.errorText = 'You Must Select Shift Type';
        return;
    }else {
      //isFixedType 
      if(data.typeIsFixedHour == 1){
        if(data.typeStartHour == undefined) {
          e.isValid = false;
          e.errorText = "You Must Enter Start Shif Hour If this is Fixed Shift"
          return;
        }else if (data.typeEndHour == undefined){
          e.isValid = false;
          e.errorText = "You Must Enter End Shif Hour If this is Fixed Shift"
          return;
        }else if (data.typeStartHour < 0 || data.typeStartHour > 23 || data.typeEndHour <= 0 || data.typeEndHour > 23 || data.typeEndHour <= data.typeStartHour) {
          e.isValid = false;
          e.errorText = "Start Hour And End Hour Must Be In Range (0,23) And End Hour > Start Hour"
          return;
        }
      }
      if(data.typeName == undefined) {
        e.isValid = false;
        e.errorText = "You Must Enter Type Name"
        return;
      }else if (data.typeWarehouseId == undefined) {
        e.isValid = false;
        e.errorText = "You Must Select Warehouse"
      }
    }
    data.typeIsFixedHour = (data.typeIsFixedHour == 1) ? true : false;
  }
    // Add the onInitNewRow method to set the default Shift Type to "Pick"
    onInitNewRow(e: any) {
      e.data.typeIsFixedHour = 0; // Default to 'Pick' (id: 0)
    }
  calculateShiftType(data: any): number {
    console.log(data, "calculate")
    return data.typeIsFixedHour ? 1 : 0;
  }
  
  setShiftType(newData: any, value: any): void {
    console.log(newData," ",  value, "calculate")
    newData.typeIsFixedHour = value === 1;
  }
  calculateCellTotalHourValue(rowData:any) {
    if(rowData.typeIsFixedHour == 1) { //Fixed
      return rowData.typeEndHour - rowData.typeStartHour
    }else {
      return (rowData.typeEndHour - rowData.typeStartHour) > 0 ? (rowData.typeEndHour - rowData.typeStartHour) : ''
    }
  }
  exportGrid2(e:any) {
    this._filehandler.exportGrid(e, "ShiftsType");
   }










//   ngOnInit(): void {     
//     this.breadCrumbItems = [
//       { label: 'Home' },
//       { label: 'Shift Configuration', active: true }
//     ];
//     this.shiftTypeLookup = [{id:1, name:"Fixed"},{id:2, name:"Peaked"}]
//     this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Shift)
//     this.InitialShiftForm();
//     this.LoadShiftDataFromApi();
//   }
//   InitialShiftForm() {  
//     this.shiftForm = this.fb.group({
//       shiftHeader: this.fb.group({
//         shiftWarehouseId: [null, Validators.required],
//         shiftShiftTypeId: [null, Validators.required],
//         shiftStartingDate: [null],
//         shiftEndDate: [null],
//         shiftStartingHour: [null],
//         shiftEndHour: [null],
//         shiftNumberOfAttribute:[null, [Validators.required, Validators.min(1)]],
//         shiftName: [null, Validators.required],
//         shiftComment: [null],
//         shiftRequestsEvedance: [''],
//         shiftRequestBy: [''],
//         shiftCompanyId: [null],
//         shiftCustomerId: [null]
//       }),
//       shiftDetails: this.fb.array([], this.duplicateAttributeValidator()) // Apply custom validator here
//     });
//   }
//   LoadShiftDataFromApi() {
//     this.fetchWarehouses();
//     this.fetchAttributes();
//   }
//   fetchWarehouses() {
//     this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesForUser?assignedWarehouse=true`).subscribe({
//       next:(response) => {
//         this.warehouseLookup = response.returnObject;
//       }
//     }
//     );
//   }
//   fetchCustomers(companyId:number) {
//     this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Customer/get-all-customer_by_company_id_lookups?companyId=${companyId}`).subscribe( {
//       next:(response) => {
//         this.customerLookup = response.returnObject;
//       }
//     }
//     );
//   }
//   fetchCompanies() {
//     this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/getAllCompaniesForUser?assignedCompany=true`).subscribe({
//       next:(response) => {
//         this.companyLookup = response.returnObject;
//       }
//     }
//     );
//   }
//   fetchAttributes() {
//     this._apihandler.GetItem(`${GlobalComponent.BASE_API}/ShiftsAttribute/get-all-shiftAttribute_lookups`).subscribe({
//       next:(response) => {
//         this.attributeLookup = response.returnObject;
//         this.shiftForm.get('shiftHeader.shiftNumberOfAttribute')?.setValidators(Validators.max(this.attributeLookup.length));
//         this.shiftForm.updateValueAndValidity();
//       }
//     }
//     );
//   }
//   warehouseChanged() {
//     if(this.warehouseValueSelected != null) {

//     }else {
//       this.shiftForm.get('shiftHeader.shiftShiftTypeId')?.setValue(null);
//       this.shiftForm.updateValueAndValidity;
//     }
//   }
//   shiftTypeChanged() {
//     if(this.shiftTypeValueSelected == null) {
//       this.shiftIsFixed = false;
//       this.shiftTypeIsSelected = false;
//     }else if(this.shiftTypeValueSelected == 1) {
//       this.shiftIsFixed = true;
//       this.shiftTypeIsSelected = true;
//       this.shiftForm.get('shiftHeader.shiftStartingHour')?.setValidators([Validators.required,Validators.min(1), Validators.max(23)]);
//       this.shiftForm.get('shiftHeader.shiftEndHour')?.setValidators([Validators.required,Validators.min(1), Validators.max(23)]);
//       this.shiftForm.get('shiftHeader.shiftStartingDate')?.removeValidators(Validators.required);
//       this.shiftForm.get('shiftHeader.shiftEndDate')?.removeValidators(Validators.required);
//       this.shiftForm.updateValueAndValidity();
//     }else {
//       this.shiftIsFixed = false;
//       this.shiftTypeIsSelected = true;
//       this.fetchCompanies();
//       this.shiftForm.get('shiftHeader.shiftStartingHour')?.removeValidators([Validators.required,Validators.min(1), Validators.max(23)]);
//       this.shiftForm.get('shiftHeader.shiftEndHour')?.removeValidators([Validators.required,Validators.min(1), Validators.max(23)]);
//       this.shiftForm.get('shiftHeader.shiftStartingDate')?.setValidators(Validators.required);
//       this.shiftForm.get('shiftHeader.shiftEndDate')?.setValidators(Validators.required);
//       this.shiftForm.updateValueAndValidity();
//     }
//   }
//   CompanyChanged(event: any) {
//     if(this.companySelectedValue) {
//       this.fetchCustomers(this.companySelectedValue);
//     }else {
//       this.shiftForm.get('shiftHeader.shiftCustomerId')?.setValue(null);
//       this.shiftForm.updateValueAndValidity();
//     }
//   }
//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedFile = input.files[0];
//     }
//   }
//   // Create Shift Form Submission
//   onCreateShift(shiftForm: FormGroup) {
//     if (shiftForm.valid) {
//       // Create FormData object
//       const formData = new FormData();

//       // Append header fields from shiftHeader form group
//       Object.keys(shiftForm.value.shiftHeader).forEach(key => {
//         if (shiftForm.value.shiftHeader[key] !== null) {
//           formData.append(`ShiftHeader.${key}`, shiftForm.value.shiftHeader[key]);
//         }
//       });

//       // Append shift details (Array)
//       shiftForm.value.shiftDetails.forEach((detail: any, index: number) => {
//         formData.append(`ShiftDetails[${index}].AttributeId`, detail.attributeId);
//         formData.append(`ShiftDetails[${index}].Value`, detail.value);
//       });

//       // Append the file if selected
//       if (this.selectedFile) {
//         formData.append('ShiftHeader.ShiftRequestsEvedance', this.selectedFile, this.selectedFile.name);
//       }

//       // Send the form data with the file using HttpClient
//       this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Shift/CreateShiftCongfiguration`, formData).subscribe({
//         next: (response: any) => {
//           if(response.success) {
//             this.toaster.success("The Shift Created Successful")
//           }else {
//             this.toaster.error(response.message)
//           }
//         },
//         error: (err) => {
//         }
//       });
//     }
//   }
//   // onCreateShift(shiftForm:FormGroup) {
//   //   console.log(shiftForm.value);
//   //   if(shiftForm.valid) {
//   //     this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Shift/CreateShiftCongfiguration`, shiftForm.value).subscribe({
//   //       next:(response)=> {

//   //       },
//   //       error:(err)=> {

//   //       }
//   //     })
//   //   }
//   // }
//   NumberOfAttributesEntered() {
//     const numberOfAttributes = this.numberOfAttributeValue;

//     if (numberOfAttributes && numberOfAttributes > 0 && numberOfAttributes <= this.attributeLookup.length) {
//       this.shiftDetails.clear(); 

//       for (let i = 0; i < numberOfAttributes; i++) {
//         this.shiftDetails.push(
//           this.fb.group({
//             attributeId: [null, Validators.required], // Dropdown to select attribute
//             value: [null, [Validators.required, Validators.min(1)]] // Input for value
//           })
//         );
//       }
//     }
//   }
//  duplicateAttributeValidator(): (formArray: AbstractControl) => null | { duplicate: true } {
//   return (formArray: AbstractControl): null | { duplicate: true } => {
//     const selectedAttributeIds = (formArray as FormArray).controls
//       .map(control => control.get('attributeId')?.value)
//       .filter(id => id !== null); // Ignore null values

//     const hasDuplicates = selectedAttributeIds.some((id, index) => selectedAttributeIds.indexOf(id) !== index);
//     return hasDuplicates ? { duplicate: true } : null;
//   };
// }
//   warehouseId() {
//     return this.shiftForm.get('shiftHeader.shiftWarehouseId');
//   }
//   shiftTypeId() {
//     return this.shiftForm.get('shiftHeader.shiftShiftTypeId');
//   }
//   shiftStartingHour() {
//     return this.shiftForm.get('shiftHeader.shiftStartingHour');
//   }
//   shiftEndHour() {
//     return this.shiftForm.get('shiftHeader.shiftEndHour');
//   }
//   get shiftDetails() {
//     return this.shiftForm.get('shiftDetails') as FormArray;
//   }
}
