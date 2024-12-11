import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { quantityValidator } from './CustomeValidation/quantityValidator';
import Swal from 'sweetalert2';
import { catchError, map, Observable, of } from 'rxjs';
const BaseCompanyURL_LookUp = 'get-all-company_lookups';
const BaseStockTypeOut_LookUp = 'get-allout-stockType';
const BaseWarehouseURL_LookUp = 'get-all-Warehouse_lookups';
const BaseWarehouseToURL_LookUp = 'get-all-warehouseuser-or-Not';
const BaseCustomerURL_LookUp = 'get-all-customer_by_company_id_lookups';
const BaseURL_GetById = 'get-pallettype-by-id';
const BaseURL_Post = 'Create-stockHeader';
const BaseURL_Update = 'edit-pallettype';
const BaseURL_Delete = 'deleted-pallettype';
const BASE_API = GlobalComponent.BASE_API;
const ITEM_CONTEROLER = GlobalComponent.Controllers.ITEM;
const ITEM_Name = ITEM_CONTEROLER.NAME;
const GET_ITEM_BY_BARCODE =
  ITEM_CONTEROLER.API_ACTIONS.GET_ITEM_BY_BARCODE_AND_COMPANY_WITH_ITEMDETAILS;
@Component({
  selector: 'app-handling-out',
  templateUrl: './handling-out.component.html',
  styleUrls: ['./handling-out.component.scss']
})


