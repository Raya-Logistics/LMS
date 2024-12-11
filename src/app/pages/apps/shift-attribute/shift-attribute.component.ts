import { Component, Input, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { saveAs } from 'file-saver-es';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL_GetAll = 'get-all-shiftAttribute';
const BaseURL_GetById = 'get-shiftAttribute-by-id';
const BaseURL_Post = 'Create-shiftAttribute';
const BaseURL_PostAll = 'Create-list-shiftAttribute';
const BaseURL_Update = 'edit-shiftAttribute';
const BaseURL_Delete = 'deleted-shiftAttribute';
@Component({
  selector: 'app-shift-attribute',
  templateUrl: './shift-attribute.component.html',
  styleUrls: ['./shift-attribute.component.scss']
})
export class ShiftAttributeComponent implements OnInit{
  @Input() isChildComponent: boolean = false;

  //DevExpress And Template Definations
  readonly allowedPageSizes = [5, 10, 'all'];
  readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
  displayMode = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  breadCrumbItems!: Array<{}>;
  //SiftAtrribute Data
  dataSource!: CustomStore;  
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
   this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    BaseURL_Update,BaseURL_Delete)
    this.breadCrumbItems = [
        { label: 'Home' },
        { label: 'Shift Attribute', active: true }
    ];
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.ShiftAttribute)
    this.authentication.getInternalPermissionss(this.pagesname.ShiftAttribute).subscribe({
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
    const requiredFields = ['attributeName'];
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
          this._apihandler.AddItem(`${GlobalComponent.BASE_API}/ShiftsAttribute/${BaseURL_PostAll}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success) {
                this.toaster.success(response.returnObject.split(",").join(" </br>"));
              }else {
                this.toaster.error(response.returnObject.split(",").join(" </br>"));
              }
              this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
              BaseURL_Update,BaseURL_Delete);
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
    this._filehandler.exportGrid(e, this.pagesname.ShiftAttribute);
   }
  // Function to handle file download
  downloadFile() {
    const filename = `${this.pagesname.ShiftAttribute}.xlsx`;
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }
}
