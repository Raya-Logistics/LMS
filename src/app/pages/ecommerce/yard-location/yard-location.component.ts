import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-yard-location',
  templateUrl: './yard-location.component.html',
  styleUrls: ['./yard-location.component.scss']
})
export class YardLocationComponent {
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
  LocationData:any[] = [];
  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService, private http:HttpClient) {
    
  }
  ngOnInit(): void {
      this.dataSource = this._apihandler.getStoreWithList(
        `${GlobalComponent.BASE_API}/StockDetails`,
        'Get-Yard-Location-DetailsUpgrade',
        `Get-Yard-By-Id`,
        'Create-Yard-Handling',
        `LocationYard`,
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
      );
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Assign Location', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.TruckType)
    this.authentication.getInternalPermissionss(this.pagesname.AssignLocation).subscribe({
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
  getFreeYardLocations(warehouseId: number): Observable<any> {
    return this.http.get(`${GlobalComponent.BASE_API}/Location/GrtFreeYardLocationForWarehouse?warehouseId=${warehouseId}`);
  }
  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.dataField === 'location') {
      e.editorOptions.disabled = false;
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
      };

      if (e.row && e.row.data && e.row.data.warehouseId) {
        this.getFreeYardLocations(e.row.data.warehouseId).subscribe({
          next:(response) => {
            const Locations = response.returnObject;
            this.LocationData = Locations;
            // console.log(Locations, " Locations")
            //       e.editorOptions.dataSource = Locations;
            //       e.editorOptions.displayExpr = 'name';
            //       e.editorOptions.valueExpr = 'id';
            // e.editorOptions.dataSource = [
            //   { id: 1, name: 'Option 1' },
            //   { id: 2, name: 'Option 2' }
            // ];
            // e.editorOptions.displayExpr = 'name';
            // e.editorOptions.valueExpr = 'id';
          }
        });
  
      }
    }
  }
  onAcceptClick = (e: DxDataGridTypes.ColumnButtonClickEvent) => {
    const id = e.row?.data?.id;
    if(id) {
      this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/AcceptYard`,id).subscribe({
        next:(response)=>{
          if(response.success) {
                Swal.fire({
                  icon: 'success', // You can change this to 'success', 'warning', etc.
                  title: 'نجاح',
                  text: response.message + "/" + response.arabicMessage,
                  // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
                  confirmButtonText: 'close',
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
        }
      })
    }
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
    const id = e.row?.data?.id;
    if(id) {
      this._apihandler.AddItem(`${GlobalComponent.BASE_API}/StockDetails/CancelYard`,id).subscribe({
        next:(response)=>{
          if(response.success) {
                Swal.fire({
                  icon: 'success', // You can change this to 'success', 'warning', etc.
                  title: 'نجاح',
                  text: response.message + "/" + response.arabicMessage,
                  // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
                  confirmButtonText: 'close',
                  confirmButtonColor: '#3085d6'
                });
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
          this.dataSource = this._apihandler.getStoreWithList(
            `${GlobalComponent.BASE_API}/StockDetails`,
            'Get-Yard-Inspection-Details',
            GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.GET_BY_ID,
            'Create-Yard-Handling',
            GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.EDIT,
            GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
          );
        }
      })
    }
  };
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