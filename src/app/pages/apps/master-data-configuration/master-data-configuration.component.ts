import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import CustomStore from 'devextreme/data/custom_store';
import saveAs from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
const BaseCompanyURL_Lookup = 'getAllCompaniesForUser?assignedCompany=true';
const BASE_API = GlobalComponent.BASE_API;
const CATEGORY = GlobalComponent.Controllers.CATEGORY.NAME;
const CATEGORY_LOOKUP = GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_LOOKUP + '?IsActiveOnly=true';
const BRAND = GlobalComponent.Controllers.BRAND.NAME;
const BRAND_LOOKUP = GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_LOOKUP + '?IsActiveOnly=true';

@Component({
  selector: 'app-master-data-configuration',
  templateUrl: './master-data-configuration.component.html',
  styleUrls: ['./master-data-configuration.component.scss']
})
export class MasterDataConfigurationComponent {
  dropDownOptions = { width: 500 };
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:any;
  permissionIsLoadded:boolean = false;
  brandSource!:CustomStore;
  categorySource!:CustomStore;
  itemSource!:CustomStore;

  //Item
  brandData!:CustomStore;
  categoryData!:CustomStore;
  companyData!:CustomStore;
  storageTypesData!:CustomStore;
  palletCategoryData!:CustomStore;
  palletCategorySource!:CustomStore;
  
