
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-password.html',
  styleUrl: './set-password.css'
})
export class SetPassword {
  token = '';
  loading = false;
  message = '';
  isError = false;

  passwordForm;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.message = '';
    this.isError = false;

    if (!this.token) {
      this.message = 'Password setup link is missing its token.';
      this.isError = true;
      return;
    }

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.message = 'Passwords do not match.';
      this.isError = true;
      return;
    }

    this.loading = true;

    this.http.post<any>(
      'http://localhost:5000/api/auth/complete-employee-password-setup',
      {
        token: this.token,
        newPassword
      }
    ).subscribe({
      next: (response) => {
        this.message = response.message || 'Password set successfully.';
        this.isError = false;
        this.loading = false;
      },
      error: (error) => {
        this.message =
          error.error?.message || 'Unable to set password. Please try again.';
        this.isError = true;
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
