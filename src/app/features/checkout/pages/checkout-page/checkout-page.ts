import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { CustomerAuthService } from '../../../../core/services/customer-auth.service';
import { PedidoService } from '../../../../core/services/pedido.service';
import { CartStore } from '../../../cart/cart.store';

@Component({
  selector: 'app-checkout-page',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmInputImports,
    ...HlmTextareaImports,
    ...HlmBadgeImports,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .payment-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .payment-option:hover {
      border-color: var(--ring);
      background: var(--secondary);
    }
    .payment-option.selected {
      border-color: var(--primary);
      background: color-mix(in srgb, var(--primary) 8%, transparent);
    }
    .payment-option input[type="radio"] { accent-color: var(--primary); width: 18px; height: 18px; }
    .step-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary);
      color: var(--primary-foreground);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
      flex-shrink: 0;
    }
  `],
  template: `
    <!-- Header -->
    <div class="mb-8 flex items-center gap-4">
      <a hlmBtn variant="ghost" routerLink="/carrito" class="text-muted-foreground hover:text-primary px-2">
        ← Carrito
      </a>
      <div class="h-4 w-px bg-border"></div>
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Paso final</p>
        <h1 class="text-3xl md:text-4xl font-black font-serif leading-none text-primary">Confirmar Pedido</h1>
      </div>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
      
      <!-- ======================== Columna izquierda: Formulario ======================== -->
      <div class="flex flex-col gap-6">

        <!-- SECCIÓN 1: Datos personales -->
        <div hlmCard class="p-6 flex flex-col gap-5">
          <div class="flex items-center gap-3 mb-1">
            <div class="step-badge">1</div>
            <h2 class="text-base font-bold text-foreground">Información de contacto</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nombre completo</span>
              <input hlmInput formControlName="clienteNombre" autocomplete="name" placeholder="Ej: María García" />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Celular / WhatsApp</span>
              <input hlmInput formControlName="celular" autocomplete="tel" placeholder="+51 999 000 111" />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Correo electrónico</span>
              <input hlmInput formControlName="email" type="email" autocomplete="email" placeholder="tu@correo.com" />
            </label>
          </div>
        </div>

        <!-- SECCIÓN 2: Datos de entrega -->
        <div hlmCard class="p-6 flex flex-col gap-5">
          <div class="flex items-center gap-3 mb-1">
            <div class="step-badge">2</div>
            <h2 class="text-base font-bold text-foreground">Dirección de entrega</h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5 sm:col-span-2">
              <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Dirección</span>
              <input hlmInput formControlName="direccion" autocomplete="street-address" placeholder="Av. Principal 123, Distrito" />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ciudad</span>
              <input hlmInput formControlName="ciudad" autocomplete="address-level2" placeholder="Ej: Lima" />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Referencia (opcional)</span>
              <input hlmInput formControlName="referencia" placeholder="Ej: frente al parque" />
            </label>
          </div>

          <!-- Tipo de entrega -->
          <div>
            <p class="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Tipo de entrega</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="payment-option" [class.selected]="form.controls.tipoEntrega.value === 'delivery'">
                <input type="radio" formControlName="tipoEntrega" value="delivery" />
                <div>
                  <p class="text-sm font-semibold">🚚 Delivery</p>
                  <p class="text-xs text-muted-foreground">Entrega a domicilio · PEN 15.00</p>
                </div>
              </label>
              <label class="payment-option" [class.selected]="form.controls.tipoEntrega.value === 'recojo'">
                <input type="radio" formControlName="tipoEntrega" value="recojo" />
                <div>
                  <p class="text-sm font-semibold">🏪 Recojo en tienda</p>
                  <p class="text-xs text-muted-foreground">Gratis · Listo en 20 min</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: Método de pago -->
        <div hlmCard class="p-6 flex flex-col gap-5">
          <div class="flex items-center gap-3 mb-1">
            <div class="step-badge">3</div>
            <h2 class="text-base font-bold text-foreground">Método de pago</h2>
          </div>

          <div class="flex flex-col gap-3">
            <label class="payment-option" [class.selected]="form.controls.metodoPago.value === 'efectivo'">
              <input type="radio" formControlName="metodoPago" value="efectivo" />
              <div>
                <p class="text-sm font-semibold">💵 Efectivo al recibir</p>
                <p class="text-xs text-muted-foreground">Paga cuando llegue tu pedido</p>
              </div>
            </label>
            <label class="payment-option" [class.selected]="form.controls.metodoPago.value === 'yape'">
              <input type="radio" formControlName="metodoPago" value="yape" />
              <div>
                <p class="text-sm font-semibold">📱 Yape / Plin</p>
                <p class="text-xs text-muted-foreground">Transferencia instantánea</p>
              </div>
            </label>
            <label class="payment-option" [class.selected]="form.controls.metodoPago.value === 'tarjeta'">
              <input type="radio" formControlName="metodoPago" value="tarjeta" />
              <div>
                <p class="text-sm font-semibold">💳 Tarjeta (simulado)</p>
                <p class="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
              </div>
            </label>
          </div>

          <!-- Campos de tarjeta (simulado, sólo se muestran si seleccionan tarjeta) -->
          @if (form.controls.metodoPago.value === 'tarjeta') {
            <div class="border border-border/60 rounded-xl p-4 flex flex-col gap-4 bg-secondary/20">
              <p class="text-xs font-bold uppercase tracking-wide text-muted-foreground">Datos de tarjeta (demo)</p>
              <label class="flex flex-col gap-1.5">
                <span class="text-xs text-muted-foreground">Número de tarjeta</span>
                <input hlmInput placeholder="4242 4242 4242 4242" maxlength="19" />
              </label>
              <div class="grid grid-cols-2 gap-4">
                <label class="flex flex-col gap-1.5">
                  <span class="text-xs text-muted-foreground">Vencimiento</span>
                  <input hlmInput placeholder="MM/AA" maxlength="5" />
                </label>
                <label class="flex flex-col gap-1.5">
                  <span class="text-xs text-muted-foreground">CVV</span>
                  <input hlmInput placeholder="123" maxlength="3" />
                </label>
              </div>
              <div class="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <span>🔒</span>
                <span>Modo simulación — no se procesa ningún pago real</span>
              </div>
            </div>
          }
        </div>

        <!-- Notas adicionales -->
        <div hlmCard class="p-6 flex flex-col gap-3">
          <h2 class="text-base font-bold text-foreground">Notas para el pedido <span class="text-muted-foreground font-normal text-sm">(opcional)</span></h2>
          <textarea hlmTextarea formControlName="notas" rows="3" placeholder="Ej: Sin azúcar, extra caliente, timbrar al portero..."></textarea>
        </div>
      </div>

      <!-- ======================== Columna derecha: Resumen de pedido ======================== -->
      <div class="sticky top-24 flex flex-col gap-4">
        <div hlmCard class="p-6 flex flex-col gap-4">
          <h2 class="text-base font-bold text-foreground border-b border-border/50 pb-4">Resumen del pedido</h2>
          
          <!-- Productos -->
          <div class="flex flex-col gap-3">
            @for (item of cart.items(); track item.producto.id) {
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-secondary/50 overflow-hidden shrink-0">
                  @if (item.producto.imagenUrl) {
                    <img [src]="item.producto.imagenUrl" [alt]="item.producto.nombre" class="w-full h-full object-cover" />
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-lg">☕</div>
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold truncate">{{ item.producto.nombre }}</p>
                  <p class="text-xs text-muted-foreground">x{{ item.cantidad }}</p>
                </div>
                <span class="text-sm font-bold shrink-0">{{ (item.producto.precio * item.cantidad) | currency: 'PEN' : 'symbol' : '1.2-2' }}</span>
              </div>
            }
          </div>

          <div class="border-t border-border/50 pt-4 flex flex-col gap-2">
            <div class="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{{ cart.total() | currency: 'PEN' : 'symbol' : '1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-sm text-muted-foreground">
              <span>Envío</span>
              <span>{{ form.controls.tipoEntrega.value === 'recojo' ? 'Gratis' : 'PEN 15.00' }}</span>
            </div>
          </div>

          <div class="border-t border-border/50 pt-4">
            <div class="flex justify-between items-center">
              <span class="font-bold text-foreground">Total</span>
              <strong class="text-2xl font-serif text-primary">
                {{ finalTotal() | currency: 'PEN' : 'symbol' : '1.2-2' }}
              </strong>
            </div>
          </div>

          <!-- Método de pago seleccionado -->
          @if (form.controls.metodoPago.value) {
            <div class="bg-secondary/40 rounded-lg p-3 text-xs text-muted-foreground flex items-center gap-2">
              <span>{{ paymentEmoji() }}</span>
              <span>Pagarás con <strong class="text-foreground">{{ paymentLabel() }}</strong></span>
            </div>
          }
        </div>

        <!-- Botón confirmar -->
        <button 
          hlmBtn 
          type="submit" 
          size="lg"
          class="w-full h-14 text-base font-bold"
          [disabled]="form.invalid || submitting() || cart.items().length === 0">
          @if (submitting()) {
            <span class="opacity-70">Enviando pedido...</span>
          } @else {
            Confirmar y pedir ☕
          }
        </button>

        <p class="text-xs text-center text-muted-foreground px-4">
          Al confirmar aceptas nuestros términos de servicio. Tu pedido será confirmado por WhatsApp.
        </p>
      </div>
    </form>
  `,
})
export class CheckoutPage {
  private readonly pedidoService = inject(PedidoService);
  private readonly customerAuth = inject(CustomerAuthService);
  readonly cart = inject(CartStore);
  private readonly router = inject(Router);
  private readonly customerSession = this.customerAuth.session();

  readonly submitting = signal(false);

  readonly form = new FormGroup({
    clienteNombre: new FormControl(this.customerSession?.nombre ?? '', { nonNullable: true, validators: [Validators.required] }),
    celular: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl(this.customerSession?.email ?? '', { nonNullable: true, validators: [Validators.email] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ciudad: new FormControl('', { nonNullable: true }),
    referencia: new FormControl('', { nonNullable: true }),
    tipoEntrega: new FormControl<'delivery' | 'recojo'>('delivery', { nonNullable: true }),
    metodoPago: new FormControl<'efectivo' | 'yape' | 'tarjeta'>('efectivo', { nonNullable: true }),
    notas: new FormControl('', { nonNullable: true }),
  });

  finalTotal(): number {
    const envio = this.form.controls.tipoEntrega.value === 'recojo' ? 0 : 15;
    return this.cart.total() + envio;
  }

  paymentEmoji(): string {
    const map: Record<string, string> = { efectivo: '💵', yape: '📱', tarjeta: '💳' };
    return map[this.form.controls.metodoPago.value] ?? '';
  }

  paymentLabel(): string {
    const map: Record<string, string> = { efectivo: 'Efectivo al recibir', yape: 'Yape / Plin', tarjeta: 'Tarjeta (simulado)' };
    return map[this.form.controls.metodoPago.value] ?? '';
  }

  submit(): void {
    if (this.form.invalid || this.cart.items().length === 0) {
      toast.warning('Checkout incompleto', {
        description: 'Completa tus datos y agrega al menos un producto.',
      });
      return;
    }

    this.submitting.set(true);
    this.pedidoService
      .crear({
        clienteNombre: this.form.controls.clienteNombre.value,
        celular: this.form.controls.celular.value,
        direccion: `${this.form.controls.direccion.value}${this.form.controls.ciudad.value ? ', ' + this.form.controls.ciudad.value : ''}`,
        items: this.cart.items().map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
      })
      .subscribe({
        next: () => {
          this.cart.clear();
          toast.success('¡Pedido registrado! ☕', {
            description: `Pagarás con ${this.paymentLabel()}. Te confirmaremos por WhatsApp.`,
          });
          this.router.navigateByUrl('/');
        },
        error: () => {
          toast.error('No se pudo registrar el pedido', {
            description: 'Revisa stock, datos de entrega y conexión con el backend.',
          });
          this.submitting.set(false);
        },
      });
  }
}
