import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent {
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
        `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.BRAND.NAME}`,
        GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_ALL,
        GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_BY_ID,
        GlobalComponent.Controllers.BRAND.API_ACTIONS.CREATE,
        GlobalComponent.Controllers.BRAND.API_ACTIONS.EDIT,
        GlobalComponent.Controllers.BRAND.API_ACTIONS.DELETE
      );
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Brand', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.Brand)
    this.authentication.getInternalPermissionss(this.pagesname.Brand).subscribe({
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
    const requiredFields = ['brandName'];

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
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.BRAND.NAME}/${GlobalComponent.Controllers.BRAND.API_ACTIONS.CREATE_LIST}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success) {
                this.toaster.success("Added Succefuly");
                this.dataSource = this._apihandler.getStore(
                  `${GlobalComponent.BASE_API}/${GlobalComponent.Controllers.BRAND.NAME}`,
                  GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_ALL,
                  GlobalComponent.Controllers.BRAND.API_ACTIONS.GET_BY_ID,
                  GlobalComponent.Controllers.BRAND.API_ACTIONS.CREATE,
                  GlobalComponent.Controllers.BRAND.API_ACTIONS.EDIT,
                  GlobalComponent.Controllers.BRAND.API_ACTIONS.DELETE
                );
              }
              else
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
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
    this._filehandler.exportGrid(e, this.pagesname.Brand);
   }
  //Using It Two Downalod File (Template)
  downloadFile() {
    this._filehandler.downloadFile(this.pagesname.Brand, "xlsx")
  }
}
