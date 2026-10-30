
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { EmployeeList } from '../../employees/employee-list/employee-list';
import { AddEmployee } from '../../../admin/add-employee/add-employee';

interface DashboardEmployee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number | string;
  phone?: string | null;
  joining_date?: string | null;
  status?: string;
}

interface EmployeesApiResponse {
  success: boolean;
  message?: string;
  data: DashboardEmployee[];
  pagination?: {
    totalEmployees: number;
    totalPages: number;
  };
}

interface EmployeeStatsResponse {
  success: boolean;
  message?: string;
  data: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    totalDepartments?: number;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeList,
    AddEmployee
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  @ViewChild(EmployeeList)
  employeeList?: EmployeeList;

  // Dashboard data
  employees: DashboardEmployee[] = [];

  totalEmployees = 0;
  totalDepartments = 0;

  activeEmployees: number | null = null;
  inactiveEmployees: number | null = null;

  loadingStats = true;
  statsError = '';

  // Add Employee popup
  showAddEmployeeModal = false;

  private readonly employeesApiUrl =
    'http://localhost:5000/api/employees';

  private readonly employeeStatsApiUrl =
    'http://localhost:5000/api/employees/stats';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployeeStats();
    this.loadDashboardStats();
  }

  // Load employee records
  loadEmployeeStats(): void {

    this.http
      .get<EmployeesApiResponse>(this.employeesApiUrl)
      .subscribe({

        next: (response) => {

          this.employees = response.data ?? [];

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Employee API error:',
            error
          );

        }

      });
  }

  // Load dashboard statistics
  loadDashboardStats(): void {

    this.loadingStats = true;
    this.statsError = '';

    this.http
      .get<EmployeeStatsResponse>(
        this.employeeStatsApiUrl
      )
      .subscribe({

        next: (response) => {

          const stats = response.data;

          this.totalEmployees =
            stats?.totalEmployees ?? 0;

          this.activeEmployees =
            stats?.activeEmployees ?? 0;

          this.inactiveEmployees =
            stats?.inactiveEmployees ?? 0;

          if (stats?.totalDepartments !== undefined) {
            this.totalDepartments =
              stats.totalDepartments;
          }

          this.loadingStats = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Dashboard statistics API error:',
            error
          );

          this.statsError =
            error.error?.message ??
            'Unable to load dashboard statistics.';

          this.loadingStats = false;

          this.cdr.detectChanges();
        }

      });
  }

  // Open Add Employee popup
  goToAddEmployee(): void {
    this.showAddEmployeeModal = true;
  }

  // Close Add Employee popup
  closeAddEmployeeModal(): void {
    this.showAddEmployeeModal = false;
  }

  // After successful employee creation
  onEmployeeAdded(): void {

    this.showAddEmployeeModal = false;

    // Refresh employee table
    this.employeeList?.refreshEmployees();

    // Refresh dashboard data
    this.loadEmployeeStats();
    this.loadDashboardStats();

    this.cdr.detectChanges();
  }

  // Logout
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}
