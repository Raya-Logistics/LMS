import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import saveAs from 'file-saver';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

const BASE_API = GlobalComponent.BASE_API;
const SHIFT_ATTRIBUTE = GlobalComponent.Controllers.SHIFT_ATTRIBUTE.NAME;
const SHIFT_ATTRIBUTE_LOOKUP_ACTIVE = GlobalComponent.Controllers.SHIFT_ATTRIBUTE.API_ACTIONS.GET_LOOKUP + '?IsActiveOnly=true';
const SHIFT_ATTRIBUTE_ALL = GlobalComponent.Controllers.SHIFT_ATTRIBUTE.API_ACTIONS.GET_ALL + '?IsActiveOnly=false';
const SHIFT_ATTRIBUTE_BY_ID = GlobalComponent.Controllers.SHIFT_ATTRIBUTE.API_ACTIONS.GET_BY_ID;
const SHIFT_ATTRIBUTE_CREATE = GlobalComponent.Controllers.SHIFT_ATTRIBUTE.API_ACTIONS.CREATE;
const SHIFT_ATTRIBUTE_LIST = GlobalComponent.Controllers.SHIFT_ATTRIBUTE.API_ACTIONS.CREATE_LIST;
const SHIFT_ATTRIBUTE_EDIT = GlobalComponent.Controllers.SHIFT_ATTRIBUTE.API_ACTIONS.EDIT;
const WAREHOUE = GlobalComponent.Controllers.WAREHOUSE.NAME;
const WAREHOUE_LOOKUP_ACTIVE = GlobalComponent.Controllers.WAREHOUSE.API_ACTIONS.GET_LOOKUP + '?IsActiveOnly=true';
const SHIFT_TYPE = GlobalComponent.Controllers.SHIFT_TYPE.NAME;
const SHIFT_TYPE_ALL = GlobalComponent.Controllers.SHIFT_TYPE.API_ACTIONS.GET_ALL + '?IsActiveOnly=false';
const SHIFT_TYPE_BY_ID = GlobalComponent.Controllers.SHIFT_TYPE.API_ACTIONS.GET_BY_ID;
const SHIFT_TYPE_CREATE = GlobalComponent.Controllers.SHIFT_TYPE.API_ACTIONS.CREATE;
const SHIFT_TYPE_EDIT = GlobalComponent.Controllers.SHIFT_TYPE.API_ACTIONS.EDIT;
const HOLIDAY = GlobalComponent.Controllers.HOLIDAY.NAME;
const HOLIDAY_ALL = GlobalComponent.Controllers.HOLIDAY.API_ACTIONS.GET_ALL + '?IsActiveOnly=false';
const HOLIDAY_BY_ID = GlobalComponent.Controllers.HOLIDAY.API_ACTIONS.GET_BY_ID;
const HOLIDAY_CREATE = GlobalComponent.Controllers.HOLIDAY.API_ACTIONS.CREATE;
const HOLIDAY_EDIT = GlobalComponent.Controllers.HOLIDAY.API_ACTIONS.EDIT;

@Component({
  selector: 'app-all-shift-configuration',
  templateUrl: './all-shift-configuration.component.html',
  styleUrls: ['./all-shift-configuration.component.scss']
})
export class AllShiftConfigurationComponent implements OnInit {
  dropDownOptions = { width: 500 };
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  breadCrumbItems!: Array<{}>;
  warehouseData!: CustomStore;
  attributeData!: CustomStore;
  attributeSource!: CustomStore;
  warehouseLookupSource!: CustomStore;
  shiftTypeSource!: CustomStore;
  holidaySource!: CustomStore;
  shiftType: any;

  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:any;
  permissionIsLoadded:boolean = false;
  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService,
    private authentication:AuthenticationService) {
  }
  ngOnInit(): void {
    this.initialAttribute();
    this.initialShiftType();
    this.initialHoliday();
    this.breadCrumbItems = [
      { label: "Home" },
      { label: "Shift Configuration", active: true },
    ];
    const pageNamesArray = [this.pagesname.ShiftAttribute, this.pagesname.ShiftType, this.pagesname.ShiftSellingPrice, this.pagesname.Holiday];

    this.authentication.getPagesInternalPermissions(pageNamesArray).subscribe({
        next: (permissions) => {
            this.internalPermission = permissions;
            this.permissionIsLoadded = true;
        },
        error: (error) => {
            console.error('Error retrieving permissions:', error);
        }
    });
  }

