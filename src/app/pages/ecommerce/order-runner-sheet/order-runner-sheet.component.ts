import { Component, ElementRef, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-runner-sheet',
  templateUrl: './order-runner-sheet.component.html',
  styleUrls: ['./order-runner-sheet.component.scss']
})
export class OrderRunnerSheetComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  requests: string[] = [];
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;
  selectedFile: File | null = null;
  dataSource!:CustomStore;
  warehouseSource!:CustomStore;
  companySource!:CustomStore;
  typeSource!:CustomStore;
  orderStatusSource!:CustomStore;
  warehouseLookup:any;
  warehouseSelectedValue:any;
  @ViewChild('fileInputRef') fileInputRef!: ElementRef;
  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private authentication:AuthenticationService,
    private spinner: NgxSpinnerService) {
    
  }
  ngOnInit(): void {
    this.dataSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/OrderRunSheet`,
      'GetAllOrderRunSheet','GetOrderRun','CreateOrderRun','EditOrderRun',''
    );
    this.warehouseSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/Warehouse`,
      'getAllWarehousesForUser?assignedWarehouse=true','','','',''
    );
    this.companySource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/Company`,
      'getAllCompaniesChannelForUser?assignedCompany=true','','','',''
    );
    this.typeSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/StockTypeDetails`,
      'GetItemStatus','','','',''
    );
    this.orderStatusSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/RunSheetStatus`,
      'GetAllRunSheetStatusLookup','','','',''
    );
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/warehouse/getAllWarehousesForUser?assignedWarehouse=true`).subscribe({
      next:(response)=>{
        if(response.success) {
          this.warehouseLookup = response.returnObject;
          this.warehouseSelectedValue = this.warehouseLookup[0].id;
        }
      }
    })
    this.authentication.getInternalPermissionss(this.pagesname.NewOrder).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },});
      this.breadCrumbItems = [
        { label: "Home" },
        { label: "New Order", active: true },
      ];
  }
  initNewRow(e: any) {
    e.data.company = "";
    e.data.warehouse = "";
    e.data.createdBy = "";
    e.data.errorMessage = "";
  }
  downloadFile(): void {
    this.spinner.show();
    this._apihandler.GetItemFile(`${GlobalComponent.BASE_API}/OrderRunSheet/DownloadOrderRunFile`).subscribe({
      next: (response: Blob) => {
        // Create a URL for the file
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'OrderRunSheetTemplate.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Download failed:', error);
      },
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
    }
  }
  // uploadFile() {
  //   if(this.selectedFile != null) {
  //     const formData = new FormData();
  //     formData.append('file', this.selectedFile, this.selectedFile.name);
  //     this.spinner.show();
  //     this._apihandler.AddItemFile(`${GlobalComponent.BASE_API}/OrderRunSheet/UploadOrderRunSheet`, formData).subscribe({
  //       next:(response)=>{
  //         this.spinner.hide();

  //       // Try to parse the response as JSON
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         try {
  //           // Attempt to parse the response as JSON
  //           const jsonResponse = JSON.parse(reader.result as string);
  //           console.log(jsonResponse, "JSON Response");
  //           if (jsonResponse && jsonResponse.message) {
  //             Swal.fire({
  //               icon: 'error', // You can change this to 'success', 'warning', etc.
  //               title: 'خطأ',
  //               text: jsonResponse.message,
  //               // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
  //               confirmButtonText: 'close',
  //               confirmButtonColor: '#3085d6'
  //             });
  //           }
  //         } catch (e) {
  //           const url = window.URL.createObjectURL(response);
  //           const a = document.createElement('a');
  //           a.href = url;
  //           a.download = 'OrderRunSheetResult.xlsx';
  //           document.body.appendChild(a);
  //           a.click();
  //           document.body.removeChild(a);
  //           window.URL.revokeObjectURL(url);
  //           this.dataSource = this._apihandler.getStore(
  //             `${GlobalComponent.BASE_API}/OrderRunSheet`,
  //             'GetAllOrderRunSheet','','','',''
  //           )
  //         }
  //       };

  //       // Read the Blob as text to check if it's JSON
  //       reader.readAsText(response);
  //       }
  //     })
  //   }
  // }
  uploadFile() {
    if (this.selectedFile != null) {
      console.log(this.warehouseSelectedValue, " this.warehouseSelectedValue")
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);
      formData.append('warehouseId', this.warehouseSelectedValue);
      this.spinner.show();
  
      this._apihandler.AddItemFile(`${GlobalComponent.BASE_API}/OrderRunSheet/UploadOrderRunSheet`, formData).subscribe({
        next: (response: Blob) => {
          this.spinner.hide();
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const jsonResponse = JSON.parse(reader.result as string);
              console.log(jsonResponse, " jsonResponse")
              if (jsonResponse && jsonResponse.Success) {
                Swal.fire({
                  icon: 'success',
                  title: 'نجاح',
                  text: jsonResponse.Message || 'تمت معالجة الملف بنجاح',
                  confirmButtonText: 'إغلاق',
                  confirmButtonColor: '#3085d6',
                });
                this.dataSource = this._apihandler.getStore(
                  `${GlobalComponent.BASE_API}/OrderRunSheet`,
                  'GetAllOrderRunSheet','GetOrderRun','','EditOrderRun',''
                );
              } else {
                this.dataSource = this._apihandler.getStore(
                  `${GlobalComponent.BASE_API}/OrderRunSheet`,
                  'GetAllOrderRunSheet','GetOrderRun','','EditOrderRun',''
                );
                Swal.fire({
                  icon: 'error',
                  title: 'خطأ',
                  text: jsonResponse.message,
                  // confirmButtonText: 'تحميل الملف',
                  confirmButtonColor: '#d33',
                  showCancelButton: true,
                  cancelButtonText: 'إلغاء',
                })
              }
            } catch (e) {
              this.dataSource = this._apihandler.getStore(
                `${GlobalComponent.BASE_API}/OrderRunSheet`,
                'GetAllOrderRunSheet','GetOrderRun','','EditOrderRun',''
              );
              Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: 'تم العثور علي خطأ في الملف.',
                confirmButtonText: 'تحميل الملف',
                confirmButtonColor: '#3085d6',
              }).then(() => {
                const url = window.URL.createObjectURL(response);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'OrderRunSheetResult.xlsx'; // Specify the file name
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              });
            }
          };
  
          // Read the response as text to check if it's JSON
          reader.readAsText(response);
        },
        error: (err) => {
          this.spinner.hide();
          console.error("Error uploading file", err);
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: 'حدث خطأ أثناء تحميل الملف. الرجاء المحاولة مرة أخرى.',
            confirmButtonText: 'إغلاق',
            confirmButtonColor: '#d33',
          });
        },
        complete: () => {
          // Reset file input after operation
          this.fileInputRef.nativeElement.value = '';
          this.selectedFile = null;
        },
      });
    }
  }
  
  
  exportGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.PriceListUpgrade);
   }
}
