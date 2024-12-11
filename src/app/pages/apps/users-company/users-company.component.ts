import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
// import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
// Our demo infrastructure requires us to use 'file-saver-es'. We recommend that you use the official 'file-saver' package in your applications.
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { GlobalComponent } from 'src/app/global-component';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL = 'https://localhost:7202/api/CompanyUsers';
const BaseCompanyURL = 'https://localhost:7202/api/Company';
const BaseUserDetailsURL = 'https://localhost:7202/api/WarehouseUser';
const BaseURL_GetAll = 'get-all-companyUsers';
const BaseURL_GetAllPaged = 'get-all-companyUsers-pagination';
const BaseCompanyURL_Lookup = 'get-all-company_lookups';
const BaseUserDetailsURL_Lookup = 'get-all-UserDetails';
const BaseURL_GetById = 'get-companyUsers-by-id';
const BaseURL_Post = 'Create-companyUsers';
const BaseURL_AllPost = 'Create-list-companyUsers';
const BaseURL_Update = 'edit-companyUsers';
const BaseURL_Delete = 'deleted-companyUsers';
@Component({
  selector: 'app-users-company',
  templateUrl: './users-company.component.html',
  styleUrls: ['./users-company.component.scss']
})
export class UsersCompanyComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  companyData!: CustomStore;
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
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanyUsers`, "GetAllCompanyUserForUser",BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete);
    this.companyData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, "getAllCompaniesForUser?assignedCompany=true","","",
      "","");
      this.userData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/User`, "GetAllUserDetailsLookup","","",
        "","");
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Company User', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.CompaniesUsers)
    this.authentication.getInternalPermissionss(this.pagesname.CompaniesUsers).subscribe({
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
    const requiredFields = ['companyId', 'userId'];

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
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/CompanyUsers/${BaseURL_AllPost}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanyUsers`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
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
    this._filehandler.exportGrid(e, this.pagesname.CompaniesUsers);
   }
  // Function to handle file download
  downloadFile() {
    // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
    const filename = `${this.pagesname.CompaniesUsers}.xlsx`;
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }
}
