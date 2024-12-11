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
import { PermissionsVM } from 'src/app/models/permissions-vm';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment.prod';
const BaseURL = 'https://localhost:7202/api/Customer';
const BaseCompanyURL = 'https://localhost:7202/api/Company';
const BaseURL_GetAll = 'get-all-customer';
const BaseURL_GetAllPaged = 'get-all-customer-pagination';
const BaseCompanyURL_Lookup = 'get-all-company_lookups';
const BaseURL_GetById = 'get-customer-by-id';
const BaseURL_Post = 'Create-customer';
const BaseURL_AllPost = 'Create-list-customer';
const BaseURL_Update = 'edit-customer';
const BaseURL_Delete = 'deleted-customer';
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  companyData!: CustomStore;
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
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Customer`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete);
      this.companyData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, BaseCompanyURL_Lookup,"","",
        "","");
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Customer', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Customers)
    this.authentication.getInternalPermissionss(this.pagesname.Customers).subscribe({
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
    const requiredFields = ['customersName', 'customerPhone1', 'customerPhone2', 'contactPersonName', 
      'address', 'companyId', 'email'];
    const phoneFields = ['customerPhone1', 'customerPhone2'];
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
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Customer/${BaseURL_AllPost}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Customer`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
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
    this._filehandler.exportGrid(e, this.pagesname.Customers);
   }
  // Function to handle file download
  downloadFile() {
    // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
    const filename = `${this.pagesname.Customers}.xlsx`;
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }
}
