import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface EmployeeProfile {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number | string;
  phone: string | null;
  joining_date: string | null;
  created_at?: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit {
  @ViewChild('profileSection')
  profileSection?: ElementRef<HTMLElement>;

  employee: EmployeeProfile | null = null;

  loading = true;
  errorMessage = '';

  sidebarCollapsed = false;
  mobileMenuOpen = false;
  employeeMenuOpen = false;
  notificationsOpen = false;
  searchQuery = '';

  currentRole = 'Employee';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStoredUser();
    this.loadEmployeeProfile();
  }

  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.currentRole = user.role || 'Employee';
      }
    } catch {
      this.currentRole = 'Employee';
    }
  }

  loadEmployeeProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<{
        success: boolean;
        message: string;
        data: EmployeeProfile;
      }>('http://localhost:5000/api/employees/me')
      .subscribe({
        next: (response) => {
          this.employee = response.data ?? null;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Profile API error:', error);

          this.employee = null;
          this.loading = false;
          this.errorMessage =
            error.error?.message ||
            'Unable to load your profile. Please try again.';

          this.cdr.detectChanges();
        },
      });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleEmployeeMenu(): void {
    this.employeeMenuOpen = !this.employeeMenuOpen;
    this.notificationsOpen = false;
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    this.employeeMenuOpen = false;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  get searchMatches(): boolean {
    if (!this.employee || !this.searchQuery.trim()) {
      return false;
    }

    const query = this.searchQuery.trim().toLowerCase();

    const searchableValues = [
      this.employee.id,
      this.employee.name,
      this.employee.email,
      this.employee.department,
      this.employee.phone ?? '',
      this.currentRole,
    ];

    return searchableValues.some((value) =>
      String(value).toLowerCase().includes(query)
    );
  }

  get showSearchResults(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  activeTab: 'dashboard' | 'profile' | 'change-password' = 'dashboard';

  viewProfile(): void {
  this.activeTab = 'profile';

  this.employeeMenuOpen = false;
  this.mobileMenuOpen = false;

  this.profileSection?.nativeElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

setActiveTab(tab: 'dashboard' | 'profile' | 'change-password'): void {
  this.activeTab = tab;
}

  navigateToProfile(): void {
    this.employeeMenuOpen = false;
    this.viewProfile();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}