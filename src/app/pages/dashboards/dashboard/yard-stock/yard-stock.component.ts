import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { el } from '@fullcalendar/core/internal-common';
import CustomStore from 'devextreme/data/custom_store';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { GlobalComponent } from 'src/app/global-component';
import { LookupVM } from 'src/app/models/LookupVM';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { FilehandlerService } from 'src/app/services/filehandler.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-yard-stock',
  templateUrl: './yard-stock.component.html',
  styleUrls: ['./yard-stock.component.scss']
})
export class YardStockComponent {
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
  transactionsTypeLookup!:LookupVM[];
  companyLookup!:LookupVM[];
  warehouseLookup!:LookupVM[];
  codeLookup!:any[];
  form!: FormGroup;
  typeIsSelected:boolean = false;
  SerialIsScan:boolean = false;
  typeSelectedValue:any = null;
  companyIsSelected:boolean = false;
  minDate!: string;
  dataSource!:CustomStore;
  firstSerialDetails: { warehouse: number; company: number; item: number; category: number } | null = null;

  constructor(private _apihandler : ApihandlerService, 
    private _filehandler : FilehandlerService, 
    private toaster: ToastrService,
    private authentication:AuthenticationService,private fb: FormBuilder,
    private spinner: NgxSpinnerService) {
    
  }
  ngOnInit(): void {
    this.dataSource = this._apihandler.getStoreWithList(
      `${GlobalComponent.BASE_API}/StockDetails`,
      'Get-Yard-Details',
      'Get-Yard-By-Id',
      'Create-Yard-Handling',
      'EditFreeTime',
      GlobalComponent.Controllers.TRUCK_TYPE.API_ACTIONS.DELETE
    );
    this.authentication.getInternalPermissionss(this.pagesname.GatesHandler).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },});
  }
    exportGrid(e:any) {
      this._filehandler.exportGrid(e, this.pagesname.TruckType);
     }
}
