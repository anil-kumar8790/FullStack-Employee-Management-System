import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(storedUser);
    const requiredRole = route.data?.['role'];

    if (user.role === requiredRole) {
      return true;
    }

    if (user.role === 'Admin') {
      router.navigate(['/admin/dashboard']);
    } else if (user.role === 'Employee') {
      router.navigate(['/employee-dashboard']);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.navigate(['/login']);
    }

    return false;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.navigate(['/login']);
    return false;
  }
};
