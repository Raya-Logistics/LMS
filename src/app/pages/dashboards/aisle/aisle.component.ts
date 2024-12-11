import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { saveAs } from 'file-saver-es';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL_GetAll = 'get-all-aisle';
const BaseURL_GetAllPaged = 'get-all-aisle-pagination';
const BaseWarehouseURL_Lookup = 'get-all-Warehouse_lookups';
const BaseWarehouseUserURL_Lookup = 'get-all-warehouseuser';
const BaseURL_GetById = 'get-aisle-by-id';
const BaseURL_Post = 'Create-aisle';
const BaseURL_PostAll = 'Create-list-aisle';
const BaseURL_Update = 'edit-aisle';
const BaseURL_Delete = 'deleted-aisle';
@Component({
  selector: 'app-aisle',
  templateUrl: './aisle.component.html',
  styleUrls: ['./aisle.component.scss']
})
export class AisleComponent implements OnInit {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  warehouseData!: CustomStore;
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
    private toaster : ToastrService,
    private authentication:AuthenticationService) {
    
  }

  ngOnInit(): void {
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Aisle`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete);
      this.warehouseData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Warehouse`, BaseWarehouseUserURL_Lookup,"","",
        "","");
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Aisle', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Aisles)
    this.authentication.getInternalPermissionss(this.pagesname.Aisles).subscribe({
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

  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Aisle/${BaseURL_PostAll}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Aisle`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
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
    this._filehandler.exportGrid(e, this.pagesname.Aisles);
   }
  // Function to handle file download
  downloadFile() {
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
}
