
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  errorMessage = '';

  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ])
  });

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  onLogin() {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    this.authService.login(email!, password!).subscribe({
      next: (response) => {
        console.log('Login response:', response);

        const token = response.data.token;
        const user = response.data.user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        console.log('Token stored successfully');
        console.log('User saved successfully:', user);

        if (user.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (user.role === 'Employee') {
          this.router.navigate(['/employee-dashboard']);
        } else {
          this.errorMessage = 'Invalid user role. Please contact support.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },
      error: (error) => {
        console.log('Login error:', error);

        this.errorMessage =
          error.error?.message || 'Invalid email or password';
      }
    });
  }
}
