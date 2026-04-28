import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideShoppingCart, lucideTrash2, lucidePlus, lucideMinus } from '@ng-icons/lucide';
import { CartStore } from '../../../features/cart/cart.store';
import { CustomerAuthService } from '../../../core/services/customer-auth.service';
import { UserLoginDialogComponent } from '../user-login-dialog/user-login-dialog';

@Component({
  selector: 'app-cart-sheet',
  imports: [...BrnSheetImports, ...HlmSheetImports, ...HlmButtonImports, HlmIconImports, RouterLink, UserLoginDialogComponent],
  providers: [provideIcons({ lucideShoppingCart, lucideTrash2, lucidePlus, lucideMinus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep hlm-sheet-content {
      transition-duration: 280ms;
      transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform, opacity;
    }

    :host ::ng-deep hlm-sheet-overlay {
      transition-duration: 220ms;
    }

    .cart-sheet-item {
      border-bottom: 1px solid color-mix(in srgb, var(--border), transparent 50%);
      padding-bottom: 16px;
    }

    .cart-sheet-item:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }
  `],
  template: `
    <hlm-sheet side="right">
      <button hlmBtn variant="ghost" size="icon" class="relative" brnSheetTrigger>
        <ng-icon hlm size="sm" name="lucideShoppingCart" />
        @if(cart.totalItems() > 0) {
           <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold shadow-sm">
             {{cart.totalItems()}}
           </span>
        }
      </button>
      
      <hlm-sheet-content *brnSheetContent="let ctx" class="w-full sm:w-[450px] sm:max-w-[90vw] bg-background border-l flex flex-col p-0 shadow-2xl">
        
        <hlm-sheet-header class="px-6 py-4 border-b flex flex-col justify-center">
          <h3 hlmSheetTitle class="text-lg font-semibold tracking-tight text-foreground font-sans">Tu Carrito</h3>
          <p hlmSheetDescription class="text-sm text-muted-foreground mt-1 font-sans">
            Revisa tus productos antes de pagar.
          </p>
        </hlm-sheet-header>

        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 font-sans">
          @if(cart.items().length === 0) {
            <div class="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-80 mt-12">
              <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ng-icon hlm size="xl" name="lucideShoppingCart" class="text-muted-foreground" />
              </div>
              <p class="text-sm font-medium text-muted-foreground">Tu carrito está vacío</p>
              <button hlmBtn variant="outline" (click)="ctx.close()" class="mt-4">Continuar comprando</button>
            </div>
          } @else {
            <div class="flex flex-col gap-5">
              @for(item of cart.items(); track item.producto.id) {
                <div class="cart-sheet-item flex items-start justify-between gap-4">
                  <!-- Detalles del producto -->
                  <div class="flex flex-col gap-1 flex-1">
                    <span class="font-semibold text-sm text-foreground">{{item.producto.nombre}}</span>
                    <span class="price-text text-sm text-muted-foreground">
                      <span class="currency">S/</span>{{ item.producto.precio.toFixed(2) }}
                    </span>
                    
                    <!-- Controles de cantidad -->
                    <div class="flex items-center gap-3 mt-2">
                      <div class="flex items-center border rounded-md bg-card">
                        <button hlmBtn variant="ghost" size="icon" class="h-7 w-7 rounded-none hover:bg-muted" (click)="cart.updateQuantity(item.producto.id, item.cantidad - 1)">
                          <ng-icon hlm size="sm" name="lucideMinus" />
                        </button>
                        <span class="w-8 text-center text-sm font-medium">{{item.cantidad}}</span>
                        <button hlmBtn variant="ghost" size="icon" class="h-7 w-7 rounded-none hover:bg-muted" (click)="cart.updateQuantity(item.producto.id, item.cantidad + 1)">
                          <ng-icon hlm size="sm" name="lucidePlus" />
                        </button>
                      </div>
                      <button hlmBtn variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" (click)="cart.remove(item.producto.id)">
                        <ng-icon hlm size="sm" name="lucideTrash2" />
                      </button>
                    </div>
                  </div>
                  
                  <!-- Total por item -->
                  <div class="text-right mt-0.5">
                    <span class="price-text text-sm">
                      <span class="currency">S/</span>{{ (item.producto.precio * item.cantidad).toFixed(2) }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        @if(cart.items().length > 0) {
          <div class="p-6 border-t bg-background sticky bottom-0 font-sans">
            <div class="flex justify-between items-center mb-4">
              <span class="text-sm font-medium text-muted-foreground">Subtotal</span>
              <span class="price-text text-xl">
                <span class="currency">S/</span>{{ cart.total().toFixed(2) }}
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <!-- Si ya está autenticado, ir directo a checkout; si no, mostrar dialogo de login -->
              @if (customerAuth.isAuthenticated()) {
                <button hlmBtn class="w-full font-semibold" (click)="ctx.close()" routerLink="/checkout">
                  Proceder al pago
                </button>
              } @else {
                <app-user-login-dialog triggerLabel="Iniciar sesion para pagar" />
              }
              <button hlmBtn variant="outline" class="w-full font-medium" (click)="ctx.close()" routerLink="/carrito">
                Ver carrito completo
              </button>
            </div>
          </div>
        }
      </hlm-sheet-content>
    </hlm-sheet>
  `
})
export class CartSheetComponent {
  readonly cart = inject(CartStore);
  readonly customerAuth = inject(CustomerAuthService);
}
