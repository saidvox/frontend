import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login-dialog',
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
      <button hlmBtn variant="ghost" brnDialogTrigger>Admin</button>
      <hlm-dialog-content class="sm:max-w-[425px]" *brnDialogContent="let ctx">
        <hlm-dialog-header>
          <h3 hlmDialogTitle>Acceso interno</h3>
          <p hlmDialogDescription>
            Gestiona productos, stock y pedidos recibidos.
          </p>
        </hlm-dialog-header>

        <form [formGroup]="form" (ngSubmit)="login(ctx)" class="grid gap-4 py-4">
          <div class="grid gap-2">
            <label for="username" class="text-sm font-medium">Usuario</label>
            <input hlmInput id="username" formControlName="username" autocomplete="username" />
          </div>
          <div class="grid gap-2">
            <label for="password" class="text-sm font-medium">Clave</label>
            <input hlmInput id="password" formControlName="password" type="password" autocomplete="current-password" />
          </div>
          <hlm-dialog-footer>
            <button hlmBtn type="submit" [disabled]="form.invalid || loading()">
              Ingresar
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class AdminLoginDialogComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);

  readonly form = new FormGroup({
    username: new FormControl('admin', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('Admin12345*', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  login(ctx: any): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        ctx.close();
        this.router.navigateByUrl('/admin');
      },
      error: () => {
        toast.error('Credenciales inválidas');
        this.loading.set(false);
      },
    });
  }
}
