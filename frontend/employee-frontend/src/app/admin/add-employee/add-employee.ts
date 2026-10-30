
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Employee } from '../../services/employee';
import { CreateEmployeeRequest } from '../../models/employee';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css'
})
export class AddEmployee {

  @Output() closed = new EventEmitter<void>();
  @Output() employeeAdded = new EventEmitter<void>();

  employeeForm: FormGroup;

  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: Employee
  ) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      salary: [null, [Validators.required, Validators.min(0)]],
      phone: ['', Validators.required],
      joining_date: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  closeModal(): void {
    if (!this.loading) {
      this.closed.emit();
    }
  }

  onSubmit(): void {

    this.successMessage = '';
    this.errorMessage = '';

    if (this.employeeForm.invalid || this.loading) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employee: CreateEmployeeRequest =
      this.employeeForm.getRawValue();

    this.loading = true;

    this.employeeService.createEmployee(employee).subscribe({

      next: (response) => {

        this.successMessage =
          response.message || 'Employee added successfully.';

        this.loading = false;

        this.employeeAdded.emit();
        this.closed.emit();
      },

      error: (error) => {

        console.error('Add employee error:', error);

        this.errorMessage =
          error.error?.message || 'Failed to add employee.';

        this.loading = false;
      }

    });
  }
}
