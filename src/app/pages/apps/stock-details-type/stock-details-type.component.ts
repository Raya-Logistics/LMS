import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { GlobalComponent } from 'src/app/global-component';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-stock-details-type',
  templateUrl: './stock-details-type.component.html',
  styleUrls: ['./stock-details-type.component.scss']
})
export class StockDetailsTypeComponent {
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  requests: string[] = [];
  refreshModes = ['full', 'reshape', 'repaint'];
  refreshMode = 'reshape';
  breadCrumbItems!: Array<{}>;
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;

  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService) {
    
  }
  ngOnInit(): void {
    this.dataSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM_STATUS.NAME}`,
      GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.GET_ALL,
      GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.GET_BY_ID,
      GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.CREATE,
      GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.EDIT,
      GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.DELETE
    );
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Items Status', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.ItemsStatus)
    this.authentication.getInternalPermissionss(this.pagesname.ItemsStatus).subscribe({
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
  onRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['type'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
  }
  onFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          console.log('JSON data:', jsonData);
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM_STATUS.NAME}/${GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success)
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              else
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
              this.dataSource = this._apihandler.getStore(
                `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.ITEM_STATUS.NAME}`,
                GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.GET_ALL,
                GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.GET_BY_ID,
                GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.CREATE,
                GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.EDIT,
                GlobalComponent.Controllers.ITEM_STATUS.API_ACTIONS.DELETE
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
  //Use It To Export All Data Or Selected Data In Excel Or Pdf File
  exportGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.ItemsStatus);
   }
  //Using It Two Downalod File (Template)
  downloadFile() {
    this._filehandler.downloadFile(this.pagesname.ItemsStatus, "xlsx")
  }
}
