import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) {
    router.navigate(['/login']);
    return false;
  }
  try {
    const user = JSON.parse(storedUser);

    if (!user.role) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      router.navigate(['/login']);
      return false;
    }
    return true;
  }
  catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    router.navigate(['/login']);
    return false;
  }
};
