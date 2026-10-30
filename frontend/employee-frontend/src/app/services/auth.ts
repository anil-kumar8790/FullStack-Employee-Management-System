import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../models/auth-response';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http:HttpClient){}

  login(email:string,password:string){
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`,{
      email,password
    });
  }
}
