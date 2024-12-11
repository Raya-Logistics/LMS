import { Component, OnInit } from "@angular/core";
import CustomStore from "devextreme/data/custom_store";
import { ApihandlerService } from "src/app/services/apihandler.service";
import { FilehandlerService } from "src/app/services/filehandler.service";
import { ToastrService } from "ngx-toastr";
import { GlobalComponent } from "src/app/global-component";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { environment } from "src/environments/environment.prod";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
//Constatnt Variable
const BaseCompanyURL_Lookup = 'getAllCompaniesForUser?assignedCompany=true';
const BASE_API = GlobalComponent.BASE_API;
const CATEGORY = GlobalComponent.Controllers.CATEGORY.NAME;
const CATEGORY_LOOKUP = GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_LOOKUP;
const BRAND = GlobalComponent.Controllers.BRAND.NAME;
const BRAND_LOOKUP = GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_LOOKUP;
@Component({
  selector: "app-item",
  templateUrl: "./item.component.html",
  styleUrls: ["./item.component.scss"],
})
export class ItemComponent {
  readonly allowedPageSizes = [5, 10, "all"];
  readonly displayModes = [
    { text: "Display Mode 'full'", value: "full" },
    { text: "Display Mode 'compact'", value: "compact" },
  ];
  displayMode = "full";
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  // dataSource!: CustomStore;
  dataSource!: any;
  requests: string[] = [];
  refreshModes = ["full", "reshape", "repaint"];
  refreshMode = "reshape";
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  brandData!:CustomStore;
  categoryData!:CustomStore;
  companyData!:CustomStore;
  storageTypesData!:CustomStore;
  palletCategoryData!:CustomStore;
  companyLookUp: any;
  itemCodeLookUp: any;
  ItemForm!: FormGroup;
  isLoading: boolean = false;
  LastDataForm:any;
  companySelectedValue: number = 0;
  apiError:string = "";
  firstTime:boolean = true;
  permissionIsLoadded:boolean = false;

