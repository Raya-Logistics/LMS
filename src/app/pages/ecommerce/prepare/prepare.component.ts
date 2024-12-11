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
  selector: 'app-prepare',
  templateUrl: './prepare.component.html',
  styleUrls: ['./prepare.component.scss']
})
export class PrepareComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  serialSource!:CustomStore;
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
        'Get-Yard-Prepare-Details',
        `Get-Yard-By-Id`,
        'Create-Yard-Handling',
        `PrepareYard`,
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
      );
      this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockDetails/GetAllSerials`).subscribe({
        next:(response)=>{}
      });
      this.serialSource = this._apihandler.getStoreWithList(
        `${GlobalComponent.BASE_API}/StockDetails`,
        'GetAllSerials',
        `Get-Yard-By-Id`,
        'Create-Yard-Handling',
        `PrepareYard`,
        GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
      );
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Get Out', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.TruckType)
    this.authentication.getInternalPermissionss(this.pagesname.Prepare).subscribe({
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
  getFreeYardLocations(serialNumber: string, companyId:number, warehouseId:number): Observable<any> {
    console.log(serialNumber, companyId, warehouseId, "   getFreeYardLocations")
    return this._apihandler.GetItem(`${GlobalComponent.BASE_API}/StockDetails/Get-Yard-Serial-detailsByWhandCompany?Serial=${serialNumber}&companyId=${companyId}&warehouseId=${warehouseId}`)
  }
  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.dataField === 'serialNumber') {
      e.editorOptions.disabled = false;
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
      };
      if (e.row && e.row.data && e.row.data.warehouseId) {
        this.getFreeYardLocations(e.row.data.serialNumber, e.row.data.companyId, e.row.data.warehouseId).subscribe({
          next:(response) => {
            if(response.success) {

            }else {

            }
          }
        });
      }
    }
  }
  onRowUpdated(e: any) {
    const updatedData = e.data;
    // Logic to handle data after updates to serialNumber and shiftNumber
    console.log("Updated Row:", updatedData);
    // Optionally, call an API to update the data in the backend
    this.updateDataOnServer(updatedData);
  }
  
  updateDataOnServer(data: any) {
    // Implement your API call logic here
    console.log(data, " datadata")
    // this._apihandler.updateItem(`${GlobalComponent.BASE_API}/UpdatePath`, data).subscribe({
    //   next: response => console.log("Update Success", response),
    //   error: error => console.error("Update Failed", error)
    // });
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
