import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

interface Department {
  id: number;
  name: string;
  description: string | null;
  manager_id: number | null;
  manager_name: string | null;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
  employee_count: number;
}

interface DepartmentResponse {
  success: boolean;
  message: string;
  data: Department[];
  totalEmployees: number;
}

interface Employee {
  id: number;
  name: string;
}

interface EmployeeResponse {
  success: boolean;
  message: string;
  data: Employee[];
}

interface CreateDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
})
export class Departments implements OnInit {
  private readonly apiUrl = 'http://localhost:5000/api';

  departments: Department[] = [];
  employees: Employee[] = [];

  searchText = '';

  loading = false;
  saving = false;
  showAddForm = false;

  editingDepartmentId: number | null = null;

  deletingDepartmentId: number | null = null;

  errorMessage = '';
  employeeErrorMessage = '';
  formErrorMessage = '';
  successMessage = '';

  totalEmployees = 0;

  newDepartment = {
    name: '',
    description: '',
    managerId: null as number | null,
    status: 'Active' as 'Active' | 'Inactive',
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  // Load departments and employee counts
  loadDepartments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<DepartmentResponse>(`${this.apiUrl}/departments`)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.departments = response.data ?? [];
          this.totalEmployees = response.totalEmployees;
        },
        error: (error) => {
          console.error('Error loading departments:', error);

          this.errorMessage =
            error.error?.message ||
            'Unable to load departments. Please try again.';
        },
      });
  }

  // Load employees for the Department Head dropdown
  loadEmployees(): void {
    this.employeeErrorMessage = '';

    const token = localStorage.getItem('token');

    if (!token) {
      this.employeeErrorMessage =
        'Your session has expired. Please log in again.';
      return;
    }

    this.http
      .get<EmployeeResponse>(
        `${this.apiUrl}/employees?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .subscribe({
        next: (response) => {
          this.employees = response.data ?? [];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading employees:', error);

          this.employeeErrorMessage =
            'Unable to load employees for the Department Head dropdown.';

          this.cdr.detectChanges();
        },
      });
  }

  // Search by department name or manager
  get filteredDepartments(): Department[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.departments;
    }

    return this.departments.filter(
      (department) =>
        department.name.toLowerCase().includes(search) ||
        (department.manager_name ?? '')
          .toLowerCase()
          .includes(search)
    );
  }

  // Summary counts
  get totalDepartments(): number {
    return this.departments.length;
  }

  get activeDepartments(): number {
    return this.departments.filter(
      (department) => department.status === 'Active'
    ).length;
  }

  get inactiveDepartments(): number {
    return this.departments.filter(
      (department) => department.status === 'Inactive'
    ).length;
  }

  // Open a blank Add Department form
  openAddForm(): void {
    this.resetDepartmentForm();
    this.editingDepartmentId = null;
    this.formErrorMessage = '';
    this.successMessage = '';
    this.showAddForm = true;
  }

  // Open the popup with existing department details
  editDepartment(department: Department): void {
    this.editingDepartmentId = department.id;
    this.showAddForm = true;

    this.formErrorMessage = '';
    this.successMessage = '';

    this.newDepartment = {
      name: department.name,
      description: department.description ?? '',
      managerId: department.manager_id,
      status: department.status,
    };
  }

  // Create a department
  addDepartment(): void {
    if (this.editingDepartmentId !== null) {
      this.saveDepartment();
      return;
    }

    const name = this.newDepartment.name.trim();

    if (!name) {
      this.formErrorMessage = 'Department name is required.';
      return;
    }

    if (this.saving) {
      return;
    }

    this.saving = true;
    this.formErrorMessage = '';
    this.successMessage = '';

    const payload = this.getDepartmentPayload(name);

    this.http
      .post<CreateDepartmentResponse>(
        `${this.apiUrl}/departments`,
        payload
      )
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.showAddForm = false;
          this.resetDepartmentForm();

          this.successMessage =
            response.message || 'Department created successfully.';

          this.loadDepartments();
        },
        error: (error) => {
          console.error('Error creating department:', error);

          this.formErrorMessage =
            error.error?.message ||
            'Unable to create department. Please try again.';
        },
      });
  }

  // Ask for confirmation before deleting a department
confirmDeleteDepartment(department: Department): void {
  if (this.saving || this.deletingDepartmentId !== null) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete the "${department.name}" department?`
  );

  if (!confirmed) {
    return;
  }

  this.deleteDepartment(department);
}

// Delete department from the backend
deleteDepartment(department: Department): void {
  if (this.deletingDepartmentId !== null) {
    return;
  }

  this.deletingDepartmentId = department.id;
  this.errorMessage = '';
  this.successMessage = '';

  this.http
    .delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/departments/${department.id}`
    )
    .pipe(
      finalize(() => {
        this.deletingDepartmentId = null;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response) => {
        this.successMessage =
          response.message || 'Department deleted successfully.';

        this.loadDepartments();
      },
      error: (error) => {
        console.error('Error deleting department:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to delete department. Please try again.';
      },
    });
}
  // Update an existing department
  saveDepartment(): void {
    if (this.editingDepartmentId === null) {
      this.addDepartment();
      return;
    }

    const name = this.newDepartment.name.trim();

    if (!name) {
      this.formErrorMessage = 'Department name is required.';
      return;
    }

    if (this.saving) {
      return;
    }

    const departmentId = this.editingDepartmentId;
    const payload = this.getDepartmentPayload(name);

    this.saving = true;
    this.formErrorMessage = '';
    this.successMessage = '';

    this.http
      .put<CreateDepartmentResponse>(
        `${this.apiUrl}/departments/${departmentId}`,
        payload
      )
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.showAddForm = false;
          this.editingDepartmentId = null;
          this.resetDepartmentForm();

          this.successMessage =
            response.message || 'Department updated successfully.';

          this.loadDepartments();
        },
        error: (error) => {
          console.error('Error updating department:', error);

          this.formErrorMessage =
            error.error?.message ||
            'Unable to update department. Please try again.';
        },
      });
  }

  // Build the payload for creating or updating
  private getDepartmentPayload(name: string) {
    return {
      name,
      description: this.newDepartment.description.trim() || null,
      managerId: this.newDepartment.managerId,
      status: this.newDepartment.status,
    };
  }

  // Close Add/Edit popup
  cancelAddForm(): void {
    if (this.saving) {
      return;
    }

    this.showAddForm = false;
    this.editingDepartmentId = null;
    this.formErrorMessage = '';

    this.resetDepartmentForm();
  }

  // Reset form values
  private resetDepartmentForm(): void {
    this.newDepartment = {
      name: '',
      description: '',
      managerId: null,
      status: 'Active',
    };

    this.formErrorMessage = '';
  }
}
