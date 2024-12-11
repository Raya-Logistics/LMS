import { Component } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-company-configuration',
  templateUrl: './company-configuration.component.html',
  styleUrls: ['./company-configuration.component.scss']
})
export class CompanyConfigurationComponent {
  dropDownOptions = { width: 500 };
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:any;
  permissionIsLoadded:boolean = false;
  companySource!: CustomStore;
  customerSource!: CustomStore;
  companyLookupData!: CustomStore;
  vendorSource!: CustomStore;
  companyOptionSource!: CustomStore;
  companySettingSource!: CustomStore;
  companyOptionLookupData!: CustomStore;
  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService,
    private authentication:AuthenticationService,
    private toaster: ToastrService) {
  }
  ngOnInit(): void {
    this.initialCompany();
    this.initialCustomer();
    this.initialVendor();
    this.initialCompanyOption();
    this.initialCompanySetting();
    this.breadCrumbItems = [
      { label: "Home" },
      { label: "Company Configuration", active: true },
    ];
    const pageNamesArray = [this.pagesname.Company, this.pagesname.Customers, this.pagesname.Vendor, this.pagesname.CompaniesServices, this.pagesname.Services];

    this.authentication.getPagesInternalPermissions(pageNamesArray).subscribe({
        next: (permissions) => {
            this.internalPermission = permissions;
            this.permissionIsLoadded = true;
        },
        error: (error) => {
            this.toaster.error('Failed to retrieve permissions');
            console.error('Error retrieving permissions:', error);
        }
    });
  }


  ////Company Configuration
  initialCompany() {
    this.companySource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, "get-all-company",'get-company-by-id','Create-company',
      'edit-company','')
  }
  onCompanyRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['code', 'phone1', 'phone2', 'address', 'email', 'contactPerson'];
    const phoneFields = ['phone1', 'phone2'];
    const emailField = 'email';
    data['phone1'] = data['phone1'].trim();
    data['phone2'] = data['phone2'].trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        console.log(data[field], field, " hello")
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
    data['phone1'] = data['phone1'].trim();
    data['phone2'] = data['phone2'].trim();
    if (!emailPattern.test(data[emailField])) {
      event.isValid = false;
      event.errorText = `You must enter a valid email`;
      return;
    }
  }
  onCompanyFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          console.log('JSON data:', jsonData);
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Company/Create-list-company`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.initialCompany();
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
  exportCompanyGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.Company);
   }
  // Function to handle file download
  downloadCompanyFile() {
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



  
  ////Company Configuration
  initialCustomer() {
    this.customerSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Customer`, 'get-all-customer','get-customer-by-id','Create-customer',
      'edit-customer','');
        this.companyLookupData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, 'get-all-company_lookups',"","",
          "","");
  }
  onCustomerRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['customersName', 'customerPhone1', 'customerPhone2', 'contactPersonName', 
      'address', 'companyId', 'email'];
    const phoneFields = ['customerPhone1', 'customerPhone2'];
    const emailField = 'email';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
    data['customerPhone1'] = data['customerPhone1'].trim();
    data['customerPhone2'] = data['customerPhone2'].trim();
    if (!emailPattern.test(data[emailField])) {
      event.isValid = false;
      event.errorText = `You must enter a valid email`;
      return;
    }
  }

  onCustomerFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          console.log('JSON data:', jsonData);
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/Customer/Create-list-customer`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
              this.customerSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Customer`, 'get-all-customer','get-customer-by-id','Create-customer',
                'edit-customer','');
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
  exportCustomerGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.Customers);
   }
  // Function to handle file download
  downloadCustomerFile() {
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

    ////Vendor Configuration
    initialVendor() {
      this.vendorSource = this._apihandler.getStore(
        `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.VENDOR.NAME}`,
        GlobalComponent.Controllers.VENDOR.API_ACTIONS.GET_ALL,
        GlobalComponent.Controllers.VENDOR.API_ACTIONS.GET_BY_ID,
        GlobalComponent.Controllers.VENDOR.API_ACTIONS.CREATE,
        GlobalComponent.Controllers.VENDOR.API_ACTIONS.EDIT,
        GlobalComponent.Controllers.VENDOR.API_ACTIONS.DELETE
      );
    }
    onVendorRowValidating(event: any) {
      const data = { ...event.oldData, ...event.newData };
      const requiredFields = ['vendorName'];
  
      for (const field of requiredFields) {
        if (data[field] === undefined) {
          event.isValid = false;
          event.errorText = `You must enter ${field}`;
          return;
        }
      }
    }
  
    onVendorFileSelected(event: any) {
      const files = event.value;
      for (const file of files) {
        this._filehandler.getjsonDataFromFile(file)
          .then(jsonData => {
            console.log('JSON data:', jsonData);
            this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.VENDOR.NAME}/${GlobalComponent.Controllers.VENDOR.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
              next:(response)=>{
                if(response.success)
                  this.toaster.success(response.returnObject.split(",").join(" </br>"));
                else
                  this.toaster.error(response.returnObject.split(",").join(" </br>"));
                  this.vendorSource = this._apihandler.getStore(
                    `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.VENDOR.NAME}`,
                    GlobalComponent.Controllers.VENDOR.API_ACTIONS.GET_ALL,
                    GlobalComponent.Controllers.VENDOR.API_ACTIONS.GET_BY_ID,
                    GlobalComponent.Controllers.VENDOR.API_ACTIONS.CREATE,
                    GlobalComponent.Controllers.VENDOR.API_ACTIONS.EDIT,
                    GlobalComponent.Controllers.VENDOR.API_ACTIONS.DELETE
                  );
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
    exportVendorGrid(e:any) {
      this._filehandler.exportGrid(e, this.pagesname.Vendor);
     }
    //Using It Two Downalod File (Template)
    downloadVendorFile() {
      this._filehandler.downloadFile(this.pagesname.Vendor, "xlsx")
    }


    
    ////CompanyOption Configuration
    initialCompanyOption() {
      this.companyOptionSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanyOption`, 'get-all-companyOption','get-companyOption-by-id','Create-companyOption',
        'edit-companyOption','')
    }


    onCompanyoptionRowValidating(event: any) {
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
    onCompanyoptionFileSelected(event: any) {
      const files = event.value;
      for (const file of files) {
        this._filehandler.getjsonDataFromFile(file)
          .then(jsonData => {
            console.log('JSON data:', jsonData);
            this._apihandler.AddItem(`${GlobalComponent.BASE_API}/CompanyOption/Create-list-companyOption`, jsonData).subscribe({
              next:(response)=>{
                if(response.success)
                  this.toaster.success(response.returnObject.split(",").join(" </br>"));
                else
                this.toaster.error(response.returnObject.split(",").join(" </br>"));
                this.companyOptionSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanyOption`, 'get-all-companyOption','get-companyOption-by-id','Create-companyOption',
                  'edit-companyOption','')
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
    exportCompanyoptionGrid(e:any) {
      this._filehandler.exportGrid(e, this.pagesname.Services);
     }
    // Function to handle file download
    downloadCompanyoptionFile() {
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


    ////CompanySetting Configuration
    initialCompanySetting() {
      this.companySettingSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanySetting`, 'get-all-companySetting','get-companySetting-by-id','Create-companySetting',
        'edit-companySetting','');
      this.companyOptionLookupData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanyOption`, 'get-all-companyOption_lookups',"","",
            "","");
    }

    onCompanySettingRowValidating(event: any) {
      const data = { ...event.oldData, ...event.newData };
      const requiredFields = ['companyId', 'settingId'];
  
      for (const field of requiredFields) {
        if (data[field] === undefined) {
          event.isValid = false;
          event.errorText = `You must enter ${field}`;
          return;
        }
      }
    }
  
    onCompanySettingFileSelected(event: any) {
      const files = event.value;
      for (const file of files) {
        this._filehandler.getjsonDataFromFile(file)
          .then(jsonData => {
            console.log('JSON data:', jsonData);
            this._apihandler.AddItem(`${GlobalComponent.BASE_API}/CompanySetting/Create-list-companySetting`, jsonData).subscribe({
              next:(response)=>{
                if(response.success)
                  this.toaster.success(response.returnObject.split(",").join(" </br>"));
                else
                this.toaster.error(response.returnObject.split(",").join(" </br>"));
                this.companySettingSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/CompanySetting`, 'get-all-companySetting','get-companySetting-by-id','Create-companySetting',
                  'edit-companySetting','');
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
    exportCompanySettingGrid(e:any) {
      this._filehandler.exportGrid(e, this.pagesname.CompaniesServices);
     }
    // Function to handle file download
    downloadCompanySettingFile() {
      // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
      const filename = `${this.pagesname.CompaniesServices}.xlsx`;
      const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
      fetch(filepath)
        .then(response => response.blob())
        .then(blob => {
          saveAs(blob, filename); // Save file using file-saver library
        })
        .catch(error => console.error('Error downloading file:', error));
    }

}
