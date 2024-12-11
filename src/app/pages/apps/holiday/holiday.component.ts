import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { saveAs } from 'file-saver-es';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL_GetAll = 'GetAllHoliday';
const BaseURL_GetWarehouseForUser = 'getAllWarehousesForUser';
const BaseURL_GetAttributeAll = 'get-all-shiftAttribute_lookups';
const BaseURL_GetById = 'GetHoliday';
const BaseURL_Post = 'CreateHoliday';
const BaseURL_PostAll = 'Create-list-shiftsType';
const BaseURL_Update = 'EditHoliday';
const BaseURL_Delete = 'deleted-shiftsType';
@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.scss']
})
export class HolidayComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  breadCrumbItems!: Array<{}>;
  //SiftAtrribute Data
  dropDownOptions = { width: 500 };
  dataSource!: CustomStore;  
  warehouseSource!: CustomStore;   
  attributeData!: CustomStore;  
  shiftType: any;
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
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Holiday`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete)
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesForUser?assignedWarehouse=true`).subscribe({
      next:(response) => {
        this.warehouseSource = response.returnObject;
        console.log(this.warehouseSource);
      }
    });
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Shift Type', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Warehouse)
    this.authentication.getInternalPermissionss(this.pagesname.Holiday).subscribe({
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
  
  onWarehouseChanged(data: any, event: any) {
    const selectedWarehouseIds = event.value;
    data.data.warehouses = selectedWarehouseIds;
    console.log('Updated warehouses for row:', data.data, 'to:', selectedWarehouseIds);
  }
  
  
  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/ShiftsType/${BaseURL_PostAll}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success) {
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              }else {
                this.toaster.error(response.returnObject.split(",").join(" </br>"));
              }
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsType`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
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
    this._filehandler.exportGrid(e, "ShiftsType");
   }
  // Function to handle file download
  downloadFile() {
    const filename = 'ShiftsType.xlsx';
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }
}
