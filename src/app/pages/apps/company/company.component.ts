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
const BaseURL = 'https://localhost:7202/api/Company';
const BaseURL_GetAll = 'get-all-company';
const BaseURL_GetAllPaged = 'get-all-company-pagination';
const BaseURL_GetById = 'get-company-by-id';
const BaseURL_Post = 'Create-company';
const BaseURL_AllPost = 'Create-list-company';
const BaseURL_Update = 'edit-company';
const BaseURL_Delete = 'deleted-company';
@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
styleUrls: ['./company.component.scss']
})
export class CompanyComponent {
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
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, "getAllCompaniesForUserAllData?assignedCompany=true",BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete)
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Company', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Company)
    this.authentication.getInternalPermissionss(this.pagesname.Company).subscribe({
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
    const requiredFields = ['code', 'phone1', 'phone2', 'address', 'email', 'contactPerson'];
    const phoneFields = ['phone1', 'phone2'];
    const emailField = 'email';
    const egyptianPhonePattern = /^01[0125][0-9]{8}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
    for (const field of phoneFields) {
      if (data[field] === undefined || !egyptianPhonePattern.test(data[field])) {
        event.isValid = false;
        event.errorText = `You must enter Valid Number ${field}`;
        return;
      }
    }
    if (!emailPattern.test(data[emailField])) {
      event.isValid = false;
      event.errorText = `You must enter a valid email`;
      return;
    }
  }
  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          console.log('JSON data:', jsonData);
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Company/${BaseURL_AllPost}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, "getAllCompaniesForUserAllData?assignedCompany=true",BaseURL_GetById,BaseURL_Post,
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
    this._filehandler.exportGrid(e, this.pagesname.Company);
   }
  // Function to handle file download
  downloadFile() {
    // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
    const filename = `${this.pagesname.Company}.xlsx`;
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }
}
