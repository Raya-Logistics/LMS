import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

// Register Auth
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { UserProfileService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

/**
 * Register Component
 */
export class RegisterComponent implements OnInit {

  // Login Form
  signupForm!: UntypedFormGroup;
  submitted = false;
  successmsg = false;
  error = '';
  isLoding:boolean = false;
  // set the current year
  year: number = new Date().getFullYear();

  constructor(private formBuilder: UntypedFormBuilder, private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserProfileService, private toaster : ToastrService) { }

  ngOnInit(): void {
    /**
     * Form Validatyion
     */
     this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      hrId: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      password: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * Register submit form
   */
   onSubmit() {
    this.submitted = true;
    if(this.signupForm.valid) {
      this.isLoding = true;
      this.authenticationService.register(this.signupForm.value).subscribe({
        next:(response) => {
          this.isLoding = false;
          if(response.success) {
            this.toaster.success(response.message);
            this.router.navigate(['/auth/login']);
          }else {
            this.toaster.error(response.message);
          }
        }
      });
    }
    //Register Api
    // this.authenticationService.register(this.f['email'].value, this.f['name'].value, this.f['password'].value).pipe(first()).subscribe(
    //   (data: any) => {
    //   this.successmsg = true;
    //   if (this.successmsg) {
    //     this.router.navigate(['/auth/login']);
    //   }
    // },
    // (error: any) => {
    //   this.error = error ? error : '';
    // });

    // stop here if form is invalid
    // if (this.signupForm.invalid) {
    //   return;
    // } else {
    //   if (environment.defaultauth === 'firebase') {
    //     this.authenticationService.register(this.f['email'].value, this.f['password'].value).then((res: any) => {
    //       this.successmsg = true;
    //       if (this.successmsg) {
    //         this.router.navigate(['']);
    //       }
    //     })
    //       .catch((error: string) => {
    //         this.error = error ? error : '';
    //       });
    //   } else {
    //     this.userService.register(this.signupForm.value)
    //       .pipe(first())
    //       .subscribe(
    //         (data: any) => {
    //           this.successmsg = true;
    //           if (this.successmsg) {
    //             this.router.navigate(['/auth/login']);
    //           }
    //         },
    //         (error: any) => {
    //           this.error = error ? error : '';
    //         });
    //   }
    // }
  }

}
