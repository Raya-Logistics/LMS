import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ResetPasswordViewModel } from 'src/app/core/models/resetPasswordViewModel';
import { ResultViewModel } from 'src/app/core/models/resultViewModel';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  isLoading:boolean = false;
  token: string = '';
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    public toastService: ToastrService
  ) {}

  ngOnInit(): void {

    // Build the reset password form
    this.resetPasswordForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required]],
    });
  }

  // Form controls getter
  get f() {
    return this.resetPasswordForm.controls;
  }

  // Handle form submission
  onSubmit(formdata:FormGroup) {
    this.submitted = true;

    if (formdata.invalid) {
      return;
    }

    // Check if passwords match
    if (this.f['password'].value !== this.f['confirmPassword'].value) {
      this.toastService.error('Passwords do not match');
      return;
    }

    // Mark as loading
    this.isLoading = true;

    // Prepare the reset password payload
    const resetPasswordData:ResetPasswordViewModel = {
      Email: formdata.value.email,
      Password: formdata.value.password,
      ConfirmPassword: formdata.value.confirmPassword,
    };

    // Call the reset password API
    this.authenticationService.resetPasswrod(resetPasswordData).subscribe({
      next: (response:ResultViewModel) => {
        if (response.success) {
          this.toastService.success('Password has been reset successfully');
          this.router.navigate(['/auth/login']);
        } else {
          this.toastService.error(response.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error('Something went wrong. Please try again.');
        this.isLoading = false;
      }
    });
  }

  // Toggle password visibility
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
