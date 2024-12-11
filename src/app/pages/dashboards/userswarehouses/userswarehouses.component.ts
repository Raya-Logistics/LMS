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
const BaseURL = 'https://localhost:7202/api/WarehouseUser';
const BaseUserURL = 'https://localhost:7202/api/User';
const BaseWarehouseURL = 'https://localhost:7202/api/Warehouse';
const BaseURL_GetAll = 'get-all-WarehouseUser';
const BaseURL_GetAllPaged = 'get-all-WarehouseUser-pagination';
const BaseUserURL_Lookup = 'get-all-User_lookups';
const BaseWarehouseURL_Lookup = 'get-all-Warehouse_lookups';
const BaseURL_GetById = 'get-WarehouseUser-by-id';
const BaseURL_Post = 'Create-WarehouseUser';
const BaseURL_Update = 'edit-WarehouseUser';
const BaseURL_Delete = 'deleted-WarehouseUser';
const BaseURL_PostAll = 'Create-list-WarehouseUser';
@Component({
  selector: 'app-userswarehouses',
  templateUrl: './userswarehouses.component.html',
  styleUrls: ['./userswarehouses.component.scss']
})
export class UserswarehousesComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  warehouseData!: CustomStore;
  userData!: CustomStore;
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
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/WarehouseUser`, 'GetAllWarehouseUserForUser',BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete);
    this.userData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/User`, "GetAllUserDetailsLookup","","",
      "","");
      this.warehouseData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Warehouse`, "getAllWarehousesForUser?assignedWarehouse=true","","",
        "","");
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'User Warehouse', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.WarehousesUsers)
    this.authentication.getInternalPermissionss(this.pagesname.WarehousesUsers).subscribe({
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
    const requiredFields = ['whid', 'userId'];
    console.log(data, " data")
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
          console.log('JSON data:', jsonData);
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/WarehouseUser/${BaseURL_PostAll}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/WarehouseUser`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
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
    this._filehandler.exportGrid(e, this.pagesname.WarehousesUsers);
   }
  // Function to handle file download
  downloadFile() {
    // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
    const filename = `${this.pagesname.WarehousesUsers}.xlsx`;
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }
}
