
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profile: UserProfile | null = null;
  loading = true;
  errorMessage = '';

  private apiUrl = 'http://localhost:5000/api/auth/profile';

  constructor(private http: HttpClient, private cdr:ChangeDetectorRef, private router:Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  
loadProfile(): void {
  this.loading = true;
  this.errorMessage = '';

  const token = localStorage.getItem('token');

  if (!token) {
    this.errorMessage = 'Your session has expired. Please log in again.';
    this.loading = false;
    this.cdr.detectChanges();
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  this.http.get<ProfileResponse>(this.apiUrl, { headers }).subscribe({
    next: (response) => {
      this.profile = response.data;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Failed to load profile:', error);

      this.errorMessage =
        error.status === 401
          ? 'Your session has expired. Please log in again.'
          : 'Unable to load your profile. Please try again.';

      this.loading = false;
      this.cdr.detectChanges();
    },
  });
}


  get initials(): string {
    if (!this.profile?.name) {
      return '';
    }

    return this.profile.name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  logout(): void {
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}
}
