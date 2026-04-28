import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { QuantityStepper } from '../../../../shared/components/quantity-stepper/quantity-stepper';
import { UserLoginDialogComponent } from '../../../../shared/components/user-login-dialog/user-login-dialog';
import { CartStore } from '../../cart.store';

@Component({
  selector: 'app-cart-page',
  imports: [
    CurrencyPipe,
    EmptyState,
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmInputImports,
    QuantityStepper,
    UserLoginDialogComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mb-8">
      <h1 class="text-4xl font-black uppercase mb-6">Tu Carrito</h1>
    </section>

    @if (cart.items().length > 0) {
      <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <!-- Lista de productos -->
        <div class="flex-1 flex flex-col gap-4">
          @for (item of cart.items(); track item.producto.id) {
            <article class="flex gap-4 p-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
              <div class="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-secondary/50 rounded-md overflow-hidden flex items-center justify-center">
                @if(item.producto.imagenUrl) {
                  <img [src]="item.producto.imagenUrl" [alt]="item.producto.nombre" class="w-full h-full object-cover" />
                } @else {
                  <span class="text-4xl">☕</span>
                }
              </div>
              <div class="flex flex-col flex-1 justify-between">
                <div class="flex justify-between items-start gap-2">
                  <div>
                    <h2 class="font-bold text-lg leading-tight">{{ item.producto.nombre }}</h2>
                    <p class="text-sm text-muted-foreground mt-1">Categoria: <span class="font-medium text-foreground">{{ item.producto.categoriaNombre }}</span></p>
                    <p class="text-sm text-muted-foreground">Estado: <span class="font-medium text-foreground">Disponible</span></p>
                  </div>
                  <button hlmBtn variant="ghost" size="icon" class="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0" (click)="remove(item.producto.id)" aria-label="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
                <div class="flex justify-between items-center mt-4">
                  <strong class="text-xl sm:text-2xl font-bold">
                    {{ item.producto.precio | currency: 'PEN' : 'symbol' : '1.2-2' }}
                  </strong>
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

        <!-- Order Summary -->
        <aside class="w-full lg:w-[400px] shrink-0">
          <div class="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4">
            <h2 class="text-xl font-bold mb-2">Order Summary</h2>
            
            <div class="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <strong class="text-foreground">{{ cart.total() | currency: 'PEN' : 'symbol' : '1.2-2' }}</strong>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Descuento (-20%)</span>
              <strong class="text-destructive">-{{ (cart.total() * 0.2) | currency: 'PEN' : 'symbol' : '1.2-2' }}</strong>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <span>Envío</span>
              <strong class="text-foreground">PEN 15.00</strong>
            </div>
            
            <hr class="border-border my-2" />
            
            <div class="flex justify-between items-center text-xl font-bold mb-2">
              <span>Total</span>
              <span>{{ (cart.total() * 0.8 + 15) | currency: 'PEN' : 'symbol' : '1.2-2' }}</span>
            </div>

            <div class="flex gap-2">
              <div class="relative flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🎫</span>
                <input hlmInput class="w-full pl-9 rounded-full bg-secondary/50 border-transparent" placeholder="Add promo code" />
              </div>
              <button hlmBtn class="rounded-full px-6">Apply</button>
            </div>

            <app-user-login-dialog />
          </div>
        </aside>
      </div>

      <!-- Newsletter Block -->
      <div class="mt-16 rounded-3xl bg-foreground text-background p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
        <h2 class="text-3xl md:text-4xl font-black uppercase max-w-md leading-tight">
          STAY UPTO DATE ABOUT OUR LATEST OFFERS
        </h2>
        <div class="w-full md:w-auto flex flex-col gap-3 min-w-[300px]">
          <div class="relative w-full">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">✉️</span>
            <input class="flex h-12 w-full rounded-full bg-background px-4 py-2 pl-12 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Enter your email address" />
          </div>
          <button class="h-12 w-full rounded-full bg-background text-foreground font-medium hover:bg-secondary transition-colors">
            Subscribe to Newsletter
          </button>
        </div>
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

  remove(productId: number): void {
    this.cart.remove(productId);
    toast.info('Producto retirado del carrito');
  }
}
