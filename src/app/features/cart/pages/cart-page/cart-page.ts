import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';

import { CustomerAuthService } from '../../../../core/services/customer-auth.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { QuantityStepper } from '../../../../shared/components/quantity-stepper/quantity-stepper';
import { UserLoginDialogComponent } from '../../../../shared/components/user-login-dialog/user-login-dialog';
import { CartStore } from '../../cart.store';

@Component({
  selector: 'app-cart-page',
  imports: [
    EmptyState,
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmIconImports,
    QuantityStepper,
    RouterLink,
    UserLoginDialogComponent,
  ],
  providers: [provideIcons({ lucideTrash2 })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cart-heading">
      <p class="eyebrow">Compra</p>
      <h1 class="text-4xl font-black uppercase mb-2">Tu carrito</h1>
      <p class="text-sm text-muted-foreground">Revisa tus productos antes de confirmar el pedido.</p>
    </section>

    @if (cart.items().length > 0) {
      <div class="cart-page-layout">
        <div class="cart-items-list">
          @for (item of cart.items(); track item.producto.id) {
            <article hlmCard class="cart-item-card">
              <div class="cart-item-media">
                @if(item.producto.imagenUrl) {
                  <img [src]="item.producto.imagenUrl" [alt]="item.producto.nombre" class="h-full w-full object-cover" />
                } @else {
                  <span class="text-xs font-black text-muted-foreground">CAFE</span>
                }
              </div>

              <div class="cart-item-info">
                <div>
                  <h2>{{ item.producto.nombre }}</h2>
                  <p>
                    Categoria: <span>{{ item.producto.categoriaNombre }}</span>
                  </p>
                  <span hlmBadge variant="secondary">Disponible</span>
                </div>

                <strong class="price-text cart-item-price">
                  <span class="currency">S/</span>{{ item.producto.precio.toFixed(2) }}
                </strong>
              </div>

              <div class="cart-item-actions">
                <button
                  hlmBtn
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  type="button"
                  (click)="remove(item.producto.id)"
                  aria-label="Eliminar"
                >
                  <ng-icon hlm name="lucideTrash2" size="sm" />
                </button>

                <div class="cart-item-quantity">
                  <span>Cantidad</span>
                  <app-quantity-stepper
                    [value]="item.cantidad"
                    [max]="item.producto.stock"
                    (change)="cart.updateQuantity(item.producto.id, $event)"
                  />
                </div>
              </div>
            </article>
          }
        </div>

        <aside class="cart-summary-wrap">
          <div hlmCard class="cart-summary-card">
            <div>
              <p class="eyebrow">Pedido</p>
              <h2>Resumen del pedido</h2>
            </div>

            <div class="cart-summary-lines">
              <div>
                <span>Productos</span>
                <strong>{{ cart.totalItems() }}</strong>
              </div>
              <div>
                <span>Subtotal</span>
                <strong class="price-text">
                  <span class="currency">S/</span>{{ cart.total().toFixed(2) }}
                </strong>
              </div>
              <div>
                <span>Envio</span>
                <span>Se calcula en checkout</span>
              </div>
            </div>

            <div class="cart-summary-total">
              <span>Total parcial</span>
              <strong class="price-text">
                <span class="currency">S/</span>{{ cart.total().toFixed(2) }}
              </strong>
            </div>

            @if (customerAuth.isAuthenticated()) {
              <a hlmBtn class="w-full rounded-full" routerLink="/checkout">
                Ir al checkout
              </a>
            } @else {
              <app-user-login-dialog triggerLabel="Iniciar sesion para pagar" />
            }
          </div>
        </aside>
      </div>
    } @else {
      <app-empty-state
        title="Tu carrito esta vacio"
        message="Agrega productos desde el catalogo para iniciar un pedido."
      />
    }
  `,
})
export class CartPage {
  readonly cart = inject(CartStore);
  readonly customerAuth = inject(CustomerAuthService);

  remove(productId: number): void {
    this.cart.remove(productId);
    toast.info('Producto retirado del carrito');
  }
}
