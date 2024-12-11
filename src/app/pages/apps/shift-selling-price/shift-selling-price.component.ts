import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { saveAs } from 'file-saver-es';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL_GetAll = 'get-all-shiftSellingPrice';
const BaseURL_GetAttributeAll = 'get-all-shiftAttribute_lookups';
const BaseURL_GetCompanyAll = 'get-all-company_lookups';
const BaseURL_GetCompanyUser = 'get-all-companyuser';
const BaseURL_GetCompanyForUser = 'getAllCompaniesForUser';
const BaseURL_GetById = 'get-shiftSellingPrice-by-id';
const BaseURL_Post = 'Create-shiftSellingPrice';
const BaseURL_PostAll = 'Create-list-shiftSellingPrice';
const BaseURL_Update = 'edit-shiftSellingPrice';
const BaseURL_Delete = 'deleted-shiftSellingPrice';
@Component({
  selector: 'app-shift-selling-price',
  templateUrl: './shift-selling-price.component.html',
  styleUrls: ['./shift-selling-price.component.scss']
})
export class ShiftSellingPriceComponent {
//DevExpress And Template Definations
readonly allowedPageSizes = [5, 10, 'all'];
readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
displayMode = 'full';
showPageSizeSelector = true;
showInfo = true;
showNavButtons = true;
breadCrumbItems!: Array<{}>;
//SiftAtrribute Data
dataSource!: CustomStore;  
atrributeSource!: CustomStore;  
companySource!: CustomStore;  
permissionData = environment.permission;
pagesname = environment.pagesname;
internalPermission:(string[] | null) = [];
constructor(private _apihandler : ApihandlerService, 
  private _filehandler : FilehandlerService, 
  private toaster: ToastrService,
  private authentication:AuthenticationService) {
  
}
ngOnInit(): void {
 this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/shiftSellingPrice`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
  BaseURL_Update,BaseURL_Delete)
  this.atrributeSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAttributeAll,BaseURL_GetById,BaseURL_Post,
  BaseURL_Update,BaseURL_Delete)
  this.companySource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Company`, `${BaseURL_GetCompanyForUser}?assignedCompany=true`,BaseURL_GetById,BaseURL_Post,
  BaseURL_Update,BaseURL_Delete)
  this.breadCrumbItems = [
      { label: 'Home' },
      { label: 'Shift Selling Price', active: true }
  ];
  this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.ShiftSellingPrice)
}

onEditorPreparing(e: any) {
  if (e.dataField === 'sellingEndDate') {
    e.editorOptions.onValueChanged = (args: any) => {
      const startDate = e.row.data.sellingStartDate;
      const endDate = args.value;
      console.log(startDate, "===>", endDate);
      if (endDate <= startDate) {
        args.component.option('isValid', false);
        args.component.option('validationError', {
          message: 'End date must be greater than start date'
        });
      } else {
        args.component.option('isValid', true);
      }

      e.setValue(args.value);
    };
  }
}
onRowValidating(e: any) {
  const today = new Date();
  const tomorrow = new Date(today.setDate(today.getDate() + 1));
  if(e.newData.sellingAttributesId == undefined) {
      e.isValid = false;
      e.errorText = 'You Must Select Attribute';
  }else if(e.newData.sellingCompanyId == undefined) {
    e.isValid = false;
    e.errorText = 'You Must Select Company';
  }else if(!e.newData.sellingPrice) {
    e.isValid = false;
    e.errorText = 'You Must Enter Price';
  }else if(e.newData.sellingEndDate && e.newData.sellingStartDate) {
    const startDate = new Date(e.newData.sellingStartDate);
    const endDate = new Date(e.newData.sellingEndDate);
    if (endDate <= startDate) {
      e.isValid = false;
      e.errorText = 'End date must be greater than start date';
    } else if (endDate <= tomorrow) {
      e.isValid = false;
      e.errorText = 'End date must be at least tomorrow';
    }
  }
}


onFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/shiftSellingPrice/${BaseURL_PostAll}`, jsonData).subscribe({
          next:(response)=>{
            if(response.success) {
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
            }else {
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
            }
            this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/shiftSellingPrice`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
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
  this._filehandler.exportGrid(e, "shiftSellingPrice");
 }
// Function to handle file download
downloadFile() {
  const filename = 'shiftSellingPrice.xlsx';
  const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
  fetch(filepath)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, filename); // Save file using file-saver library
    })
    .catch(error => console.error('Error downloading file:', error));
}

}
