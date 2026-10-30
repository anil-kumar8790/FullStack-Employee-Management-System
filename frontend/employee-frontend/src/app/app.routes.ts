import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { EmployeeList } from './pages/employees/employee-list/employee-list';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { EmployeeDashboard } from './pages/employee-dashboard/employee-dashboard';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { AddEmployee } from './admin/add-employee/add-employee';
import { SetPassword } from './auth/set-password/set-password';
import { ChangePassword } from './auth/change-password/change-password';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';
import { Departments } from './pages/admin/departments/departments';
import { Settings } from './pages/admin/settings/settings';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'set-password', component: SetPassword },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },

  {
    path: 'change-password',
    component: ChangePassword,
    canActivate: [authGuard]
  },

  {
    path: 'employee-dashboard',
    component: EmployeeDashboard,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Employee' }
  },

  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    children: [
      { path: 'admin/dashboard', component: Dashboard },
      { path: 'employees', component: EmployeeList },
      { path: 'admin/add-employee', component: AddEmployee },
      { path: 'admin/departments', component: Departments },

      {
        path: 'admin/profile',
        loadComponent: () =>
          import('./pages/admin/profile/profile')
            .then(m => m.Profile)
      },

      { path: 'admin/settings', component: Settings },

      { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];