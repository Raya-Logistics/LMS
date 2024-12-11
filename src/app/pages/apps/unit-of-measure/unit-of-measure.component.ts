import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
// import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
// Our demo infrastructure requires us to use 'file-saver-es'. We recommend that you use the official 'file-saver' package in your applications.
import { exportDataGrid } from 'devextreme/excel_exporter';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL = 'https://localhost:7202/api/UnitOfMeasure';
const BaseBasicURL = 'https://localhost:7202/api/BasicUnitOfMeasure';
const BaseURL_GetAll = 'get-all-unitofmeasure';
const BaseURL_GetAllPaged = 'get-all-unitofmeasure-pagination';
const BaseURL_Basic_Lookup = 'get-all-basicUnitOfMeasure_lookups';
const BaseURL_Class_Lookup = 'get-all-classUnitOfMeasure_lookups';
const BaseURL_GetById = 'get-unitofmeasure-by-id';
const BaseURL_Post = 'Create-unitofmeasure';
const BaseURL_Update = 'edit-unitofmeasure';
const BaseURL_Delete = 'deleted-unitofmeasure';
@Component({
  selector: 'app-unit-of-measure',
  templateUrl: './unit-of-measure.component.html',
  styleUrls: ['./unit-of-measure.component.scss']
})
export class UnitOfMeasureComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  basicData!: CustomStore;
  classData!: CustomStore;
  unitofmeasureForm!:FormGroup;
  classLookupData!: any;
  basicLookData!: any;
  requests: string[] = [];
  isLoading:boolean = false;
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  classSelectedValue:any;
  basicSelectedValue:any;
  conversionResult:any;
  conversionValueInput:any;
  codeValue:string="";
  apiError:any;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;

  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toastService: ToastrService,
    private authentication:AuthenticationService) {
    
  }
  ngOnInit(): void {
    this.unitofmeasureForm = new FormGroup({
      code: new FormControl(null, Validators.required),
      name : new FormControl(null, Validators.required),
      descriptions: new FormControl(null, Validators.required),
      creaatedDate: new FormControl(null),
      createdBy: new FormControl(null),
      modifiedDate: new FormControl(null),
      modifiedBy: new FormControl(null),
      basicUomId: new FormControl(null, Validators.required),
      conversionValue: new FormControl(null, Validators.required)
    });
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/BasicUnitOfMeasure/${BaseURL_Basic_Lookup}`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.basicLookData = response.returnObject
        }
      },
      error: (error)=>{
        console.log("error", error)
      }
    });
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/BasicUnitOfMeasure/${BaseURL_Class_Lookup}`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.classLookupData = response.returnObject;
        }
      },
      error: (error)=>{
        console.log("error", error)
      }
    });
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/UnitOfMeasure`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete)
    this.basicData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/BasicUnitOfMeasure`, BaseURL_Basic_Lookup,"","",
      "","")
      this.classData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/BasicUnitOfMeasure`, BaseURL_Class_Lookup,"","",
      "","")
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Unit Of Measure', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.UnitOfMeasure)
    this.authentication.getInternalPermissionss(this.pagesname.UnitOfMeasure).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },
      error:(error) => {
        this.toastService.error('Failed to retrieve permissions');
        console.error('Error retrieving permissions:', error);
      }
    })
  }
  onRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['code', 'name', 'basicUomId'];

    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
  }

  exportGrid(e:any) {
    this._filehandler.exportGrid(e, "unitOfMeasure");
   }


  addUnitOfMeasure(_FormGroup:FormGroup){
    console.log(_FormGroup.value)
    if (_FormGroup.valid) {
      console.log(_FormGroup.value);
      this.isLoading = true;
      this._apihandler.AddItem(`${GlobalComponent.BASE_API}/UnitOfMeasure/${BaseURL_Post}`, _FormGroup.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.success) {
            this.toastService.success(response.message);
            
            // Fetch updated data from the server
            this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/UnitOfMeasure`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
              BaseURL_Update,BaseURL_Delete)
  
          } else {
            this.toastService.error(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.apiError = error.error.message;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  classSelectChanged() {
    console.log(this.classSelectedValue)
    for(const item of this.basicLookData){
      if(item.id == this.classSelectedValue)
        this.basicSelectedValue = item.name
    }
  }
  conversionValueFunc() {
    console.log("conversionValueFunc => ", this.classSelectedValue)
    if(this.classSelectedValue == undefined || this.classSelectedValue == null) {
      this.conversionResult = "";
    }else if(Number(this.conversionValueInput) && this.codeValue != ""){
      this.conversionResult = `1 ${this.codeValue} = ${this.conversionValueInput} ${this.basicSelectedValue}`
      console.log("else if =>", this.conversionResult);
    }
  }

  get code() {
    return this.unitofmeasureForm.get('code');
  }
  get name() {
    return this.unitofmeasureForm.get('name');
  }
  get descriptions() {
    return this.unitofmeasureForm.get('descriptions');
  }
  get basicUomId() {
    return this.unitofmeasureForm.get('basicUomId');
  }
  get conversionValue() {
    return this.unitofmeasureForm.get('conversionValue');
  }
}
