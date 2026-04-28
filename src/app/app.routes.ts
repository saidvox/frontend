import { Routes } from '@angular/router';

import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { customerAuthGuard } from './core/guards/customer-auth.guard';
import { AdminShell } from './shared/components/admin-shell/admin-shell';
import { AppShell } from './shared/components/app-shell/app-shell';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminShell,
    canMatch: [adminAuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'productos',
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/pages/admin-products-page/admin-products-page').then(
            (module) => module.AdminProductsPage,
          ),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/pages/admin-orders-page/admin-orders-page').then(
            (module) => module.AdminOrdersPage,
          ),
      },
      {
        path: '**',
        redirectTo: 'productos',
      },
    ],
  },
  {
    path: '',
    component: AppShell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/catalog/pages/catalog-page/catalog-page').then(
            (module) => module.CatalogPage,
          ),
      },
      {
        path: 'productos/:id',
        loadComponent: () =>
          import('./features/catalog/pages/product-detail-page/product-detail-page').then(
            (module) => module.ProductDetailPage,
          ),
      },
      {
        path: 'buscar',
        loadComponent: () =>
          import('./features/catalog/pages/search-page/search-page').then(
            (module) => module.SearchPage,
          ),
      },
      {
        path: 'carrito',
        loadComponent: () =>
          import('./features/cart/pages/cart-page/cart-page').then((module) => module.CartPage),
      },
      {
        path: 'checkout',
        canMatch: [customerAuthGuard],
        loadComponent: () =>
          import('./features/checkout/pages/checkout-page/checkout-page').then(
            (module) => module.CheckoutPage,
          ),
      },

      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