// Attribute Configuration

  initialAttribute() {
    this.attributeData = this._apihandler.getStore(`${BASE_API}/${SHIFT_ATTRIBUTE}`, SHIFT_ATTRIBUTE_ALL,SHIFT_ATTRIBUTE_BY_ID,SHIFT_ATTRIBUTE_CREATE,
      SHIFT_ATTRIBUTE_EDIT,'')
  }
  onAttributeRowValidating(event: any) {
    const data = { ...event.oldData, ...event.newData };
    const requiredFields = ['attributeName', 'attributeDescription', 'attributeNote'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        event.isValid = false;
        event.errorText = `You must enter ${field}`;
        return;
      }
    }
  }

  onAttributeFileSelected(event: any) {
    const files = event.value;
    for (const file of files) {
      this._filehandler.getjsonDataFromFile(file)
        .then(jsonData => {
          this._apihandler.AddItem(`${BASE_API}/${SHIFT_ATTRIBUTE}/${SHIFT_ATTRIBUTE_LIST}`, jsonData).subscribe({
            next:(response)=>{
              if(response.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'نجاح!',
                  text: "تم رفع جميع المخازن بنجاح",
                  confirmButtonText: 'اغلاق',
                  confirmButtonColor: '#3085d6'
                });
              }else {
                Swal.fire({
                  icon: 'error', // You can change this to 'success', 'warning', etc.
                  title: 'خطأ...',
                  text: response.returnObject.split(","),
                  // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
                  confirmButtonText: 'اغلاق',
                  confirmButtonColor: '#3085d6'
                });
              }
              this.initialAttribute();
            },
            error:(e) =>{
              Swal.fire({
                icon: 'error', // You can change this to 'success', 'warning', etc.
                title: 'خطأ...',
                text: "من فضلك المحاولة مرة اخري او الرجوع اللي الفريق التقني",
                // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
                confirmButtonText: 'اغلاق',
                confirmButtonColor: '#3085d6'
              });
            }
          })
        })
        .catch(error => {
          Swal.fire({
            icon: 'error', // You can change this to 'success', 'warning', etc.
            title: 'خطأ...',
            text: "من فضلك المحاولة مرة اخري او الرجوع اللي الفريق التقني",
            // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
            confirmButtonText: 'اغلاق',
            confirmButtonColor: '#3085d6'
          });
        });
    }
  }
  exportAttributeGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.ShiftAttribute);
   }
  downloadAttributeFile() {
    // Replace 'your-file-name.extension' with the name of the file you want to download from assets folder
    const filename = `${this.pagesname.ShiftAttribute}.xlsx`;
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }



  // Shift Type Configuration
  initialShiftType() {
    this.shiftTypeSource = this._apihandler.getStore(`${BASE_API}/${SHIFT_TYPE}`, SHIFT_TYPE_ALL,SHIFT_TYPE_BY_ID,SHIFT_TYPE_CREATE,
      SHIFT_TYPE_EDIT,'')
      this.attributeSource = this._apihandler.getStore(`${BASE_API}/${SHIFT_ATTRIBUTE}`, SHIFT_ATTRIBUTE_LOOKUP_ACTIVE,"","",
        "","")
      this.warehouseLookupSource = this._apihandler.getStore(`${BASE_API}/${WAREHOUE}`, WAREHOUE_LOOKUP_ACTIVE,"","","","")
       this.shiftType = [{id:true, name:"Fixed"}, {id:false, name:"Extra"}]
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
  
  onShifTypeRowValidating(e: any) {
    const data = { ...e.oldData, ...e.newData };
    if(data.typeIsFixedHour == undefined) {
        e.isValid = false;
        e.errorText = 'You Must Select Shift Type';
        return;
    }else {
      //isFixedType 
      if(data.typeIsFixedHour == true){
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
    // console.log(data.typeIsFixedHour, " isFixed")
    // data.typeIsFixedHour = (data.typeIsFixedHour == 1) ? true : false;
  }
    // Add the onInitNewRow method to set the default Shift Type to "Pick"
    onInitNewShifTypeRow(e: any) {
      e.data.typeIsFixedHour = false; 
    }
  calculateShiftType(data: any): number {
    return data.typeIsFixedHour
  }
  
  setShiftType(newData: any, value: any): void {
    newData.typeIsFixedHour = value 
  }
  calculateCellTotalHourValue(rowData:any) {
    if(rowData.typeIsFixedHour) { //Fixed
      return rowData.typeEndHour - rowData.typeStartHour
    }else {
      return (rowData.typeEndHour - rowData.typeStartHour) > 0 ? (rowData.typeEndHour - rowData.typeStartHour) : ''
    }
  }
  onShifTypeFileSelected(event: any) {
    const files = event.value;
    // for (const file of files) {
    //   this._filehandler.getjsonDataFromFile(file)
    //     .then(jsonData => {
    //       this._apihandler.AddItem(`${GlobalComponent.BASE_API}/ShiftsType/${BaseURL_PostAll}`, jsonData).subscribe({
    //         next:(response)=>{
    //           if(response.success) {
    //             this.toaster.success(response.returnObject.split(",").join(" </br>"));
    //           }else {
    //             this.toaster.error(response.returnObject.split(",").join(" </br>"));
    //           }
    //           this.dataSource = this._apihandler.getStore(`${GlobalComponent.BASE_API}/ShiftsType`, BaseURL_GetAll,BaseURL_GetById,BaseURL_Post,
    //           BaseURL_Update,BaseURL_Delete);
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
  exportShifTypeGrid(e:any) {
    this._filehandler.exportGrid(e, "ShiftsType");
   }
  // Function to handle file download
  downloadShifTypeFile() {
    const filename = 'ShiftsType.xlsx';
    const filepath = `assets/Template/${filename}`; // Path to your file in assets folder
    fetch(filepath)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, filename); // Save file using file-saver library
      })
      .catch(error => console.error('Error downloading file:', error));
  }


  initialHoliday() {
    this.holidaySource = this._apihandler.getStore(`${BASE_API}/${HOLIDAY}`, HOLIDAY_ALL,HOLIDAY_BY_ID,HOLIDAY_CREATE,
      HOLIDAY_EDIT,'')
  }
  exportHolidayGrid(e:any) {
    this._filehandler.exportGrid(e, this.pagesname.Holiday);
   }
}
