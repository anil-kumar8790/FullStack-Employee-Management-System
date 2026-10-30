export interface EmployeeModel {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  phone: string | null;
  joining_date: string | null;
  created_at: string;
  status: 'Active' | 'Inactive';
}

export interface EmployeeResponse {
  success: boolean;
  message: string;
  data: EmployeeModel[];
  pagination: {
    page: number;
    limit: number;
    search: string;
    department: string;
    sortBy: string;
    order: string;
    totalEmployees: number;
    totalPages: number;
  };
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  department: string;
  salary: number;
  phone: string;
  joining_date: string;
  status: 'Active' | 'Inactive';
}