export class HandlingOutComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  companyLookUp:any;
  warehouseLookUp:any;
  warehouseToLookUp:any;
  customerLookUp:any;
  typeLookUp:any;
  SelectedTypeValue:number = 0;
  companySelectedValue:number = 0;
  transActionId:number = 0;
  requests: string[] = [];
  isDisaled:boolean = true;
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  handlingOutForm!:FormGroup;
  isLoading:boolean = false;
  toWarehouseVisible = false;
  customerVisible = false;
  stockHeaderAdded = false;
  isStockDetailsCreation = false;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission:(string[] | null) = [];
  isHeaderTransactionOperationData:any;
  avaliablityQuantityForm!:FormGroup;
  pickedNumber:number = 0;
  AllAvailableQuantity:number = 0;
  AvailableItems:any;
  selectedItemValue:any;
  selectedItemValueFIFO:any;
  selectedItemValueFILO:any;
  // itemCodeValue:string = "";
  stockDetails: any[] = [];
  selectedItemDetails: any[] = [];
  itemForm!: FormGroup;
  itemsFIFO!: FormArray;
  itemsFILO!: FormArray;
  itemFormFIFO!: FormGroup;
  itemFormFILO!: FormGroup;
  groupedItemsByLocation: any[] = [];
  quantityError:boolean= false;
  itemIsSeializedOut:boolean = false;
  itemSerial:string = '';
  ItemScanedData: any;
  scanItemCode: string = "";
  ItemScaned: boolean = false;
  itemIsSerializedOut: boolean = false;
  addnewDetailsForm!: FormGroup;
  scanSerial: string = "";

  @ViewChild("serialInput") serialInput!: ElementRef;
  @ViewChild("barCodeInput") barCodeInput!: ElementRef;

  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService,
    private _router:Router,
    private _ActivatedRoute: ActivatedRoute,
    private fb: FormBuilder) {
    
  }
  InitialAddNewDetailsForm() {
    this.addnewDetailsForm = new FormGroup({
      itemCode: new FormControl(null, Validators.required),
      serial: new FormControl(null)
    });
  }
  scanBarCodeOperation() {
    if (this.scanItemCode) {
        this._apihandler
          .GetItem(
            `${BASE_API}/${ITEM_Name}/${GET_ITEM_BY_BARCODE}?barCode=${this.scanItemCode}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}`
          )
          .subscribe({
            next: (response: any) => {
              this.isLoading = false;
              if (response.success) {
                this.ItemScanedData = response.returnObject;
                console.log(this.ItemScanedData, " ItemScaned");
                this.CheckForSerailedIn(this.ItemScanedData.itemIsSerializedOut);
                this.ItemScaned = true;
              } else {
                this.ItemScanedData = null;
                this.itemIsSerializedOut = false;
                this.ItemScaned = false;
                this.scanItemCode = "";
                this.toaster.error(response.message);
                Swal.fire({
                  icon: 'error', // You can change this to 'success', 'warning', etc.
                  title: 'خطأ...',
                  text: response.message + "" + response.arabicMessage,
                  confirmButtonText: 'close',
                  confirmButtonColor: '#3085d6'
                });
              }
            },
            error: (error: any) => {
              this.ItemScanedData = null;
              this.isLoading = false;
              this.toaster.error(error);
            },
          });
    } else {
      Swal.fire({
        icon: 'error', // You can change this to 'success', 'warning', etc.
        title: 'خطأ...',
        text: "يجب عليك ادخال بار كود",
        confirmButtonText: 'close',
        confirmButtonColor: '#3085d6'
      });
      this.ItemScanedData = null;
      this.itemIsSerializedOut = false;
      this.ItemScaned = false;
    }
  }
  scanSerialOperation() {

    // this.itemIsSerializedOut = false;
    // this.scanItemCode = "";
    // this.scanSerial = "";
console.log(this.scanSerial, " scanSerial")
this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/SerialDefinations/GetSerialByBarCodeAndCompany?serialNumber=${this.scanSerial}&barCode=${this.scanItemCode}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}`
      ).subscribe({
        next:(response)=>{
          if(response.success) {
            this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetStockDetailsForItemByCompanyIdAndWarehouseId?itemCode=${Number(response.returnObject)}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}&warehouseId=${this.isHeaderTransactionOperationData.headerInfo.warehouseId}`).subscribe({
              next:(response) => {
                if(response.success) {
                  this.selectedItemDetails = response.returnObject;
                  console.log(this.selectedItemDetails, " selectedIyemDetails")
                  this.setItemDetails(this.selectedItemDetails);
                  this.scanItemCode = "";
                  this.scanSerial = "";
                  setTimeout(() => this.barCodeInput.nativeElement.focus(), 0);
                    // this.setFormArray(this.selectedItemDetails);
                }else {
                  this.itemIsSerializedOut = false;
                  this.scanItemCode = "";
                  this.scanSerial = "";
                  Swal.fire({
                    icon: 'error', // You can change this to 'success', 'warning', etc.
                    title: 'خطأ...',
                    text: response.message + "" + response.arabicMessage,
                    confirmButtonText: 'close',
                    confirmButtonColor: '#3085d6'
                  });
                }
              }
            })
          }else {
            Swal.fire({
              icon: 'error', // You can change this to 'success', 'warning', etc.
              title: 'خطأ...',
              text: response.message + "" + response.arabicMessage,
              confirmButtonText: 'close',
              confirmButtonColor: '#3085d6'
            });
          }
        },
        error:(err) => {
          
        }
      })

  }
  CheckForSerailedIn(itemIsSerializedIn: boolean) {
    if (itemIsSerializedIn) {
      this.itemIsSerializedOut = true;
      setTimeout(() => this.serialInput.nativeElement.focus(), 0);
    } else {
      this.itemIsSerializedOut = false;
    }
  }
  checkIfSerialExistsRemotely(serial: string): Observable<boolean> {
    console.log(serial, this.scanItemCode, this.isHeaderTransactionOperationData.headerInfo.companyId);
    return this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/SerialDefinations/GetSerialByBarCodeAndCompany?serialNumber=${serial}&barCode=${this.scanItemCode}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}`
      )
      .pipe(
        map((response: any) => {
          console.log(response, " response")
          this.isLoading = false;
          return response.success;
        }),
        catchError((error: any) => {
          this.isLoading = false;
          this.toaster.error(error);
          return of(false); // Default to false on error
        })
      );
  }
  ngOnInit(): void {
    this.InitialAddNewDetailsForm();
    // this.itemsForm = this.fb.group({
    //   items: this.fb.array([])
    // });
    this.itemFormFIFO = this.fb.group({
      items: this.fb.array([])
    });
    this.itemsFIFO = this.itemFormFIFO.get('items') as FormArray;
    this.itemFormFILO = this.fb.group({
      items: this.fb.array([])
    });
    this.itemsFILO = this.itemFormFILO.get('items') as FormArray;
    this.itemForm = this.fb.group({
      items: this.fb.array([])
    });
    this._ActivatedRoute.params.subscribe(params => {
      var transactionNumber = params['transactionNumber']
      const qrCode = this._ActivatedRoute.snapshot.queryParamMap.get('qrCode');
      if(transactionNumber != undefined) {
        this.isStockDetailsCreation = true;
        this.getTransactionData(transactionNumber);
        this.initialAvailabilityQuantityForm();
      }else if(qrCode != undefined) {
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_BY_BARCODE}/${qrCode.split("-")[2]}`).subscribe({
          next:(response) => {
            if(response.success) {
              console.log(response, " for qrCode");
              this.initialHandlingOutForm(response.returnObject.whqueueCompanyId, 
                response.returnObject.whqueueWarehouseId, true, true);
                this.companySelectedValue = response.returnObject.whqueueCompanyId;
            }
          }
        })
      }
    });
    this.initialHandlingOutForm(null, null, false, false);
    // this.handlingOutForm = new FormGroup({
    //   typeId: new FormControl(null, Validators.required),
    //   companyId: new FormControl(null, Validators.required),
    //   warehouseId: new FormControl(null, Validators.required),
    //   cutomerId: new FormControl(null),
    //   toWarehouse: new FormControl(null),
    //   refrenceNumber : new FormControl(null, Validators.required),
    // });
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/${BaseCompanyURL_LookUp}`).subscribe({
      next:(response)=>{
        if(response.success){
          this.companyLookUp = response.returnObject
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesForUser?assignedWarehouse=${true}`).subscribe({
      next:(response : any)=>{
        if(response.success){
          this.warehouseLookUp = response.returnObject
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesForUser?assignedWarehouse=${false}`).subscribe({
      next:(response : any)=>{
        if(response.success){
          this.warehouseToLookUp = response.returnObject
        }
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockType/${BaseStockTypeOut_LookUp}`).subscribe({
      next:(response : any)=>{
        if(response.success){
          console.log(response.returnObject)
          this.typeLookUp = response.returnObject
        }
      }
    })
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Handling Out', active: true }
    ];
    this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.HandlingOut)
  }
  initialHandlingOutForm(CompanyOptionalValue:(number|null), WarehouseOptionalValue:(number|null),
CompanyIsDisabled:boolean, WarehouseIsDisabled:boolean) {
    this.handlingOutForm = new FormGroup({
      typeId: new FormControl(null, Validators.required),
      companyId: new FormControl({value : CompanyOptionalValue, disabled : CompanyIsDisabled}, Validators.required),
      warehouseId: new FormControl({value : WarehouseOptionalValue, disabled: WarehouseIsDisabled}, Validators.required),
      cutomerId: new FormControl(null),
      toWarehouse: new FormControl(null),
      refrenceNumber : new FormControl(null, Validators.required),
    });
  }
  CompanySelectChanged() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Customer/${BaseCustomerURL_LookUp}?companyId=${this.companySelectedValue}`).subscribe({
      next:(response : any)=>{
        if(response.success){
          this.customerLookUp = response.returnObject
        }
      }
    })
  }

  TypeSelectChanged() {
    console.log(this.companySelectedValue, " companySelectedValue")
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Customer/${BaseCustomerURL_LookUp}?companyId=${this.companySelectedValue}`).subscribe({
      next:(response : any)=>{
        if(response.success){
          this.customerLookUp = response.returnObject
        }
      }
    })
    console.log(this.SelectedTypeValue, " SelectedTypeValue")
    if(this.SelectedTypeValue == 3){
      this.customerVisible = true;
      this.toWarehouseVisible = false;
    }else if(this.SelectedTypeValue == 6) {
      this.toWarehouseVisible = true;
      this.customerVisible = false;
    }else {
      this.toWarehouseVisible = false;
      this.customerVisible = false;
    }
  }


  exportGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.HandlingOut);
   }
   addhandlingOut(_formGroup: FormGroup) {
    this.isLoading = true;
    _formGroup.value.isHandlingIn = false;
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockHeader/${BaseURL_Post}`, _formGroup.getRawValue()).subscribe({
        next: (response : any) => {
          this.isLoading = false;
            if(response.success) {
              this.toaster.success("Stock Header Added Successfully")
              this.transActionId = response.returnObject.id;
              this.stockHeaderAdded = true;
              this._router.navigate(["/handlingOut", response.returnObject.id]);
            }else {
              this.toaster.error(response.message)
            }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.toaster.error(error)
        }
    });
}
getTransactionData(transactionId:number) {
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockHeader/GetTransactionDataAndDetails/${transactionId}`).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.isHeaderTransactionOperationData = response.returnObject;
        console.log(this.isHeaderTransactionOperationData, "Header Data");
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetItemInStockByCompanyIdAndWarehouseId?companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}&warehouseId=${this.isHeaderTransactionOperationData.headerInfo.warehouseId}`).subscribe({
          next:(response:any) => {
            if(response.success) {
              this.AvailableItems = response.returnObject;
            }
          }
        })
      }
    }
  });
}
initialAvailabilityQuantityForm() {
  this.avaliablityQuantityForm = new FormGroup({
    itemCode: new FormControl(null, Validators.required),
    neededQuantity: new FormControl(null, Validators.required)
  });
}
addManualHandlingOut(form:FormGroup) {
  if(form.valid) {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetAvailabilityQuantityInStock?ItemCode=${form.value.itemCode}&neededQuantity=${form.value.neededQuantity}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log(response.returnObject);
          this.AllAvailableQuantity = response.returnObject.allQuantity;
          this.pickedNumber = form.value.neededQuantity;
          this.stockDetails = response.returnObject.locations;
        }
      }
    });
  }
}
selectedItemChanged() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Item/GetItem/${this.selectedItemValue.id}`).subscribe({
    next:(response) => {
      if(response.success) {
        console.log(response.returnObject, " ItemSelectedData")
        if(response.returnObject.itemIsSerializedOut) {
          if(response.returnObject.itemIsSerializedIn) {
            this.itemIsSeializedOut = true;
          }else {
            this.toaster.error("This Item Is Not Serialized In, Can't HandlingOut It")
            this.itemIsSeializedOut = false;
          }
        }else {
          this.itemIsSeializedOut = false;
            this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetStockDetailsForItemByCompanyIdAndWarehouseId?itemCode=${this.selectedItemValue.id}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}&warehouseId=${this.isHeaderTransactionOperationData.headerInfo.warehouseId}`).subscribe({
              next:(response) => {
                if(response.success) {
                  this.selectedItemDetails = response.returnObject;
                  this.setItemDetails(this.selectedItemDetails);

                    // this.setFormArray(this.selectedItemDetails);
                }
              }
            })
        }
      }
    }
  })
  // console.log(this.selectedItemValue, "IN")
  // console.log(this.selectedItemValue, "IN")
  // this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetStockDetailsForItemByCompanyIdAndWarehouseId?itemCode=${this.selectedItemValue.id}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}&warehouseId=${this.isHeaderTransactionOperationData.headerInfo.warehouseId}`).subscribe({
  //   next:(response) => {
  //     if(response.success) {
  //       this.selectedItemDetails = response.returnObject;
  //       console.log(this.selectedItemDetails);
  //       this.setItemDetails(this.selectedItemDetails);

  //         // this.setFormArray(this.selectedItemDetails);
  //     }
  //   }
  // })
}
itemSerializedOutScanning() {
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.SERIAL_DEFINITIONS.NAME}/${GlobalComponent.Controllers.SERIAL_DEFINITIONS.API_ACTIONS.GET_BY_SERIAL}?serialNumber=${this.itemSerial}&itemId=${this.selectedItemValue.id}`).subscribe({
    next:(response) => {
      if(response.success) {
        console.log(response.returnObject);
            this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetStockDetailsForItemByCompanyIdAndWarehouseId?itemCode=${this.selectedItemValue.id}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}&warehouseId=${this.isHeaderTransactionOperationData.headerInfo.warehouseId}`).subscribe({
              next:(response) => {
                this.itemIsSeializedOut = false;
                this.itemSerial = '';
                if(response.success) {
                  this.selectedItemDetails = response.returnObject;
                  this.setItemDetails(this.selectedItemDetails);
                    // this.setFormArray(this.selectedItemDetails);
                }
              }
            })
      }else {
        this.itemSerial = '';
        this.toaster.error("Not Found This Serial")
      }
    }
  })
}
selectedItemChangedFIFo() {
  console.log(this.selectedItemValue)
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetStockDetailsForItemByCompanyIdAndWarehouseId?itemCode=${this.selectedItemValue.id}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}&warehouseId=${this.isHeaderTransactionOperationData.headerInfo.warehouseId}`).subscribe({
    next:(response) => {
      if(response.success) {
        this.selectedItemDetails = response.returnObject;
        console.log(this.selectedItemDetails);
        this.setItemDetails(this.selectedItemDetails);

          // this.setFormArray(this.selectedItemDetails);
      }
    }
  })
}

// setItemDetails(details: any[]): void {
//   // Get the current form array
//   const itemsArray = this.itemForm.get('items') as FormArray;

//   details.forEach(detail => {
//     // Check if the pallet already exists in the form array
//     const existingItem = itemsArray.controls.find(control => control.get('pallet')?.value === detail.pallet);

//     if (existingItem) {
//       // If pallet exists, check if inputQuantity has reached the atp value
//       const currentQuantity = existingItem.get('inputQuantity')?.value;
//       const maxAtp = existingItem.get('atp')?.value;

//       if (currentQuantity < maxAtp) {
//         // If inputQuantity is less than atp, increment inputQuantity by 1
//         existingItem.get('inputQuantity')?.setValue(currentQuantity + 1);
//       } else {
//         // If inputQuantity is equal to atp, show an error and prevent increment
//         Swal.fire({
//           icon: 'error',
//           title: 'Error...',
//           text: 'Input quantity Value cannot exceed available ATP.',
//           confirmButtonText: 'Close',
//           confirmButtonColor: '#3085d6'
//         });
//       }
//     } else {
//       // If pallet doesn't exist, add a new item with inputQuantity set to 1
//       const itemGroup = this.fb.group({
//         item_Code: [detail.item_Code],
//         itemType: [detail.itemType],
//         location: [detail.location],
//         onhand: [detail.onhand],
//         atp: [detail.atp],
//         inputQuantity: [1], // Set the initial quantity to 1 for a new item
//         pallet: [detail.pallet],
//         patchExpiryNumber: [detail.patchExpiryNumber]
//       });

//       const onhandControl = itemGroup.get('onhand') as AbstractControl;
//       itemGroup.get('inputQuantity')?.setValidators([
//         Validators.required,
//         quantityValidator(onhandControl)
//       ]);

//       itemsArray.push(itemGroup); // Add the new item group to the form array
//     }
//   });

//   this.itemForm.setControl('items', itemsArray); // Update the form array in the form
// }

// setItemDetails(details: any[]): void {
//   // Get the current form array
//   const itemsArray = this.itemForm.get('items') as FormArray;

//   details.forEach(detail => {
//     // Check if the pallet already exists in the form array
//     const existingItem = itemsArray.controls.find(control => control.get('pallet')?.value === detail.pallet);

//     if (existingItem) {
//       // If pallet exists, increment the inputQuantity by 1
//       const currentQuantity = existingItem.get('inputQuantity')?.value;
//       existingItem.get('inputQuantity')?.setValue(currentQuantity + 1);
//     } else {
//       // If pallet doesn't exist, add a new item with inputQuantity set to 1
//       const itemGroup = this.fb.group({
//         item_Code: [detail.item_Code],
//         itemType: [detail.itemType],
//         location: [detail.location],
//         onhand: [detail.onhand],
//         atp: [detail.atp],
//         inputQuantity: [1], // Set the initial quantity to 1 for a new item
//         pallet: [detail.pallet],
//         patchExpiryNumber: [detail.patchExpiryNumber]
//       });

//       const onhandControl = itemGroup.get('onhand') as AbstractControl;
//       itemGroup.get('inputQuantity')?.setValidators([
//         Validators.required,
//         quantityValidator(onhandControl)
//       ]);

//       itemsArray.push(itemGroup); // Add the new item group to the form array
//     }
//   });

//   this.itemForm.setControl('items', itemsArray); // Update the form array in the form
// }

// setItemDetails(details: any[]): void {
//   const itemControls = details.map(detail => {
//     const itemGroup = this.fb.group({
//       item_Code: [detail.item_Code],
//       itemType: [detail.itemType],
//       location: [detail.location],
//       onhand: [detail.onhand],
//       atp: [detail.atp],
//       // inputQuantity: [detail.inputQuantity, [Validators.max(detail.onhand)]],
//       inputQuantity: [0],
//       pallet: [detail.pallet],
//       patchExpiryNumber: [detail.patchExpiryNumber]
//     });

//     const onhandControl = itemGroup.get('onhand') as AbstractControl;
//     itemGroup.get('inputQuantity')?.setValidators([
//       Validators.required,
//       quantityValidator(onhandControl)
//     ]);

//     return itemGroup;
//   });

//   const itemFormArray = this.fb.array(itemControls);
//   this.itemForm.setControl('items', itemFormArray);
// }
setItemDetails(details: any[]): void {
  // Get the current form array
  const itemsArray = this.itemForm.get('items') as FormArray;

  details.forEach(detail => {
    // Check if the pallet already exists in the form array
    const existingItem = itemsArray.controls.find(control => control.get('pallet')?.value === detail.pallet);

    if (existingItem) {
      // If pallet exists, check if inputQuantity has reached the atp value
      const currentQuantity = existingItem.get('inputQuantity')?.value;
      const maxAtp = existingItem.get('atp')?.value;

      if (currentQuantity < maxAtp) {
        // If inputQuantity is less than atp, increment inputQuantity by 1
        existingItem.get('inputQuantity')?.setValue(currentQuantity + 1);
      } else {
        // If inputQuantity is equal to atp, show an error and prevent increment
        Swal.fire({
          icon: 'error',
          title: 'Error...',
          text: 'Input quantity Value cannot exceed available ATP.',
          confirmButtonText: 'Close',
          confirmButtonColor: '#3085d6'
        });
      }
    } else {
      // Check if the item is serialized
      const isSerialized = this.itemIsSerializedOut;

      // If pallet doesn't exist, add a new item with inputQuantity set to 1 or make it readonly if serialized
      const itemGroup = this.fb.group({
        item_Code: [detail.item_Code],
        itemType: [detail.itemType],
        location: [detail.location],
        onhand: [detail.onhand],
        atp: [detail.atp],
        inputQuantity: [{ value: isSerialized ? 1 : 1, disabled: isSerialized }], // Set the initial quantity to 1 and disable if serialized
        pallet: [detail.pallet],
        patchExpiryNumber: [detail.patchExpiryNumber]
      });

      const onhandControl = itemGroup.get('onhand') as AbstractControl;
      itemGroup.get('inputQuantity')?.setValidators([
        Validators.required,
        quantityValidator(onhandControl)
      ]);

      itemsArray.push(itemGroup); // Add the new item group to the form array
    }
  });

  this.itemForm.setControl('items', itemsArray); // Update the form array in the form
  this.itemIsSerializedOut = false;

}

asFormGroup(control: AbstractControl): FormGroup {
  return control as FormGroup;
}

submitForm(): void {
  const validItems = this.itemForm.value.items.filter((item:any) => item.inputQuantity > 0 && item.inputQuantity <= item.onhand);
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockTypeDetails/GetItemStatusByType?Type=${validItems[0].itemType}`).subscribe({
    next:(response) => {
      if(response.success) {
        var data = response.returnObject;
        console.log("Ok")
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Item/GetItemByItemCodeAndCompany?itemCode=${validItems[0].item_Code}&companyId=${this.isHeaderTransactionOperationData?.headerInfo?.companyId}`).subscribe({
          next:(response) => {
            if(response != null) {
              const updatedValidItems = validItems.map((item: any) => {
                const {item_Code, atp, location, ...rest } = item; 
                return {
                  ...rest,
                  itemType: data.id,
                  itemId: response.id,
                  stockHeaderId: this.isHeaderTransactionOperationData?.headerInfo?.id,
                  companyId: this.isHeaderTransactionOperationData?.headerInfo?.companyId
                };
              });
              console.log(updatedValidItems, "InsertHandlingOut")
              this._apihandler.AddItem(`${GlobalComponent.BASE_API}/HandlingOut/HandlingOutInsert`,updatedValidItems).subscribe({
                next:(response) => {
                  console.log(response, "handlingoutinsert")
                  if(response.success) {
                    console.log(response);
                    console.log(this.selectedItemValue, "OUT")
                    this.selectedItemChanged();
                  }
                }
              })
              
            }
          }
        })
        console.log("Ok3")
      }
    }
  })
}

submitFormFIFO(): void {
  var validItems = this.itemFormFIFO.value.items;
  // const validItems = this.itemForm.value.items.filter((item:any) => item.inputQuantity > 0 && item.inputQuantity <= item.onhand);
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockTypeDetails/GetItemStatusByType?Type=${validItems[0].itemType}`).subscribe({
    next:(response) => {
      if(response.success) {
        var data = response.returnObject;
        console.log("Ok")
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Item/GetItemByItemCodeAndCompany?itemCode=${validItems[0].item_Code}&companyId=${this.isHeaderTransactionOperationData?.headerInfo?.companyId}`).subscribe({
          next:(response) => {
            console.log("ok2")
            if(response != null) {
              const updatedValidItems = validItems.map((item: any) => {
                const {item_Code, atp, location, ...rest } = item; 
                return {
                  ...rest,
                  itemType: data.id,
                  itemId: response.id,
                  stockHeaderId: this.isHeaderTransactionOperationData?.headerInfo?.id,
                  companyId: this.isHeaderTransactionOperationData?.headerInfo?.companyId
                };
              });
              this._apihandler.AddItem(`${GlobalComponent.BASE_API}/HandlingOut/HandlingOutInsert`,updatedValidItems).subscribe({
                next:(response) => {
                  if(response.success) {
                    console.log(response.returnObject)
                    var results = response.returnObject;
                    
                    // var jsonValidList = JSON.stringify(validItems);
                    // localStorage.setItem("hanldingOutPrint", jsonValidList);
                    // this._router.navigate([]).then((result) => {
                    //   const basePath = window.location.origin + window.location.pathname;
                    //   const barcodePath = `#/handlingOutPrint`;
                    //   const fullUrl = `${basePath}${barcodePath}`;
                    //   window.open(fullUrl, '_blank');
                    // });
                  }
                }
              })
              
            }
          }
        })
        console.log("Ok3")
      }
    }
  })
}
submitFormFILO(): void {
  const validItems = this.itemForm.value.items.filter((item:any) => item.inputQuantity > 0 && item.inputQuantity <= item.onhand);
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockTypeDetails/GetItemStatusByType?Type=${validItems[0].itemType}`).subscribe({
    next:(response) => {
      if(response.success) {
        var data = response.returnObject;
        console.log("Ok")
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Item/GetItemByItemCodeAndCompany?itemCode=${validItems[0].item_Code}&companyId=${this.isHeaderTransactionOperationData?.headerInfo?.companyId}`).subscribe({
          next:(response) => {
            console.log("ok2")
            if(response != null) {
              const updatedValidItems = validItems.map((item: any) => {
                const {item_Code, atp, location, ...rest } = item; 
                return {
                  ...rest,
                  itemType: data.id,
                  itemId: response.id,
                  stockHeaderId: this.isHeaderTransactionOperationData?.headerInfo?.id,
                  companyId: this.isHeaderTransactionOperationData?.headerInfo?.companyId
                };
              });
              this._apihandler.AddItem(`${GlobalComponent.BASE_API}/HandlingOut/HandlingOutInsert`,updatedValidItems).subscribe({
                next:(response) => {
                  if(response.success) {
                    console.log(response);
                  }
                }
              })
              
            }
          }
        })
        console.log("Ok3")
      }
    }
  })
}
createItemFormGroup(item: any): FormGroup {
  console.log(item, "Iteeeeem")
  return this.fb.group({
    item_Code: [item.item_Code],
    itemType: [item.itemType],
    pallet: [item.pallet],
    patchExpiryNumber: [item.patchExpiryNumber],
    onhand: [item.onhand],
    location: [item.location],
    // inputQuantity: ['', [Validators.required, this.validateQuantity(item.Onhand)]],
    atp: [item.atp]
  });
}

