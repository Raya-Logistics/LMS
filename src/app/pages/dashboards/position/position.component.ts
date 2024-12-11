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
const BaseURL = 'https://localhost:7202/api/Position';
const BaseStorageTypeURL = 'https://localhost:7202/api/StorageType';
const BaseAisleURL = 'https://localhost:7202/api/Aisle';
const BasePositionDirectionURL = 'https://localhost:7202/api/PositionDirection';
const BaseURL_GetAll = 'get-all-position';
const BaseURL_GetAllPaged = 'get-all-position-pagination';
const BaseStorageTypeURL_Lookup = 'get-all-storageType_lookups';
const BaseAisleURL_Lookup = 'get-all-aisle_lookups';
const BasePositionDirectionURL_Lookup = 'get-all-positionDirection_lookups';
const BaseURL_GetById = 'get-position-by-id';
const BaseURL_Post = 'Create-position';
const BaseURL_Update = 'edit-position';
const BaseURL_Delete = 'deleted-position';
const BaseURL_PostAll = 'Create-list-position';
@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss']
})
export class PositionComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  StorageTypeData!: CustomStore;
  AisleData!: CustomStore;
  PositionDirectionData!: CustomStore;
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
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Position`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete);
    this.StorageTypeData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/StorageType`, BaseStorageTypeURL_Lookup,"","",
        "","");
    this.AisleData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Aisle`, BaseAisleURL_Lookup,"","",
        "","");
    this.PositionDirectionData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/PositionDirection`, BasePositionDirectionURL_Lookup,"","",
        "","");
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Position', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Position)
    this.authentication.getInternalPermissionss(this.pagesname.Position).subscribe({
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

  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          console.log('JSON data:', jsonData);
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Position/${BaseURL_PostAll}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Position`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
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
    this._filehandler.exportGrid(e, this.pagesname.Position);
   }
  // Function to handle file download
  downloadFile() {
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
}
