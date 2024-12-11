
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ApihandlerService } from 'src/app/services/apihandler.service';
import { GlobalComponent } from 'src/app/global-component';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-user-configuration',
  templateUrl: './user-configuration.component.html',
  styleUrls: ['./user-configuration.component.scss']
})
export class UserConfigurationComponent implements OnInit {
  permissionForm!: FormGroup;
  permissionHedaerForm!: FormGroup;
  allEntities!: { id: number, name: string }[];
  allActions!: { id: number, name: string }[];
  allUsers!: {id: string, userName: string}[];
  allWarehouses!: {id: number, name: string}[];
  allCompanies!: {id: number, name: string}[];
  userSelectedValue = null;
  breadCrumbItems!: Array<{}>;
  dropdownSettings = {};
  isUserSelected:boolean = false;
  pagesname = environment.pagesname;
  permissionData = environment.permission;
  internalPermission!:(string[] | null);
  permissionIsLoadded:boolean = false;
  filteredUsers!: { id: string, userName: string }[];
  sourceUserSelectedValue: string | null = null;
  targetUserSelectedValue: string | null = null;
  constructor(private fb: FormBuilder, private _apihandler: ApihandlerService, 
    private spinner: NgxSpinnerService,
    private authentication:AuthenticationService
  ) { }

  ngOnInit(): void {
    this.fetchInternalPermission();
    this.fetchActions();
    this.fetchEntities();
    this.fetchUsers();
    this.fetchWarehouses();
    this.fetchCompanies();
    this.initialFormHeader();
    this.initialMultiSelectDropDown();
    
    this.breadCrumbItems = [
      { label: "Home" },
      { label: "User Configuration", active: true },
    ];
  }
fetchInternalPermission() {
  this.authentication.getInternalPermissionss(this.pagesname.UserConfiguration).subscribe({
    next:(permissions) => {
      this.internalPermission = permissions;
      this.permissionIsLoadded = true;
    },
    error:(error) => {
      Swal.fire({
        icon: 'error', // You can change this to 'success', 'warning', etc.
        title: 'خطأ...',
        text: "خطأ في جلب صالحيات المستخدم... من فضلك المحاولة مرة اخري او الرجوع اللي الفريق التقني",
        // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
        confirmButtonText: 'اغلاق',
        confirmButtonColor: '#3085d6'
      });
    }
  })
}
  initialFormHeader() {
    this.permissionHedaerForm = new FormGroup({
      userId: new FormControl(null, Validators.required),
      warehouseIds: new FormControl(null, Validators.required),
      companyIds: new FormControl(null, Validators.required),
    })
  }

