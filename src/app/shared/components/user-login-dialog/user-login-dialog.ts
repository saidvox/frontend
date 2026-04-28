import { ChangeDetectionStrategy, Component, input, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { CustomerAuthService } from '../../../core/services/customer-auth.service';

type AuthMode = 'login' | 'register';
type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';

@Component({
  selector: 'app-user-login-dialog',
  imports: [
    ...HlmButtonImports,
    ...HlmInputImports,
    ReactiveFormsModule,
    ...BrnDialogImports,
    ...HlmDialogImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-dialog>
      <button
        hlmBtn
        [variant]="triggerVariant()"
        [class]="triggerClass()"
        brnDialogTrigger
      >
        {{ triggerLabel() }}
      </button>

      <hlm-dialog-content class="sm:max-w-[440px]" *brnDialogContent="let ctx">
        <hlm-dialog-header>
          <h3 hlmDialogTitle>Acceso de cliente</h3>
          <p hlmDialogDescription>
            Inicia sesion o crea una cuenta para continuar con tu compra.
          </p>
        </hlm-dialog-header>

        <div class="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <button
            hlmBtn
            type="button"
            [variant]="mode() === 'login' ? 'default' : 'ghost'"
            size="sm"
            (click)="mode.set('login')"
          >
            Iniciar sesion
          </button>
          <button
            hlmBtn
            type="button"
            [variant]="mode() === 'register' ? 'default' : 'ghost'"
            size="sm"
            (click)="mode.set('register')"
          >
            Registrarme
          </button>
        </div>

        @if (mode() === 'login') {
          <form [formGroup]="loginForm" (ngSubmit)="login(ctx)" class="grid gap-4 py-4">
            <div class="grid gap-2">
              <label for="customer-email" class="text-sm font-medium">Correo</label>
              <input hlmInput id="customer-email" formControlName="email" type="email" autocomplete="email" placeholder="cliente@demo.com" />
            </div>
            <div class="grid gap-2">
              <label for="customer-password" class="text-sm font-medium">Clave</label>
              <input hlmInput id="customer-password" formControlName="password" type="password" autocomplete="current-password" placeholder="Cliente123" />
            </div>
            <p class="text-xs text-muted-foreground">
              Demo: cliente@demo.com / Cliente123
            </p>
            <hlm-dialog-footer>
              <button hlmBtn type="submit" [disabled]="loginForm.invalid || loading()">
                Continuar
              </button>
            </hlm-dialog-footer>
          </form>
        } @else {
          <form [formGroup]="registerForm" (ngSubmit)="register(ctx)" class="grid gap-4 py-4">
            <div class="grid gap-2">
              <label for="customer-name-register" class="text-sm font-medium">Nombre</label>
              <input hlmInput id="customer-name-register" formControlName="nombre" autocomplete="name" placeholder="Tu nombre" />
            </div>
            <div class="grid gap-2">
              <label for="customer-email-register" class="text-sm font-medium">Correo</label>
              <input hlmInput id="customer-email-register" formControlName="email" type="email" autocomplete="email" placeholder="tu@correo.com" />
            </div>
            <div class="grid gap-2">
              <label for="customer-password-register" class="text-sm font-medium">Clave</label>
              <input hlmInput id="customer-password-register" formControlName="password" type="password" autocomplete="new-password" />
            </div>
            <hlm-dialog-footer>
              <button hlmBtn type="submit" [disabled]="registerForm.invalid || loading()">
                Crear cuenta
              </button>
            </hlm-dialog-footer>
          </form>
        }
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class UserLoginDialogComponent {
  private readonly customerAuth = inject(CustomerAuthService);
  private readonly router = inject(Router);

  readonly triggerLabel = input('Ir al checkout');
  readonly triggerVariant = input<ButtonVariant>('default');
  readonly triggerClass = input('w-full rounded-full');
  readonly redirectToCheckout = input(true);

  readonly loading = signal(false);
  readonly mode = signal<AuthMode>('login');

  readonly loginForm = new FormGroup({
    email: new FormControl('cliente@demo.com', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('Cliente123', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly registerForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  login(ctx: { close: () => void }): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    const success = this.customerAuth.login(
      this.loginForm.controls.email.value,
      this.loginForm.controls.password.value,
    );

    this.finishAuth(ctx, success, 'Bienvenido de nuevo', 'Correo o clave incorrectos');
  }

  register(ctx: { close: () => void }): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading.set(true);
    const success = this.customerAuth.register(
      this.registerForm.controls.nombre.value,
      this.registerForm.controls.email.value,
      this.registerForm.controls.password.value,
    );

    this.finishAuth(ctx, success, 'Cuenta creada correctamente', 'Ese correo ya esta registrado');
  }

  private finishAuth(ctx: { close: () => void }, success: boolean, successMessage: string, errorMessage: string): void {
    this.loading.set(false);

    if (!success) {
      toast.error(errorMessage);
      return;
    }

    toast.success(successMessage);
    ctx.close();

    if (this.redirectToCheckout()) {
      this.router.navigateByUrl('/checkout');
    }
  }
}
