
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  message = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.token) {
      this.errorMessage =
        'Reset token is missing. Please request a new link.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.http
      .post<{ success: boolean; message: string }>(
        'http://localhost:5000/api/auth/reset-password',
        {
          token: this.token,
          newPassword: this.newPassword,
        }
      )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();

          console.log('Reset password request finished');
          console.log('Loading state:', this.loading);
        })
      )
      .subscribe({
        next: (response) => {
          this.message =
            response.message || 'Password reset successfully.';
          this.newPassword = '';
          this.confirmPassword = '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Reset password error:', error);

          this.errorMessage =
            error.error?.message ||
            'Unable to reset password. Please request a new link.';

          this.cdr.detectChanges();
        },
      });
  }
}
