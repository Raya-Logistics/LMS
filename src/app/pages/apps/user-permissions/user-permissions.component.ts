import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import CustomStore from "devextreme/data/custom_store";
// import { Workbook } from 'exceljs';
import { saveAs } from "file-saver-es";
// Our demo infrastructure requires us to use 'file-saver-es'. We recommend that you use the official 'file-saver' package in your applications.
import { exportDataGrid } from "devextreme/excel_exporter";
import { ApihandlerService } from "src/app/services/apihandler.service";
import { FilehandlerService } from "src/app/services/filehandler.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { GlobalComponent } from "src/app/global-component";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { environment } from "src/environments/environment.prod";
import { AuthenticationService } from "src/app/core/services/auth.service";
const BaseURL_GetAll = "get-all-userResponsibility_lookups";
const BaseURL_Permission_Lookup = "get-all-permission_lookups";
const BaseURL_User_Lookup = "get-all-User_lookups";
const BaseURL_Responsibility_Lookup = "get-all-responsibility_lookups";
const BaseURL_GetById = "get-unitofmeasure-by-id";
const BaseURL_Post = "Create-userResponsibility";
const BaseURL_Update = "edit-userResponsibility";
const BaseURL_Delete = "deleted-userResponsibility";
@Component({
  selector: "app-user-permissions",
  templateUrl: "./user-permissions.component.html",
  styleUrls: ["./user-permissions.component.scss"],
})
export class UserPermissionsComponent {
  readonly allowedPageSizes = [5, 10, "all"];
  readonly displayModes = [
    { text: "Display Mode 'full'", value: "full" },
    { text: "Display Mode 'compact'", value: "compact" },
  ];
  displayMode = "full";
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  dataSource!: CustomStore;
  userData!: CustomStore;
  responsibilityData!: CustomStore;
  permissionsData!: CustomStore;
  userPermissionForm!: FormGroup;
  pageLookupData!: any;
  userLookData!: any;
  permissionLookData!: any;
  requests: string[] = [];
  isLoading: boolean = false;
  refreshModes = ["full", "reshape", "repaint"];
  refreshMode = "reshape";
  breadCrumbItems!: Array<{}>;
  apiError: any;
  dropdownList = [];
  selectedItems: any[] = [];
  dropdownSettings = {};
  permissionData = environment.permission;
  pagesname = environment.pagesname;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;

  constructor(
    private _apihandler: ApihandlerService,
    private _filehandler: FilehandlerService,
    private toastService: ToastrService,
    private authentication:AuthenticationService
  ) {}
  ngOnInit(): void {
    this.userPermissionForm = new FormGroup({
      responsibilityId: new FormControl(null, Validators.required),
      userId: new FormControl(null, Validators.required),
      permissionIds: new FormControl(null, Validators.required),
    });
    this._apihandler
      .GetItem(`${GlobalComponent.BASE_API}/User/${BaseURL_User_Lookup}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.userLookData = response.returnObject;
          }
        },
        error: (error) => {
          console.log("error", error);
        },
      });
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/WebAppResponsibility/${BaseURL_Responsibility_Lookup}`
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.pageLookupData = response.returnObject;
          }
        },
        error: (error) => {
          console.log("error", error);
        },
      });
    this._apihandler
      .GetItem(
        `${GlobalComponent.BASE_API}/WebAppPermission/${BaseURL_Permission_Lookup}`
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.permissionLookData = response.returnObject;
            this.dropdownList = response.returnObject;
          }
        },
        error: (error) => {
          console.log("error", error);
        },
      });
    this.userData = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/User`,
      BaseURL_User_Lookup,
      "",
      "",
      "",
      ""
    );
    this.responsibilityData = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/WebAppResponsibility`,
      BaseURL_Responsibility_Lookup,
      "",
      "",
      "",
      ""
    );
    this.permissionsData = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/WebAppPermission`,
      BaseURL_Permission_Lookup,
      "",
      "",
      "",
      ""
    );
    this.dataSource = this._apihandler.getStore(
      `${GlobalComponent.BASE_API}/WebAppUserResponsibility`,
      BaseURL_GetAll,
      "",
      "",
      "",
      ""
    );
    this.breadCrumbItems = [
      { label: "Home" },
      { label: "User Permissions", active: true },
    ];
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
    // this.internalPermission = this.authentication.getInternalPermissions(this.pagesname.UserPermissions)
    this.authentication.getInternalPermissionss(this.pagesname.UserPermissions).subscribe({
      next:(permissions) => {
        this.internalPermission = permissions;
        this.permissionIsLoadded = true;

      },
      error:(error) => {
        this.toastService.error('Failed to retrieve permissions');
        console.error('Error retrieving permissions:', error);
      }
    })
  }
  exportGrid(e: any) {
    this._filehandler.exportGrid(e, "unitOfMeasure");
  }

  adduserPermissionMeasure(_FormGroup: FormGroup) {
    _FormGroup.value.permissionIds = _FormGroup.value.permissionIds.map((item: any) => item.id);
    if (_FormGroup.valid) {
      console.log(_FormGroup.value);
      this.isLoading = true;
      this._apihandler
        .AddItem(
          `${GlobalComponent.BASE_API}/WebAppUserResponsibility/${BaseURL_Post}`,
          _FormGroup.value
        )
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.toastService.success(response.message);
              // Fetch updated data from the server
              this.dataSource = this._apihandler.getStore(
                `${GlobalComponent.BASE_API}/WebAppUserResponsibility`,
                BaseURL_GetAll,
                BaseURL_GetById,
                BaseURL_Post,
                BaseURL_Update,
                BaseURL_Delete
              );
            } else {
              this.toastService.error(response.message);
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.apiError = error.error.message;
          },
          complete: () => {
            this.isLoading = false;
          },
        });
    }
  }

  get permissionIds() {
    return this.userPermissionForm.get("permissionIds");
  }
  get userId() {
    return this.userPermissionForm.get("userId");
  }
  get responsibilityId() {
    return this.userPermissionForm.get("responsibilityId");
  }
}