  constructor(
    private _apihandler: ApihandlerService,
    private _filehandler: FilehandlerService,
    private toaster: ToastrService,
    private authentication: AuthenticationService,
    private fb: FormBuilder // Inject FormBuilder
  ) {}
  ngOnInit(): void {
    //Initialize Dev Express Data Grid
    this.dataSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
      `${GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL_ITEM_FOR_USER}?assignedCompany=true`,
      GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
      GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
      GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
      GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
    );
    // this.dataSource = null;
    this.categoryData = this._apihandler.getStore(`${BASE_API}/${CATEGORY}`, CATEGORY_LOOKUP,"","",
      "","");
      this.brandData = this._apihandler.getStore(`${BASE_API}/${BRAND}`, BRAND_LOOKUP,"","",
      "","");
      this.companyData = this._apihandler.getStore(`${BASE_API}/Company`, BaseCompanyURL_Lookup,"","",
        "","");
        this.storageTypesData = this._apihandler.getStore(`${BASE_API}/StorageType`, "get-all-storageType_lookups","","",
          "","");
          this.palletCategoryData = this._apihandler.getStore(`${BASE_API}/PalletCategory`, "get-all-palletCategory_lookups","","",
            "","");
        this.ItemForm = this.fb.group({
          companyId: [null],
          itemCode: [null]
        });
    
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/getAllCompaniesForUser?assignedCompany=true`).subscribe({
          next: response => {
            if (response.success) {
              this.companyLookUp = response.returnObject;
            }
          }
        });
    //Initialize Header Page Data
    this.breadCrumbItems = [
      { label: "Home" },
      { label: "Company's Item", active: true },
    ];
    // Get User Permissions In This Page
    // this.internalPermission = this.authentication.getInternalPermissions(
    //   this.pagesname.Item
    // );
    this.authentication.getInternalPermissionss(this.pagesname.Item).subscribe({
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
  // onRowValidating(e: any) {
  //   const errors = [];
  //   const item = e.newData;
  
  //   // Validate Item Code
  //   if (!item.itemCode || item.itemCode.trim() === '') {
  //     errors.push({ column: 'itemCode', message: 'Item Code is required' });
  //   }
  
  //   // Validate BarCode
  //   if (!item.globalSku || item.globalSku.trim() === '') {
  //     errors.push({ column: 'globalSku', message: 'BarCode is required' });
  //   }
  
  //   // Validate Expiration Days if Is Expiration is true
  //   if (item.itemIsExpiration && (!item.itemMinExpirationDays || item.itemMinExpirationDays <= 0)) {
  //     errors.push({
  //       column: 'itemMinExpirationDays',
  //       message: 'Expiration Days are required when the item is marked as expiration',
  //     });
  //   }
  
  //   if (errors.length) {
  //     e.isValid = false; // Mark the row as invalid
  //     e.errorText = 'There are validation errors'; // General error message
  //     e.brokenRules = errors.map((err) => ({
  //       type: 'custom',
  //       message: err.message,
  //       column: err.column,
  //     }));
  //   }
  // }
  onRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['itemCode', 'globalSku', 'description', 'mainCategory', 
      'width', 'height', 'weight', 'itemLength', 'companyId', 'categoryId', 'brandId'];
    const numericFields = ['weight', 'width', 'height', 'itemLength'];
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

    if((data['itemIsExpiration'] !== undefined && data['itemIsExpiration'] != null && data['itemIsExpiration'] != false) && 
    (data['itemLifeTime'] == undefined || data['itemLifeTime'] == null || data['itemLifeTime'] <= 0)) {
      event.isValid = false;
        event.errorText = `You must enter itemLifeTime because this item is Expiration`;
        return;
    }
    if((data['itemIsExpiration'] !== undefined && data['itemIsExpiration'] != null && data['itemIsExpiration'] != false) && 
    (data['itemLifeTimePercentage'] == undefined || data['itemLifeTimePercentage'] == null || data['itemLifeTimePercentage'] <= 0 || data['itemLifeTimePercentage'] > 100)) {
      event.isValid = false;
        event.errorText = `You must enter itemLifeTimePercentage because this item is Expiration Between(1,100)`;
        return;
    }
  }
  onCellPrepared(e: any) {
    console.log(e)
    if (e.rowType === 'data') {
        if (e.column.dataField === 'itemCode' || e.column.dataField === 'globalSku') {
            e.cellElement.style.backgroundColor = '#838fb9';
            e.cellElement.style.color = "white";
        }
    }
}
  isInteger(params: any): boolean {
    const val = Number(params.value);
    return Number.isInteger(val);
  }
  onItemDetailInserting(e: any, itemHeader: any) {
    console.log(e.data)
    const itemLength = itemHeader.itemLength; 
    const itemHeight = itemHeader.height; 
    const width = itemHeader.width; 
    const tieV = e.data.itemDetailTieVertical;
    const tieH = e.data.itemDetailTieHorizontal;
    const high = e.data.itemDetailHigh;
    const conversion = e.data.itemDetailConversion;
    
    // Calculate itemDetailSqmPerPallet
    const sqmPerPallet = (itemLength * width * tieV * tieH)/ 10000;
    
    // Assign the calculated value
    e.data.itemDetailSqmPerPallet = sqmPerPallet;
    e.data.itemDetailCbm = sqmPerPallet * itemHeight;
    const newItemDetail = {
      itemDetailTieVertical: e.data.itemDetailTieVertical || 0,
      itemDetailTieHorizontal: e.data.itemDetailTieHorizontal || 0,
      itemDetailHigh: e.data.itemDetailHigh || 0,
      itemDetailSpc: high * tieV * tieH,
      itemDetailSpcStacking: high * tieV * tieH * conversion,
      itemDetailPalletCategoryId: e.data.itemDetailPalletCategoryId || 0,
      itemDetailStorageTypeId: e.data.itemDetailStorageTypeId || 0,
      itemDetailSqmPerPallet: sqmPerPallet,
      itemDetailCbm: sqmPerPallet * itemHeight,
      itemDetailConversion: e.data.itemDetailConversion || null,
      itemDetailItemId: itemHeader.id, // Link to the item header
      itemDetailIsActive: true
    };
    console.log("Details  ==> ", newItemDetail)
  this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM_DETAIL.NAME}/${GlobalComponent.Controllers.ITEM_DETAIL.API_ACTIONS.CREATE}`, newItemDetail).subscribe({
    next:(response) => {
      if(response.success) {
        this.dataSource = this._apihandler.getStore(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
          `${GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL_ITEM_FOR_USER}?assignedCompany=true`,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
        );
      }else {
        this.toaster.error(response.arabicMessage)
        this.dataSource = this._apihandler.getStore(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
          `${GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL_ITEM_FOR_USER}?assignedCompany=true`,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
        );
      }
    }
  })
  }

  onItemDetailUpdating(e:any, itemHeader:any) {
    console.log(e)
    const itemLength = itemHeader.itemLength;
    const itemHeight = itemHeader.height; 
    const width = itemHeader.width;
    const tieV = e.newData.itemDetailTieVertical !== undefined ? e.newData.itemDetailTieVertical : e.oldData.itemDetailTieVertical;
    const tieH = e.newData.itemDetailTieHorizontal !== undefined ? e.newData.itemDetailTieHorizontal : e.oldData.itemDetailTieHorizontal;
    const high = e.newData.itemDetailHigh !== undefined ? e.newData.itemDetailHigh : e.oldData.itemDetailHigh;
    const conversion = e.newData.itemDetailConversion !== undefined ? e.newData.itemDetailConversion : e.oldData.itemDetailConversion;
  
    const sqmPerPallet = (itemLength * width * tieV * tieH) / 10000;
    
    e.newData.itemDetailSqmPerPallet = sqmPerPallet;
    e.data.itemDetailCbm = sqmPerPallet * itemHeight;
    const updateItemDetail = {
      itemDetailTieVertical: tieV || 0,
      itemDetailTieHorizontal: tieH || 0,
      itemDetailHigh: high || 0,
      itemDetailSpc: high * tieV * tieH,
      itemDetailSpcStacking: high * tieV * tieH * conversion,
      itemDetailPalletCategoryId: e.newData.itemDetailPalletCategoryId !== undefined ? e.newData.itemDetailPalletCategoryId : e.oldData.itemDetailPalletCategoryId,
      // itemDetailStorageTypeId: e.data.itemDetailStorageTypeId !== undefined ? e.newData.itemDetailStorageTypeId : e.oldData.itemDetailStorageTypeId,
      itemDetailSqmPerPallet: sqmPerPallet,
      itemDetailCbm: sqmPerPallet * itemHeight,
      itemDetailConversion: e.newData.itemDetailConversion !== undefined ? e.newData.itemDetailConversion : e.oldData.itemDetailConversion,
      itemDetailItemId: itemHeader.id,
      id: e.oldData.id,
      itemDetailIsActive: true
    };
    console.log(updateItemDetail)
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM_DETAIL.NAME}/${GlobalComponent.Controllers.ITEM_DETAIL.API_ACTIONS.EDIT}`, updateItemDetail).subscribe({
      next:(response) => {
        if(response.success) {
          this.dataSource = this._apihandler.getStore(
            `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
            `${GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL_ITEM_FOR_USER}?assignedCompany=true`,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
          );
        }else {
          this.toaster.error(response.arabicMessage)
          this.dataSource = this._apihandler.getStore(
            `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
            `${GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL_ITEM_FOR_USER}?assignedCompany=true`,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
          );
        }
      }
    })  
  }
  calculateCellMinExpirationDaysValue(rowData:any){
    const lifeTime = rowData.itemLifeTime || 0;
    const lifeTimePercentage = rowData.itemLifeTimePercentage || 0;
    return (lifeTime * (lifeTimePercentage / 100));
  }
  calculateCellSpcValue(rowData:any){
    const tieV = rowData.itemDetailTieVertical || 0;
    const tieH = rowData.itemDetailTieHorizontal || 0;
    const high = rowData.itemDetailHigh || 0;
    const spc = tieV * tieH * high;
    return spc;
  }
  calculateCellStackingValue(rowData:any){
    const tieV = rowData.itemDetailTieVertical || 0;
    const tieH = rowData.itemDetailTieHorizontal || 0;
    const high = rowData.itemDetailHigh || 0;
    const conversion = rowData.itemDetailConversion || 0;
    const spcStacking = tieV * tieH * high * conversion;
    return spcStacking;
  }
















  //Upload Files Then Call getjsonDataFromFile Method Two Read Data From File And Send It End Point
  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler
        .getjsonDataFromFile(file)
        .then((jsonData) => {
          console.log("JSON data:", jsonData);
          // this._apihandler
          //   .AddItem(
          //     `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}/${GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE_LIST}`,
          //     jsonData
          //   )
          //   .subscribe({
          //     next: (response) => {
          //       if (response.success)
          //         this.toaster.success(
          //           response.returnObject.split(",").join(" </br>")
          //         );
          //       else
          //         this.toaster.error(
          //           response.returnObject.split(",").join(" </br>")
          //         );
          //         this.dataSource = this._apihandler.getStore(
          //           `${GlobalComponent.BASE_API}/Item`,
          //           GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL,
          //           GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
          //           GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
          //           GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
          //           GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
          //         );
          //     },
          //     error: (e) => {
          //       this.toaster.error(e);
          //     },
          //   });
        })
        .catch((error) => {
          console.error("Error processing file:", error);
        });
    }
  }

  //Use It To Export All Data Or Selected Data In Excel Or Pdf File
  exportGrid(e: any) {
    this._filehandler.exportGrid(e, this.pagesname.Item);
  }
  //Using It Two Downalod File (Template)
  downloadFile() {
    this._filehandler.downloadFile(this.pagesname.Item, "xlsx")
  }
  CompanyChanged() {
    if(this.companySelectedValue != undefined && this.companySelectedValue != null) {
      this.isLoading = true;
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Item/GetAllItemForCompanylookup?companyId=${this.companySelectedValue}`).subscribe({
        next: (response) => {
          if(response.success) {
            this.isLoading = false;
            this.apiError = "";
            this.ItemForm.get("itemCode")?.setValue(null);
            this.itemCodeLookUp = response.returnObject;
          }else {
            this.isLoading = false;
            this.apiError = "لا يوجد منتاجات لهذه الشركة"
          }
        },
        error: (error) => {
          console.error("API call error:", error);
        }
      });
    }
  }
  GetItems(form: FormGroup) {
    console.log(form.value, "forms")
    if(form.value.companyId != null && form.value.companyId != 0) {
      if(form.value.itemCode != null && form.value.itemCode != 'null') {
        // this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Item/GetAllItemForCompanyAndItemCode?companyId=${this.companySelectedValue}&itemcode=${form.value.itemCode}`).subscribe({
        //   next: (response) => {
        //     if(response.success) {
        //       this.apiError = "";
        //       this.dataSource = response.returnObject;
        //     }else {
        //       this.isLoading = false;
        //       this.apiError = "لا يوجد منتاجات لهذه الشركة"
        //     }
        //   },
        //   error: (error) => {
        //     this.isLoading = false;
        //     console.error("API call error:", error);
        //   }
        // });
        this.apiError ="";
        this.dataSource = this._apihandler.getStore(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
          `GetAllItemForCompanyAndItemCode?companyId=${this.companySelectedValue}&itemcode=${form.value.itemCode}`,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
        );
      }else {
        this.apiError ="";
        this.dataSource = this._apihandler.getStore(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
          `GetAllItemForCompany?companyId=${this.companySelectedValue}`,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
        );
      }
    }else {
      this.isLoading = false;
      this.apiError = "يجب اختيار شركة علي الاقل"
    }
  }

}
