import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DxDataGridComponent, DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';


const BASE_API = GlobalComponent.BASE_API;
const WAREHOUE = GlobalComponent.Controllers.WAREHOUSE.NAME;
const WAREHOUE_ALL = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.GET_ALL_WAREHOUSE;
const WAREHOUSE_BY_ID = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.GET_BY_ID;
const WAREHOUE_CREATE = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.CREATE;
const WAREHOUE_CREATE_LIST = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.CREATE_LIST;
const WAREHOUE_EDIT = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.EDIT;
const WAREHOUE_DELETE = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.DELETE;
const WAREHOUE_LOOKUPT = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.GET_LOOKUP + '?IsActiveOnly=true';
const DOCK = GlobalComponent.Controllers.DOCK.NAME;
const DOCK_ALL = GlobalComponent.Controllers.DOCK.API_ACTIONS.GET_ALL;
const DOCK_BY_ID = GlobalComponent.Controllers.DOCK.API_ACTIONS.GET_BY_ID;
const DOCK_CREATE = GlobalComponent.Controllers.DOCK.API_ACTIONS.CREATE;
const DOCK_CREATE_LIST = GlobalComponent.Controllers.DOCK.API_ACTIONS.CREATE_LIST;
const DOCK_EDIT = GlobalComponent.Controllers.DOCK.API_ACTIONS.EDIT;

@Component({
  selector: 'app-warehouse-configuration',
  templateUrl: './warehouse-configuration.component.html',
  styleUrls: ['./warehouse-configuration.component.scss']
})
export class WarehouseConfigurationComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  dropDownOptions = { width: 500 };
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:any;
  permissionIsLoadded:boolean = false;
  warehouseData!: CustomStore;
  warehouseLookupData!: CustomStore;
  dockData!: CustomStore;
  aiselSource!: CustomStore;
  positionColumnSource!: CustomStore;
  positionLevelSource!: CustomStore;
  positionDirectionSource!: CustomStore;
  positionSource!: CustomStore;
  StorageTypeData!: CustomStore;
  AisleLookupData!: CustomStore;
  PositionDirectionLookupData!: CustomStore;
  locationSource!: CustomStore;
  storageTypeData!: CustomStore;
  aisleData!: CustomStore;
  directionData!: CustomStore;
  positionData!: CustomStore;
  levelData!: CustomStore;
  columnData!: CustomStore;
  unitofmeasureForm!:FormGroup;
  classLookupData!: any;
  basicLookData!: any;
  locationForm!: FormGroup;
  warehouseSelectedValue: any = null;
  storageTypeSelectedValue: any = null;
  aisleSelectedValue: any = null;
  positionDirectionSelectedValue: any = null;
  warehouseLookUp : any;
  storageTypeLookUp : any; 
  aisleLookUp : any; 
  positionDirectionLookUp : any; 
  positionLookUp : any; 
  levelLookUp : any;
  columnLookUp : any;
  apiError: string = '';
  isLoading: boolean = false;
  inputValue = "T3ERHB";
  inputValue2 = "";
  locationCode="";
  LocationFilterForm!: FormGroup;

////////////////////////
palletTypeSource!: CustomStore;
  companyData!: CustomStore;
  palletCategoryData!: CustomStore;
  storageTypeLookupData!: CustomStore;
  aisleLookupData!: CustomStore;
  directionLookupData!: CustomStore;
  companyLookUp:any;
  palletCategoryLookUp:any;
  warehousePriceLookUp:any;
  palletCategory99SelectedValue:any;
  storageTypePriceSelectedValue:any;
  palletCategory1SelectedValue:any;
  palletCategory2SelectedValue:any;
  palletCategory3SelectedValue:any;
  selectStorageTypeValue:any;
  isFixedValue:any;
  isDisaled:boolean = true;
  priceListForm!:FormGroup;

  
  constructor(private _router:Router, private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService,
    private toaster : ToastrService,
    private authentication:AuthenticationService,
    private fb: FormBuilder) {
  }
  ngOnInit(): void {
    this.initialWarehouseData();
    this.initialDock();
    this.initialAisle();
    this.initialPositionColumn();
    this.initialPositionLevel();
    this.initialPositionDirection();
    this.initialPositionData();
    this.initialLocation();
    this.initialPriceList();
    this.breadCrumbItems = [
      { label: "Home" },
      { label: "Warehouse Configuration", active: true },
    ];
    const pageNamesArray = [this.pagesname.Warehouse, this.pagesname.Dock, this.pagesname.Aisles, this.pagesname.PositionColumn,
      this.pagesname.PositionColumn,this.pagesname.PositionLevel, this.pagesname.PositionDirection, this.pagesname.Position, this.pagesname.Locations,
      this.pagesname.PriceList];

    this.authentication.getPagesInternalPermissions(pageNamesArray).subscribe({
        next: (permissions) => {
            this.internalPermission = permissions;
            this.permissionIsLoadded = true;
        },
        error: (error) => {
            this.toaster.error('Failed to retrieve permissions');
            console.error('Error retrieving permissions:', error);
        }
    });
  }

