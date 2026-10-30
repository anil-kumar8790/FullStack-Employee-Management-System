import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email = '';
  loading = false;
  message = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.message = '';
    this.errorMessage = '';

    const emailValue = this.email.trim();

    if (!emailValue) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.loading = true;

    this.http
      .post<{
        success: boolean;
        message: string;
      }>(
        'http://localhost:5000/api/auth/forgot-password',
        { email: emailValue }
      )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();

          console.log('Forgot password request finished');
          console.log('Loading state:', this.loading);
        })
      )
      .subscribe({
        next: (response) => {
          this.message =
            response.message ||
            'If the email is registered, a reset link will be sent.';

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Forgot password error:', error);

          this.errorMessage =
            error.error?.message ||
            'Unable to process your request. Please try again.';

          this.cdr.detectChanges();
        },
      });
  }
}