  companyLookUp: any;
  itemCodeLookUp: any;
  ItemForm!: FormGroup;
  isLoading: boolean = false;
  LastDataForm:any;
  companySelectedValue: number = 0;
  apiError:string = "";
  firstTime:boolean = true;
  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService,
    private authentication:AuthenticationService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService) {
  }
  ngOnInit(): void {

    const data = [
      { item: 10, amount: 10000, category: "agn" },
      { item: 20, amount: 100, category: "agn" },
      { item: 20, amount: 200, category: "agn" },
      { item: 20, amount: 300, category: "agn" },
      { item: 20, amount: 300, category: "agn" },
      { item: 90, amount: 0, category: "kero" },
      { item: 30, amount: 200, category: "agxn" },
      { item: 40, amount: 400, category: "agxn" },
      { item: 40, amount: 500, category: "agxn" },
      { item: 40, amount: 900, category: "agxn" },
      { item: 40, amount: 900, category: "agxn" },
      { item: 30, amount: 0, category: "dida" },
    ];
    
    
    const updatedData = this.adjustAmounts(data);
    console.log(updatedData," updatedData");
    
    
  
  
    this.initialBrandeData();
    this.initialCategoryData();
    this.initialPalletCategory();
    this.initialItem();
    // this.initialAisle();
    this.breadCrumbItems = [
      { label: "Home" },
      { label: "Master Data Configuration", active: true },
    ];
    const pageNamesArray = [this.pagesname.Brand, this.pagesname.Category, this.pagesname.PalletCategory, this.pagesname.Item];

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

  adjustAmounts(data:any) {
    let currentCategory = data[0].category;
    let sum = 0;
  
    for (let i = 0; i < data.length; i++) {
      if (data[i].category === currentCategory) {
        sum += data[i].amount;
      } else {
        if (data[i].amount === 0) {
          data[i].amount = sum;
        }
        currentCategory = data[i].category;
        sum = data[i].amount;
      }
    }
    return data;
  }
  initialBrandeData() {
    this.brandSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.BRAND.NAME}`,
      GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_ALL,
      GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_BY_ID,
      GlobalComponent.Controllers.BRAND.API_ACTIONS.CREATE,
      GlobalComponent.Controllers.BRAND.API_ACTIONS.EDIT,
      GlobalComponent.Controllers.BRAND.API_ACTIONS.DELETE
    );
  }
  onBrandRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['brandName'];

    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
  }

  onBrandFileSelected(event: any) {
    // const files = event.value;
    // for (const file of files) {
    //   this._filehandler.getjsonDataFromFile(file)
    //     .then(jsonData => {
    //       this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.BRAND.NAME}/${GlobalComponent.Controllers.BRAND.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
    //         next:(response)=>{
    //           if(response.success) {
    //             this.toaster.success("Added Succefuly");
    //             this.dataSource = this._apihandler.getStore(
    //               `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.BRAND.NAME}`,
    //               GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_ALL,
    //               GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_BY_ID,
    //               GlobalComponent.Controllers.BRAND.API_ACTIONS.CREATE,
    //               GlobalComponent.Controllers.BRAND.API_ACTIONS.EDIT,
    //               GlobalComponent.Controllers.BRAND.API_ACTIONS.DELETE
    //             );
    //           }
    //           else
    //           this.toaster.error(response.returnObject.split(",").join(" </br>"));
    //         },
    //         error:(e) =>{
    //           this.toaster.error(e);
    //         }
    //       })
    //     })
    //     .catch(error => {
    //       console.error('Error processing file:', error);
    //     });
    // }
  }
  exportBrandGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.Brand);
   }
  //Using It Two Downalod File (Template)
  downloadBrandFile() {
    this._filehandler.downloadFile(this.pagesname.Brand, "xlsx")
  }

  initialCategoryData() {
    this.categorySource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.CATEGORY.NAME}`,
      GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_ALL,
      GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_BY_ID,
      GlobalComponent.Controllers.CATEGORY.API_ACTIONS.CREATE,
      GlobalComponent.Controllers.CATEGORY.API_ACTIONS.EDIT,
      GlobalComponent.Controllers.CATEGORY.API_ACTIONS.DELETE
    );
  }
  onCategoryRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['categoryName'];

    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
  }
  onCategoryFileSelected(event: any) {
    // const files = event.value;
    // for (const file of files) {
    //   this._filehandler.getjsonDataFromFile(file)
    //     .then(jsonData => {
    //       this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.CATEGORY.NAME}/${GlobalComponent.Controllers.CATEGORY.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
    //         next:(response)=>{
    //           if(response.success) {
    //             this.toaster.success(response.returnObject.split(",").join(" </br>"));
    //             this.dataSource = this._apihandler.getStore(
    //               `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.CATEGORY.NAME}`,
    //               GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_ALL,
    //               GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_BY_ID,
    //               GlobalComponent.Controllers.CATEGORY.API_ACTIONS.CREATE,
    //               GlobalComponent.Controllers.CATEGORY.API_ACTIONS.EDIT,
    //               GlobalComponent.Controllers.CATEGORY.API_ACTIONS.DELETE
    //             );
    //           }
    //           else
    //           this.toaster.error(response.returnObject.split(",").join(" </br>"));
    //     //Initialize Dev Express Data Grid
    //     this.dataSource = this._apihandler.getStore(
    //       `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.CATEGORY.NAME}`,
    //       GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_ALL,
    //       GlobalComponent.Controllers.CATEGORY.API_ACTIONS.GET_BY_ID,
    //       GlobalComponent.Controllers.CATEGORY.API_ACTIONS.CREATE,
    //       GlobalComponent.Controllers.CATEGORY.API_ACTIONS.EDIT,
    //       GlobalComponent.Controllers.CATEGORY.API_ACTIONS.DELETE
    //     );
    //         },
    //         error:(e) =>{
    //           this.toaster.error(e);
    //         }
    //       })
    //     })
    //     .catch(error => {
    //       console.error('Error processing file:', error);
    //     });
    // }
  }
  exportCategoryGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.Category);
   }
  //Using It Two Downalod File (Template)
  downloadCategoryFile() {
    this._filehandler.downloadFile(this.pagesname.Category, "xlsx")
  }

initialPalletCategory() {
  this.palletCategorySource = this._apihandler.getStore(
    `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.PALLET_CATEGORY.NAME}`,
    GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.GET_ALL,
    GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.GET_BY_ID,
    GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.CREATE,
    GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.EDIT,
    GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.DELETE
  );
}

