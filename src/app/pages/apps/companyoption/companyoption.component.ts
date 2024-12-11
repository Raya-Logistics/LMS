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
const BaseURL = 'https://localhost:7202/api/CompanyOption';
const BaseURL_GetAll = 'get-all-companyOption';
const BaseURL_GetAllPaged = 'get-all-companyOption-pagination';
const BaseURL_GetById = 'get-companyOption-by-id';
const BaseURL_Post = 'Create-companyOption';
const BaseURL_AllPost = 'Create-list-companyOption';
const BaseURL_Update = 'edit-companyOption';
const BaseURL_Delete = 'deleted-companyOption';
@Component({
  selector: 'app-companyoption',
  templateUrl: './companyoption.component.html',
  styleUrls: ['./companyoption.component.scss']
})
export class CompanyoptionComponent {
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
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanyOption`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete)
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Service', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Services)
    this.authentication.getInternalPermissionss(this.pagesname.Services).subscribe({
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
    const requiredFields = ['options', 'description', 'monthlyCost'];
    const numericFields = ['monthlyCost'];
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
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/CompanyOption/${BaseURL_AllPost}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanyOption`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
                BaseURL_Update,BaseURL_Delete)
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
    this._filehandler.exportGrid(e, this.pagesname.Services);
   }
  // Function to handle file download
  downloadFile() {
    // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
    const filename = `${this.pagesname.Services}.xlsx`;
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }
}