// WareHouse Configuration
initialWarehouseData() {
  this.warehouseData = this._apihandler.getStore(`${BASE_API}/${WAREHOUE}`, WAREHOUE_ALL,WAREHOUSE_BY_ID,WAREHOUE_CREATE,
    WAREHOUE_EDIT,WAREHOUE_DELETE);
}
onWarehouseRowValidating(event: any) {
  const data = { ...event.oldData, ...event.newData };
  const requiredFields = ['warehouseName', 'address', 'width', 'height', 'length'];
  const numericFields = ['width', 'height', 'length'];

  for (const field of requiredFields) {
    if (data[field] === undefined) {
      event.isValid = false;
      event.errorText = `You must enter ${field}`;
      return;
    }
  }

  for (const field of numericFields) {
    if (data[field] === undefined || data[field] < 0) {
      event.isValid = false;
      event.errorText = `You must enter ${field} and start from zero`;
      return;
    }
  }
}
onWarehouseFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        console.log('JSON data:', jsonData);
        this._apihandler.AddItem(`${BASE_API}/${WAREHOUE}/${WAREHOUE_CREATE_LIST}`, jsonData).subscribe({
          next:(response)=>{
            if(response.success) {
              Swal.fire({
                icon: 'success',
                title: 'نجاح!',
                text: "تم رفع جميع المخازن بنجاح",
                confirmButtonText: 'اغلاق',
                confirmButtonColor: '#3085d6'
              });
            }
            else {
              Swal.fire({
                icon: 'error', // You can change this to 'success', 'warning', etc.
                title: 'خطأ...',
                text: response.returnObject.split(","),
                // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
                confirmButtonText: 'اغلاق',
                confirmButtonColor: '#3085d6'
              });
            }
            this.initialWarehouseData();
          },
          error:(e) =>{
            Swal.fire({
              icon: 'error', // You can change this to 'success', 'warning', etc.
              title: 'خطأ...',
              text: "من فضلك المحاولة مرة اخري او الرجوع اللي الفريق التقني",
              // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
              confirmButtonText: 'اغلاق',
              confirmButtonColor: '#3085d6'
            });
          }
        })
      })
      .catch(error => {
        Swal.fire({
          icon: 'error', // You can change this to 'success', 'warning', etc.
          title: 'خطأ...',
          text: "من فضلك المحاولة مرة اخري او الرجوع اللي الفريق التقني",
          // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
          confirmButtonText: 'اغلاق',
          confirmButtonColor: '#3085d6'
        });
      });
  }
}
exportWarehouseGrid(e:any) {
  this._filehandler.exportGrid(e, this.pagesname.Warehouse);
 }
downloadWarehouseFile() {
  // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
  const filename = `${this.pagesname.Warehouse}.xlsx`;
  const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
  fetch(filepath)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, filename); // Save file using file-saver library
    })
    .catch(error => console.error('Error downloading file:', error));
}

// Dock Configuration
initialDock() {
  this.dockData = this._apihandler.getStore(
    `${BASE_API}/${DOCK}`,
    DOCK_ALL,
    DOCK_BY_ID,
    DOCK_CREATE,
    DOCK_EDIT,
    ''
  );
  this.warehouseLookupData = this._apihandler.getStore(`${BASE_API}/${WAREHOUE}`, WAREHOUE_LOOKUPT,"","",
    "","")
}
onDockRowValidating(event: any) {
  const data = { ...event.oldData, ...event.newData };
  const requiredFields = ['dockName'];

  for (const field of requiredFields) {
    if (data[field] === undefined) {
      event.isValid = false;
      event.errorText = `You must enter ${field}`;
      return;
    }
  }
}

onDockFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        console.log('JSON data:', jsonData);
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.DOCK.NAME}/${GlobalComponent.Controllers.DOCK.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
          next:(response)=>{
            if(response.success)
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
            else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dockData = this._apihandler.getStore(
                `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.DOCK.NAME}`,
                GlobalComponent.Controllers.DOCK.API_ACTIONS.GET_ALL,
                GlobalComponent.Controllers.DOCK.API_ACTIONS.GET_BY_ID,
                GlobalComponent.Controllers.DOCK.API_ACTIONS.CREATE,
                GlobalComponent.Controllers.DOCK.API_ACTIONS.EDIT,
                GlobalComponent.Controllers.DOCK.API_ACTIONS.DELETE
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
exportDockGrid(e:any) {
  this._filehandler.exportGrid(e, this.pagesname.Dock);
 }
//Using It Two Downalod File (Template)
downloadDockFile() {
  this._filehandler.downloadFile(this.pagesname.Dock, "xlsx")
}


// Aisle Configuration
initialAisle() {
  this.aiselSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Aisle`, 'get-all-aisle','get-aisle-by-id','Create-aisle',
    'edit-aisle','');
}
onAisleRowValidating(event: any) {
  const data = { ...event.oldData, ...event.newData };
  const requiredFields = ['warehouseId', 'code', 'width', 'length'];
  const numericFields = ['width', 'length'];

  for (const field of requiredFields) {
    if (data[field] === undefined) {
      event.isValid = false;
      event.errorText = `You must enter ${field}`;
      return;
    }
  }

  for (const field of numericFields) {
    if (data[field] === undefined || data[field] <= 0) {
      event.isValid = false;
      event.errorText = `You must enter ${field} and greater than zero`;
      return;
    }
  }
}

onAisleFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Aisle/Create-list-aisle`, jsonData).subscribe({
          next:(response)=>{
            if(response.success)
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
            else
            this.toaster.error(response.returnObject.split(",").join(" </br>"));
            this.aiselSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Aisle`, 'get-all-aisle','get-aisle-by-id','Create-aisle',
              'edit-aisle','');
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
exportAisleGrid(e:any) {
  this._filehandler.exportGrid(e, this.pagesname.Aisles);
 }
// Function to handle file download
downloadAisleFile() {
  // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
  const filename = `${this.pagesname.Aisles}.xlsx`;
  const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
  fetch(filepath)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, filename); // Save file using file-saver library
    })
    .catch(error => console.error('Error downloading file:', error));
}

// Position Column Configuration

initialPositionColumn() {
  this.positionColumnSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionColumn`, 'get-all-positionColumn','get-positionColumn-by-id','Create-PositionColumn',
    'edit-positionColumn','');
}

onPositionColumnRowValidating(event: any) {
  const data = { ...event.oldData, ...event.newData };
  const requiredFields = ['code', 'description'];

  for (const field of requiredFields) {
    if (data[field] === undefined) {
      event.isValid = false;
      event.errorText = `You must enter ${field}`;
      return;
    }
  }
}
onPositionColumnFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        console.log('JSON data:', jsonData);
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/PositionColumn/Create-list-positionColumn`, jsonData).subscribe({
          next:(response)=>{
            if(response.success)
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
            else
            this.toaster.error(response.returnObject.split(",").join(" </br>"));
            this.positionColumnSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionColumn`, 'get-all-positionColumn','get-positionColumn-by-id','Create-PositionColumn',
              'edit-positionColumn','');
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
exportPositionColumnGrid(e:any) {
  this._filehandler.exportGrid(e, this.pagesname.PositionColumn);
 }
// Function to handle file download
downloadPositionColumnFile() {
  // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
  const filename = `${this.pagesname.PositionColumn}.xlsx`;
  const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
  fetch(filepath)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, filename); // Save file using file-saver library
    })
    .catch(error => console.error('Error downloading file:', error));
}