  fetchEntities() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/WebAppResponsibility/get-all-responsibility_lookups`).subscribe({
      next: (response) => {
        if (response.success) {
          this.allEntities = response.returnObject;
          this.buildForm();
        }
      }
    });
  }

  fetchActions() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/WebAppPermission/get-all-permission_lookups`).subscribe({
      next: (response) => {
        if (response.success) {
          this.allActions = response.returnObject;
          this.buildForm();
        }
      }
    });
  }

  fetchUsers() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/User/GetAllUserLookup`).subscribe({
      next: (response) => {
        if (response.success) {
          this.allUsers = response.returnObject;
          this.filteredUsers = [...this.allUsers]; 
        }
      }
    });
  }

  fetchWarehouses() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Warehouse/get-all-Warehouse_lookups`).subscribe({
      next: (response) => {
        if (response.success) {
          this.allWarehouses = response.returnObject;
        }
      }
    });
  }

  fetchCompanies() {
    this._apihandler.GetItem(`${GlobalComponent.BASE_API}/Company/get-all-company_lookups`).subscribe({
      next: (response) => {
        if (response.success) {
          this.allCompanies = response.returnObject;
        }
      }
    });
  }

  initialMultiSelectDropDown() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  }

  permissionHedaerFormSubmit(formgroup:FormGroup) {
    console.log(formgroup.value, " permissionHeaderFormValue");
  }

  selectedUserChanged() {
    if (this.userSelectedValue != null) {
      this.spinner.show();
      this.isUserSelected = true;
      this.permissionForm.reset(); // Reset the form before binding new data
      this._apihandler
        .GetItem(`${GlobalComponent.BASE_API}/UserConfiguration/GetUserConfiguration?userId=${this.userSelectedValue}`)
        .subscribe({
          next: (response) => {
            const userData = response.returnObject;
  
            // Bind user-specific data to form
            this.permissionHedaerForm.patchValue({
              userId: userData.userId,
              warehouseIds: userData.warehouseIds?.map((id: number) => {
                return this.allWarehouses.find((wh) => wh.id === id);
              }),
              companyIds: userData.companyIds?.map((id: number) => {
                return this.allCompanies.find((co) => co.id === id);
              }),
            });
  
            if (userData.permission) {
              userData.permission.forEach((perm: any) => {
                const entity = this.allEntities.find((e) => e.name === perm.pageName);
                if (entity) {
                  perm.permissions.forEach((actionName: string) => {
                    const action = this.allActions.find((a) => a.name === actionName);
                    if (action) {
                      const controlName = this.getControlName(action.id, entity.id);
                      this.permissionForm.controls[controlName].setValue(true);
                    }
                  });
                }
              });
            }
  
            // After setting data, update row and select-all checkboxes
            this.updateAllRows(); // Update row checkboxes
            this.updateSelectAllCheckbox(); // Update "Select All" checkbox
  
            this.spinner.hide();
          },
          error: (err) => {
            this.spinner.hide();
            Swal.fire({
              icon: 'error', 
              title: 'خطأ...',
              text: 'من فضلك المحاولة مرة اخري او الرجوع اللي الفريق التقني',
              confirmButtonText: 'اغلاق',
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } else {
      this.isUserSelected = false;
    }
  }
  
  
  // selectedUserChanged() {
  //   if (this.userSelectedValue != null) {
  //     this.spinner.show();
  //     this.isUserSelected = true;
  //     console.log(this.userSelectedValue, " id")
  //     this._apihandler.GetItem(`${GlobalComponent.BASE_API}/UserConfiguration/GetUserConfiguration?userId=${this.userSelectedValue}`).subscribe({
  //       next:(response) => {
  //         const userData = response.returnObject;
  //         console.log(userData, " userData")
  //         this.permissionHedaerForm.patchValue({
  //           userId: userData.userId,
  //           warehouseIds: userData.warehouseIds?.map((id: number) => {
  //             return this.allWarehouses.find(wh => wh.id === id);
  //           }),
  //           companyIds: userData.companyIds?.map((id: number) => {
  //             return this.allCompanies.find(co => co.id === id);
  //           })
  //         });
  //         if (userData.permission) {
  //           userData.permission.forEach((perm: any) => {
  //             const entity = this.allEntities.find(e => e.name === perm.pageName);
  //             if (entity) {
  //               perm.permissions.forEach((actionName: string) => {
  //                 const action = this.allActions.find(a => a.name === actionName);
  //                 if (action) {
  //                   const controlName = this.getControlName(action.id, entity.id);
  //                   this.permissionForm.controls[controlName].setValue(true);
  //                 }
  //               });
  //             }
  //           });
  //         }
  //       },
  //       error: (err) => {
  //         console.log(err);
  //       },
  //       complete:()=>{
  //         this.spinner.hide();
  //       }
  //     });
  //   } else {
  //     this.isUserSelected = false;
  //   }
  // }
  
  buildForm() {
    const group: any = {};
    
    if (this.allActions && this.allEntities) {
      this.allActions.forEach(action => {
        this.allEntities.forEach(entity => {
          const controlName = this.getControlName(action.id, entity.id);
          group[controlName] = new FormControl(false);
        });
      });
      
      // Add row-level controls to track the row checkboxes
      this.allEntities.forEach(entity => {
        const rowControlName = this.getRowControlName(entity.id);
        group[rowControlName] = new FormControl(false);  // Set default as false (unchecked)
      });
    }
    
    this.permissionForm = this.fb.group(group);
  }



  toggleAll(event: any) {
    const isChecked = event.target.checked;
    
    // Loop through all actions and entities and set their control values to true/false
    this.allEntities.forEach(entity => {
      this.allActions.forEach(action => {
        const controlName = this.getControlName(action.id, entity.id);
        this.permissionForm.controls[controlName].setValue(isChecked);
      });
    });
    
    // Toggle row checkboxes as well
    this.allEntities.forEach(entity => {
      const rowCheckbox = this.getRowControlName(entity.id);
      this.permissionForm.controls[rowCheckbox].setValue(isChecked);
    });
  }
  
  updateRowCheckbox(entityId: number) {
    let allRowChecked = true;

    // Loop through all actions for this entity (row) and check if all are selected
    this.allActions.forEach(action => {
        const controlName = this.getControlName(action.id, entityId);
        if (!this.permissionForm.controls[controlName].value) {
            allRowChecked = false; // If any action checkbox is unchecked, set allRowChecked to false
        }
    });

    // Update the row checkbox based on the result
    const rowControlName = this.getRowControlName(entityId);
    this.permissionForm.controls[rowControlName].setValue(allRowChecked);
}
  
  toggleRow(entityId: number, event: any) {
    const isChecked = event.target.checked;
    this.allActions.forEach(action => {
      const controlName = this.getControlName(action.id, entityId);
      this.permissionForm.controls[controlName].setValue(isChecked);
    });
  
    this.updateSelectAllCheckbox();
  }
  toggleAction(entityId: number, actionId: number, event: any) {
    this.updateRowCheckbox(entityId);
    this.updateSelectAllCheckbox();
  }

  updateSelectAllCheckbox() {
    let allChecked = true;

    // Check if any of the row checkboxes or action checkboxes are unchecked
    this.allEntities.forEach(entity => {
        const rowControlName = this.getRowControlName(entity.id);
        if (!this.permissionForm.controls[rowControlName].value) {
            allChecked = false;
        }
        this.allActions.forEach(action => {
            const actionControlName = this.getControlName(action.id, entity.id);
            if (!this.permissionForm.controls[actionControlName].value) {
                allChecked = false;
            }
        });
    });

    // Update the "Select All" checkbox based on whether everything is selected
    const selectAllCheckbox = document.querySelector('#selectAllCheckbox') as HTMLInputElement;
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
    }
}
  getRowControlName(entityId: number): string {
    return `row_${entityId}`;
  }
  getControlName(actionId: number, entityId: number): string {
    return `action_${actionId}_entity_${entityId}`;
  }

  handleSubmit() {
    if (this.targetUserSelectedValue) {
      this.onSubmitTargetUser();
    } else {
      this.onSubmit();
    }
  }
  onSubmit() {

    const formValues = this.permissionHedaerForm.value;
    if(formValues.userId == null || formValues.userId == undefined) {
      Swal.fire({
        icon: 'error', // You can change this to 'success', 'warning', etc.
        title: 'خطأ...',
        text: "من فضلك المحاولة مرة اخري او الرجوع اللي الفريق التقني",
        // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
        confirmButtonText: 'اغلاق',
        confirmButtonColor: '#3085d6'
      });
    }else {

      this.spinner.show();
      const warehouseIds = formValues.warehouseIds?.map((warehouse: any) => warehouse.id);
      const companyIds = formValues.companyIds?.map((company: any) => company.id);
      const formattedPermissions = this.allEntities.map((entity) => {
        const permissions = this.allActions
          .map((action) => {
            const controlName = this.getControlName(action.id, entity.id);
            const isChecked = this.permissionForm.controls[controlName].value;
            if (isChecked) {
              return action.name;
            }
            return null;
          })
          .filter(Boolean); 
        
        return {
          pageName: entity.name,
          permissions: permissions
        };
      }).filter(page => page.permissions.length > 0); 
    
      const submissionData = {
        userid: formValues.userId,
        warehouseIds: warehouseIds,
        companyIds: companyIds,
        permission: formattedPermissions
      };
    
      this._apihandler.AddItem(`${GlobalComponent.BASE_API}/UserConfiguration/HandleUserConfiguration`,submissionData).subscribe({
        next:(response) => {
          this.spinner.hide();
          if(response.success) {
            Swal.fire({
              icon: 'success',
              title: 'نجاح!',
              text: "تم تعديل جميع الصالحيات لهذا المستخدم بنجاح",
              confirmButtonText: 'اغلاق',
              confirmButtonColor: '#3085d6'
            });
          }else {
            Swal.fire({
              icon: 'error', // You can change this to 'success', 'warning', etc.
              title: 'خطأ...',
              text: response.arabicMessage,
              // footer: '<a href="">Why do I have this issue?</a>', // Optional footer if needed
              confirmButtonText: 'اغلاق',
              confirmButtonColor: '#3085d6'
            });
          }
        },
        error:(err)=> {
          this.spinner.hide();
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
    }
  
  }
  onSubmitTargetUser() {
    if (!this.targetUserSelectedValue) {
      Swal.fire({
        icon: 'error',
        title: 'Error...',
        text: "Target user not selected.",
        confirmButtonText: 'Close',
      });
      return;
    }
  
    const formValues = this.permissionHedaerForm.value;
  
    const targetUserId = this.targetUserSelectedValue;
    
    const warehouseIds = formValues.warehouseIds?.map((warehouse: any) => warehouse.id);
    const companyIds = formValues.companyIds?.map((company: any) => company.id);
  
    const formattedPermissions = this.allEntities.map((entity) => {
      const permissions = this.allActions
        .map((action) => {
          const controlName = this.getControlName(action.id, entity.id);
          const isChecked = this.permissionForm.controls[controlName].value;
          if (isChecked) {
            return action.name;
          }
          return null;
        })
        .filter(Boolean);
  
      return {
        pageName: entity.name,
        permissions: permissions
      };
    }).filter(page => page.permissions.length > 0);
  
    const submissionData = {
      userid: targetUserId,
      warehouseIds: warehouseIds,
      companyIds: companyIds,
      permission: formattedPermissions
    };
  
    this.spinner.show();
    this._apihandler.AddItem(`${GlobalComponent.BASE_API}/UserConfiguration/HandleUserConfiguration`, submissionData).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: "Permissions have been updated for the target user.",
            confirmButtonText: 'Close',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: response.arabicMessage,
            confirmButtonText: 'Close',
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error...',
          text: "Failed to update permissions. Please try again.",
          confirmButtonText: 'Close',
        });
      }
    });
  }
  
  onSourceUserChanged() {
    if (this.sourceUserSelectedValue) {
      this.filteredUsers = this.allUsers.filter(
        user => user.id !== this.sourceUserSelectedValue
      );
    } else {
      this.targetUserSelectedValue = null;
      this.filteredUsers = [...this.allUsers];
    }
  }

  copyPermissions() {
    if (!this.sourceUserSelectedValue || !this.targetUserSelectedValue) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: "يجب اختيار مستخدم لاعطاءه تلك الصالحيات",
        confirmButtonText: 'اغلاق'
      });
      this.isUserSelected = false;
      return;
    }
    this.isUserSelected = true;

    this.spinner.show();
    this._apihandler
      .GetItem(`${GlobalComponent.BASE_API}/UserConfiguration/GetUserConfiguration?userId=${this.sourceUserSelectedValue}`)
      .subscribe({
        next: (response) => {
          const sourceUserData = response.returnObject;
          this.populateUserPermissions(sourceUserData);
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error...',
            text: "Failed to fetch source user permissions. Please try again.",
            confirmButtonText: 'Close'
          });
        }
      });
  }

  populateUserPermissions(userData: any) {
    this.permissionForm.reset(); // Reset the form before populating
    this.permissionHedaerForm.patchValue({
        userId: userData.userId,
        warehouseIds: userData.warehouseIds?.map((id: number) => this.allWarehouses.find(wh => wh.id === id)),
        companyIds: userData.companyIds?.map((id: number) => this.allCompanies.find(co => co.id === id)),
    });

    if (userData.permission) {
        userData.permission.forEach((perm: any) => {
            const entity = this.allEntities.find(e => e.name === perm.pageName);
            if (entity) {
                perm.permissions.forEach((actionName: string) => {
                    const action = this.allActions.find(a => a.name === actionName);
                    if (action) {
                        const controlName = this.getControlName(action.id, entity.id);
                        this.permissionForm.controls[controlName].setValue(true); // Set each action as checked
                    }
                });
            }
        });
    }

    // After setting all the action checkboxes, check if the rows should be fully checked
    this.updateAllRows(); // Check if all inputs in a row are checked
    this.updateSelectAllCheckbox(); // Check if the entire "Select All" should be checked
}
updateAllRows() {
  this.allEntities.forEach(entity => {
      this.updateRowCheckbox(entity.id);  // Update the checkbox state for each row
  });
}
}


// okkkkkkkkk9