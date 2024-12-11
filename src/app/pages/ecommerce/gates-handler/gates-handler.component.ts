import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';;
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-gates-handler',
  templateUrl: './gates-handler.component.html',
  styleUrls: ['./gates-handler.component.scss']
})
export class GatesHandlerComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  warehouseData!: CustomStore;
  companyData!: CustomStore;
  itemCodeData:any = [];
  itemCodeData2:any = [];
  transactionTypeData!:CustomStore[];

  requests: string[] = [];
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;
  yardHandlingForm!: FormGroup;
  itemOptions:any;
  transactionsTypeOptions:any;
  warehouseOptions:any;
  companyOptions:any;
  count:number = 0;
  private isProgrammaticChange: boolean = false;
  isIn:boolean = true;
  @ViewChild("refInput") refInput!: ElementRef;

  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService,private fb: FormBuilder) {
    
  }
  ngOnInit(): void {
    this.initForm();
    this.loadData();
      //Initialize Dev Express Data Grid
      this.dataSource = this._apihandler.getStoreWithList(
        `${GlobalComponent.BASE_API}/StockDetails`,
        'Get-Yard-Details',
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
        'Create-Yard-Handling',
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
      );
      this.warehouseData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Warehouse`, `getAllWarehousesYardForUser?assignedWarehouse=true`,"","",
        "","")
        // this.warehouseData = this.warehouseData.filter((warehouse:any) => warehouse.isYard);

        this.companyData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, `getAllCompaniesForUser?assignedCompany=true`,"","",
          "","");
          this.transactionTypeData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRANSACTION_TYPE.NAME}`, GlobalComponent.Controllers.TRANSACTION_TYPE.API_ACTIONS.GET_LOOKUP,"","",
            "","");
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Gates Handler', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.TruckType)
    this.authentication.getInternalPermissionss(this.pagesname.TruckType).subscribe({
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
private loadData() {
this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRANSACTION_TYPE.NAME}/${GlobalComponent.Controllers.TRANSACTION_TYPE.API_ACTIONS.GET_LOOKUP}`).subscribe({
  next:(response)=>{
    if(response.success) {
      this.transactionsTypeOptions = response.returnObject;
    }
  }
})
this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesYardForUser?assignedWarehouse=true`).subscribe({
  next:(response)=>{
    if(response.success) {
      this.warehouseOptions = response.returnObject;
      if (this.warehouseOptions.length) {
        this.yardHandlingForm.get('WarehouseId')?.setValue(this.warehouseOptions[0].id);
      }
    }
  }
})
this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/getAllCompaniesForUser?assignedCompany=true`).subscribe({
  next:(response)=>{
    if(response.success) {
      this.companyOptions = response.returnObject;

    }
  }
})
}
  private initForm(): void {
    this.yardHandlingForm = this.fb.group({
      TransactionsType: [null, Validators.required],
      WarehouseId: [null, Validators.required],
      CompanyId: [null, Validators.required],
      ItemId: [null, Validators.required],
      CategoryId: [null, Validators.required],
      OrignalDatetime: [null],
      Patch_BookinkRefrence: ['', Validators.required],
      SerialNumber: ['', Validators.required],
      ExistingDetailsId: [null]
    });

    // // Listen for changes on TransactionsType
    // this.yardHandlingForm.get('TransactionsType')?.valueChanges.subscribe((value) => {
    //   this.handleTransactionTypeChange(value);
    // });

    // // Listen for changes on CompanyId
    // this.yardHandlingForm.get('CompanyId')?.valueChanges.subscribe((companyId) => {
    //   if (this.yardHandlingForm.get('TransactionsType')?.value == 1 && companyId) {
    //     this.yardHandlingForm.get('OrignalDatetime')?.setValue(new Date)
    //     this.yardHandlingForm.get('ItemId')?.setValue(null)
    //     this.yardHandlingForm.get('CategoryId')?.setValue(null)
    //     this.loadItemsForCompany(companyId);
    //   }
    // });

    // // Listen for changes on ItemId
    // this.yardHandlingForm.get('ItemId')?.valueChanges.subscribe((itemId) => {
    //   const selectedItem = this.itemOptions?.find((item:any) => item.id == itemId);
    //   if (selectedItem) {
    //     this.yardHandlingForm.get('CategoryId')?.setValue(selectedItem.itemDetails[0].itemDetailPalletCategoryId);
    //   }
    // });

    // Listen for changes on SerialNumber when TransactionsType is 2
    // this.yardHandlingForm.get('SerialNumber')?.valueChanges.subscribe((serial) => {
    //   if (this.yardHandlingForm.get('TransactionsType')?.value == 2 && serial) {
    //     this.loadYardSerialDetails(serial);
    //   }
    // });
    // this.yardHandlingForm.get('SerialNumber')?.valueChanges.subscribe((serial) => {
    //   if (!this.isProgrammaticChange && this.yardHandlingForm.get('TransactionsType')?.value == 2 && serial) {
    //     this.loadYardSerialDetails(serial);
    //   }
    // });
    //  // Listen for changes on TransactionsType
    //  this.yardHandlingForm.get('TransactionsType')?.valueChanges.subscribe((value) => {
    //   if (!this.isProgrammaticChange) {
    //     this.handleTransactionTypeChange(value);
    //   }
    // });
  }

  private handleTransactionTypeChange(type: number): void {
    if (type == 1) {
      
      this.yardHandlingForm.enable();
      this.yardHandlingForm.reset();
    } else if (type == 2) {
      this.yardHandlingForm.get('SerialNumber')?.enable();
      this.yardHandlingForm.get('ItemId')?.disable();
      this.yardHandlingForm.get('CategoryId')?.disable();
    }
  }

  private loadItemsForCompany(companyId: number): Observable<any> {
    return this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}/GetAllItemForCompany?companyId=${companyId}`).pipe(
      tap((response:any) => {
        if (response.success) {
          this.itemOptions = response.returnObject;
        }
      })
    );
  }
  // private loadYardSerialDetails(serial: string): void {
  //   this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockDetails/Get-Yard-Serial-details?Serial=${serial}`).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         console.log(response.returnObject, "rowData");
  //         console.log(this.count++);

  //         const rowData = response.returnObject;

  //         // Set the flag to indicate programmatic change
  //         // this.isProgrammaticChange = true;

  //         // Update form values
  //         this.loadItemsForCompany(rowData.companyId).subscribe(() => {
  //           console.log(this.itemOptions, " this.itemOptions")
  //           console.log(rowData.itemId, " rowData.itemId")
  //           this.yardHandlingForm.patchValue({
  //             TransactionsType: 2,
  //             WarehouseId: rowData.warehouseId,
  //             CompanyId: rowData.companyId,
  //             ItemId: rowData.itemId,
  //             CategoryId: rowData.categoryId,
  //             OrignalDatetime: rowData.orignalDatetime,
  //             Patch_BookinkRefrence: rowData.patch_BookinkRefrence,
  //             SerialNumber: rowData.serialNumber
  //           });
  //           this.yardHandlingForm.updateValueAndValidity()
  //         });

  //         // Make fields read-only except TransactionsType if needed
  //         // this.yardHandlingForm.disable();
  //         // this.yardHandlingForm.get('TransactionsType')?.enable();
  //         // this.yardHandlingForm.updateValueAndValidity();

  //         // Reset the flag after patching values
  //         // this.isProgrammaticChange = false;
  //       }
  //     }
  //   });
  // }

  typechnage() {
    const typeValue = this.yardHandlingForm.get('TransactionsType')?.value;
    if(typeValue == 1) {
      if(!this.isIn) {
        console.log("!this.isIn")
        this.yardHandlingForm.enable();
        this.yardHandlingForm.get('SerialNumber')?.reset();
        this.yardHandlingForm.get('CompanyId')?.reset();
        this.yardHandlingForm.get('Patch_BookinkRefrence')?.reset();
        this.yardHandlingForm.get('CategoryId')?.reset();
        this.yardHandlingForm.get('ItemId')?.reset();
        this.itemOptions = [];
        this.isIn = true;
      }
      
    }
    if(typeValue == 2) {
      if(this.isIn ) {
        this.yardHandlingForm.enable();
        this.yardHandlingForm.get('SerialNumber')?.reset();
        this.yardHandlingForm.get('CompanyId')?.reset();
        this.yardHandlingForm.get('Patch_BookinkRefrence')?.reset();
        this.yardHandlingForm.get('CategoryId')?.reset();
        this.yardHandlingForm.get('ItemId')?.reset();
        this.itemOptions = [];
        this.isIn = false;
      }
    }
  }
  serialchnage() {
    const typeValue = this.yardHandlingForm.get('TransactionsType')?.value;
    const serialValue = this.yardHandlingForm.get('SerialNumber')?.value;
    if(typeValue == 2 && serialValue) {
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockDetails/Get-Yard-Serial-details?Serial=${serialValue}`).subscribe({
        next: (response) => {
          if (response.success) {
            const rowData = response.returnObject;
            this.loadItemsForCompany(rowData.companyId).subscribe(() => {
              console.log(this.itemOptions, "itemOptions")
              console.log(rowData.itemId, "rowData.itemId")
              console.log(rowData, "rowData")
              console.log("============================")
              this.yardHandlingForm.patchValue({
                TransactionsType: 2,
                WarehouseId: rowData.warehouseId,
                CompanyId: rowData.companyId,
                ItemId: rowData.itemId,
                CategoryId: rowData.categoryId,
                OrignalDatetime: new Date(),
                Patch_BookinkRefrence: null,
                SerialNumber: rowData.serialNumber,
                ExistingDetailsId:rowData.id
              });
              this.yardHandlingForm.get('ItemId')?.updateValueAndValidity();
              this.yardHandlingForm.updateValueAndValidity()

              // this.makeFieldsReadOnly(['WarehouseId', 'CompanyId', 'ItemId']);
              this.refInput.nativeElement.focus();

            });
          }
        }
      });
    }
  }
  private makeFieldsReadOnly(fieldNames: string[]): void {
    fieldNames.forEach(fieldName => {
      const control = this.yardHandlingForm.get(fieldName);
      if (control) {
        control.disable({ emitEvent: false });
      }
    });
  }
  companychnage() {
    const companyValue = this.yardHandlingForm.get('CompanyId')?.value;
    if(companyValue) {
      this.loadItemsForCompany(companyValue).subscribe(() => {
        // Any additional logic to execute after items are loaded
        // console.log('Items loaded successfully for company:', companyValue);
      });
    }

  }
  itemchnage() {
    const itemValue = this.yardHandlingForm.get('ItemId')?.value;
    if(itemValue) {
      const selectedItem = this.itemOptions?.find((item: any) => item.id == itemValue);
      this.yardHandlingForm.get('CategoryId')?.setValue(selectedItem?.itemDetails[0].itemDetailPalletCategoryId)
    }
  }
  submitYardDetails(formGroup:FormGroup) {
    console.log(formGroup, " formGroup")
    if(formGroup.valid) {
      this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/Create-Yard-Handling`, [formGroup.value]).subscribe({
        next:(response) => {
          if(response.success) {
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
            this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockDetails/Get-Yard-Details`).subscribe({
              next:(response)=>{
                if(response.success) {
                  if(Array.isArray(response.returnObject))
                    this.dataSource= response.returnObject.reverse();
                  this.yardHandlingForm.get('SerialNumber')?.reset();
                  this.yardHandlingForm.get('CompanyId')?.reset();
                  this.yardHandlingForm.get('ItemId')?.reset();
                  this.yardHandlingForm.get('CategoryId')?.reset();
                  this.yardHandlingForm.get('Patch_BookinkRefrence')?.reset();
                }
              }
            })
          }else {
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
  // private loadYardSerialDetails(serial: string): void {
  //   this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockDetails/Get-Yard-Serial-details?Serial=${serial}`).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         console.log(response.returnObject, "rowData")
  //         console.log(this.count++)

  //         const rowData = response.returnObject;
  //               this.loadItemsForCompany(rowData.companyId);
  //               // Bind each returned property to the respective form control
  //               this.yardHandlingForm.patchValue({
  //                   TransactionsType: 2,
  //                   WarehouseId: rowData.warehouseId,
  //                   CompanyId: rowData.companyId,
  //                   ItemId: rowData.itemId,
  //                   CategoryId: rowData.categoryId,
  //                   OrignalDatetime: rowData.orignalDatetime,
  //                   Patch_BookinkRefrence: rowData.patch_BookinkRefrence,
  //                   SerialNumber: rowData.serialNumber
  //               });

  //               // Optionally make all fields read-only except TransactionsType if you want
  //               this.yardHandlingForm.disable(); 
  //               this.yardHandlingForm.get('TransactionsType')?.enable(); 
  //               this.yardHandlingForm.updateValueAndValidity();
  //       }
  //     }
  //   });
  // }

  onRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['warehouseId', 'companyId', 'patch_BookinkRefrence', 'serialNumber', 'itemId', 'transactionsType'];

    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
  }
  onInitNewRow(e: any) {
    e.data.orignalDatetime = new Date();
  }
  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow') {
      const transactionsTypeId = e.row?.data?.transactionsType;
      if(transactionsTypeId == 1) { //TransactionType.IN
        const companyId = e.row?.data?.companyId;
        if (companyId) {
          
          this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}/GetAllItemForCompany?companyId=${companyId}`).subscribe({
            next:(response) => {
              if(response.success) {
                if(e.row?.data?.itemId)
                  e.row.data.itemId = null;
                this.itemCodeData = response.returnObject;
                this.itemCodeData2 = this.itemCodeData
                const categoryValue = this.calculateCellCategoryValue(e.row.data);
                e.row.data.categoryId = categoryValue
              }
            }
          })
        }
      }else if(transactionsTypeId == 2){
        const serial = e.row?.data?.serialNumber;
        if (serial) {
          this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockDetails/Get-Yard-Serial-details?Serial=${serial}`).subscribe({
            next:(response) => {
              if(response.success) {
                const rowData = response.returnObject;
                e.row.data.orignalDatetime = rowData.orignalDatetime;
                e.row.data.serialNumber = rowData.serialNumber;
                e.row.data.warehouseId = rowData.warehouseId;
                e.row.data.patch_BookinkRefrence = rowData.patch_BookinkRefrence;
                e.row.data.itemId = rowData.itemId;
                e.row.data.categoryId = rowData.categoryId;
                // Refresh the row in the grid to ensure the new values are displayed
                // e.component.refresh();
              }
            }
          })
        }
      } 
    }
  }
  calculateCellCategoryValue(rowData: any) {
    const selectedItem = this.itemCodeData2?.find((item: any) => item.id === rowData.itemId);
    return selectedItem?.itemDetails[0].itemDetailPalletCategoryId;
  }
  onCellValueChanged(event: any) {
    if (event.column.dataField === 'companyId') {
        this.onCompanyChanged(event);
    }
}

onCompanyChanged(event: any) {
    const companyId = event.value;

    // Access the row data and reset itemId
    event.data.itemId = null;

    if (companyId) {
        // Fetch new item codes based on the selected company
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}/GetAllItemForCompanylookup?companyId=${companyId}`)
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.itemCodeData = response.returnObject;
                    }
                }
            });
    } else {
        // Reset itemCodeData if no company is selected
        this.itemCodeData = [];
    }
}

  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRUCK_TYPE.NAME}/${GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
                this.toaster.error(response.returnObject.split(",").join(" </br>"));
                this.dataSource = this._apihandler.getStore(
                  `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRUCK_TYPE.NAME}`,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_ALL,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.CREATE,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
                );
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
    this._filehandler.exportGrid(e, this.pagesname.TruckType);
   }
  //Using It Two Downalod File (Template)
  downloadFile() {
    this._filehandler.downloadFile(this.pagesname.TruckType, "xlsx")
  }
}
