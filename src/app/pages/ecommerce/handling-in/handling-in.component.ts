import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ApihandlerService } from "src/app/services/apihandler.service";
import { FilehandlerService } from "src/app/services/filehandler.service";
import { ToastrService } from "ngx-toastr";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { GlobalComponent } from "src/app/global-component";
import { environment } from "src/environments/environment.prod";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { number } from "echarts";
import { catchError, map, Observable, of } from "rxjs";
import { SignalRService } from "src/app/services/signal-r.service";
import { SignalRNotificationService } from "src/app/services/signal-rnotification.service";
import { timeStamp } from "console";
import { LookupVM } from "src/app/models/LookupVM";
import { CustomValidators } from "./CustomValidators";
import Swal from "sweetalert2";
const BaseCompanyURL_LookUp = "get-all-company_lookups";
const BaseStockTypeIn_LookUp = "get-allin-stockType";
const BaseWarehouseURL_LookUp = "get-all-Warehouse_lookups";
const BaseCustomerURL_LookUp = "get-all-customer_by_company_id_lookups";
const BASE_API = GlobalComponent.BASE_API;
const ITEM_CONTEROLER = GlobalComponent.Controllers.ITEM;
const ITEM_Name = ITEM_CONTEROLER.NAME;
const GET_ITEM_BY_BARCODE =
  ITEM_CONTEROLER.API_ACTIONS.GET_ITEM_BY_BARCODE_AND_COMPANY_WITH_ITEMDETAILS;
// set NODE_OPTIONS=--max-old-space-size=10240
@Component({
  selector: "app-handling-in",
  templateUrl: "./handling-in.component.html",
  styleUrls: ["./handling-in.component.scss"],
})
export class HandlingInComponent {
  readonly allowedPageSizes = [5, 10, "all"];
  readonly displayModes = [
    { text: "Display Mode 'full'", value: "full" },
    { text: "Display Mode 'compact'", value: "compact" },
  ];
  displayMode = "full";
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  companyLookUp: any;
  warehouseLookUp: any;
  trucktypeLookUp: any;
  dockLookUp: any;
  customerLookUp: any;
  itemStatusLookup: any;
  typeLookUp: any;
  vendorLookup!: LookupVM[];
  SelectedTypeValue: number = 0;
  companySelectedValue: number = 0;
  transActionId: number = 0;
  requests: string[] = [];
  isDisaled: boolean = true;
  refreshModes = ["full", "reshape", "repaint"];
  refreshMode = "reshape";
  breadCrumbItems!: Array<{}>;
  headerTransactionForm!: FormGroup;
  addnewDetailsForm!: FormGroup;
  isLoading: boolean = false;
  customerVisible = false;
  toWarehouseVisible = false;
  stockHeaderAdded = false;
  isStockDetailsCreation = false;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission: string[] | null = [];
  shiftsUserDetails: any;
  shiftAttributesArray!: FormArray<any>;
  isHeaderTransactionOperation: boolean = true;
  isHeaderTransactionOperationData: any;
  scanItemCode: string = "";
  scanSerial: string = "";
  scanItemSerial: string = "";
  ItemIsSerializedIn: boolean = false;
  ItemIsExpired: boolean = false;
  ItemScaned: boolean = false;
  ItemDapped: boolean = false;
  ItemScanedData: any;
  itemStatusValue: number = 1;
  itemsForm!: FormGroup;
  storageTypesLookup: any;
  ListOfItemDetails: any[] = [];
  StockKeppers: any[] = [];
  transactionWays: any[] = [];
  form!: FormGroup;
  dropdownSettings = {};
  dropdownListLocations: any;
  selectedLocations: any;
  priceListLookup: any;
  visible: boolean = false;
  visibleDialogs: boolean[] = [];
  scanWhQueueBarcode!: string;
  scanWhQueueBarcodeValue!: string;
  whQueueIsScaned: boolean = false;
  whQueueWarehouseId: number = 0;
  whQueueCompanyId: number = 0;
  whQueueVendorId: number = 0;
  whQueueTruckType: number = 0;
  selectedShiftDetails: any;
  palletCategoryLookups: any;
  isReadonly: boolean = false;
  newSerials: string[] = [];
  searchText: string = "";
  selectedCurrentLocations!: any[];
  truckTypeValue: number | null = null;
  refrenceNumberValue!:string;
  TruckTypeIsConatiner: boolean = false;
  visibleTransactionDetails: boolean = false;
  selectedFiles: File[] = [];

