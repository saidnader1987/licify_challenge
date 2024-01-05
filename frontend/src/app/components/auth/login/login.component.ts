import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  constructor(
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, this.validationService.validateEmail]],
      password: ['', [Validators.required]],
    });
  }

  login(form: FormGroup) {
    if (this.loginForm.valid) {
      const { email, password } = form.value;
      this.authService.login(email, password).subscribe({
        next: (res) => {
          if (res?.data?.role === 'admin') {
            this.toastr.error(
              'Por favor utilizar las rutas de postman para realizar operaciones'
            );
            this.authService.logout();
          } else {
            this.toastr.success('Bienvenido');
            this.loginForm.reset();
            this.router.navigate(['/proyectos']);
          }
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
}
