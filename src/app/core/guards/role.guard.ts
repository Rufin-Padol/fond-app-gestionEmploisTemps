import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as string[];
  const role = authService.getRoleUser(); // Ex: { username: 'test', role: 'admin' }

  if (role && expectedRoles.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
 
};
