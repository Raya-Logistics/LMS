import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
// import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
// Our demo infrastructure requires us to use 'file-saver-es'. We recommend that you use the official 'file-saver' package in your applications.
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BASE_API = GlobalComponent.BASE_API;
const WAREHOUE = GlobalComponent.Controllers.WAREHOUSE.NAME;
const WAREHOUE_FOR_USER = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.GET_ALL_WAREHOUSE_FOR_USER + "?assignedWarehouse=true";
const WAREHOUE_FOR_USER_ALL_DATA = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.GET_ALL_WAREHOUSE_FOR_USER_ALL_DATA + "?assignedWarehouse=true";
const WAREHOUSE_BY_ID = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.GET_BY_ID;
const WAREHOUE_CREATE = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.CREATE;
const WAREHOUE_CREATE_LIST = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.CREATE_LIST;
const WAREHOUE_EDIT = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.EDIT;
const WAREHOUE_DELETE = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.DELETE;

const BaseURL_GetAll = 'getAllWarehousesForUser?assignedWarehouse=true';
const BaseURL_GetAllPaged = 'get-all-Warehouse-pagination';
const BaseURL_GetById = 'get-Warehouse-by-id';
const BaseURL_Post = 'Create-Warehouse';
const BaseURL_Update = 'edit-Warehouse';
const BaseURL_Delete = 'deleted-Warehouse';
const BaseURL_PostAll = 'Create-list-Warehouse';
@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  requests: string[] = [];
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;

  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService) {
    
  }
  ngOnInit(): void {
   this.dataSource = this._apihandler.getStore(`${BASE_API}/${WAREHOUE}`, WAREHOUE_FOR_USER_ALL_DATA,WAREHOUSE_BY_ID,WAREHOUE_CREATE,
    WAREHOUE_EDIT,WAREHOUE_DELETE);
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: WAREHOUE, active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Warehouse)
    this.authentication.getInternalPermissionss(this.pagesname.Warehouse).subscribe({
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
  onRowValidating(event: any) {
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

  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          console.log('JSON data:', jsonData);
          this._apihandler.AddItem(`${BASE_API}/${WAREHOUE}/${WAREHOUE_CREATE_LIST}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(`${BASE_API}/${WAREHOUE}`, WAREHOUE_FOR_USER,WAREHOUSE_BY_ID,WAREHOUE_CREATE,
                WAREHOUE_EDIT,WAREHOUE_DELETE);
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
    this._filehandler.exportGrid(e, this.pagesname.Warehouse);
   }
  // Function to handle file download
  downloadFile() {
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
}