  @ViewChild("serialInput") serialInput!: ElementRef;
  @ViewChild("barCodeInput") barCodeInput!: ElementRef;
  itemsGroupedBySkuAndStatus: any = {};
  itemsGroupedBySku:any={};
  uniqueStatuses:any;
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  totalCountItemsWithId: number = 0;
  sumQuantityItemsWithId: number = 0;
  sumQuantitySerializedItemsWithId: number = 0;
  sumQuantityNotSerializedItemsWithId: number = 0;
  numberOfSerializedItemsWithId: number = 0;
  numberOfNotSerializedItemsWithId: number = 0;
  totalCountItemsWithoutId: number = 0;
  sumQuantityItemsWithoutId: number = 0;
  sumQuantitySerializedItemsWithoutId: number = 0;
  sumQuantityNotSerializedItemsWithoutId: number = 0;
  numberOfSerializedItemsWithoutId: number = 0;
  numberOfNotSerializedItemsWithoutId: number = 0;
  constructor(
    private _apihandler: ApihandlerService,
    private _filehandler: FilehandlerService,
    private toaster: ToastrService,
    private _router: Router,
    private authentication: AuthenticationService,
    private _ActivatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private signalRService: SignalRService,
    private signalRNotificationService: SignalRNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.InitialHeaderTransactionForm(null, null);
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
    this.itemsForm = new FormGroup({
      addedItems: new FormArray([]),
    });
    //Read Query Parameter For Check Is Create Transaction Or Details
    this._ActivatedRoute.params.subscribe((params) => {
      var transactionNumber = params["transactionNumber"];
      const qrCode = this._ActivatedRoute.snapshot.queryParamMap.get("qrCode");
      if (transactionNumber != undefined) {
        this.isStockDetailsCreation = true;
        this.InitialAddNewDetailsForm();
        this.getTransactionData(transactionNumber);
        this.LoadItemStatusandStorageTypeAndFreeLocations();
        this.initializeForm();
        this.GetHandlingInOperationData(transactionNumber);
      } else if (qrCode != undefined) {
        this.scanWhQueueBarcode = qrCode;
        this._apihandler
          .GetItem(
            `${GlobalComponent.BASE_API}/${
              GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME
            }/${
              GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS
                .GET_BY_BARCODE
            }/${qrCode.split("-")[2]}`
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                console.log(response.returnObject, " queueobj")
                this.scanWhQueueBarcodeValue = response.returnObject.whqueueBarCode;
                this.whQueueCompanyId = response.returnObject.whqueueCompanyId;
                this.whQueueWarehouseId =
                  response.returnObject.whqueueWarehouseId;
                this.whQueueTruckType =
                  response.returnObject.whqueueTruckTypeId;
                this.whQueueVendorId = response.returnObject.whqueueVendorId;
                const userShiftsDetails =
                  localStorage.getItem("userShiftsDetails");
                if (userShiftsDetails) {
                  this.whQueueIsScaned = true;
                  this.shiftsUserDetails = JSON.parse(userShiftsDetails);
                  this.initShiftAttributes(this.whQueueWarehouseId);
                  this.LoadedDataFromApi();
                } else {
                  this._router.navigate(["/"]);
                }
                // const userShiftsDetails = localStorage.getItem("userShiftsDetails");
                // if (userShiftsDetails) {
                //   this.shiftsUserDetails = JSON.parse(userShiftsDetails);
                //   this.InitialHeaderTransactionForm(response.returnObject.whqueueCompanyId, response.returnObject.whqueueWarehouseId);
                //   this.initShiftAttributes();
                //   this.LoadedDataFromApi().then(() => {
                //     this.patchFormValues(response.returnObject);
                //     this.isReadonly = true;
                //     // this.headerTransactionForm.get('companyId')?.disable();
                //     // this.headerTransactionForm.get('warehouseId')?.disable();
                //     // this.headerTransactionForm.get('truckType')?.disable();
                //     // if(response.returnObject.whqueueTruckTypeId == 5) {
                //     //   this.headerTransactionForm.get("sealNumber")?.setValidators(Validators.required);
                //     // }
                //     this.companySelectedValue = response.returnObject.whqueueCompanyId;
                //     this.whQueueIsScaned = true;
                //   });
                // } else {
                //   this._router.navigate(["/"]);
                // }
              }
            },
          });
      } else {
        const userShiftsDetails = localStorage.getItem("userShiftsDetails");
        if (userShiftsDetails) {
          this.shiftsUserDetails = JSON.parse(userShiftsDetails);
          this.initShiftAttributes(0);
          this.LoadedDataFromApi();
        } else {
          this._router.navigate(["/"]);
        }
      }
    });
    this.breadCrumbItems = [
      { label: "Home" },
      { label: "Handling IN", active: true },
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(
    //   this.pagesname.HandlingIN
    // );
    this.authentication.getInternalPermissionss(this.pagesname.HandlingIN).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
      },
      error:(error) => {
        this.toaster.error('Failed to retrieve permissions');
        console.error('Error retrieving permissions:', error);
      }
    })
  }
  patchFormValues(data: any) {
    this.headerTransactionForm.patchValue({
      companyId: +data.whqueueCompanyId,
      warehouseId: data.whqueueWarehouseId,
      truckType: data.whqueueTruckTypeId,
    });
  }
  showDialog(index: number) {
    this.searchText = "";
    this.visibleDialogs[index] = true;
  }
  getSerialsCount(serials: string): number {
    if (Array.isArray(serials)) return serials ? serials.length : 0;
    return serials ? serials.split(",").length : 0;
  }
  // Your form group initialization
  initializeForm() {
    this.form = this.fb.group({
      items: this.fb.array([]), // FormArray for items
    });

    // Populate the form array with existing items
    this.populateFormArray(this.ListOfItemDetails);
    this.visibleDialogs = new Array(this.items().length).fill(false);
  }
  items(): FormArray {
    return this.form.get("items") as FormArray;
  }

  scanSerialOperation() {
    if(this.scanSerial.trim() == this.scanItemCode.trim()) {
      Swal.fire({
        icon: 'error', // Icon type: 'success', 'warning', etc.
        title: 'خطأ...',
        text: "The Serial Must Be Different From BarCode / لا يمكن ان يكون السيريال نفس الباركود",
        confirmButtonText: 'Close',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false, // Prevents closing when clicking outside
        allowEscapeKey: false,    // Prevents closing with the Escape key
        allowEnterKey: false  
      }).then((result) => {
          this.barCodeInput.nativeElement.focus();
      });
    }else {
      this.addNewDetailsFormAdd(this.addnewDetailsForm);
    }
    this.ItemIsSerializedIn = false;
    this.scanItemCode = "";
    this.scanSerial = "";
  }
  populateFormArray(items: any[]) {
    const itemsFormArray = this.form.get("items") as FormArray;
    items.forEach((item) => {
      itemsFormArray.push(this.createItemFormGroup(item));
    });
  }

  calculateLocationsBasedOnPalletCategory(itemFormGroup: FormGroup): void {
    const palletCategoryId = itemFormGroup.get("palletCategory")?.value;
    const quantity = itemFormGroup.get("quantity")?.value;

    // Find the matching item detail based on the selected pallet category
    const itemDetails = this.ItemScanedData?.itemDetails?.find(
      (detail: any) => detail.itemDetailPalletCategoryId == palletCategoryId
    );
console.log(itemDetails, " itemDetails")
console.log(palletCategoryId, " palletCategoryId")
console.log(quantity, " quantity")
    if (itemDetails) {
      const tieV = Number(itemDetails.itemDetailTieVertical);
      const tieH = Number(itemDetails.itemDetailTieHorizontal);
      const high = Number(itemDetails.itemDetailHigh);
      const spc = Number(itemDetails.itemDetailSpc);
      const conversion = Number(itemDetails.itemDetailConversion);
      const storageTypeId = itemFormGroup.get("storageType")?.value;
      console.log(tieV, " => tieV");
      console.log(tieH, " => tieH");
      console.log(high, " => high");
      console.log(spc, " => spc");
      console.log(conversion, " => conversion");
      // Calculate number of locations
      const numberOfLocations = this.GetNumberOfLocation(
        quantity,
        high,
        tieV * tieH,
        spc,
        conversion,
        storageTypeId
      );
      console.log(numberOfLocations, "numberOfLocations");
      // Patch the calculated number of locations to the form group
      itemFormGroup.patchValue({ numberOfLocations });
      itemFormGroup.get("numberOfLocations")?.updateValueAndValidity();
    }
  }

  onPalletCategoryChange(event: any, index: number) {
    const selectedPalletCategoryId = event.target.value;
    const itemsFormArray = this.form.get("items") as FormArray;
    const itemFormGroup = itemsFormArray.at(index) as FormGroup;

    const itemDetails = itemFormGroup.get("itemDetails")?.value;

    // Find the selected pallet category details
    const selectedDetail = itemDetails.find(
      (detail: any) => detail.palletCategoryId == selectedPalletCategoryId
    );
    if (selectedDetail) {
      // Set values for the hidden inputs
      itemFormGroup
        .get("palletCategoryConversion")
        ?.setValue(selectedDetail.palletCategoryConversion);
      itemFormGroup
        .get("palletCategoryHigh")
        ?.setValue(selectedDetail.palletCategoryHigh);
      itemFormGroup
        .get("palletCategorySpc")
        ?.setValue(selectedDetail.palletCategorySpc);
      itemFormGroup
        .get("palletCategoryTieVertical")
        ?.setValue(selectedDetail.palletCategoryTieVertical);
      itemFormGroup
        .get("palletCategoryTieHorizontal")
        ?.setValue(selectedDetail.palletCategoryTieHorizontal);
        if(selectedDetail.palletCategoryIsBulk) {
          itemFormGroup
        .get("storageType")
        ?.setValue(1);
        itemFormGroup
        .get("numberOfLocations")
        ?.setValue(1);
        itemFormGroup.get("numberOfLocations")?.updateValueAndValidity();
        this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/Location/GrtFreeLocationForWarehouseAndStorageType?warehouseId=${this.isHeaderTransactionOperationData?.headerInfo?.warehouseId}&storageTypeId=${1}`
        )
        .subscribe(
          (response: any) => {
            if (response.success) {
              const locations = response.returnObject;
              console.log(this.items().controls, " Locations");
              this.items().controls.map((row: any) => {
                console.log(row);
                console.log(row.value.location);
                console.log(row.value.locationOptions);
              });
              this.updateLocationOptions(index, locations);
            } else {
              // Handle error
            }
          },
          (error: any) => {
            // Handle error
          }
        );
        }else {
          itemFormGroup
          .get("storageType")
          ?.enable();
        }
    }
  }
  onQuantityChanges(event: any, index: number) {
    const quantity = event.target.value;
    const itemsFormArray = this.form.get("items") as FormArray;
    const itemFormGroup = itemsFormArray.at(index) as FormGroup;
    const itemRow = itemFormGroup.value;
    if (quantity && itemRow.storageType != null && itemRow.palletCategory != null) {
      const numberOfLocations = this.GetNumberOfLocation(
        Number(itemRow?.quantity),
        Number(itemRow?.palletCategoryHigh),
        Number(itemRow?.palletCategoryTieVertical) * Number(itemRow?.palletCategoryTieHorizontal),
        Number(itemRow?.palletCategorySpc),
        Number(itemRow?.palletCategoryConversion),
        Number(itemRow.storageType)
      );
      itemFormGroup.patchValue({
        numberOfLocations
      });
    }
  }
  removeItem(index: number, rowValue:any) {
    console.log(rowValue.status)

    if(rowValue.status == 1) {
      const itemsFormArray = this.form.get("items") as FormArray;
      itemsFormArray.removeAt(index);
    }else {
      console.log(rowValue, " rowValue")
      this._apihandler.EditItem(`${GlobalComponent.BASE_API}/StockDetails/MakeStockDetailsDeleted`, rowValue.ids).subscribe({
        next:(response)=> {
          if(response.success) {
            const itemsFormArray = this.form.get("items") as FormArray;
            itemsFormArray.removeAt(index);
          }else {
            Swal.fire({
              icon: 'error', // You can change this to 'success', 'warning', etc.
              title: 'خطأ...',
              text: response.message + "\n" + response.arabicMessage,
              // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
              confirmButtonText: 'close',
              confirmButtonColor: '#3085d6',
              allowOutsideClick: false, // Prevents closing when clicking outside
              allowEscapeKey: false,    // Prevents closing with the Escape key
              allowEnterKey: false  
            });
          }
        }
      });
    }
  }
  // To submit the form and get the final object
  submitForm() {
    if (this.form.valid) {
      const items = this.form.value.items;
      // Process the final object here
    }
  }

  checkIfSerialExistsLocally(
    serial: string,
    itemsFormArray: FormArray
  ): boolean {
    let serialExists = false;
    itemsFormArray.controls.forEach((itemControl: AbstractControl) => {
      if (itemControl instanceof FormGroup) {
        const item = itemControl.value;
        if (item.serials && item.serials.includes(serial)) {
          serialExists = true;
        }
      }
    });
    return serialExists;
  }

  checkIfSerialExistsRemotely(serial: string): Observable<boolean> {
    return this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/SerialDefinations/GetSerial?serialNumber=${serial}`
      )
      .pipe(
        map((response: any) => {
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

  InitialAddNewDetailsForm() {
    //Must Change It With New Attributes
    this.addnewDetailsForm = new FormGroup({
      itemCode: new FormControl(null, Validators.required),
      itemSku: new FormControl(null),
      itemDescription: new FormControl(null),
      serial: new FormControl(null),
      // Expiration: new FormControl(null),
      // ItemStatus: new FormControl(null, Validators.required),
      // ItemImage: new FormControl(null),
      itemIsSerializedIn: new FormControl(null),
      itemIsExpiration: new FormControl(null),
      itemMinExpiredDays: new FormControl(null),
      itemId: new FormControl(null),
      itemIsBulkyStore: new FormControl(null),
      itemDetails: this.fb.array([]),
      companyId: new FormControl(null),
    });
  }

  updateLocationOptions(index: number, locations: any[]): void {
    const itemsFormArray = this.form.get("items") as FormArray;
    const itemFormGroup = itemsFormArray.at(index) as FormGroup;
    itemFormGroup.patchValue({ locationOptions: locations });
  }
  onStorageTypeChange(storageTypeId: number, index: number): void {
    const itemsFormArray = this.form.get("items") as FormArray;
    const itemFormGroup = itemsFormArray.at(index) as FormGroup;
    this.calculateLocationsBasedOnPalletCategory(itemFormGroup);
    if (storageTypeId) {
      this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/Location/GrtFreeLocationForWarehouseAndStorageType?warehouseId=${this.isHeaderTransactionOperationData?.headerInfo?.warehouseId}&storageTypeId=${storageTypeId}`
        )
        .subscribe(
          (response: any) => {
            if (response.success) {
              const locations = response.returnObject;
              console.log(this.items().controls, " Locations");
              this.items().controls.map((row: any) => {
                console.log(row);
                console.log(row.value.location);
                console.log(row.value.locationOptions);
              });
              this.updateLocationOptions(index, locations);
            } else {
              // Handle error
            }
          },
          (error: any) => {
            // Handle error
          }
        );
    }
  }
  onSelectLocationChange(locationValue: any, index: number): void {
    console.log(locationValue, " location selected");
    console.log(index, " index");
    // this.selectedCurrentLocations.push({ id: locationValue.id, index: index });
  }
  onDeSelectLocationChange(locationValue: any, index: number): void {
    console.log(locationValue, " location Deselected");
    console.log(index, " index");

    // this.selectedCurrentLocations = this.selectedCurrentLocations.filter(
    //   (loc) => loc.id !== locationValue.id || loc.index !== index
    // );
  }
  onSelectAllLocationChange(locationValue: any, index: number): void {
    console.log(locationValue, " onSelectAllLocationChange");
    console.log(index, " index");

    // this.selectedCurrentLocations = this.selectedCurrentLocations.filter(
    //   loc => loc.id !== locationValue.id || loc.index !== index
    // );
    // const selectedLocation = locationValue.map((loc:any) => {id:loc.id, index:loc.index})
  }
  onDeSelectAllLocationChange(locationValue: any, index: number): void {
    console.log(locationValue, " onDeSelectAllLocationChange");
    console.log(index, " index");

  }
  // Method to calculate the number of locations based on selected pallet category
  calculateLocations(index: number, storageTypeId: number): void {
    const itemsFormArray = this.form.get("items") as FormArray;
    const itemFormGroup = itemsFormArray.at(index) as FormGroup;

    const quantity = itemFormGroup.get("quantity")?.value;
    const palletCategoryId = itemFormGroup.get("palletCategory")?.value;
    // Find the item details matching the pallet category
    const itemDetails = this.ItemScanedData?.itemDetails?.find(
      (detail: any) => detail.itemDetailPalletCategoryId == palletCategoryId
    );
    if (itemDetails) {
      const tieV = Number(itemDetails.palletCategoryTieVertical);
      const tieH = Number(itemDetails.palletCategoryTieHorizontal);
      const high = Number(itemDetails.itemDetailHigh);
      const spc = Number(itemDetails.itemDetailSpc);
      const conversion = Number(itemDetails.itemDetailConversion);
      // Calculate number of locations based on storage type
      const numberOfLocations = this.GetNumberOfLocation(
        quantity,
        high,
        tieV * tieH,
        spc,
        conversion,
        storageTypeId
      );
      // Patch the number of locations to the form
      console.log("Number Of Locations", numberOfLocations);
      itemFormGroup.patchValue({ numberOfLocations });
    }
  }
  GetNumberOfLocation(
    quantity: number,
    high: number,
    tie: number,
    spc: number,
    conversion: number,
    storageType: number
  ): number {
    console.log(quantity, " => quantity");
    console.log(high, " => high");
    console.log(tie, " => tie");
    console.log(spc, " => spc");
    console.log(conversion, " => conversion");
    console.log(storageType, " => storageType");
    if (storageType == 2) {
      // Pallet Storage
      console.log(Math.ceil(quantity / spc), " Pallet Storage");
      return Math.ceil(quantity / spc);
    } else if (storageType == 3) {
      // Pallet Stacking Storage
      console.log(
        Math.ceil(quantity / (spc * conversion)),
        " Pallet Stacking Storage"
      );
      return Math.ceil(quantity / (spc * conversion));
    } else {
      // Bulk Storage or other types
      console.log(1, " Bulk Storage");

      return 1;
    }
  }

  // onAddButtonClick(item: any) {
  //   const row = item;
  //   row.location = row.location.map((i: any) => i.id);
  //   row.itemImage = row.itemImage?.length == 0 ? null : [item.itemImage];
  //   row.storageType = Number(row.storageType);
  //   row.priceList = Number(row.priceList);
  //   row.palletCategory = Number(row.palletCategory);
  //   row.serials = row.itemIsSerializedIn ? row.serials : null;
  //   const ListOfItems: any[] = [row];
  //   this.AddHandlingInOperation(ListOfItems, this.items());
  // }
  onFileSelected(event: any): void {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }
  onAddButtonClick(item: any) {
    this.checkForTransactionStatus().subscribe((statusCheckPassed) => {
      if (statusCheckPassed) {
        const row = item;
        row.location = row.location.map((i: any) => i.id);
        row.itemImage = row.itemImage?.length === 0 ? null : [item.itemImage];
        row.storageType = Number(row.storageType);
        row.priceList = Number(row.priceList);
        row.palletCategory = Number(row.palletCategory);
        row.serials = row.itemIsSerializedIn ? row.serials : null;
        const ListOfItems: any[] = [row];
        this.AddHandlingInOperation(ListOfItems, this.items());
      }
    });
  }
  checkForTransactionStatus(): Observable<boolean> {
    return this._apihandler
      .GetItem(`${GlobalComponent.BASE_API}/StockHeader/GetTransactionStatus/${this.isHeaderTransactionOperationData?.headerInfo?.id}`)
      .pipe(
        map((response: any) => {
          if (response.success) {
            return true;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'خطأ...',
              text: "Can't Make Any Action Because This Transaction Is Not In Progress Or Revoked, لا تستطيع عمل اي اضافه تاكد من حاله العمليه",
              confirmButtonText: 'close',
              confirmButtonColor: '#3085d6',
              allowOutsideClick: false,
              allowEscapeKey: false,
              allowEnterKey: false  
            });
            return false;
          }
        })
      );
  }


  showRowDetails(item: any) {}
  removeItemFromFormArray(itemId: number, itemsFormArray: FormArray) {
    const index = itemsFormArray.controls.findIndex(
      (control: AbstractControl) => {
        const item = control.value;
        return item.itemId === itemId;
      }
    );
    if (index !== -1) {
      itemsFormArray.removeAt(index);
    }
  }
  removeItemFromFormArrayByIds(Ids: any, itemsFormArray: FormArray) {
    const index = itemsFormArray.controls.findIndex(
      (control: AbstractControl) => {
        const item = control.value;
        return item.ids = Ids;
      }
    );
    if (index !== -1) {
      itemsFormArray.removeAt(index);
    }
  }
  GetHandlingInOperationData(transactionId: number) {
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/StockDetails/GetHandlingInOpertaionNowWithGrouping/${transactionId}`
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            const HandlingInOperationData = response.returnObject;
            HandlingInOperationData.sort((a:any, b:any) => { // This Sort For Put Revoked Row At Top In Page
              if (a.status === 7 && b.status !== 7) return 1;
              if (a.status !== 7 && b.status === 7) return -1;
              return 0;
            });
            console.log(HandlingInOperationData, " After List")

            HandlingInOperationData.forEach((item: any) => {
              this.addItem(item);
            });
          }
          
          this.cdr.detectChanges();
        },
      });
  }
  calculateMinExpirationDate(itemMinExpiredDays: number): string {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + itemMinExpiredDays);
    const minDate = currentDate.toISOString().split("T")[0];
    return minDate;
  }
  // onFileChange(event: any, index: number) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.items().at(index).patchValue({ itemImage: file });
  //   }
  // }
  // (change)="onFileChange($event, i)"
  
  AddHandlingInOperation(ListOfItems: any, itemsFormArray: FormArray) {
    console.log(ListOfItems, "Final Object");

    // Define validation flags to track issues
    let hasValidationErrors = false;
    const validationErrors: string[] = [];

    ListOfItems.forEach((item: any) => {
      // Remove unwanted properties
      if (item.hasOwnProperty("conversion")) {
        delete item.conversion;
      }
      if (item.hasOwnProperty("spcForBulk")) {
        delete item.spcForBulk;
      }
      if (item.hasOwnProperty("spcForRacks")) {
        delete item.spcForRacks;
      }
      if (item.hasOwnProperty("spcForStacking")) {
        delete item.spcForStacking;
      }

      // Ensure boolean values are correct
      item.itemIsBulkyStore =
        item.itemIsBulkyStore === null ? false : item.itemIsBulkyStore;
      item.itemIsExpiration =
        item.itemIsExpiration === null ? false : item.itemIsExpiration;
      item.itemIsSerializedIn =
        item.itemIsSerializedIn === null ? false : item.itemIsSerializedIn;
        item.ids = (item.ids == null  || item.ids == "") ? null : item.ids;
      // Validation checks

      // Check if expiration date is provided when itemIsExpiration is true
      if (item.itemIsExpiration && !item.expiration) {
        hasValidationErrors = true;
        validationErrors.push(
          `Item with SKU ${item.itemSku} must have an expiration.`
        );
      }
      // Check if expiration date is provided when itemIsExpiration is true
      if (!item.storageType) {
        hasValidationErrors = true;
        validationErrors.push(
          `Item with SKU ${item.itemSku} must have an storageType.`
        );
      }
      if (!item.palletCategory) {
        hasValidationErrors = true;
        validationErrors.push(
          `Item with SKU ${item.itemSku} must have an PalletCategory.`
        );
      }
      // Check if numberOfLocations is valid (greater than 0 and not null)
      if (!item.numberOfLocations || item.numberOfLocations <= 0) {
        hasValidationErrors = true;
        validationErrors.push(
          `Item with SKU ${item.itemSku} must have a valid number of locations greater than 0.`
        );
      }
      if (!item.location || item.location.length != item.numberOfLocations) {
        hasValidationErrors = true;
        validationErrors.push(
          `Item with SKU ${item.itemSku} must have a valid number of locations.`
        );
      }

      // Check if the number of serials matches the quantity when item is serialized
      if (
        item.itemIsSerializedIn &&
        (!item.serials || item.serials.length !== item.quantity)
      ) {
        hasValidationErrors = true;
        validationErrors.push(
          `Item with SKU ${item.itemSku} must have a number of serials equal to its quantity.`
        );
      }
    });

    // If there are validation errors, show them and stop execution
    if (hasValidationErrors) {
      Swal.fire({
        icon: 'error', // You can change this to 'success', 'warning', etc.
        title: 'خطأ...',
        text: validationErrors.join(" </br>"),
        // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
        confirmButtonText: 'close',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false, // Prevents closing when clicking outside
        allowEscapeKey: false,    // Prevents closing with the Escape key
        allowEnterKey: false  
      });
      return; // Stop the function here if validation fails
    }

    const allowedKeys = [
      "transactionId",
      "itemCode",
      "itemSku",
      "itemId",
      "companyId",
      "quantity",
      "itemStatus",
      "itemDetailId",
      "location",
      "storageType",
      "palletCategory",
      "palletCategoryHigh",
      "palletCategorySpc",
      "palletCategoryTieHorizontal",
      "palletCategoryTieVertical",
      "palletCategoryConversion",
      "itemIsSerializedIn",
      "itemIsExpiration",
      "itemIsBulkyStore",
      "itemImage",
      "serials",
      "status",
      "itemMinExpiredDays",
      "expiration",
      "id",
      "ids",
      "patchNumber",
    ];
    console.log(ListOfItems, " BeforecleanedItems")

    // Filter each item to only include allowed keys
    const cleanedItems = ListOfItems.map((item: any) => {
      return Object.keys(item).reduce((filteredItem: any, key: string) => {
        if (allowedKeys.includes(key)) {
          filteredItem[key] = item[key];
        }
        return filteredItem;
      }, {});
    });
    console.log(cleanedItems, " cleanedItems")
    const formData = new FormData();

cleanedItems.forEach((item: any, index: number) => {
  Object.entries(item).forEach(([key, value]) => {
    if (key === 'itemImage' && this.selectedFiles.length) {
      // Append each file in itemImage with the correct index notation
      this.selectedFiles.forEach((file, fileIndex) => {
        formData.append(`command[${index}].itemImage`, file, file.name);
      });
    } else if (Array.isArray(value)) {
      // For array fields (e.g., location, serials), use indexed notation
      value.forEach((v, arrayIndex) => {
        formData.append(`command[${index}].${key}[${arrayIndex}]`, String(v));
      });
    } else if (value !== null && value !== undefined) {
      // Append other key-value pairs, skipping null or undefined values
      formData.append(`command[${index}].${key}`, String(value));
    }
  });
});
    // Make the API call with the cleaned items
    this._apihandler
      .AddItem(
        `${GlobalComponent.BASE_API}/StockDetails/CreateHandlingInOpertaionNow`,
        formData
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success) {
            console.log(response.success);
            // const responseList = response.returnObject.allData;
            this.removeItemFromFormArray(ListOfItems[0].itemId, itemsFormArray);
            // Add the returned list to the form array
            // this.populateFormArray(responseList);
            const HandlingInOperationData = response.returnObject;
            console.log(HandlingInOperationData, "response")
            HandlingInOperationData.forEach((item: any) => {
              this.addItem(item);
            });
            this.cdr.detectChanges();
            if (response.returnObject.errorMessage != null && response.returnObject.errorMessage != '') {
              this.toaster.error(
                response.returnObject.errorMessage.split(",").join(" </br>")
              );
            }else {
              this.toaster.success("تم اضافه المنتج بنجاح");
            }
          } else {
            this.toaster.error(response.message);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.toaster.error(error);
        },
      });


      // ===============================
    //   console.log(ListOfItems, "Final Object")
    //   ListOfItems.forEach((item: any) => {
    //     if (item.hasOwnProperty('conversion')) {
    //       delete item.conversion;
    //     }
    //     if (item.hasOwnProperty('spcForBulk')) {
    //       delete item.spcForBulk;
    //     }
    //     if (item.hasOwnProperty('spcForRacks')) {
    //       delete item.spcForRacks;
    //     }
    //     if (item.hasOwnProperty('spcForStacking')) {
    //       delete item.spcForStacking;
    //     }
    //     item.itemIsBulkyStore = item.itemIsBulkyStore === null ? false : item.itemIsBulkyStore;
    //     item.itemIsExpiration = item.itemIsExpiration === null ? false : item.itemIsExpiration;
    //     item.itemIsSerializedIn = item.itemIsSerializedIn === null ? false : item.itemIsSerializedIn;
    //   });
    //   const allowedKeys = [
    //     'transactionId', 'itemCode', 'itemId', 'companyId', 'quantity', 'itemStatus',
    //     'itemDetailId', 'location', 'storageType', 'palletCategory', 'palletCategoryHigh',
    //     'palletCategorySpc', 'palletCategoryTieHorizontal', 'palletCategoryTieVertical',
    //     'palletCategoryConversion', 'itemIsSerializedIn', 'itemIsExpiration', 'itemIsBulkyStore',
    //     'itemImage', 'serials', 'itemMinExpiredDays', 'expiration', 'id', 'patchNumber'
    //   ];

    //   const cleanedItems = ListOfItems.map((item: any) => {
    //     return Object.keys(item).reduce((filteredItem: any, key: string) => {
    //       if (allowedKeys.includes(key)) {
    //         filteredItem[key] = item[key];
    //       }
    //       return filteredItem;
    //     }, {});
    //   });
    //   this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/CreateHandlingInOpertaionNow`, cleanedItems).subscribe({
    //     next: (response : any) => {
    //       this.isLoading = false;
    //         if(response.success) {
    //           const responseList = response.returnObject.allData;
    //           this.removeItemFromFormArray(ListOfItems[0].itemId, itemsFormArray);
    //           // Add the returned list to the form array
    //           this.populateFormArray(responseList);
    //           if(response.returnObject.errorMessage != null) {
    //             this.toaster.error(response.returnObject.errorMessage.split(",").join(" </br>"));
    //           }
    //         }else {
    //           this.toaster.error(response.message)
    //         }
    //     },
    //     error: (error: any) => {
    //       this.isLoading = false;
    //       this.toaster.error(error)
    //     }
    // });
  }
  // createItemFormGroup(item: any): FormGroup {
  //   console.log("CreateItemForGroup ==> ", item)
  //   let expirationDate = item.expiration ? new Date(item.expiration).toISOString().split('T')[0] : null;
  //   return this.fb.group({
  //     itemCode: [item.itemCode, Validators.required],
  //     serials: [item.serials],
  //     quantity: [item.quantity, Validators.required],
  //     itemStatus: [item.itemStatus],
  //     expiration: [expirationDate],
  //     storageType: [item.storageType],
  //     palletCategory: [item.palletCategory],
  //     numberOfLocations:[null],
  //     // Hidden inputs
  //     id: [item.id],
  //     conversion: [item.conversion],
  //     spcForBulk: [item.spcForBulk],
  //     spcForRacks: [item.spcForRacks],
  //     spcForStacking: [item.spcForStacking],
  //     minExpiredMonth: [item.minExpiredMonth],
  //     isExpiration: [item.isExpiration],
  //     isSerialized: [item.isSerialized],
  //     isBulkStorage: [item.isBulkStorage],
  //     isDisabledQuantity: [item.isDisabledQuantity],
  //     itemImage: [item.itemImage],
  //     transactionId: [item.transactionId],
  //     location: [item.location, Validators.required],
  //     locationOptions: [[]],
  //     itemId: [item.itemId],
  //     // priceList: [item.priceList],
  //     patchNumber: [item.patchNumber, Validators.required]
  //   });
  // }
  // scanWhQueueBarcodeOperation() {
  //   if(this.scanWhQueueBarcode) {
  //     this._apihandler.GetItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.NAME}/${GlobalComponent.Controllers.WAREHOUSE_QUEUE.API_ACTIONS.GET_BY_BARCODE}/${this.scanWhQueueBarcode.replace("RAYA-","")}`).subscribe({
  //         next:(response) => {
  //           if(response.success) {
  //             console.log('Before patchValue:', this.headerTransactionForm.value);
  //             // Check if the form control exists and is not disabled
  //             const companyIdControl = this.headerTransactionForm.get('companyId');
  //             console.log('companyId control:', companyIdControl);
  //             console.log('whqueueCompanyId:', response.returnObject.whqueueCompanyId);
  //             this.headerTransactionForm.patchValue({
  //               companyId: +response.returnObject.whqueueCompanyId,
  //               warehouseId: response.returnObject.whqueueWarehouseId,
  //               truckType: response.returnObject.whqueueTruckTypeId
  //             });
  //             console.log('after patchValue:', this.headerTransactionForm.value);

  //             this.whQueueIsScaned = true;
  //           }
  //         }
  //       })
  //   }
  // }
  initShiftAttributes(whQueueId: number) {
    this.shiftAttributesArray = this.shiftAttributes;
    this.shiftAttributesArray.clear(); // Clear previous controls
    const selectedWarehouse =
      whQueueId == 0
        ? this.shiftsUserDetails[0]
        : this.shiftsUserDetails.find(
            (shift: any) => shift.warehouseId == whQueueId
          );
    this.selectedShiftDetails = selectedWarehouse;
    if (selectedWarehouse && selectedWarehouse.shiftAttributes) {
      // this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Shift/GetAvtAttributesForOpentShiftForWarehouseUser`).subscribe({
      //   next:(response) => {
      //     console.log(response, "GetAvtAttributesForOpentShiftForWarehouseUser Hello");
      //   }
      // })
      selectedWarehouse.shiftAttributes.forEach((attribute: any) => {
        this.shiftAttributesArray.push(
          new FormGroup({
            attributeName: new FormControl({
              value: attribute.shiftDetailsId,
              disabled: true,
            }),
            maxValue: new FormControl(0, [
              Validators.required,
              Validators.max(attribute.maxValue),
              Validators.min(0),
            ]),
          })
        );
      });
    }
  }
  LoadedDataFromApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      let completedCalls = 0;
      const totalCalls = 7;

      const checkCompletion = () => {
        completedCalls++;
        if (completedCalls === totalCalls) {
          resolve(); // Resolve when all API calls are completed
        }
      };
      this._apihandler
        .GetItem(`${GlobalComponent.BASE_API}/Company/${BaseCompanyURL_LookUp}`)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.companyLookUp = response.returnObject;
              if (
                this.companyLookUp.length > 0 &&
                this.scanWhQueueBarcode == null
              ) {
                const selectedWarehouse = this.shiftsUserDetails[0];
                this.headerTransactionForm
                  .get("companyId")
                  ?.setValue(selectedWarehouse.companyId);
              } else if (this.scanWhQueueBarcode) {
                this.headerTransactionForm
                  .get("companyId")
                  ?.setValue(this.whQueueCompanyId);
                this.headerTransactionForm.get("companyId")?.disable();
              }
            }
            checkCompletion();
          },
          error: reject,
        });

      this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/Warehouse/${BaseWarehouseURL_LookUp}`
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.warehouseLookUp = response.returnObject;
              if (
                this.warehouseLookUp.length > 0 &&
                this.scanWhQueueBarcode == null
              ) {
                const selectedWarehouse = this.shiftsUserDetails[0];
                this.headerTransactionForm
                  .get("warehouseId")
                  ?.setValue(selectedWarehouse.warehouseId);
              } else if (this.scanWhQueueBarcode) {
                this.headerTransactionForm
                  .get("warehouseId")
                  ?.setValue(this.whQueueWarehouseId);
                this.headerTransactionForm.get("warehouseId")?.disable();
              }
            }
            checkCompletion();
          },
          error: reject,
        });

      this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/StockType/${BaseStockTypeIn_LookUp}`
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.typeLookUp = response.returnObject;
              if (this.scanWhQueueBarcode == null) {
                this.headerTransactionForm.get("typeId")?.setValue(null);
              }
            }
            checkCompletion();
          },
          error: reject,
        });
      this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.VENDOR.NAME}/${GlobalComponent.Controllers.VENDOR.API_ACTIONS.GET_LOOKUP}`
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.vendorLookup = response.returnObject;
              if (this.scanWhQueueBarcode) {
                this.headerTransactionForm
                  .get("vendorId")
                  ?.setValue(this.whQueueVendorId);
                this.headerTransactionForm.get("vendorId")?.disable();
              }
            }
            checkCompletion();
          },
          error: reject,
        });
      this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRUCK_TYPE.NAME}/GetAllTruckTypeLookupWithContainer`
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.trucktypeLookUp = response.returnObject;
              if (this.scanWhQueueBarcode) {
                this.headerTransactionForm
                  ?.get("truckType")
                  ?.setValue(this.whQueueTruckType);
                this.headerTransactionForm?.get("truckType")?.disable();
              }
            }
            checkCompletion();
          },
          error: reject,
        });

      this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRANSACTION_WAY.NAME}/${GlobalComponent.Controllers.TRANSACTION_WAY.API_ACTIONS.GET_LOOKUP}`
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.transactionWays = response.returnObject;
            }
            checkCompletion();
          },
          error: reject,
        });
      this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.DOCK.NAME}/${GlobalComponent.Controllers.DOCK.API_ACTIONS.GET_LOOKUP_BASED_WAREHOUSE}/${this.shiftsUserDetails[0].warehouseId}`
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.dockLookUp = response.returnObject;
            }
            checkCompletion();
          },
          error: reject,
        });
    });
  }

  GetFreeLocation(warehouseId: number) {
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/Location/GrtFreeLocationForWarehouse?warehouseId=${warehouseId}`
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.dropdownListLocations = response.returnObject;
          }
        },
      });
  }
  //   calculateItemsData(): void {
  // const itemsFormArray = this.items().controls;
  // const allItems = [...itemsFormArray];

  // const itemsGroupedBySkuAndStatus = allItems.reduce((acc: any, item) => {
  //     const sku = item.get('itemSku')?.value || 'unknown';
  //     const status = item.get('itemStatus')?.value || 'unknown';

  //     if (!acc[sku]) {
  //         acc[sku] = {};
  //     }

  //     if (!acc[sku][status]) {
  //         acc[sku][status] = [];
  //     }

  //     acc[sku][status].push(item);

  //     return acc;
  // }, {});

  // // Now, process the grouped items
  // Object.keys(itemsGroupedBySkuAndStatus).forEach(sku => {
  //     const statusGroups = itemsGroupedBySkuAndStatus[sku];

  //     Object.keys(statusGroups).forEach(status => {
  //         const group = statusGroups[status];

  //         const totalCount = group.length;
  //         const sumQuantity = group.reduce((sum: any, item: any) => sum + (item.get('quantity')?.value || 0), 0);
  //         const numberOfSerializedItems = group.filter((item: any) => item.get('itemIsSerializedIn')?.value).length;
  //         const sumQuantitySerializedItems = group
  //             .filter((item: any) => item.get('itemIsSerializedIn')?.value)
  //             .reduce((sum: any, item: any) => sum + (item.get('quantity')?.value || 0), 0);
  //         const numberOfNotSerializedItems = group.filter((item: any) => !item.get('itemIsSerializedIn')?.value).length;
  //         const sumQuantityNotSerializedItems = group
  //             .filter((item: any) => !item.get('itemIsSerializedIn')?.value)
  //             .reduce((sum: any, item: any) => sum + (item.get('quantity')?.value || 0), 0);

  //         console.log(`SKU: ${sku}, Status: ${status}`);
  //         console.log(`Count: ${totalCount}`);
  //         console.log(`Quantity: ${sumQuantity}`);
  //         console.log(`Serial Count: ${numberOfSerializedItems}`);
  //         console.log(`Serialized: ${sumQuantitySerializedItems}`);
  //         console.log(`Not Serial Count: ${numberOfNotSerializedItems}`);
  //         console.log(`Not Serialized: ${sumQuantityNotSerializedItems}`);
  //     });
  //   });
  //   //     const itemsFormArray = this.items().controls;
  // //     const itemsWithId = itemsFormArray.filter(item => item.get('id')?.value);
  // //     const itemsWithoutId = itemsFormArray.filter(item => !item.get('id')?.value);

  // //     console.log("Items Confirmed", itemsWithId)
  // //     this.totalCountItemsWithId = itemsWithId.length;
  // //     this.sumQuantityItemsWithId = itemsWithId.reduce((sum, item) => sum + (item.get('quantity')?.value || 0), 0);
  // //     this.numberOfSerializedItemsWithId = itemsWithId.filter(item => item.get('itemIsSerializedIn')?.value).length;
  // //     this.sumQuantitySerializedItemsWithId = itemsWithId
  // //     .filter(item => item.get('itemIsSerializedIn')?.value)
  // //     .reduce((sum, item) => sum + (item.get('quantity')?.value || 0), 0);
  // //     this.numberOfNotSerializedItemsWithId = itemsWithId.filter(item => !item.get('itemIsSerializedIn')?.value).length;
  // //     this.sumQuantityNotSerializedItemsWithId = itemsWithId
  // //     .filter(item => !item.get('itemIsSerializedIn')?.value)
  // //     .reduce((sum, item) => sum + (item.get('quantity')?.value || 0), 0);
  // // // -----------------------------------------------------
  // // console.log("Items Pending", itemsWithoutId)
  // //     this.totalCountItemsWithoutId = itemsWithoutId.length;
  // //     this.sumQuantityItemsWithoutId = itemsWithoutId.reduce((sum, item) => sum + (item.get('quantity')?.value || 0), 0);
  // //     this.numberOfSerializedItemsWithoutId = itemsWithoutId.filter(item => item.get('itemIsSerializedIn')?.value).length;
  // //     this.sumQuantitySerializedItemsWithoutId = itemsWithoutId
  // //     .filter(item => item.get('itemIsSerializedIn')?.value)
  // //     .reduce((sum, item) => sum + (item.get('quantity')?.value || 0), 0);
  // //     this.numberOfNotSerializedItemsWithoutId = itemsWithoutId.filter(item => !item.get('itemIsSerializedIn')?.value).length;
  // //     this.sumQuantityNotSerializedItemsWithoutId = itemsWithoutId
  // //     .filter(item => !item.get('itemIsSerializedIn')?.value)
  // //     .reduce((sum, item) => sum + (item.get('quantity')?.value || 0), 0);
  // // -------------------
  // // const itemsFormArray = this.items().controls;
  // //     const allItems = [...itemsFormArray];
  // //     const itemsGroupedBySku = allItems.reduce((acc:any, item) => {
  // //         const sku = item.get('itemSku')?.value || 'unknown';
  // //         if (!acc[sku]) {
  // //             acc[sku] = [];
  // //         }
  // //         acc[sku].push(item);
  // //         return acc;
  // //     }, {});
  // //     Object.keys(itemsGroupedBySku).forEach(sku => {
  // //         const group = itemsGroupedBySku[sku];

  // //         const totalCount = group.length;
  // //         const sumQuantity = group.reduce((sum:any, item:any) => sum + (item.get('quantity')?.value || 0), 0);
  // //         const numberOfSerializedItems = group.filter((item:any) => item.get('itemIsSerializedIn')?.value).length;
  // //         const sumQuantitySerializedItems = group
  // //             .filter((item:any) => item.get('itemIsSerializedIn')?.value)
  // //             .reduce((sum:any, item:any) => sum + (item.get('quantity')?.value || 0), 0);
  // //         const numberOfNotSerializedItems = group.filter((item:any) => !item.get('itemIsSerializedIn')?.value).length;
  // //         const sumQuantityNotSerializedItems = group
  // //             .filter((item:any) => !item.get('itemIsSerializedIn')?.value)
  // //             .reduce((sum:any, item:any) => sum + (item.get('quantity')?.value || 0), 0);
  // //         console.log(`SKU: ${sku}`);
  // //         console.log(`Count: ${totalCount}`);
  // //         console.log(`Quantity: ${sumQuantity}`);
  // //         console.log(`Serial Count: ${numberOfSerializedItems}`);
  // //         console.log(`Serialized: ${sumQuantitySerializedItems}`);
  // //         console.log(`Not Serial Count: ${numberOfNotSerializedItems}`);
  // //         console.log(`Not Serialized: ${sumQuantityNotSerializedItems}`);
  // //     });
  // // ---------------------
  //   }
  // Your existing calculateItemsData method
  // calculateItemsData(): void {
  //   const itemsFormArray = this.items().controls;
  //   const allItems = [...itemsFormArray];

  //   this.itemsGroupedBySkuAndStatus = allItems.reduce((acc: any, item) => {
  //     const sku = item.get("itemSku")?.value || "unknown";
  //     const status = item.get("itemStatus")?.value || "unknown";

  //     if (!acc[sku]) {
  //       acc[sku] = {};
  //     }

  //     if (!acc[sku][status]) {
  //       acc[sku][status] = {
  //         totalCount: 0,
  //         sumQuantity: 0,
  //         numberOfSerializedItems: 0,
  //         sumQuantitySerializedItems: 0,
  //         numberOfNotSerializedItems: 0,
  //         sumQuantityNotSerializedItems: 0,
  //       };
  //     }

  //     // Calculate the metrics for each SKU and Status combination
  //     acc[sku][status].totalCount++;
  //     acc[sku][status].sumQuantity += item.get("quantity")?.value || 0;

  //     if (item.get("itemIsSerializedIn")?.value) {
  //       acc[sku][status].numberOfSerializedItems++;
  //       acc[sku][status].sumQuantitySerializedItems +=
  //         item.get("quantity")?.value || 0;
  //     } else {
  //       acc[sku][status].numberOfNotSerializedItems++;
  //       acc[sku][status].sumQuantityNotSerializedItems +=
  //         item.get("quantity")?.value || 0;
  //     }

  //     return acc;
  //   }, {});
  // }
  calculateItemsData2(): void {
    const itemsFormArray = this.items().controls;
    const allItems = [...itemsFormArray];
  
    this.itemsGroupedBySkuAndStatus = allItems.reduce((acc: any, item) => {
      const sku = item.get("itemSku")?.value || "unknown";
      const status = item.get("itemStatus")?.value || "unknown";
  
      if (!acc[sku]) {
        acc[sku] = {};
      }
  
      if (!acc[sku][status]) {
        acc[sku][status] = {
          totalCount: 0,
          sumQuantity: 0,
          numberOfSerializedItems: 0,
          sumQuantitySerializedItems: 0,
          numberOfNotSerializedItems: 0,
          sumQuantityNotSerializedItems: 0,
        };
      }
  
      // Calculate the metrics for each SKU and Status combination
      acc[sku][status].totalCount++;
      acc[sku][status].sumQuantity += item.get("quantity")?.value || 0;
  
      if (item.get("itemIsSerializedIn")?.value) {
        acc[sku][status].numberOfSerializedItems++;
        acc[sku][status].sumQuantitySerializedItems += item.get("quantity")?.value || 0;
      } else {
        acc[sku][status].numberOfNotSerializedItems++;
        acc[sku][status].sumQuantityNotSerializedItems += item.get("quantity")?.value || 0;
      }
  
      return acc;
    }, {});
  
    // Get all the status IDs for the headers
    this.uniqueStatuses = this.itemStatusLookup.map((status:any) => status.id);
  }
  calculateItemsData(): void {
    const itemsFormArray = this.items().controls;
    const allItems = [...itemsFormArray];
    this.itemsGroupedBySku = allItems.reduce((acc: any, item) => {
      const sku = item.get("itemSku")?.value || "unknown";
      const status = item.get("itemStatus")?.value || "unknown";
      const quantity = item.get("quantity")?.value || 0;
      const isSerialized = item.get("itemIsSerializedIn")?.value || false;
      if (!acc[sku]) {
        acc[sku] = {
          totalCount: 0,
          totalQuantity: 0,
          isSerialized: false,
          statusQuantities: {}
        };
      }
      acc[sku].totalCount++;
      acc[sku].totalQuantity += quantity;
      if (isSerialized) {
        acc[sku].isSerialized = true;
      }
      if (!acc[sku].statusQuantities[status]) {
        acc[sku].statusQuantities[status] = 0;
      }
      acc[sku].statusQuantities[status] += quantity;
      return acc;
    }, {});
  }
  
  getStatusName(statusId: number): string {
    const status = this.itemStatusLookup.find((s:any) => s.id === statusId);
    return status ? status.name : 'Unknown';
  }
  showDialogTransactionDetails() {
    this.calculateItemsData();
    this.visibleTransactionDetails = true;
  }
  GetPriceList(companyId: number) {
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/PalletType/GetPriceListForCompany/${companyId}`
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.priceListLookup = response.returnObject;
          }
        },
      });
  }

  InitialHeaderTransactionForm(
    CompanyId: number | null,
    WarehouseId: number | null
  ) {
    this.headerTransactionForm = this.fb.group({
      typeId: [null, Validators.required],
      companyId: [CompanyId, Validators.required],
      warehouseId: [WarehouseId, Validators.required],
      cutomerId: [null],
      toWarehouse: [null],
      refrenceNumber: [null, Validators.required, [CustomValidators.uniqueReferenceNumber(this._apihandler)]],
      sealNumber: [null],
      containerNumber: [null],
      dockNumber: [null],
      vendorId: [null],
      truckType: [null, Validators.required],
      transactionWayId: [null, Validators.required],
      shiftAttributes: this.fb.array([]),
    });
  }
  onWarehouseSelected() {
    // Get the selected warehouse ID
    const selectedWarehouseId =
      this.headerTransactionForm.get("warehouseId")?.value;
    //Get Dock Based On Warehouse
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.DOCK.NAME}/${GlobalComponent.Controllers.DOCK.API_ACTIONS.GET_LOOKUP_BASED_WAREHOUSE}/${selectedWarehouseId}`
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.dockLookUp = response.returnObject;
          }
        },
      });
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/User/GetAllStockKeeperUsers?warehouseId=${selectedWarehouseId}`
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.StockKeppers = response.returnObject;
          }
        },
      });
    // Find the selected warehouse
    const selectedWarehouseIndex = this.shiftsUserDetails.findIndex(
      (warehouse: any) => warehouse.warehouseId == selectedWarehouseId
    );
    const selectedWarehouse = this.shiftsUserDetails[selectedWarehouseIndex];
    console.log(selectedWarehouse, " selected Warehouse Shift");
    this.selectedShiftDetails = selectedWarehouse;
    this.headerTransactionForm
      .get("companyId")
      ?.setValue(selectedWarehouse.companyId);
    // Move the selected warehouse to the front of the array
    if (selectedWarehouseIndex !== -1) {
      this.shiftsUserDetails.splice(selectedWarehouseIndex, 1); // Remove the selected warehouse from its original position
      this.shiftsUserDetails.unshift(selectedWarehouse); // Add the selected warehouse to the beginning of the array
    }
    this.shiftAttributes.clear(); // Clear previous controls
    if (selectedWarehouse && selectedWarehouse.shiftAttributes) {
      selectedWarehouse.shiftAttributes.forEach((attribute: any) => {
        this.shiftAttributes.push(
          new FormGroup({
            attributeName: new FormControl({
              value: attribute.shiftDetailsId,
              disabled: true,
            }),
            maxValue: new FormControl(0, [
              Validators.required,
              Validators.max(attribute.maxValue),
              Validators.min(0),
            ]),
          })
        );
      });
    }
  }

  TypeySelectChanged() {
    console.log(this.SelectedTypeValue, " SelectedTypeValue")
    if (this.SelectedTypeValue == 14 || this.SelectedTypeValue == 1) {
      this.toWarehouseVisible = false;
      this.customerVisible = false;
    } else if (this.SelectedTypeValue == 4) {
      this._apihandler
        .GetItem(
          `${GlobalComponent.BASE_API}/Customer/${BaseCustomerURL_LookUp}?companyId=${this.companySelectedValue}`
        )
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.customerLookUp = response.returnObject;
            }
          },
        });
      this.customerVisible = true;
      this.toWarehouseVisible = false;
    } else if (this.SelectedTypeValue == 5) {
      this.toWarehouseVisible = true;
      this.customerVisible = false;
    }else {
      this.toWarehouseVisible = false;
      this.customerVisible = false;
    }
  }
  onTruckTypeSelected() {
    // if (this.truckTypeValue == 5) {
    //   this.TruckTypeIsConatiner = true;
    //   this.containerNumber?.setValidators(Validators.required);
    //   this.containerNumber?.updateValueAndValidity();
    // } else {
    //   this.TruckTypeIsConatiner = false;
    //   this.containerNumber?.removeValidators(Validators.required);
    //   this.containerNumber?.updateValueAndValidity();
    // }
    const selectedTruckType = this.trucktypeLookUp.find((type:any) => type.id == this.truckTypeValue);
console.log(selectedTruckType, " selectedTruckType")
    if (selectedTruckType?.isContainer) {
      this.TruckTypeIsConatiner = true;
      this.sealNumber?.setValidators([Validators.required]);
      this.sealNumber?.updateValueAndValidity();

      // Set validators for containerNumber
      this.containerNumber?.setValidators([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]{11}$'), // 11 alphanumeric characters
      ]);
      this.containerNumber?.updateValueAndValidity();
    } else {
      this.TruckTypeIsConatiner = false;

      // Clear validators for sealNumber and containerNumber
      this.sealNumber?.clearValidators();
      this.sealNumber?.updateValueAndValidity();

      this.containerNumber?.clearValidators();
      this.containerNumber?.updateValueAndValidity();
    }
  }
  CreateHeaderTransaction(_formGroup: FormGroup) {
    if (_formGroup.valid) {
      this.isLoading = true;
      const formData = _formGroup.getRawValue();
      console.log(formData, " Dock Number");
      const createCommand = {
        TypeId: formData.typeId,
        CompanyId: formData.companyId,
        WarehouseId: formData.warehouseId,
        CutomerId: formData.cutomerId,
        RefrenceNumber: formData.refrenceNumber,
        StatusId: null,
        BusinessUnitId: null,
        ToWarehouse: formData.toWarehouse,
        SealNumber: formData.sealNumber,
        ContainerNumber: formData.containerNumber,
        VendorId: formData.vendorId,
        WhQueueId:
          this.scanWhQueueBarcode == undefined
            ? null
            : Number(this.scanWhQueueBarcode.split("-")[2]),
        DockNumber: formData.dockNumber,
        TruckType: formData.truckType,
        // NumberOfTruck: formData.numberOfTruck,
        // StockKeeper: formData.stockKeeper,
        TransactionWayId: formData.transactionWayId,
        UploadPath: null,
        ShiftAttributes: _formGroup
          .getRawValue()
          .shiftAttributes.map((attribute: any) => ({
            StockShiftAttributeShiftDetailsId: attribute.attributeName,
            StockShiftAttributeValue: attribute.maxValue,
          })),
      };
      console.log(createCommand, " createCommand");

      this._apihandler
        .AddItem(
          `${GlobalComponent.BASE_API}/StockHeader/CreateHeaderTransaction`,
          createCommand
        )
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            if (response.success) {
              this.toaster.success("Stock Header Added Successfully");
              this._router.navigate(["handlingIn", response.returnObject]);
              // this.InitialHeaderTransactionForm(null, null);
              // this.initShiftAttributes(this.whQueueWarehouseId);
            } else {
              this.toaster.error(response.message);
            }
          },
          error: (error: any) => {
            this.isLoading = false;
            this.toaster.error(error);
          },
        });
    }
  }
  getMaxValue(index: number): number {
    const selectedWarehouseId =
      this.headerTransactionForm.get("warehouseId")?.value;
    const selectedWarehouse = this.shiftsUserDetails.find(
      (warehouse: any) => warehouse.warehouseId == selectedWarehouseId
    );
    return selectedWarehouse
      ? selectedWarehouse.shiftAttributes[index].maxValue
      : 0;
  }

  LoadItemStatusandStorageTypeAndFreeLocations() {
    this._apihandler
      .GetItem(`${GlobalComponent.BASE_API}/StockTypeDetails/GetItemStatus`)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.itemStatusLookup = response.returnObject;
          }
        },
      });
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/StorageType/get-all-storageType_lookups`
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.storageTypesLookup = response.returnObject;
          }
        },
      });
  }
  itemStatusChanged() {
    if (this.itemStatusValue == 2) {
      this.ItemDapped = true;
      this.addnewDetailsForm.controls["itemImage"].setValidators(
        Validators.required
      );
    } else {
      this.ItemDapped = false;
      this.addnewDetailsForm.controls["itemImage"].clearValidators();
    }
  }
  scanItemSerialOperation() {}

  updateValidators() {
    if (this.addnewDetailsForm.controls["itemIsSerializedIn"].value) {
      this.addnewDetailsForm.controls["serial"].setValidators(
        Validators.required
      );
    } else {
      this.addnewDetailsForm.controls["serial"].clearValidators();
    }

    this.addnewDetailsForm.controls["serial"].updateValueAndValidity();
    // this.addnewDetailsForm.controls['Expiration'].updateValueAndValidity();
  }

  expirationDateValidator(currentDate: Date, minDate: Date) {
    return (control: FormControl): { [key: string]: boolean } | null => {
      const expirationDate = new Date(control.value);
      if (expirationDate < currentDate || expirationDate > minDate) {
        return { invalidExpirationDate: true };
      }
      return null;
    };
  }

  //Form Inputs
  get typeId() {
    return this.headerTransactionForm.get("typeId");
  }
  get companyId() {
    return this.headerTransactionForm?.get("companyId");
  }
  get sealNumber() {
    return this.headerTransactionForm?.get("sealNumber");
  }
  get warehouseId() {
    return this.headerTransactionForm?.get("warehouseId");
  }
  get cutomerId() {
    return this.headerTransactionForm?.get("cutomerId");
  }
  get toWarehouse() {
    return this.headerTransactionForm?.get("toWarehouse");
  }
  get refrenceNumber() {
    return this.headerTransactionForm?.get("refrenceNumber");
  }
  get comment() {
    return this.headerTransactionForm?.get("comment");
  }
  get truckType() {
    return this.headerTransactionForm?.get("truckType");
  }
  get whQueueId() {
    return this.headerTransactionForm?.get("whQueueId");
  }
  get dockNumber() {
    return this.headerTransactionForm?.get("dockNumber");
  }
  get containerNumber() {
    return this.headerTransactionForm?.get("containerNumber");
  }
  get numberOfTruck() {
    return this.headerTransactionForm?.get("numberOfTruck");
  }
  get stockKeeper() {
    return this.headerTransactionForm?.get("stockKeeper");
  }
  get transactionWayId() {
    return this.headerTransactionForm?.get("transactionWayId");
  }
  get uploadPath() {
    return this.headerTransactionForm?.get("uploadPath");
  }
  get shiftAttributes(): FormArray {
    return this.headerTransactionForm?.get("shiftAttributes") as FormArray;
  }
  get addedItemsFormArray() {
    return this.itemsForm?.get("addedItems") as FormArray;
  }

  /**
   * Transaction Header Details
   * Fetches transaction data and details for a given transaction ID.
   *
   * This function calls the StockHeader API to retrieve data related to the
   * specified transaction, which includes header information and transaction details.
   * On a successful response, it updates the `isHeaderTransactionOperationData`
   * variable with the retrieved data.
   *
   * @param {number} transactionId - The ID of the transaction to retrieve.
   */

  getTransactionData(transactionId: number) {
    this._apihandler
      .GetItem(
        `${BASE_API}/StockHeader/GetTransactionDataAndDetails/${transactionId}`
      )
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.isHeaderTransactionOperationData = response.returnObject;
            console.log(this.isHeaderTransactionOperationData, " hello")
            // Commented 19/9/2024
            // this.GetFreeLocation(this.isHeaderTransactionOperationData?.headerInfo?.warehouseId);
            // this.GetPriceList(this.isHeaderTransactionOperationData?.headerInfo?.companyId);
          }
        },
      });
  }
  // setTimeout(() => {
  //   this.barCodeInput.nativeElement.disabled = false;
  //   this.barCodeInput.nativeElement.focus(); // Re-focus for convenience
  // }, 1000);
  /**
   * Get Item Details By Scan Bar Code And CompanyId
   * If Found Call CheckForSerailedIn Fuction
   * Then Call setFormControlValues Fuction
   *
   */
  scanBarCodeOperation() {
    if (this.scanItemCode) {
      if (this.CheckForRowClosed(this.scanItemCode)) {
        this._apihandler
          .GetItem(
            `${BASE_API}/${ITEM_Name}/${GET_ITEM_BY_BARCODE}?barCode=${this.scanItemCode}&companyId=${this.isHeaderTransactionOperationData.headerInfo.companyId}`
          )
          .subscribe({
            next: (response: any) => {
              this.isLoading = false;
              if (response.success) {
                this.ItemScanedData = response.returnObject;
                this.palletCategoryLookups = this.ItemScanedData.itemDetails;
                this.CheckForSerailedIn(this.ItemScanedData.itemIsSerializedIn);
                this.ItemScaned = true;
                this.setFormControlValues();
                if (!this.ItemIsSerializedIn) {
                  this.addNewDetailsFormAdd(this.addnewDetailsForm);
                  setTimeout(() => {
                    this.barCodeInput.nativeElement.focus();
                  }, 0);
                }
              } else {
                this.ItemScanedData = null;
                this.ItemIsSerializedIn = false;
                this.ItemScaned = false;
                this.scanItemCode = "";
                // this.toaster.error(response.message);
                Swal.fire({
                  icon: 'error', // You can change this to 'success', 'warning', etc.
                  title: 'خطأ...',
                  text: response.message + "/" + response.arabicMessage,
                  // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
                  confirmButtonText: 'close',
                  confirmButtonColor: '#3085d6',
                  allowOutsideClick: false, // Prevents closing when clicking outside
                  allowEscapeKey: false,    // Prevents closing with the Escape key
                  allowEnterKey: false  
                }).then((result) => {
                setTimeout(() => {
                  this.barCodeInput.nativeElement.focus();
                }, 0);
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
        // this.toaster.error("يجب عليك اغلاق اخر منتج تم التقاطه");
        Swal.fire({
          icon: 'error', // You can change this to 'success', 'warning', etc.
          title: 'خطأ...',
          text: "يجب عليك اغلاق اخر منتج تم التقاطه",
          // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
          confirmButtonText: 'close',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false, // Prevents closing when clicking outside
          allowEscapeKey: false,    // Prevents closing with the Escape key
          allowEnterKey: false  
        }).then((result) => {
          setTimeout(() => {
            this.barCodeInput.nativeElement.focus();
          }, 0);
        });;
        this.ItemScanedData = null;
        this.ItemIsSerializedIn = false;
        this.ItemScaned = false;
        this.addnewDetailsForm?.get("itemCode")?.setValue(null);
      }
    } else {
      this.ItemScanedData = null;
      this.ItemIsSerializedIn = false;
      this.ItemScaned = false;
    }
  }
  /**
 * CheckForSerailedIn
 * @param {boolean} itemIsSerializedIn - check Item Is Serialized Or Not

 */
  CheckForSerailedIn(itemIsSerializedIn: boolean) {
    if (itemIsSerializedIn) {
      this.ItemIsSerializedIn = true;
      setTimeout(() => this.serialInput.nativeElement.focus(), 0);
    } else {
      this.ItemIsSerializedIn = false;
    }
  }
  /**
   * Take Item Scaned Data And Put Values In Form addnewDetailsForm (Row Data)
   */
  setFormControlValues() {
    const data = this.ItemScanedData;
    const itemDetailsArray = this.fb.array(
      data.itemDetails.map((detail: any) =>
        this.fb.group({
          palletCategoryId: [detail.itemDetailPalletCategoryId],
          palletCategoryName: [detail.categoryName],
          palletCategoryIsBulk: [detail.palletCategoryIsBulk],
          palletCategoryTieVertical: [detail.itemDetailTieVertical],
          palletCategoryTieHorizontal: [detail.itemDetailTieHorizontal],
          palletCategoryHigh: [detail.itemDetailHigh],
          palletCategorySpc: [detail.itemDetailSpc],
          palletCategoryConversion: [detail.itemDetailConversion],
        })
      )
    );
    this.addnewDetailsForm.patchValue({
      itemId: data.id,
      itemIsSerializedIn: data.itemIsSerializedIn,
      itemIsExpiration: data.itemIsExpiration,
      itemMinExpiredDays: data.itemMinExpirationDays,
      itemIsBulkyStore: data.itemIsBulky,
      companyId: this.isHeaderTransactionOperationData?.headerInfo?.companyId,
      itemSku: data.itemCode,
      itemDescription: data.description,
    });
    this.addnewDetailsForm.setControl("itemDetails", itemDetailsArray);
    this.updateValidators();
  }
  /**
 * If Item Serailized Check For Serial Is Already Found Or Not Then Call ProcessItem
 * If Not Serailzed Call ProcessItem
 * @param {FormGroup} _formGroup - Form Item

 */
  addNewDetailsFormAdd(_formGroup: FormGroup) {
    if (_formGroup.valid) {
      const row = _formGroup.value;
      const itemsFormArray = this.form.get("items") as FormArray;

      if (row.itemIsSerializedIn) {
        const serialExists = this.checkIfSerialExistsLocally(
          row.serial,
          itemsFormArray
        );

        if (serialExists) {
          Swal.fire({
            icon: 'error', // Icon type: 'success', 'warning', etc.
            title: 'خطأ...',
            text: "This Serial Is Already Found / هذا السيريال موجود بالفعل",
            confirmButtonText: 'Close',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false, // Prevents closing when clicking outside
            allowEscapeKey: false,    // Prevents closing with the Escape key
            allowEnterKey: false  
          }).then((result) => {
            this.scanSerial = "";
            this.addnewDetailsForm?.get("serial")?.setValue(null);
            setTimeout(() =>{
              
              this.barCodeInput.nativeElement.focus();
            } , 0);
          });
          
          return;
          //OldWorkCode
          // this.toaster.error("This Serial Is Already Found");

          // this.scanSerial = "";
          // this.addnewDetailsForm?.get("serial")?.setValue(null);
          // setTimeout(() => this.barCodeInput.nativeElement.focus(), 0);
          // return;
        }

        // Check serial from API
        this.checkIfSerialExistsRemotely(row.serial).subscribe({
          next: (serialExists: boolean) => {
            if (serialExists) {
              this.toaster.error("This Serial Is Already Found");
              this.scanSerial = "";
              this.addnewDetailsForm?.get("serial")?.setValue(null);
            } else {
              this.processItem(row, itemsFormArray);
              this.addnewDetailsForm?.get("serial")?.setValue(null);
            }

          },
          error: (error: any) => {
            this.isLoading = false;
            this.toaster.error(error);
          },
        });
      } else {
        this.processItem(row, itemsFormArray);
        this.addnewDetailsForm?.get("itemCode")?.setValue(null);
      }
    }
    setTimeout(() => {
      
      this.barCodeInput.nativeElement.focus()
    }, 0);
  }
  /**
 * Check For This Item Found Before Or Not
 * If Found Increase Quantity
 * If Not Found Create New Object then Send To addItem
 * @param {any} row - item row
 * @param {FormArray} itemsFormArray - All Rows Scaned

 */
  processItem(row: any, itemsFormArray: FormArray) {
    let itemFound = false;
    row.itemIsSerializedIn = row.itemIsSerializedIn??false;
    itemsFormArray.controls.forEach((itemControl: AbstractControl) => {
      if (itemControl instanceof FormGroup) {
        const item = itemControl.value;
        if(item.status === 7) {
          console.log(item.itemCode === row.itemCode, " item.itemCode === row.itemCode")
          console.log(item.itemIsSerializedIn, "itemIsSerializedIn")
          console.log(row.itemIsSerializedIn, "row.itemIsSerializedIn")
          console.log(item.itemIsSerializedIn === row.itemIsSerializedIn, " item.itemIsSerializedIn === row.itemIsSerializedIn")
          console.log(item.status === 7, " item.status === 1")
          console.log(item.itemStatus === 1, " item.itemStatus === 1")
        }
        if (
          item.itemCode === row.itemCode &&
          item.itemIsSerializedIn === row.itemIsSerializedIn &&
          // item.id === null && before wan depend on id
          (item.status === 1 || item.status === 7)  && //New Depend on status
          item.itemStatus === 1
        ) {
          item.serials = item.serials??[];
          const updatedSerials = [...item?.serials, row?.serial];
          itemControl.patchValue({
            quantity: item.quantity + 1,
            serials: updatedSerials,
          });
          itemFound = true;
          const itemRow = itemControl.value;
          if(itemRow.storageType != null && itemRow.palletCategory != null) {
            const numberOfLocations = this.GetNumberOfLocation(
              Number(itemRow?.quantity),
              Number(itemRow?.palletCategoryHigh),
              Number(itemRow?.palletCategoryTieVertical) * Number(itemRow?.palletCategoryTieHorizontal),
              Number(itemRow?.palletCategorySpc),
              Number(itemRow?.palletCategoryConversion),
              Number(itemRow.storageType)
            );
            itemControl.patchValue({
              numberOfLocations
            });
          }
        }
      }
    });
    if (!itemFound) {
      console.log(row.itemDetails, " roww");
      row.itemPalletCategories = row.itemPalletCategories ? row.itemPalletCategories : 
      row.itemDetails?.map((item:any) => ({
        id: item.palletCategoryId,
        name: item.palletCategoryName
      }))
      const newItem = {
        itemId: row.itemId,
        itemCode: row.itemCode,
        itemSku: row.itemSku,
        itemDescription: row.itemDescription,
        id: null,
        serials: row.itemIsSerializedIn ? [row.serial] : "",
        ids: row.ids ? [row.ids] : "",
        quantity: 1,
        itemStatus: 1,
        numberOfLocations: null,
        expiration: null,
        storageType: null,
        palletCategory: null,
        itemIsSerializedIn: row.itemIsSerializedIn,
        itemIsExpiration: row.itemIsExpiration,
        itemMinExpiredDays: row.itemMinExpiredDays,
        itemPalletCategories: [...row.itemPalletCategories],
        itemImage: [],
        status : 1,
        itemIsBulkyStore: row.itemIsBulkyStore,
        transactionId: this.isHeaderTransactionOperationData?.headerInfo?.id,
        location: [],
        priceList: null,
        patchNumber: null,
        itemDetails: row.itemDetails,
        companyId: this.isHeaderTransactionOperationData?.headerInfo?.companyId,
      };
      this.addItem(newItem);
    }
  }
  /**
 * Add New Item In Row 
 * @param {any} item - Form Item

 */
  addItem(item: any) {
    console.log("addItem => ", item);
    const itemsFormArray = this.form.get("items") as FormArray;
    itemsFormArray.insert(0, this.createItemFormGroup(item));
  }
  /**
   * Return Item
   * @param {any} item - Form Item
   */
  createItemFormGroup(item: any): FormGroup {
    console.log("createItemFormGroup ==> ", item);
    let expirationDate = item.expiration
      ? new Date(item.expiration).toISOString().split("T")[0]
      : null;
    const formGroup = this.fb.group({
      itemCode: [item.itemCode, Validators.required],
      itemSku: [item.itemSku],
      itemDescription: [item.itemDescription],
      serials: [item.serials],
      quantity: [item.quantity, Validators.required],
      newSerial: [""],
      searchSerial: [""],
      itemStatus: [item.itemStatus],
      expiration: [expirationDate],
      storageType: [item.storageType],
      itemDetails: [item.itemDetails],
      itemPalletCategories: [item.itemPalletCategories],
      palletCategory: [item.palletCategory, Validators.required], // Add pallet category
      numberOfLocations: [item.selectedLocation?.length],
      id: [item.id],
      ids: [item.ids],
      status: [item.status],
      conversion: [item.conversion],
      spcForBulk: [item.spcForBulk],
      spcForRacks: [item.spcForRacks],
      spcForStacking: [item.spcForStacking],
      itemMinExpiredDays: [item.itemMinExpiredDays],
      itemIsExpiration: [item.itemIsExpiration],
      itemIsSerializedIn: [item.itemIsSerializedIn],
      itemIsBulkyStore: [item.itemIsBulkyStore],
      itemImage: [item.itemImage],
      transactionId: [item.transactionId],
      location: [item.selectedLocation, Validators.required],
      locationOptions: [item.locationOptions],
      itemId: [item.itemId],
      patchNumber: [item.patchNumber, Validators.required],
      palletCategoryTieVertical: [item.palletCategoryTieVertical || ""], // Add these missing controls
      palletCategoryTieHorizontal: [item.palletCategoryTieHorizontal || ""], // Add these missing controls
      palletCategorySpc: [item.palletCategorySpc || ""], // Add these missing controls
      palletCategoryHigh: [item.palletCategoryHigh || ""], // Add these missing controls
      palletCategoryConversion: [item.palletCategoryConversion || ""],
      companyId: [item.companyId || ""],
      itemDetailId:[item.itemDetailId]
    });
    if(formGroup.get('status')?.value == 2) {
      formGroup.get('palletCategory')?.disable();
      formGroup.get('itemStatus')?.disable();
      formGroup.get('expiration')?.disable();
      formGroup.get('storageType')?.disable();
      formGroup.get('itemImage')?.disable();
    }
    // if (item.id) {
    //   formGroup.get('itemStatus')?.disable();
    //   formGroup.get('expiration')?.disable();
    //   formGroup.get('palletCategory')?.disable();
    //   formGroup.get('storageType')?.disable();
    //   formGroup.get('itemImage')?.disable();
    // }
    // Listen to changes on palletCategory or quantity to update details dynamically
    formGroup.get("palletCategory")?.valueChanges.subscribe(() => {
      this.calculateLocationsBasedOnPalletCategory(formGroup); // Update form values dynamically
    });
    console.log("the value will bind => ", formGroup.value);
    return formGroup;
  }

  addSerial(index: number): void {
    const itemsFormArray = this.form.get("items") as FormArray;
    const itemFormGroup = itemsFormArray.at(index) as FormGroup;

    const serialsControl = itemFormGroup.get("serials");
    const newSerialControl = itemFormGroup.get("newSerial"); // Access the newSerial control

    if (serialsControl && newSerialControl?.value) {
      const currentSerials = serialsControl.value || [];

      if (currentSerials.includes(newSerialControl.value)) {
        this.toaster.error("This serial is already added.");
        return;
      }

      // Add the new serial
      currentSerials.push(newSerialControl.value);

      // Update the serials and clear the new serial input
      serialsControl.setValue(currentSerials);
      newSerialControl.setValue("");

      // Update the quantity
      const quantityControl = itemFormGroup.get("quantity");
      if (quantityControl) {
        quantityControl.setValue(currentSerials.length);
      }
    }
  }

  getFilteredSerials(serials: string[]): string[] {
    // console.log(serials, this.searchText);
    // console.log(this.searchText)
    if (!this.searchText) return serials;
    return serials.filter((serial) =>
      serial.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  removeSerial(itemIndex: number, serialIndex: number): void {
    const itemsFormArray = this.form.get("items") as FormArray;
    const itemFormGroup = itemsFormArray.at(itemIndex) as FormGroup;

    const serialsControl = itemFormGroup.get("serials");
    if (serialsControl) {
      let currentSerials = serialsControl.value || [];

      // Remove the serial by index
      currentSerials.splice(serialIndex, 1);

      // Update the serials in the form control
      serialsControl.setValue(currentSerials);

      // Update the quantity
      const quantityControl = itemFormGroup.get("quantity");
      if (quantityControl) {
        quantityControl.setValue(currentSerials.length);
      }
    }
  }
  CheckForRowClosed(itemSku: string): boolean {
    const itemsFormArray = this.items().controls;
    const allItems = [...itemsFormArray];
    // const ItemsNotColsed = allItems.filter((item) => !item.value.id); Old Depened
    console.log(allItems, " allItems")
    const ItemsNotColsed = allItems.filter((item) => (item.value.status == 1 || item.value.status == 7)); //New Or Revoked
    if (ItemsNotColsed.length == 0) {
      return true;
    } else {
      return ItemsNotColsed[0].value.itemCode == itemSku;
    }
  }
  refrenceNumberEntered() {
    if(this.refrenceNumberValue) {
      console.log(this.refrenceNumberValue, " value")
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockHeader/${this.refrenceNumberValue}`).subscribe({
        next:(response) => {
          if(response.success) {

          }else {

          }
        }
      })
    }else {
      this.headerTransactionForm.get
    }
  }
  onRevokeButtonClick(RowValue:any) {
    var item = RowValue;
    console.log(item, "Hellooo")
    item.location = item.location.map((i: any) => i.id);
    item.itemImage = item.itemImage?.length == 0 ? null : [item.itemImage];
    item.storageType = Number(item.storageType);
    item.priceList = Number(item.priceList);
    item.palletCategory = Number(item.palletCategory);
    item.serials = item.itemIsSerializedIn ? item.serials : null;
    const ListOfItems: any[] = [item];
    ListOfItems.forEach((item: any) => {
      // Remove unwanted properties
      if (item.hasOwnProperty("conversion")) {
        delete item.conversion;
      }
      if (item.hasOwnProperty("spcForBulk")) {
        delete item.spcForBulk;
      }
      if (item.hasOwnProperty("spcForRacks")) {
        delete item.spcForRacks;
      }
      if (item.hasOwnProperty("spcForStacking")) {
        delete item.spcForStacking;
      }

        // Ensure boolean values are correct
        item.itemIsBulkyStore =
        item.itemIsBulkyStore === null ? false : item.itemIsBulkyStore;
        item.itemIsExpiration =
        item.itemIsExpiration === null ? false : item.itemIsExpiration;
        item.itemIsSerializedIn =
        item.itemIsSerializedIn === null ? false : item.itemIsSerializedIn;
    });


    const allowedKeys = [
      "transactionId",
      "itemCode",
      "itemSku",
      "itemId",
      "companyId",
      "quantity",
      "itemStatus",
      "itemDetailId",
      "location",
      "storageType",
      "palletCategory",
      "palletCategoryHigh",
      "palletCategorySpc",
      "palletCategoryTieHorizontal",
      "palletCategoryTieVertical",
      "palletCategoryConversion",
      "itemIsSerializedIn",
      "itemIsExpiration",
      "itemIsBulkyStore",
      "itemImage",
      "serials",
      "status",
      "itemMinExpiredDays",
      "expiration",
      "id",
      "ids",
      "patchNumber",
    ];
    console.log(ListOfItems, " BeforecleanedItems")

    const cleanedItems = ListOfItems.map((item: any) => {
      return Object.keys(item).reduce((filteredItem: any, key: string) => {
        if (allowedKeys.includes(key)) {
          filteredItem[key] = item[key];
        }
        return filteredItem;
      }, {});
    });
    console.log(cleanedItems, " cleanedItems")
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/CreateHandlingInOpertaionNow`, cleanedItems).subscribe({
      next:(response) => {
        const HandlingInOperationData = response.returnObject;
        console.log(HandlingInOperationData, "response")
        this.removeItemFromFormArrayByIds(ListOfItems[0].ids,  this.items());
        HandlingInOperationData.forEach((item: any) => {
          this.addItem(item);
        });
        this.cdr.detectChanges();
      }
    });
  }
}
