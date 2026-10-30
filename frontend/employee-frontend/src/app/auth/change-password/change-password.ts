
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  loading = false;
  message = '';
  isError = false;

  passwordForm;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.message = '';
    this.isError = false;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.message = 'New password and confirmation do not match.';
      this.isError = true;
      return;
    }

    if (currentPassword === newPassword) {
      this.message = 'New password must differ from current password.';
      this.isError = true;
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      this.message = 'Your session has expired. Please log in again.';
      this.isError = true;
      return;
    }

    this.loading = true;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.put<any>(
      'http://localhost:5000/api/auth/change-password',
      {
        currentPassword,
        newPassword,
        confirmPassword
      },
      { headers }
    ).subscribe({
      next: (response) => {
        this.message = response.message || 'Password changed successfully.';
        this.isError = false;
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (error) => {
        this.message =
          error.error?.message || 'Unable to change password. Please try again.';
        this.isError = true;
        this.loading = false;
      }
    });
  }
}
