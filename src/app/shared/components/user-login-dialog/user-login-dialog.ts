import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

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
      <button hlmBtn class="w-full rounded-full flex items-center justify-center gap-2" brnDialogTrigger>
        Go to Checkout <span>➔</span>
      </button>
      <hlm-dialog-content class="sm:max-w-[425px]" *brnDialogContent="let ctx">
        <hlm-dialog-header>
          <h3 hlmDialogTitle>Inicia sesión</h3>
          <p hlmDialogDescription>
            Ingresa como cliente para guardar tu pedido y completar el checkout.
          </p>
        </hlm-dialog-header>

        <form [formGroup]="form" (ngSubmit)="login(ctx)" class="grid gap-4 py-4">
          <div class="grid gap-2">
            <label for="email" class="text-sm font-medium">Correo Electrónico</label>
            <input hlmInput id="email" formControlName="email" type="email" placeholder="cliente@ejemplo.com" />
          </div>
          <div class="grid gap-2">
            <label for="password" class="text-sm font-medium">Contraseña</label>
            <input hlmInput id="password" formControlName="password" type="password" />
          </div>
          <hlm-dialog-footer>
            <button hlmBtn type="submit" [disabled]="form.invalid || loading()">
              Continuar al pago
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class UserLoginDialogComponent {
  private readonly router = inject(Router);

  readonly loading = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  login(ctx: any): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    // Simulación de delay de login
    setTimeout(() => {
      this.loading.set(false);
      ctx.close();
      this.router.navigateByUrl('/checkout');
    }, 800);
  }
}
