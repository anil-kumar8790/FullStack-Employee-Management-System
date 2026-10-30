
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  EmployeeModel,
  EmployeeResponse,
  CreateEmployeeRequest
} from '../models/employee';

@Injectable({
  providedIn: 'root',
})
export class Employee {
  private apiUrl = 'http://localhost:5000/api/employees';

  constructor(private http: HttpClient) {}

  getEmployees(
    page: number = 1,
    limit: number = 5,
    search: string = ''
  ) {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);

    return this.http.get<EmployeeResponse>(
      this.apiUrl,
      { params }
    );
  }

  getEmployeeStats() {
    return this.http.get<{
      success: boolean;
      data: {
        totalEmployees: number;
        activeEmployees: number;
        inactiveEmployees: number;
      };
    }>(`${this.apiUrl}/stats`);
  }

  createEmployee(employee: CreateEmployeeRequest) {
    return this.http.post<{
      success: boolean;
      message: string;
      data: EmployeeModel;
    }>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: CreateEmployeeRequest) {
    return this.http.put<{
      success: boolean;
      message: string;
      data: EmployeeModel;
    }>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number) {
    return this.http.delete<{
      success: boolean;
      message: string;
      data: EmployeeModel;
    }>(`${this.apiUrl}/${id}`);
  }
}
