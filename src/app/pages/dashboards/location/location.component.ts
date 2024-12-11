import { Component, OnInit, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
// import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
// Our demo infrastructure requires us to use 'file-saver-es'. We recommend that you use the official 'file-saver' package in your applications.
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { HttpClient } from '@angular/common/http';
import { DxDataGridComponent, DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL = 'https://localhost:44310/api/Location';
const BaseWarehouseURL = 'https://localhost:44310/api/Warehouse';
const BaseStorageTypeURL = 'https://localhost:44310/api/StorageType';
const BaseAisleURL = 'https://localhost:44310/api/Aisle';
const BasePositionDirectionURL = 'https://localhost:44310/api/PositionDirection';
const BasePositionURL = 'https://localhost:44310/api/Position';
const BasePositionColumnURL = 'https://localhost:44310/api/PositionColumn';
const BasePositionLevelURL = 'https://localhost:44310/api/PositionLevel';
const BaseURL_GetAll = 'get-all-location';
const BaseWarehouseURL_Lookup = 'get-all-Warehouse_lookups';
const BaseStorageTypeURL_Lookup = 'get-all-storageType_lookups';
const BaseAisleURL_Lookup = 'get-all-aisle_by-warehouse-id?warehouseId=';
const BaseNormalAisleURL_Lookup = 'get-all-aisle_lookups';
const BasePositionDirectionURL_Lookup = 'get-all-positionDirection_lookups';
const BasePositionURL_Lookup = 'get-all-position_by-aisle-and-direction-id';
const BaseNormalPositionURL_Lookup = 'get-all-position_lookups';
const BasePositionColumnURL_Lookup = 'get-all-positionColumn_lookups';
const BasePositionLevelURL_Lookup = 'get-all-positionLevel_lookups';
const BaseURL_GetById = 'get-location-by-id';
const BaseURL_Post = 'Create-location';
const BaseURL_Update = 'edit-location';
const BaseURL_Delete = 'deleted-location';
@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  warehouseData!: CustomStore;
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
  warehouseLookUp : any; // Fill with actual data
  storageTypeLookUp : any; // Fill with actual data
  aisleLookUp : any; // Fill with actual data
  positionDirectionLookUp : any; // Fill with actual data
  positionLookUp : any; // Fill with actual data
  levelLookUp : any; // Fill with actual data
  columnLookUp : any; // Fill with actual data
  apiError: string = '';
  isLoading: boolean = false;
  inputValue = "T3ERHB";
  inputValue2 = "";
  locationCode="";
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  breadCrumbItems!: Array<{}>;
  LocationFilterForm!: FormGroup;
  permissionIsLoadded:boolean = false;

  constructor(private _router:Router, 
    private http:HttpClient, 
    private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster : ToastrService,
    private authentication:AuthenticationService,
    private fb: FormBuilder) {
    
  }
  ngOnInit() {
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
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StorageType/${BaseStorageTypeURL_Lookup}`).subscribe({
      next:(response)=>{
        this.storageTypeLookUp = response.returnObject;
      }
    })
    // this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Location`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    // BaseURL_Update,BaseURL_Delete)
    this.warehouseData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Warehouse`, BaseWarehouseURL_Lookup,"","",
      "","")
      this.storageTypeData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/StorageType`, BaseStorageTypeURL_Lookup,"","",
      "","")
      this.aisleData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Aisle`, BaseNormalAisleURL_Lookup,"","",
      "","")
      this.directionData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionDirection`, BasePositionDirectionURL_Lookup,"","",
      "","")
      this.positionData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Position`, BaseNormalPositionURL_Lookup,"","",
      "","")
      this.levelData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionLevel`, BasePositionLevelURL_Lookup,"","",
      "","")
      this.columnData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionColumn`, BasePositionColumnURL_Lookup,"","",
      "","")
      // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Locations)
      this.authentication.getInternalPermissionss(this.pagesname.Locations).subscribe({
        next:(permissions) => {
          this.internalPermission = permissions;
          this.permissionIsLoadded = true;

        },
        error:(error) => {
          this.toaster.error('Failed to retrieve permissions');
          console.error('Error retrieving permissions:', error);
        }
      })
      this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Locations', active: true }
    ];

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
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Aisle/${BaseAisleURL_Lookup}${this.warehouseSelectedValue}`).subscribe({
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
  exportGrid(e:any) {
    this._filehandler.exportGrid(e, "unitOfMeasure");
   }
  storedTypeSelectChanged() {
    // Handle storage type selection change if needed
  }

  aisleSelectChanged() {
    console.log(this.aisleSelectedValue);
    if(this.aisleSelectedValue != null) {
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PositionDirection/${BasePositionDirectionURL_Lookup}`).subscribe({
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
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Position/${BasePositionURL_Lookup}?aisleId=${this.aisleSelectedValue}&directionId=${this.positionDirectionSelectedValue}`).subscribe({
        next:(response)=>{
          this.positionLookUp = response.returnObject;
        }
      })
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PositionColumn/${BasePositionColumnURL_Lookup}`).subscribe({
        next:(response)=>{
          this.columnLookUp = response.returnObject;
        }
      })
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/PositionLevel/${BasePositionLevelURL_Lookup}`).subscribe({
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
      this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Location/${BaseURL_Post}`, form.value).subscribe({
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
    this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Location`, `GetAllLocationsForWarehouse?warehouseId=${form.value.warehouseId}`,BaseURL_GetById,BaseURL_Post,
      BaseURL_Update,BaseURL_Delete)
  }
  }
  onFileSelected(event: any) {
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
  downloadFile() {
    this._filehandler.downloadFile(this.pagesname.Locations, "xlsx")
  }
}
