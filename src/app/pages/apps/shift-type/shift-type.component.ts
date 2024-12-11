import { Component, Input, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { saveAs } from 'file-saver-es';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalComponent } from 'src/app/global-component';
import { environment } from 'src/environments/environment.prod';
import { AuthenticationService } from 'src/app/core/services/auth.service';
const BaseURL_GetAll = 'get-all-shiftsType';
const BaseURL_GetWarehouseForUser = 'getAllWarehousesForUser';
const BaseURL_GetAttributeAll = 'get-all-shiftAttribute_lookups';
const BaseURL_GetById = 'get-shiftsType-by-id';
const BaseURL_Post = 'Create-shiftsType';
const BaseURL_PostAll = 'Create-list-shiftsType';
const BaseURL_Update = 'edit-shiftsType';
const BaseURL_Delete = 'deleted-shiftsType';
@Component({
  selector: 'app-shift-type',
  templateUrl: './shift-type.component.html',
  styleUrls: ['./shift-type.component.scss']
})
export class ShiftTypeComponent {
//DevExpress And Template Definations
readonly allowedPageSizes = [5, 10, 'all'];
readonly displayModes = [{ text: "Display Mode 'full'", value: 'full' }, { text: "Display Mode 'compact'", value: 'compact' }];
displayMode = 'full';
showPageSizeSelector = true;
showInfo = true;
showNavButtons = true;
breadCrumbItems!: Array<{}>;
//SiftAtrribute Data
dropDownOptions = { width: 500 };
dataSource!: CustomStore;  
warehouseSource!: CustomStore;  
attributeData!: CustomStore;  
shiftType: any;
permissionData = environment.permission;
pagesname = environment.pagesname;
internalPermission!:(string[] | null);
permissionIsLoadded:boolean = false;

@Input() isChildComponent: boolean = false;

constructor(private _apihandler : ApihandlerService, 
  private _filehandler : FilehandlerService, 
  private toaster: ToastrService,
  private authentication:AuthenticationService) {
  
}
ngOnInit(): void {
 this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsType`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
  BaseURL_Update,BaseURL_Delete)
  this.warehouseSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/Warehouse`, `${BaseURL_GetWarehouseForUser}?assignedWarehouse=true`,BaseURL_GetById,BaseURL_Post,
  BaseURL_Update,BaseURL_Delete)
  this.attributeData = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsAttribute`, BaseURL_GetAttributeAll,"","",
    "","") 
  this.shiftType = [{id:1, name:"Fixed"}, {id:0, name:"OverTime"}]
  this.breadCrumbItems = [
      { label: 'Home' },
      { label: 'Shift Type', active: true }
  ];
  // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.ShiftType)
  this.authentication.getInternalPermissionss(this.pagesname.ShiftType).subscribe({
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


calculateFilterExpression(filterValue:any, selectedFilterOperation:any, target:any) {
  if (target === 'search' && typeof (filterValue) === 'string') {
    return [(this as any).dataField, 'contains', filterValue];
  }
  return function (rowData:any) {
    return (rowData.AssignedEmployee || []).indexOf(filterValue) !== -1;
  };
}

cellTemplate(container:any, options:any) {
  const noBreakSpace = '\u00A0';

  const assignees = (options.value || []).map(
    (assigneeId: number) => options.column!.lookup!.calculateCellValue!(assigneeId),
  );
  const text = assignees.join(', ');

  container.textContent = text || noBreakSpace;
  container.title = text;
}

onValueChanged(event: any, cellInfo: any) {
  console.log('Value changed:', event.value);
  cellInfo.setValue(event.value);
}

onSelectionChanged(event: any, cellInfo: any) {
  console.log('Selection changed:', event);
  cellInfo.component.updateDimensions();
}

onRowValidating(e: any) {
  console.log(e, "validating");
  const data = { ...e.oldData, ...e.newData };
  if(data.typeIsFixedHour == undefined) {
      e.isValid = false;
      e.errorText = 'You Must Select Shift Type';
      return;
  }else {
    //isFixedType 
    if(data.typeIsFixedHour == 1){
      if(data.typeStartHour == undefined) {
        e.isValid = false;
        e.errorText = "You Must Enter Start Shif Hour If this is Fixed Shift"
        return;
      }else if (data.typeEndHour == undefined){
        e.isValid = false;
        e.errorText = "You Must Enter End Shif Hour If this is Fixed Shift"
        return;
      }else if (data.typeStartHour < 0 || data.typeStartHour > 23 || data.typeEndHour <= 0 || data.typeEndHour > 23 || data.typeEndHour <= data.typeStartHour) {
        e.isValid = false;
        e.errorText = "Start Hour And End Hour Must Be In Range (0,23) And End Hour > Start Hour"
        return;
      }
    }
    if(data.typeName == undefined) {
      e.isValid = false;
      e.errorText = "You Must Enter Type Name"
      return;
    }else if (data.typeWarehouseId == undefined) {
      e.isValid = false;
      e.errorText = "You Must Select Warehouse"
    }
  }
  data.typeIsFixedHour = (data.typeIsFixedHour == 1) ? true : false;
}
  // Add the onInitNewRow method to set the default Shift Type to "Pick"
  onInitNewRow(e: any) {
    e.data.typeIsFixedHour = 0; // Default to 'Pick' (id: 0)
  }
calculateShiftType(data: any): number {
  console.log(data, "calculate")
  return data.typeIsFixedHour ? 1 : 0;
}

setShiftType(newData: any, value: any): void {
  console.log(newData," ",  value, "calculate")
  newData.typeIsFixedHour = value === 1;
}
calculateCellTotalHourValue(rowData:any) {
  if(rowData.typeIsFixedHour == 1) { //Fixed
    return rowData.typeEndHour - rowData.typeStartHour
  }else {
    return (rowData.typeEndHour - rowData.typeStartHour) > 0 ? (rowData.typeEndHour - rowData.typeStartHour) : ''
  }
}
onFileSelected(event: any) {
  const files = event.value;
  for (const file of files) {
    this._filehandler.getjsonDataFromFile(file)
      .then(jsonData => {
        this._apihandler.AddItem(`${GlobalComponent.BASE_API}/ShiftsType/${BaseURL_PostAll}`, jsonData).subscribe({
          next:(response)=>{
            if(response.success) {
              this.toaster.success(response.returnObject.split(",").join(" </br>"));
            }else {
              this.toaster.error(response.returnObject.split(",").join(" </br>"));
            }
            this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsType`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
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
  this._filehandler.exportGrid(e, "ShiftsType");
 }
// Function to handle file download
downloadFile() {
  const filename = 'ShiftsType.xlsx';
  const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
  fetch(filepath)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, filename); // Save file using file-saver library
    })
    .catch(error => console.error('Error downloading file:', error));
}
}
