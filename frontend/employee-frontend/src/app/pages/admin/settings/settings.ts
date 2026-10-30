import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  private readonly apiUrl = 'http://localhost:5000/api';

  profile: AdminProfile | null = null;
  loadingProfile = false;
  profileError = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  changingPassword = false;
  passwordMessage = '';
  passwordError = '';

  logoutConfirmation = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
  this.loadingProfile = true;
  this.profileError = '';

  this.http
    .get<ApiResponse<AdminProfile>>(
      `${this.apiUrl}/auth/profile`
    )
    .subscribe({
      next: (response) => {
  console.log('Profile response:', response);

  this.profile = response.data;
  this.loadingProfile = false;

  this.cdr.detectChanges();

  console.log('Profile assigned:', this.profile);
  console.log('Loading state:', this.loadingProfile);
},
      error: (error) => {
  console.error('Profile API error:', error);

  this.profileError =
    error.error?.message || 'Unable to load profile.';

  this.loadingProfile = false;
  this.cdr.detectChanges();
}
    });
}

  changePassword(): void {
    this.passwordMessage = '';
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill in all password fields.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError =
        'Your new password must contain at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New password and confirmation do not match.';
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.passwordError =
        'Your new password must differ from your current password.';
      return;
    }

    this.changingPassword = true;

    this.http
      .put<ApiResponse<unknown>>(
        `${this.apiUrl}/auth/change-password`,
        {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword
        }
      )
      .subscribe({
        next: (response) => {
          this.passwordMessage =
            response.message || 'Password changed successfully.';

          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';

          this.changingPassword = false;
        },
        error: (error: HttpErrorResponse) => {
          this.passwordError =
            error.error?.message || 'Unable to change your password.';
          this.changingPassword = false;
        }
      });
  }

  confirmLogout(): void {
    this.logoutConfirmation = true;
  }

  cancelLogout(): void {
    this.logoutConfirmation = false;
  }

  logout(): void {
    this.logoutConfirmation = false;
    localStorage.removeItem('token');
    void this.router.navigate(['/login']);
  }
}