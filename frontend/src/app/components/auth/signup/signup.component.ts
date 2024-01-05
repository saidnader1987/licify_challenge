import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models/user';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  role: UserRole = UserRole.CONSTRUCTOR;

  constructor(
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.signupForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        company: ['', Validators.required],
        email: [
          '',
          [Validators.required, this.validationService.validateEmail],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.validationService.validateAtLeastOneLowerCase,
            this.validationService.validateAtLeastOneNumber,
            this.validationService.validateAtLeastOneSpecialChar,
            this.validationService.validateAtLeastOneUpperCase,
          ],
        ],
        passwordConfirm: ['', Validators.required],
      },
      { validator: this.validationService.validatePasswordConfirm }
    );
  }

  signUp(registeringUser: User) {
    if (this.signupForm.valid) {
      registeringUser.role = this.role;
      this.authService.signup(registeringUser).subscribe({
        next: (res) => {
          this.toastr.success('Usuario creado correctamente');
          this.signupForm.reset();
          this.router.navigate(['/proyectos']);
        },
        error: (error) => {
          this.toastr.error(error);
        },
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleRoleOption(role: string) {
    this.role = role as UserRole;
  }
}