onPalletCategoryRowValidating(event: any) {
  const data = { ...event.oldData, ...event.newData };
  const requiredFields = ['categoryName', 'descriptions', 'type', 'height', 'depth', 'width'];
  const numericFields = ['height', 'depth', 'width'];
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
      event.errorText = `You must enter ${field} and >= zero`;
      return;
    }
  }
}

onPalletCategoryFileSelected(event: any) {
  // const files = event.value;
  // for (const file of files) {
  //   this._filehandler.getjsonDataFromFile(file)
  //     .then(jsonData => {
  //       console.log('JSON data:', jsonData);
  //       this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.PALLET_CATEGORY.NAME}/${GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
  //         next:(response)=>{
  //           if(response.success)
  //             this.toaster.success(response.returnObject.split(",").join(" </br>"));
  //           else
  //             this.toaster.error(response.returnObject.split(",").join(" </br>"));
  //             this.dataSource = this._apihandler.getStore(
  //               `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.PALLET_CATEGORY.NAME}`,
  //               GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.GET_ALL,
  //               GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.GET_BY_ID,
  //               GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.CREATE,
  //               GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.EDIT,
  //               GlobalComponent.Controllers.PALLET_CATEGORY.API_ACTIONS.DELETE
  //             );
  //         },
  //         error:(e) =>{
  //           this.toaster.error(e);
  //         }
  //       })
  //     })
  //     .catch(error => {
  //       console.error('Error processing file:', error);
  //     });
  // }
}
exportPalletCategoryGrid(e:any) {
  this._filehandler.exportGrid(e, this.pagesname.PalletCategory);
 }
