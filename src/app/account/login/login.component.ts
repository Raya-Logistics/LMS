import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

// Login Auth
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../../core/services/auth.service";
import { AuthfakeauthenticationService } from "../../core/services/authfake.service";
import { first } from "rxjs/operators";
import { ToastService } from "./toast-service";
import { Loginresponseviewmodel } from "src/app/core/models/loginresponseviewmodel";
import { ToastrService } from "ngx-toastr";
import { jwtDecode } from "jwt-decode";
import { BehaviorSubject } from "rxjs";
import { PermissionsVM } from "src/app/models/permissions-vm";
import { SignalRService } from "src/app/services/signal-r.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})

/**
 * Login Component
 */
export class LoginComponent implements OnInit {
  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = "";
  returnUrl!: string;
  response: any;
  toast!: false;
  isLoding: boolean = false;
  // set the current year
  year: number = new Date().getFullYear();
  constructor(
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    public toastService: ToastrService,
    private signalRService: SignalRService
  ) {
    // redirect to home if already logged in
    // if (this.authenticationService.currentUserValue) {
    //   this.router.navigate(["/"]);
    // }
  }

  ngOnInit(): void {
    if (localStorage.getItem("currentUser")) {
      this.router.navigate(["/"]);
    }
    
    /**
     * Form Validatyion
     */
    //  this.loginForm = this.formBuilder.group({
    //   username: ['admin@themesbrand.com', [Validators.required]],
    //   password: ['123456', [Validators.required]],
    //   deviceID:[""],
    //   FCM_Token:[""],
    //   DeviceVersion:[""]
    // });

    this.loginForm = this.formBuilder.group({
      identifier: [null, [Validators.required]],
      password: [null, [Validators.required]],
      rememberMe: [false],
    });
    // get return url from route parameters or default to '/'
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  //   helloWorld() {
  //     alert('Hello world!');
  // }
  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Form submit
   */
  onSubmit(formdata: FormGroup) {
    this.submitted = true;
    if (formdata.valid) {
      this.isLoding = true;
      console.log(formdata.value);
      this.authenticationService.login(formdata.value).subscribe({
        next: (response) => {
          if (response.success) {
            localStorage.setItem("userToken", response.returnObject.token);
            this.authenticationService.decodeToken();
            this.isLoding = false;
            this.toastService.success(response.message);
            // this.signalRService.startConnection();
            // this.signalRService.addGetAllLogingUsersListener((users) => {
            //      console.log("Logged in users:", users);
            // });
            // localStorage.setItem("currentUser", JSON.stringify(response.returnObject));
            // localStorage.setItem("token", response.returnObject);
            this.router.navigate(["/"]);
          } else {
            this.isLoding = false;
            this.toastService.error(response.message);
          }
        },
      });
      // this.authenticationService.login(formdata.value).subscribe({
      //   next:(response : Loginresponseviewmodel) => {
      //     console.log(response);
      //     if(response.isAuthorized == true) {
      //       this.toastService.show(response.headerInfo.message, { classname: 'bg-success text-white', delay: 15000 });
      //       localStorage.setItem('currentUser', JSON.stringify(response.permissions));
      //       this.router.navigate(['/']);
      //     }else{
      //       this.toastService.show(response.headerInfo.message, { classname: 'bg-danger text-white', delay: 15000 });
      //     }
      //     this.submitted = false;
      //   },
      //   error:(error) => {
      //     this.toastService.show("something went wrong try again", { classname: 'bg-danger text-white', delay: 15000 });
      //     this.submitted = false;
      //   }
      // });
    }
    // Login Api
    // this.authenticationService.login(this.f['email'].value, this.f['password'].value).subscribe((data:any) => {
    //   console.log(data);
    //   if(data.status == 'success'){
    //     localStorage.setItem('toast', 'true');
    //     localStorage.setItem('currentUser', JSON.stringify(data.data));
    //     localStorage.setItem('token', data.token);
    //     this.router.navigate(['/']);
    //   } else {
    //     this.toastService.show(data.data, { classname: 'bg-danger text-white', delay: 15000 });
    //   }
    // });

    // stop here if form is invalid
    // if (this.loginForm.invalid) {
    //   return;
    // } else {
    //   if (environment.defaultauth === 'firebase') {
    //     this.authenticationService.login(this.f['email'].value, this.f['password'].value).then((res: any) => {
    //       this.router.navigate(['/']);
    //     })
    //       .catch(error => {
    //         this.error = error ? error : '';
    //       });
    //   } else {
    //     this.authFackservice.login(this.f['email'].value, this.f['password'].value).pipe(first()).subscribe(data => {
    //           this.router.navigate(['/']);
    //         },
    //         error => {
    //           this.error = error ? error : '';
    //         });
    //   }
    // }
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
