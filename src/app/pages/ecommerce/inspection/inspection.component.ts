import { Component } from '@angular/core';
import { NgModel } from '@angular/forms';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inspection',
  templateUrl: './inspection.component.html',
  styleUrls: ['./inspection.component.scss']
})
export class InspectionComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  warehouseData!: CustomStore;
  companyData!: CustomStore;
  itemCodeData:any = [];
  itemCodeData2:any = [];
  transactionTypeData!:CustomStore[];

  requests: string[] = [];
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;
  showModal: boolean = false; // Controls modal visibility
  containerValue:any;
  StatusLookup:any;
  statusValue:any;
  formNumber:any;
  driverName: string = '';
  plateCar: string[] = ['', '', '', ''];
  vendor: string = '';
  rowId!:any;
  selectedReason!: any;  // To bind with the dropdown selection
  rejectionReasons!:any;
  isModalVisible: boolean = false;  // Control modal visibility
  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService) {
    
  }
  ngOnInit(): void {
      this.dataSource = this._apihandler.getStoreWithList(
        `${GlobalComponent.BASE_API}/StockDetails`,
        'Get-Yard-Inspection-Details',
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
        'Create-Yard-Handling',
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
      );
      
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Yard Inspection', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.TruckType)
    this.authentication.getInternalPermissionss(this.pagesname.Inspection).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },
      error:(error) => {
        this.toaster.error('Failed to retrieve permissions');
        console.error('Error retrieving permissions:', error);
      }
    })
    this.initialStatusLookup();
  }
