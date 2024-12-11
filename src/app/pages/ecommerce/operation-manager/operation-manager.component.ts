import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-operation-manager',
  templateUrl: './operation-manager.component.html',
  styleUrls: ['./operation-manager.component.scss']
})
export class OperationManagerComponent implements OnInit {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [
    { text: "Display Mode 'full'", value: 'full' },
    { text: "Display Mode 'compact'", value: 'compact' }
  ];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  pagesname = environment.pagesname;
  stockStatusLookUp: any;
  warehouseLookUp: any;
  customerLookUp: any;
  itemStatusLookup: any;
  typeLookUp: any;
  SelectedTypeValue: number = 0;
  companySelectedValue: number = 0;
  transActionId: number = 0;
  requests: string[] = [];
  isDisaled: boolean = true;
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  internalPermission: (string[] | null) = [];
  permissionIsLoadded:boolean = false;

  operationManagerFom!: FormGroup;
  isLoading: boolean = false;
  dataSource!: any[];
  LastDataForm:any;
  IsStockKeeper:boolean = false;
  visibleTransactionDetails:boolean = false;
  visibleTransactionRevokeDetails:boolean = false;
  transactionRevokeDetails:any[]=[];
  expandedRowIndex: number | null = null;
  itemsGroupedBySku:any={};
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  constructor(
    private _apihandler: ApihandlerService,
    private _filehandler: FilehandlerService,
    private toaster: ToastrService,
    private httpClient:HttpClient,
    private spinner: NgxSpinnerService,
    private _router:Router,
    private authentication: AuthenticationService,
    private fb: FormBuilder // Inject FormBuilder
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Home' },
      { label: 'Operation Manager', active: true }
    ];
    var stockKeeperPermission = this.authentication.getInternalPermissions(this.pagesname.HandlingIN);
    if(stockKeeperPermission != null) {
      this.IsStockKeeper = stockKeeperPermission.includes("StockKeeper");
    }
    if(this.IsStockKeeper) {
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/OperationManager/GetAllTransactionsForStoreKeeper`).subscribe({
        next: (response) => {
          this.dataSource = response.returnObject;
          console.log(this.dataSource);
        },
        error: (error) => {
          console.error("API call error:", error);
        }
      });
    }else {
      this.operationManagerFom = this.fb.group({
        statusTransaction: [null],
        warehouseId: [null, Validators.required]
      });
  
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockStatus/GetAllStockStatusLookUp`).subscribe({
        next: response => {
          if (response.success) {
            this.stockStatusLookUp = response.returnObject;
          }
        }
      });
  
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/getAllWarehousesForUser?assignedWarehouse=true`).subscribe({
        next: response => {
          if (response.success) {
            this.warehouseLookUp = response.returnObject;
          }
        }
      });
      this._apihandler
      .GetItem(`${GlobalComponent.BASE_API}/StockTypeDetails/GetItemStatus`)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.itemStatusLookup = response.returnObject;
          }
        },
      });
      // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.OperationManager);
      this.authentication.getInternalPermissionss(this.pagesname.OperationManager).subscribe({
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

  }

  // GetTransactions(form: FormGroup) {
  //   if (form.valid) {
  //     console.log(form.value);
  //     console.log
  //     this._apihandler.AddItem(`${GlobalComponent.BASE_API}/OperationManager/GetAllTransactions`, form.value).subscribe({
  //       next:(response) => {
  //         console.log(response.returnObject, "hello");
  //         this.dataSource = response.returnObject;
  //       }
  //     })
  //   }
  // }
  GetTransactions(form: FormGroup) {
    if (form.valid) {
      if(form.value.statusTransaction == 0 || form.value.statusTransaction == null || form.value.statusTransaction == 'null')
        form.value.statusTransaction = null;
      form.value.warehouseId = Number(form.value.warehouseId)
      this._apihandler.AddItem(`${GlobalComponent.BASE_API}/OperationManager/GetAllTransactionsByWarehouse`, form.value).subscribe({
        next: (response) => {
          this.dataSource = response.returnObject;
          console.log(this.dataSource, " DataSource");
        },
        error: (error) => {
          console.error("API call error:", error);
        }
      });
    }
  }
  onCloneIconClickDetails = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.spinner.show();
    console.log(e.row?.data.transactionID)
    var listOfHandlingIn = [1, 4, 5, 14];
    var listOfHandlingOut = [3,12];
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockHeader/GetStockHeaderDetails/${e.row?.data.transactionID}`).subscribe({
      next:(response) => {
        if(response.success) {
          console.log(response)
          var typeid = response.returnObject.typeId;
          if(listOfHandlingOut.includes(typeid)) {
          }else {
            console.log(response.returnObject.id, " response.returnObject.id");
            this.GetHandlingInOperationData(response.returnObject.id);
          }
        }else {
          this.spinner.hide();
        }
      },
      error:(err)=> {
        this.spinner.hide();
      }
    })
  };

  calculateItemsData(transactionData:any[]): void {
    console.log(transactionData, " transactionData")

    this.itemsGroupedBySku = transactionData.reduce((acc: any, item) => {
      const sku = item.itemSku || "unknown";
      const status = item.itemStatus|| "unknown";
      const quantity = item.quantity || 0;
      const isSerialized = item.itemIsSerializedIn || false;
      if (!acc[sku]) {
        acc[sku] = {
          totalCount: 0,
          totalQuantity: 0,
          isSerialized: false,
          statusQuantities: {}
        };
      }
      acc[sku].totalCount++;
      acc[sku].totalQuantity += quantity;
      if (isSerialized) {
        acc[sku].isSerialized = true;
      }
      if (!acc[sku].statusQuantities[status]) {
        acc[sku].statusQuantities[status] = 0;
      }
      acc[sku].statusQuantities[status] += quantity;
      return acc;
    }, {});
    console.log(this.itemsGroupedBySku, " itemsGroupedBySku")
    this.visibleTransactionDetails = true;
  }
  GetHandlingInOperationData(transactionId: number) {
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/StockDetails/GetHandlingInOpertaionNow/${transactionId}`
      )
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          if (response.success) {
            const HandlingInOperationData = response.returnObject;
            this.calculateItemsData(HandlingInOperationData)
          }
        },
        error:(err) => {
          this.spinner.hide();
        }
      }
    );
  }
  GetHandlingInOperationDataWithGrouping(transactionId: number) {
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/StockDetails/GetHandlingInOpertaionNowWithGrouping/${transactionId}`
      )
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          if (response.success) {
            const HandlingInOperationDataWithGrouping = response.returnObject;
            this.transactionRevokeDetails = HandlingInOperationDataWithGrouping;
            this.visibleTransactionRevokeDetails = true;
          }
        },
        error:(err) => {
          this.spinner.hide();
        }
      }
    );
  }
  onCloneIconClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    Swal.fire({
      icon: 'info', // You can change this to 'success', 'warning', etc.
      title: 'انتظر',
      text: "under construction",
      // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
      confirmButtonText: 'close',
      confirmButtonColor: '#3085d6'
    });
    // this.spinner.show();
    // this._apihandler.GetItem(`${GlobalComponent.BASE_API}/OperationManager/CancelTransaction?transactionId=${e.row?.data.transactionID}`).subscribe({
    //   next: (response) => {
    //     if(response.success) {
    //       this._apihandler.AddItem(`${GlobalComponent.BASE_API}/OperationManager/GetAllTransactionsByWarehouse`, this.operationManagerFom.value).subscribe({
    //         next: (response) => {
    //           this.dataSource = response.returnObject;
    //           this.spinner.hide();
    //         },
    //         error: (error) => {
    //           console.error("API call error:", error);
    //         }
    //       });
    //     }else {
    //       this.spinner.hide();
    //       Swal.fire({
    //         icon: 'error', // You can change this to 'success', 'warning', etc.
    //         title: 'خطأ...',
    //         text: response.message,
    //         // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
    //         confirmButtonText: 'close',
    //         confirmButtonColor: '#3085d6'
    //       });
    //     }
    //   },
    //   error: (error) => {
    //     console.error("API call error:", error);
    //   }
    // });
  };
  onCloneIconClickStatus = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.spinner.show();
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/OperationManager/UpdateTransactionStatud?transactionId=${e.row?.data.transactionID}`).subscribe({
      next: (response) => {
        if(response.success) {
          this.toaster.success("Status Be Issued Successfuly")
          // location.reload();
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/OperationManager/GetAllTransactionsByWarehouse`, this.operationManagerFom.value).subscribe({
            next: (response) => {
              this.spinner.hide();
              this.dataSource = response.returnObject;
            },
            error: (error) => {
              this.spinner.hide();
              console.error("API call error:", error);
            }
          });
        }else {
          this.spinner.hide();
          Swal.fire({
            icon: 'error', // You can change this to 'success', 'warning', etc.
            title: 'خطأ...',
            text: response.message,
            // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
            confirmButtonText: 'close',
            confirmButtonColor: '#3085d6'
          });
        }
      },
      error: (error) => {
        console.error("API call error:", error);
      }
    });
    // var code = e.row?.data.code;
  };
  onCloneIconClickEdit = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    console.log(e.row?.data.transactionID)
    var listOfHandlingIn = [1, 4, 5, 14];
    var listOfHandlingOut = [3,12];
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockHeader/GetStockHeaderDetails/${e.row?.data.transactionID}`).subscribe({
      next:(response) => {
        if(response.success) {
          console.log(response)
          var typeid = response.returnObject.typeId;
          if(listOfHandlingOut.includes(typeid)) {
            this._router.navigate(['handlingOut',response.returnObject.id])
          }else {
            this._router.navigate(['handlingIn',response.returnObject.id])
          }
        }
      }
    })

  };
  onCloneIconClickRevoke = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.spinner.show();
    var listOfHandlingIn = [1, 4, 5, 14];
    var listOfHandlingOut = [3,12];
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockHeader/GetStockHeaderDetails/${e.row?.data.transactionID}`).subscribe({
      next:(response) => {
        if(response.success) {
          if(response.returnObject.statusId == 2 || response.returnObject.statusId == 7) {
            var typeid = response.returnObject.typeId;
            if(listOfHandlingOut.includes(typeid)) {
              this.spinner.hide();
            }else {
              this.GetHandlingInOperationDataWithGrouping(response.returnObject.id);
            }
          }else {
            this.spinner.hide();
            Swal.fire({
              icon: 'error', // You can change this to 'success', 'warning', etc.
              title: 'خطأ...',
              text: "Can't Make Any Action Because This Transaction Is Not In Progress Or Revoked, لا تستطيع عمل اي اضافه تاكد من حاله العمليه",
              // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
              confirmButtonText: 'close',
              confirmButtonColor: '#3085d6',
              allowOutsideClick: false, // Prevents closing when clicking outside
              allowEscapeKey: false,    // Prevents closing with the Escape key
              allowEnterKey: false  
            });
          }
        }else {
          this.spinner.hide();
        }
      },
      error:(err)=> {
        this.spinner.hide();
      }
    })

  };
  toggleSerials(index: number) {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
  }
  getBadgeColor(index: number): string {
    return 'color-' + (index % 7); 
  }
  RevokeRow(Ids: number[]) {
    this._apihandler.EditItem(`${GlobalComponent.BASE_API}/StockDetails/MakeStockDetailsRevoked`, Ids).subscribe({
      next:(response) => {
        if(response.success) {
          //Go To Handling In
          this._router.navigate(['handlingIn',response.returnObject])
        }
      }
    })
  }
}