// Position Level Configuration
initialPositionLevel() {
  this.positionLevelSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionLevel`, 'get-all-positionLevel','get-positionLevel-by-id','Create-positionLevel',
    'edit-positionLevel','');
}
onPositionLevelRowValidating(event: any) {
  const data = { ...event.oldData, ...event.newData };
  const requiredFields = ['code', 'description'];
  console.log(data)
  for (const field of requiredFields) {
    if (data[field] === undefined) {
      event.isValid = false;
      event.errorText = `You must enter ${field}`;
      return;
    }
  }
}

onPositionLevelFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        console.log('JSON data:', jsonData);
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/PositionLevel/Create-list-positionLevel`, jsonData).subscribe({
          next:(response)=>{
            if(response.success)
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
            else
            this.toaster.error(response.returnObject.split(",").join(" </br>"));
            this.positionLevelSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionLevel`, 'get-all-positionLevel','get-positionLevel-by-id','Create-positionLevel',
              'edit-positionLevel','');
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
exportPositionLevelGrid(e:any) {
  this._filehandler.exportGrid(e, this.pagesname.PositionLevel);
 }
// Function to handle file download
downloadPositionLevelFile() {
  // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
  const filename = `${this.pagesname.PositionLevel}.xlsx`;
  const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
  fetch(filepath)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, filename); // Save file using file-saver library
    })
    .catch(error => console.error('Error downloading file:', error));
}



// Position Direction Configuration
initialPositionDirection() {
  this.positionDirectionSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionDirection`, 'get-all-positionDirection','get-positionDirection-by-id','Create-positionDirection',
    'edit-positionDirection','')
}
onPositionDirectionRowValidating(event: any) {
  const data = { ...event.oldData, ...event.newData };
  const requiredFields = ["code", "description"];
  for (const field of requiredFields) {
    if (data[field] === undefined) {
      event.isValid = false;
      event.errorText = `You must enter ${field}`;
      return;
    }
  }
}
onPositionDirectionFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler
      .getjsonDataFromFile(file)
      .then((jsonData) => {
        console.log("JSON data:", jsonData);
        this._apihandler
          .AddItem(
            `${GlobalComponent.BASE_API}/PositionDirection/Create-list-positionDirection`,
            jsonData
          )
          .subscribe({
            next: (response) => {
              if (response.success)
                this.toaster.success(
                  response.returnObject.split(",").join(" </br>")
                );
              else
                this.toaster.error(
                  response.returnObject.split(",").join(" </br>")
                );
                this.positionDirectionSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionDirection`, 'get-all-positionDirection','get-positionDirection-by-id','Create-positionDirection',
                  'edit-positionDirection','')
            },
            error: (e) => {
              this.toaster.error(e);
            },
          });
      })
      .catch((error) => {
        console.error("Error processing file:", error);
      });
  }
}
exportPositionDirectionGrid(e: any) {
  this._filehandler.exportGrid(e, this.pagesname.PositionDirection);
}
// Function to handle file download
downloadPositionDirectionFile() {
  // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
  const filename = `${this.pagesname.PositionDirection}.xlsx`;
  const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
  fetch(filepath)
    .then((response) => response.blob())
    .then((blob) => {
      saveAs(blob, filename); // Save file using file-saver library
    })
    .catch((error) => console.error("Error downloading file:", error));
}



// Position Configuration
initialPositionData() {
  this.positionSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Position`, 'get-all-position','get-position-by-id','Create-position',
    'edit-position','');
    this.StorageTypeData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/StorageType`, 'get-all-storageType_lookups',"","",
        "","");
    this.AisleLookupData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Aisle`, 'get-all-aisle_lookups',"","",
        "","");
    this.PositionDirectionLookupData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionDirection`, 'get-all-positionDirection_lookups',"","",
        "","");
}
onPositionRowValidating(event: any) {
  const data = { ...event.oldData, ...event.newData };
  const requiredFields = ['code', 'storageTypeId', 'aisleId', 'length', 'width', 'hight', 'positionDirectionId'];
  const numericFields = ['length', 'width', 'hight'];

  for (const field of requiredFields) {
    if (data[field] === undefined) {
      event.isValid = false;
      event.errorText = `You must enter ${field}`;
      return;
    }
  }

  for (const field of numericFields) {
    console.log(data, data[field], data[field] <= 0)
    if (data[field] === undefined || data[field] <= 0) {
      event.isValid = false;
      event.errorText = `You must enter ${field} and greater than zero`;
      return;
    }
  }
}

onPositionFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        console.log('JSON data:', jsonData);
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Position/Create-list-position`, jsonData).subscribe({
          next:(response)=>{
            if(response.success)
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
            else
            this.toaster.error(response.returnObject.split(",").join(" </br>"));
            this.positionSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Position`, 'get-all-position','get-position-by-id','Create-position',
              'edit-position','');
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
exportPositionGrid(e:any) {
  this._filehandler.exportGrid(e, this.pagesname.Position);
 }
// Function to handle file download
downloadPositionFile() {
  // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
  const filename = `${this.pagesname.Position}.xlsx`;
  const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
  fetch(filepath)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, filename); // Save file using file-saver library
    })
    .catch(error => console.error('Error downloading file:', error));
}



// Location Configuration

initialLocation() {
  this.locationForm = new FormGroup({
    warehouseId: new FormControl(null, Validators.required),
    storageTypeId: new FormControl(null, Validators.required),
    aisle: new FormControl(null, Validators.required),
    direction: new FormControl(null, Validators.required),
    positionNo: new FormControl(null, Validators.required),
    level: new FormControl(null, Validators.required),
    column: new FormControl(null, Validators.required),
    width: new FormControl(null, [Validators.required, Validators.min(0.1)]),
    depth: new FormControl(null, [Validators.required, Validators.min(0.1)]),
    height: new FormControl(null, [Validators.required, Validators.min(0.1)]),
    availableWeight: new FormControl(null, [Validators.required, Validators.min(0.1)]),
  });
  this.LocationFilterForm = this.fb.group({
    warehouseId: [null, Validators.required]
  });
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesForUser?assignedWarehouse=true`).subscribe({
    next:(response)=>{
      this.warehouseLookUp = response.returnObject;
    }
  })
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StorageType/get-all-storageType_lookups`).subscribe({
    next:(response)=>{
      this.storageTypeLookUp = response.returnObject;
    }
  })
  // this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Location`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
  // BaseURL_Update,BaseURL_Delete)
  this.warehouseLookupData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Warehouse`, 'get-all-Warehouse_lookups',"","",
    "","")
    this.positionData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Position`, 'get-all-position_lookups',"","",
    "","")
    this.levelData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionLevel`, 'get-all-positionLevel_lookups',"","",
    "","")
    this.columnData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionColumn`, 'get-all-positionColumn_lookups',"","",
    "","");
    this.storageTypeLookupData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/StorageType`, 'get-all-storageType_lookups',"","",
      "","")
      this.aisleLookupData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Aisle`, 'get-all-aisle_lookups',"","",
      "","")
      this.directionLookupData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionDirection`, 'get-all-positionDirection_lookups',"","",
      "","")
}
onGenerateCodeClick(rowData: any) {
  console.log(rowData.data.code); // Log the "code" field value to the console
}
readSelectedCodes() {
const selectedData = this.dataGrid.instance.getSelectedRowsData();
const selectedCodes = selectedData.map(row => row.code);
if(selectedCodes.length > 0) {
  // this._router.navigate([]).then((result) => {
  //   window.open('/#/barcode/' + selectedCodes, '_blank');
  // });
  this._router.navigate([]).then((result) => {
    const basePath = window.location.origin + window.location.pathname;
    const barcodePath = `#/barcode/${selectedCodes.join(',')}`;
    const fullUrl = `${basePath}${barcodePath}`;
    window.open(fullUrl, '_blank');
  });
}else {
  this.toaster.info("You Must Select Location")
}
}
onCloneIconClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
var code = e.row?.data.code;
this._router.navigate([]).then((result) => {
  const basePath = window.location.origin + window.location.pathname;
  const barcodePath = `#/barcode/${code}`;
  const fullUrl = `${basePath}${barcodePath}`;
  window.open(fullUrl, '_blank');
});
};
generateBarCode() {
this.inputValue2 = this.locationCode;
}
warehouseSelectChanged() {
  if(this.warehouseSelectedValue != null) {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Aisle/get-all-aisle_by-warehouse-id?warehouseId=${this.warehouseSelectedValue}`).subscribe({
      next:(response)=>{
        this.aisleLookUp = response.returnObject;
      }
    })
  }else {
    this.aisleLookUp = [];
    this.positionDirectionLookUp = [];
    this.positionLookUp = [];
  }
  // Handle warehouse selection change if needed
}
exportLocationGrid(e:any) {
  this._filehandler.exportGrid(e, "unitOfMeasure");
 }
storedTypeSelectChanged() {
  // Handle storage type selection change if needed
}

aisleSelectChanged() {
  console.log(this.aisleSelectedValue);
  if(this.aisleSelectedValue != null) {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PositionDirection/get-all-positionDirection_lookups`).subscribe({
      next:(response)=>{
        this.positionDirectionLookUp = response.returnObject;
      }
    })
  }else {
    this.positionDirectionLookUp = [];
    this.positionLookUp = [];
    this.columnLookUp = [];
    this.levelLookUp = [];
  }
}

