import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { CustomerAuthService } from '../services/customer-auth.service';

export const customerAuthGuard: CanMatchFn = () => {
  const customerAuth = inject(CustomerAuthService);
  const router = inject(Router);

  return customerAuth.isAuthenticated() || router.parseUrl('/carrito');
};
