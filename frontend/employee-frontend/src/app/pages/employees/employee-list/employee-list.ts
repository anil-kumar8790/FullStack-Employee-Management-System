
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Employee } from '../../../services/employee';

import {
  EmployeeModel,
  CreateEmployeeRequest
} from '../../../models/employee';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeList implements OnInit, OnDestroy {

  employees: EmployeeModel[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';

  currentPage = 1;
  pageSize = 5;
  totalEmployees = 0;
  totalPages = 0;

  private successMessageTimer:
    ReturnType<typeof setTimeout> | undefined;

  constructor(
    private employeeService: Employee,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
  }

  // Refresh employee records from backend
  refreshEmployees(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService
      .getEmployees(
        this.currentPage,
        this.pageSize,
        this.searchTerm.trim()
      )
      .subscribe({

        next: (response) => {

          this.employees = response.data ?? [];

          this.totalEmployees =
            response.pagination?.totalEmployees ??
            this.employees.length;

          this.totalPages =
            response.pagination?.totalPages ??
            Math.ceil(
              this.totalEmployees / this.pageSize
            );

          this.loading = false;
          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('Employee API error:', error);

          this.employees = [];
          this.totalEmployees = 0;
          this.totalPages = 0;

          this.errorMessage =
            error.error?.message ??
            'Failed to load employees. Please try again.';

          this.loading = false;
          this.cdr.detectChanges();
        }

      });
  }

  searchEmployees(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadEmployees();
  }

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.loadEmployees();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  private showSuccessMessage(message: string): void {

    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }

    this.successMessage = message;
    this.errorMessage = '';

    this.successMessageTimer = setTimeout(() => {

      this.successMessage = '';
      this.successMessageTimer = undefined;
      this.cdr.detectChanges();

    }, 3000);
  }

  editEmployee(employee: EmployeeModel): void {

    const name = window.prompt(
      'Enter employee name:',
      employee.name
    );

    if (name === null) return;

    const email = window.prompt(
      'Enter employee email:',
      employee.email
    );

    if (email === null) return;

    const department = window.prompt(
      'Enter department:',
      employee.department
    );

    if (department === null) return;

    const salaryInput = window.prompt(
      'Enter salary:',
      String(employee.salary)
    );

    if (salaryInput === null) return;

    const salary = Number(salaryInput);

    if (!Number.isFinite(salary) || salary <= 0) {
      this.errorMessage =
        'Salary must be greater than zero.';
      return;
    }

    const phoneInput = window.prompt(
      'Enter 10-digit phone number:',
      employee.phone ?? ''
    );

    if (phoneInput === null) return;

    const phone = phoneInput.trim();

    if (phone && !/^\d{10}$/.test(phone)) {
      this.errorMessage =
        'Phone number must contain 10 digits.';
      return;
    }

    const joiningDateInput = window.prompt(
      'Enter joining date (YYYY-MM-DD):',
      employee.joining_date
        ? employee.joining_date.substring(0, 10)
        : ''
    );

    if (joiningDateInput === null) return;

    const joining_date = joiningDateInput.trim();

    if (
      joining_date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(joining_date)
    ) {
      this.errorMessage =
        'Enter the joining date as YYYY-MM-DD.';
      return;
    }

    const statusInput = window.prompt(
      'Enter status: Active or Inactive',
      employee.status ?? 'Active'
    );

    if (statusInput === null) return;

    const normalizedStatus =
      statusInput.trim().toLowerCase();

    if (
      normalizedStatus !== 'active' &&
      normalizedStatus !== 'inactive'
    ) {
      this.errorMessage =
        'Status must be Active or Inactive.';
      return;
    }

    const updatedEmployee: CreateEmployeeRequest = {
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      salary,
      phone,
      joining_date,
      status:
        normalizedStatus === 'active'
          ? 'Active'
          : 'Inactive'
    };

    this.errorMessage = '';

    this.employeeService
      .updateEmployee(employee.id, updatedEmployee)
      .subscribe({

        next: (response) => {

          if (response.data) {

            this.employees = this.employees.map(
              (emp) =>
                emp.id === employee.id
                  ? { ...emp, ...response.data }
                  : emp
            );

          }

          this.showSuccessMessage(
            response.message ||
            'Employee updated successfully.'
          );

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Update employee error:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Failed to update employee. Please try again.';

          this.cdr.detectChanges();
        }

      });
  }

  deleteEmployee(id: number): void {

    const confirmed = window.confirm(
      'Are you sure you want to delete this employee?'
    );

    if (!confirmed) return;

    this.errorMessage = '';

    this.employeeService
      .deleteEmployee(id)
      .subscribe({

        next: (response) => {

          this.employees = this.employees.filter(
            (employee) => employee.id !== id
          );

          this.totalEmployees = Math.max(
            0,
            this.totalEmployees - 1
          );

          this.totalPages = Math.ceil(
            this.totalEmployees / this.pageSize
          );

          if (
            this.employees.length === 0 &&
            this.currentPage > 1
          ) {

            this.currentPage--;
            this.loadEmployees();

          }

          this.showSuccessMessage(
            response.message ||
            'Employee deleted successfully.'
          );

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Delete employee error:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Failed to delete employee. Please try again.';

          this.cdr.detectChanges();
        }

      });
  }
}