positionDirectionSelectChanged() {
  if(this.positionDirectionSelectedValue != null) {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Position/get-all-position_by-aisle-and-direction-id?aisleId=${this.aisleSelectedValue}&directionId=${this.positionDirectionSelectedValue}`).subscribe({
      next:(response)=>{
        this.positionLookUp = response.returnObject;
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PositionColumn/get-all-positionColumn_lookups`).subscribe({
      next:(response)=>{
        this.columnLookUp = response.returnObject;
      }
    })
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PositionLevel/get-all-positionLevel_lookups`).subscribe({
      next:(response)=>{
        this.levelLookUp = response.returnObject;
      }
    })
  }else {
    this.positionLookUp = [];
    this.columnLookUp = [];
    this.levelLookUp = [];
  }
}

AddHandle(form: FormGroup) {
  if (form.valid) {
    const aisle = this.aisleLookUp.find((t:any) => t.id == form.value.aisle);
    const direction = this.positionDirectionLookUp.find((t:any) => t.id == form.value.direction);
    const position = this.positionLookUp.find((t:any) => t.id == form.value.positionNo);
    const column = this.columnLookUp.find((t:any) => t.id == form.value.column);
    const level = this.levelLookUp.find((t:any) => t.id == form.value.level);
    const code = `${aisle.name}${direction.name}${position.name}${column.name}${level.name}`;
    form.value.code = code;
    console.log(form.value, " formValue")
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Location/Create-location`, form.value).subscribe({
      next:(response)=>{
        if(response.success) {
          this.toaster.success(response.message);
        }else {
          this.toaster.error(response.message);
        }
      }
    })
    
  } else {
    // Handle form errors
    this.apiError = 'Please fill all the required fields.';
  }
}
GetLocation(form: FormGroup) {
if(form.value != 'null' && form.value != null) {
  form.value.warehouseId = Number(form.value.warehouseId);
  this.locationSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Location`, `GetAllLocationsForWarehouse?warehouseId=${form.value.warehouseId}`,'get-location-by-id','Create-location',
    'edit-loction','')
}
}
onLocationFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Location/CreateListOfLocation`, jsonData).subscribe({
          next:(response)=>{
            if(response.success)
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
            else
            this.toaster.error(response.returnObject.split(",").join(" </br>"));
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
downloadLocationFile() {
  this._filehandler.downloadFile(this.pagesname.Locations, "xlsx")
}

// PriceList Configuration
initialPriceList() {
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
 this.palletTypeSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PalletType`, 'get-all-pallettype','get-pallettype-by-id','Create-pallettype',
  'edit-pallettype','');
  this.companyData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, 'get-all-company_lookups',"","","","");
  this.palletCategoryData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PalletCategory`, 'GetPalletCategoryLookup?IsActiveOnly=true',"","","","");
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/get-all-company_lookups`).subscribe({
    next:(response)=>{
      if(response.success){
        this.companyLookUp = response.returnObject
      }
    }
  })
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StorageType/get-all-storageType_lookups`).subscribe({
    next:(response)=>{
      if(response.success){
        this.storageTypeLookUp = response.returnObject
      }
    }
  })
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PalletCategory/GetPalletCategoryLookup?IsActiveOnly=true`).subscribe({
    next:(response)=>{
      if(response.success){
        this.palletCategoryLookUp = response.returnObject
      }
    }
  })
  this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/get-all-Warehouse_lookups`).subscribe({
    next:(response)=>{
      if(response.success){
        this.warehousePriceLookUp = response.returnObject
      }
    }
  })
}

exportPriceListGrid(e:any) {
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
  console.log(formData.get("contractLink"));
  console.log(formData.get("contractLink2")); 
  console.log(formData.get("warehouseId"))
  this._apihandler.AddItem(`${GlobalComponent.BASE_API}/PalletType/Create-pallettype`, formData).subscribe({
      next: (response) => {
          if(response.success) {
            this.palletTypeSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PalletType`, 'get-all-pallettype','get-pallettype-by-id','Create-pallettype',
              'edit-pallettype','');
          }
      },
      error: (error) => {
          console.error(error);
      }
  });
}
storageTypeSelectChanged() {
  console.log(this.storageTypePriceSelectedValue)
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
