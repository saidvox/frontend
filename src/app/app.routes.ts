import { Routes } from '@angular/router';

import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { AppShell } from './shared/components/app-shell/app-shell';

export const routes: Routes = [
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
        loadComponent: () =>
          import('./features/checkout/pages/checkout-page/checkout-page').then(
            (module) => module.CheckoutPage,
          ),
      },

      {
        path: 'admin',
        canMatch: [adminAuthGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/pages/admin-dashboard-page/admin-dashboard-page').then(
                (module) => module.AdminDashboardPage,
              ),
          },
          {
            path: 'productos',
            loadComponent: () =>
              import('./features/admin/pages/admin-products-page/admin-products-page').then(
                (module) => module.AdminProductsPage,
              ),
          },
          {
            path: 'productos/nuevo',
            loadComponent: () =>
              import(
                './features/admin/pages/admin-product-form-page/admin-product-form-page'
              ).then((module) => module.AdminProductFormPage),
          },
          {
            path: 'productos/:id/editar',
            loadComponent: () =>
              import(
                './features/admin/pages/admin-product-form-page/admin-product-form-page'
              ).then((module) => module.AdminProductFormPage),
          },
          {
            path: 'pedidos',
            loadComponent: () =>
              import('./features/admin/pages/admin-orders-page/admin-orders-page').then(
                (module) => module.AdminOrdersPage,
              ),
          },
        ],
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