//Using It Two Downalod File (Template)
downloadPalletCategoryFile() {
  this._filehandler.downloadFile(this.pagesname.PalletCategory, "xlsx")
}



  initialItem() {
    this.itemSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
      `GetAllItem`,
      GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
      GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
      GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
      GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
    );
    this.categoryData = this._apihandler.getStore(`${BASE_API}/${CATEGORY}`, CATEGORY_LOOKUP,"","",
      "","");
      this.brandData = this._apihandler.getStore(`${BASE_API}/${BRAND}`, BRAND_LOOKUP,"","",
      "","");
      this.companyData = this._apihandler.getStore(`${BASE_API}/Company`, 'getAllCompanyLookup',"","",
        "","");
        this.storageTypesData = this._apihandler.getStore(`${BASE_API}/StorageType`, "get-all-storageType_lookups","","",
          "","");
          this.palletCategoryData = this._apihandler.getStore(`${BASE_API}/PalletCategory`, 'GetPalletCategoryLookup?IsActiveOnly=true',"","",
            "","");
  }



  onItemRowValidating(event: any) {
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
    e.data.itemDetailCbm = sqmPerPallet * (itemHeight/100) * high;
    const newItemDetail = {
      itemDetailTieVertical: e.data.itemDetailTieVertical || 0,
      itemDetailTieHorizontal: e.data.itemDetailTieHorizontal || 0,
      itemDetailHigh: e.data.itemDetailHigh || 0,
      itemDetailSpc: high * tieV * tieH,
      itemDetailSpcStacking: high * tieV * tieH * conversion,
      itemDetailPalletCategoryId: e.data.itemDetailPalletCategoryId || 0,
      itemDetailStorageTypeId: e.data.itemDetailStorageTypeId || 0,
      itemDetailSqmPerPallet: sqmPerPallet,
      itemDetailCbm: sqmPerPallet * (itemHeight/100) * high,
      itemDetailConversion: e.data.itemDetailConversion || null,
      itemDetailItemId: itemHeader.id, // Link to the item header
      itemDetailIsActive: true
    };
    console.log("Details  ==> ", newItemDetail)
  this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM_DETAIL.NAME}/${GlobalComponent.Controllers.ITEM_DETAIL.API_ACTIONS.CREATE}`, newItemDetail).subscribe({
    next:(response) => {
      if(response.success) {
        this.itemSource = this._apihandler.getStore(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
          `${GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL_ITEM_FOR_USER}?assignedCompany=true`,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
        );
      }else {
        this.toaster.error(response.arabicMessage)
        this.itemSource = this._apihandler.getStore(
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
    e.data.itemDetailCbm = sqmPerPallet * (itemHeight/100) * high
    const updateItemDetail = {
      itemDetailTieVertical: tieV || 0,
      itemDetailTieHorizontal: tieH || 0,
      itemDetailHigh: high || 0,
      itemDetailSpc: high * tieV * tieH,
      itemDetailSpcStacking: high * tieV * tieH * conversion,
      itemDetailPalletCategoryId: e.newData.itemDetailPalletCategoryId !== undefined ? e.newData.itemDetailPalletCategoryId : e.oldData.itemDetailPalletCategoryId,
      // itemDetailStorageTypeId: e.data.itemDetailStorageTypeId !== undefined ? e.newData.itemDetailStorageTypeId : e.oldData.itemDetailStorageTypeId,
      itemDetailSqmPerPallet: sqmPerPallet,
      itemDetailCbm: sqmPerPallet * (itemHeight/100) * high,
      itemDetailConversion: e.newData.itemDetailConversion !== undefined ? e.newData.itemDetailConversion : e.oldData.itemDetailConversion,
      itemDetailItemId: itemHeader.id,
      id: e.oldData.id,
      itemDetailIsActive: true
    };
    console.log(updateItemDetail)
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM_DETAIL.NAME}/${GlobalComponent.Controllers.ITEM_DETAIL.API_ACTIONS.EDIT}`, updateItemDetail).subscribe({
      next:(response) => {
        if(response.success) {
          this.itemSource = this._apihandler.getStore(
            `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
            `${GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL_ITEM_FOR_USER}?assignedCompany=true`,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
            GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
          );
        }else {
          this.toaster.error(response.arabicMessage)
          this.itemSource = this._apihandler.getStore(
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
  onItemFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler
        .getjsonDataFromFile(file)
        .then((jsonData) => {
          console.log("JSON data:", jsonData);
          this.spinner.show();
          this._apihandler
            .AddItem(
              `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}/${GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE_LIST}`,
              jsonData
            )
            .subscribe({
              next: (response) => {
                if (response.success){
                  this.spinner.hide();
                  this.toaster.success(
                    "Added Successfuly"
                  );
                }else {
                  this.spinner.hide();
                  Swal.fire({
                    icon: 'error', 
                    title: 'خطأ...',
                    text: response.returnObject.split(",").join(","),
                    confirmButtonText: 'close',
                    confirmButtonColor: '#3085d6'
                  });
                }
                  this.itemSource = this._apihandler.getStore(
                    `${GlobalComponent.BASE_API}/Item`,
                    GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_ALL,
                    GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
                    GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
                    GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
                    GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
                  );
              },
              error: (e) => {
                this.toaster.error(e);
                this.spinner.hide();
              },
            });
        })
        .catch((error) => {
          console.error("Error processing file:", error);
          this.spinner.hide();
        });
    }
  }

  //Use It To Export All Data Or Selected Data In Excel Or Pdf File
  exportItemGrid(e: any) {
    this._filehandler.exportGrid2(e, this.pagesname.Item);
  }
  //Using It Two Downalod File (Template)
  downloadItemFile() {
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
        this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Item/GetAllItemForCompanyAndItemCode?companyId=${this.companySelectedValue}&itemcode=${form.value.itemCode}`).subscribe({
          next: (response) => {
            if(response.success) {
              this.apiError = "";
              this.itemSource = response.returnObject;
            }else {
              this.isLoading = false;
              this.apiError = "لا يوجد منتاجات لهذه الشركة"
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error("API call error:", error);
          }
        });
        this.apiError ="";
        this.itemSource = this._apihandler.getStore(
          `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM.NAME}`,
          `GetAllItemForCompanyAndItemCode?companyId=${this.companySelectedValue}&itemcode=${form.value.itemCode}`,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.GET_BY_ID,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.CREATE,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.EDIT,
          GlobalComponent.Controllers.ITEM.API_ACTIONS.DELETE
        );
      }else {
        this.apiError ="";
        this.itemSource = this._apihandler.getStore(
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