// Function to validate input quantity
validateQuantity(onhand: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const quantity = control.value;
    return quantity > onhand ? { quantityExceeds: true } : null;
  };
}
FIFOSubmitHeader() {
  var Quantity = document.getElementById("FifoQuantity");
  if (Quantity !== null) {
    const quantity = Quantity as HTMLInputElement;
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetStockDetailsForItemByCompanyIdAndWarehouseIdWithMasterData?quantity=${quantity.value}&itemCode=${this.selectedItemValueFIFO.id}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}&warehouseId=${this.isHeaderTransactionOperationData.headerInfo.warehouseId}&firstOut=true`).subscribe({
      next: (response) => {
        if (response.success) {
          this.quantityError = false;
          var list = response.returnObject;
          console.log(list, "our List");
          // Clear the FormArray before adding new items
          this.itemsFIFO.clear();
          // Iterate over the list and add FormGroups
          list.forEach((item: any) => {
            this.itemsFIFO.push(this.createItemFormGroup(item));
          });
          console.log(this.itemsFIFO, "formsssss");
        } else {
          this.quantityError = true;
        }
      }
    });
  }
}
FILOSubmitHeader() {
  var Quantity = document.getElementById("FiloQuantity");
  if (Quantity !== null) {
    const quantity = Quantity as HTMLInputElement;
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/HandlingOut/GetStockDetailsForItemByCompanyIdAndWarehouseIdWithMasterData?quantity=${quantity.value}&itemCode=${this.selectedItemValueFILO.id}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}&warehouseId=${this.isHeaderTransactionOperationData.headerInfo.warehouseId}&firstOut=false`).subscribe({
      next: (response) => {
        if (response.success) {
          this.quantityError = false;
          var list = response.returnObject;
          console.log(list, "our List");
          // Clear the FormArray before adding new items
          this.itemsFILO.clear();
          // Iterate over the list and add FormGroups
          list.forEach((item: any) => {
            this.itemsFILO.push(this.createItemFormGroup(item));
          });
          console.log(this.itemsFILO, "formsssss");
        } else {
          this.quantityError = true;
        }
      }
    });
  }
}

get items(): FormArray {
  return this.itemForm.get('items') as FormArray;
}
  get typeId() {
    return this.handlingOutForm.get('typeId');
  }
  get companyId() {
    return this.handlingOutForm.get('companyId');
  }
  get warehouseId() {
    return this.handlingOutForm.get('warehouseId');
  }
  get cutomerId() {
    return this.handlingOutForm.get('cutomerId');
  }
  get toWarehouse() {
    return this.handlingOutForm.get('toWarehouse');
  }
  get refrenceNumber() {
    return this.handlingOutForm.get('refrenceNumber');
  }
  get comment() {
    return this.handlingOutForm.get('comment');
  }
  get uploadPath() {
    return this.handlingOutForm.get('uploadPath');
  }
}
