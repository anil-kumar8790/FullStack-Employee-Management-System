
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
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

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:5000/api/auth/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<ProfileResponse>(this.apiUrl, { headers });
  }
}