initialStatusLookup() {
  this._apihandler
      .GetItem(`${GlobalComponent.BASE_API}/StockTypeDetails/GetItemStatusYard/true`)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.StatusLookup = response.returnObject;
            this.statusValue = this.StatusLookup[0].od;
          }
        },
      });
      this._apihandler
      .GetItem(`${GlobalComponent.BASE_API}/RejectionReason/GetAllRejectionReasonLookup`)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.rejectionReasons = response.returnObject;
          }
        },
      });
}
  onAcceptClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    // const id = e.row?.data?.id;
    this.rowId = e?.row?.data.id;
    this.containerValue = e?.row?.data.serialNumber;
    this.statusValue = this.StatusLookup?.[0]?.id; // Initialize to first item if exists
    this.formNumber = ''; 
    this.showModal = true;
    // if(id) {
    //   this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/AcceptYard`,id).subscribe({
    //     next:(response)=>{
    //       if(response.success) {
    //             Swal.fire({
    //               icon: 'success', // You can change this to 'success', 'warning', etc.
    //               title: 'نجاح',
    //               text: response.message + "/" + response.arabicMessage,
    //               // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
    //               confirmButtonText: 'close',
    //               confirmButtonColor: '#3085d6'
    //             });
                
    //           this.dataSource = this._apihandler.getStoreWithList(
    //             `${GlobalComponent.BASE_API}/StockDetails`,
    //             'Get-Yard-Inspection-Details',
    //             GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
    //             'Create-Yard-Handling',
    //             GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
    //             GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
    //           );
    //       }else {
    //             Swal.fire({
    //               icon: 'error', // You can change this to 'success', 'warning', etc.
    //               title: 'خطأ',
    //               text: response.message,
    //               // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
    //               confirmButtonText: 'close',
    //               confirmButtonColor: '#3085d6'
    //             });
    //       }
    //     }
    //   })
    // }
    // Swal.fire({
    //   icon: 'info', // You can change this to 'success', 'warning', etc.
    //   title: 'انتظر',
    //   text: "under construction",
    //   // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
    //   confirmButtonText: 'close',
    //   confirmButtonColor: '#3085d6'
    // });
  };
  onRejectClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    this.rowId = e.row?.data?.id;
    this.isModalVisible = true;
    this.containerValue = e?.row?.data.serialNumber;
    // this.sr.detectChanges(); // Force change detection to update the view
    console.log('isModalVisible:', this.isModalVisible); // Check this log
  }
    // const id = e.row?.data?.id;
    // if(id) {
    //   this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/CancelYard`,id).subscribe({
    //     next:(response)=>{
    //       if(response.success) {
    //             Swal.fire({
    //               icon: 'success', // You can change this to 'success', 'warning', etc.
    //               title: 'نجاح',
    //               text: response.message + "/" + response.arabicMessage,
    //               // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
    //               confirmButtonText: 'close',
    //               confirmButtonColor: '#3085d6'
    //             });
    //       }else {
    //             Swal.fire({
    //               icon: 'error', // You can change this to 'success', 'warning', etc.
    //               title: 'خطأ',
    //               text: response.message,
    //               // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
    //               confirmButtonText: 'close',
    //               confirmButtonColor: '#3085d6'
    //             });
    //       }
    //       this.dataSource = this._apihandler.getStoreWithList(
    //         `${GlobalComponent.BASE_API}/StockDetails`,
    //         'Get-Yard-Inspection-Details',
    //         GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
    //         'Create-Yard-Handling',
    //         GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
    //         GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
    //       );
    //     }
    //   })
    // }
  // };

  closeReasonModal() {
    // Close the modal by setting isModalVisible to false
    this.rowId = null;
    this.isModalVisible = false;
    this.selectedReason = null;
  }
  submitRejection = () => {
    if (this.selectedReason) {
      // Call the CancelYard API with the id and selected reason
      this._apihandler.AddItem(
        `${GlobalComponent.BASE_API}/StockDetails/CancelYard`,
        { stockDetailsId:this.rowId, rejectedReasonId: this.selectedReason }
      ).subscribe({
        next: (response) => {
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'نجاح',
              text: `${response.message} / ${response.arabicMessage}`,
              confirmButtonText: 'Close',
              confirmButtonColor: '#3085d6'
            });
            this.dataSource = this._apihandler.getStoreWithList(
              `${GlobalComponent.BASE_API}/StockDetails`,
              'Get-Yard-Inspection-Details',
              GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
              'Create-Yard-Handling',
              GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
              GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
            );
            this.closeReasonModal();  // Close modal on success
          } else {
            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: response.message,
              confirmButtonText: 'Close',
              confirmButtonColor: '#3085d6'
            });
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'حدث خطأ',
            text: 'هناك مشكلة في الاتصال بالخادم.',
            confirmButtonText: 'Close',
            confirmButtonColor: '#3085d6'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'تحذير',
        text: 'يرجى تحديد سبب الرفض.',
        confirmButtonText: 'Close',
        confirmButtonColor: '#3085d6'
      });
    }
  };
  closeModal() {
    this.rowId = null;
    this.showModal = false; // Hide the modal
    this.resetForm(); // Reset form fields
  }
  isPlateCarIncomplete(): boolean {
    return (
      !this.plateCar[0] ||
      !this.isValidNumber(this.plateCar[0]) ||
      this.plateCar.slice(1).some((p) => !/^[\u0600-\u06FF]$/.test(p))
    );
  }

  // Check if any of the plate car inputs have been touched
  arePlateCarInputsTouched(
    plateCar0Input: NgModel | null,
    plateCar1Input: NgModel | null,
    plateCar2Input: NgModel | null,
    plateCar3Input: NgModel | null
  ): boolean {
    return !!(plateCar0Input?.touched || plateCar1Input?.touched || plateCar2Input?.touched || plateCar3Input?.touched);
  }

  isValidNumber(value: string): boolean {
    const num = Number(value);
    return !isNaN(num) && num >= 1 && num <= 9999;
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Allow only numbers (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  allowOnlyArabicCharacters(event: KeyboardEvent): void {
    const arabicCharRegex = /^[\u0600-\u06FF]$/;
    const char = event.key;

    // Prevent input if the character does not match the Arabic character regex
    if (!arabicCharRegex.test(char)) {
      event.preventDefault();
    }
  }
  resetForm() {
    this.driverName = '';
    this.plateCar = ['', '', '', ''];
    this.vendor = '';
    this.formNumber = '';
  }

  validateForm(): boolean {
    return !!this.driverName && this.plateCar.every(p => !!p) && !!this.vendor;
  }

  save() {
    if (this.validateForm() && this.rowId) {
      const data = {
        id: this.rowId,
        driverName: this.driverName,
        plateCar: this.plateCar.join(''),
        vendor: this.vendor,
        formNumber: this.formNumber,
        status: this.statusValue
      };
      this.submitData(data);
    } else {
      this.toaster.error('Please fill out all required fields');
    }
  }

  submitData(data: any) {
    console.log(data , " data")
     this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/AcceptYardUpgrade`, data).subscribe({
       next: (response) => {
         if(response.success) {
           this.dataSource = this._apihandler.getStoreWithList(
             `${GlobalComponent.BASE_API}/StockDetails`,
             'Get-Yard-Inspection-Details',
             GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
             'Create-Yard-Handling',
             GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
             GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
           );
           
         this.toaster.success('Transaction confirmed successfully');
         this.closeModal();
         }else {
           Swal.fire({
             icon: 'error', // You can change this to 'success', 'warning', etc.
             title: 'خطأ',
             text: response.message,
             // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
             confirmButtonText: 'close',
             confirmButtonColor: '#3085d6'
           });
         }
       },
       error: (error:any) => {
         this.toaster.error('Failed to confirm transaction');
         console.error('Error:', error);
       }
     });
   }
  // saveAndPrint() {
  //   Swal.fire({
  //     icon: 'info', // You can change this to 'success', 'warning', etc.
  //     title: 'انتظر',
  //     text: "under construction",
  //     // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
  //     confirmButtonText: 'close',
  //     confirmButtonColor: '#3085d6'
  //   });
  //   // if (this.validateForm() && this.rowId) {
  //   //   const data = {
  //   //     id: this.rowId,
  //   //     driverName: this.driverName,
  //   //     plateCar: this.plateCar.join(''),
  //   //     vendor: this.vendor,
  //   //   };
  //   //   this.submitData(data);
  //   //   this.printData(data); // Print logic
  //   // } else {
  //   //   this.toaster.error('Please fill out all required fields');
  //   // }
  // }


  printData(data: any) {
    // Printing logic here, e.g., opening a new window with data
    console.log('Printing data:', data);
  }
  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRUCK_TYPE.NAME}/${GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
                this.toaster.error(response.returnObject.split(",").join(" </br>"));
                this.dataSource = this._apihandler.getStore(
                  `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.TRUCK_TYPE.NAME}`,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_ALL,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.CREATE,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
                  GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
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
    this._filehandler.exportGrid(e, this.pagesname.TruckType);
   }
  //Using It Two Downalod File (Template)
  downloadFile() {
    this._filehandler.downloadFile(this.pagesname.TruckType, "xlsx")
  }
}
