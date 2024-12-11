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
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { Router } from '@angular/router';
// const BaseURL = 'https://localhost:7202/api/MasterUnit';
// const BaseBrandURL = 'https://localhost:7202/api/Brand';
// const BaseCategoryURL = 'https://localhost:7202/api/Category';
// const BaseURL_GetAll = 'get-all-masterunit';
// const BaseURL_GetAllPaged = 'get-all-masterunit-pagination';

const BaseBrandURL_Lookup = 'get-all-brand_lookups';
const BaseCategoryURL_Lookup = 'get-all-category_lookups';
// const BaseURL_GetById = 'get-masterunit-by-id';
// const BaseURL_Post = 'Create-masterunit';
// const BaseURL_AllPost = 'Create-list-masterunit';
// const BaseURL_Update = 'edit-masterunit';
// const BaseURL_Delete = 'deleted-masterunit';
@Component({
  selector: 'app-masterunit',
  templateUrl: './masterunit.component.html',
  styleUrls: ['./masterunit.component.scss']
})
export class MasterunitComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  brandData!: CustomStore;
  categoryData!: CustomStore;
  requests: string[] = [];
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission:(string[] | null) = [];
  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService,
  private _router:Router) {
    
  }
  ngOnInit(): void {
        //Initialize Dev Express Data Grid
        this.dataSource = this._apihandler.getStore(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.MASTER_UNIT.NAME}`,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.GET_ALL,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.GET_BY_ID,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.CREATE,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.EDIT,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.DELETE
        );
      this.categoryData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Category`, BaseCategoryURL_Lookup,"","",
        "","");
        this.brandData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Brand`, BaseBrandURL_Lookup,"","",
        "","");
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Master Data', active: true }
    ];
    this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.MasterData)
  }
  onCloneIconClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    var code = e.row?.data.masterDataBarCode;
    // this._router.navigate([]).then((result) => {
    //   window.open('/#/barcode/' + code, '_blank');
    // });
    this._router.navigate([]).then((result) => {
      const basePath = window.location.origin + window.location.pathname;
      const barcodePath = `#/barcode/${code}`;
      const fullUrl = `${basePath}${barcodePath}`;
      window.open(fullUrl, '_blank');
    });
  };
  calculateCellValue(rowData:any){
    return rowData.masterDataTieForRack * rowData.masterDataHighForRack;  
}
calculateCellStackingValue(rowData:any){
  return rowData.masterDataTieForStacking * rowData.masterDataHighForStacking * rowData.masterDataBulkConversion;  
}  
  onRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    console.log(data, "this is data")
    const requiredFields = ['masterDataItemCode', 'masterDataBrandId', 'masterDataCategoryId', 'masterDataDescription',
       'masterDataBarCode', 'masterDataLength', 'masterDataWidth', 'masterDataHeight', 'masterDataTieForRack', 'masterDataHighForRack',
      'masterDataBulkConversion', 'masterDataMainCategory', 'masterDataTieForStacking'
      , 'masterDataTieForStacking', 'masterDataHighForStacking'];
    const numericFields = ['masterDataLength', 'masterDataWidth', 'masterDataHeight', 'masterDataTieForRack', 'masterDataHighForRack', 
      'masterDataBulkConversion', 'masterDataTieForStacking', 'masterDataHighForStacking',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }

    for (const field of numericFields) {
      if (data[field] === undefined || data[field] < 0.1) {
        event.isValid = false;
        event.errorText = `You must enter ${field} and greater than zero`;
        return;
      }
    }
    if(data['masterDataIsExpiration'] === true) {
      if(data['masterDataMinExpirationMonth'] === undefined || data['masterDataMinExpirationMonth'] < 1) {
        event.isValid = false;
        event.errorText = `You must enter masterDataMinExpirationMonth and greater than zero`;
        return;
      }

    }
    if(data['masterDataIsSerializedOut'] === false || data['masterDataIsSerializedOut'] == undefined) {
      event.isValid = false;
        event.errorText = `Serialized Out Must Be Checked`;
        return;
    }
  }

  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          console.log("jsonData ==> ", jsonData);
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.MASTER_UNIT.NAME}/${GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else {
                this.toaster.error(response.returnObject.split(",").join(" </br>"));
              }
        //Initialize Dev Express Data Grid
        this.dataSource = this._apihandler.getStore(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.MASTER_UNIT.NAME}`,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.GET_ALL,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.GET_BY_ID,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.CREATE,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.EDIT,
          GlobalComponent.Controllers.MASTER_UNIT.API_ACTIONS.DELETE
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
  exportGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.MasterData);
   }
  //Using It Two Downalod File (Template)
  downloadFile() {
    this._filehandler.downloadFile(this.pagesname.MasterData, "xlsx")
  }
}
