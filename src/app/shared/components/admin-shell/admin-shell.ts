import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideClipboardList,
  lucideLogOut,
  lucideMoon,
  lucidePackage,
  lucideStore,
  lucideSun,
  lucidePanelLeftClose,
  lucidePanelLeftOpen,
} from '@ng-icons/lucide';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmToaster } from '@spartan-ng/helm/sonner';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-admin-shell',
  imports: [
    ...BrnAlertDialogImports,
    ...HlmAlertDialogImports,
    ...HlmButtonImports,
    ...HlmIconImports,
    HlmToaster,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  providers: [
    provideIcons({
      lucideClipboardList,
      lucideLogOut,
      lucideMoon,
      lucidePackage,
      lucideStore,
      lucideSun,
      lucidePanelLeftClose,
      lucidePanelLeftOpen,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      min-height: 100dvh;
    }
  `],
  template: `
    <div class="admin-shell" [class.collapsed]="isSidebarCollapsed()">
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <div class="admin-brand-mark">CB</div>
          <div>
            <strong>Cafe de Barrio</strong>
            <span>Administracion</span>
          </div>
        </div>

        <nav class="admin-sidebar-nav" aria-label="Navegacion administrativa">
          <a routerLink="/admin/productos" routerLinkActive="active" title="Productos">
            <ng-icon hlm name="lucidePackage" size="sm" />
            <span class="label">Productos</span>
          </a>
          <a routerLink="/admin/pedidos" routerLinkActive="active" title="Pedidos">
            <ng-icon hlm name="lucideClipboardList" size="sm" />
            <span class="label">Pedidos</span>
          </a>
        </nav>

        <div class="admin-sidebar-footer">
          <a hlmBtn variant="ghost" routerLink="/" class="justify-start" title="Ver tienda">
            <ng-icon hlm name="lucideStore" size="sm" />
            <span class="label">Ver tienda</span>
          </a>
          <button hlmBtn variant="ghost" type="button" class="justify-start" (click)="theme.toggleTheme()" title="Cambiar tema">
            @if (theme.isDark()) {
              <ng-icon hlm name="lucideSun" size="sm" />
              <span class="label">Tema claro</span>
            } @else {
              <ng-icon hlm name="lucideMoon" size="sm" />
              <span class="label">Tema oscuro</span>
            }
          </button>
          <hlm-alert-dialog>
            <button hlmBtn variant="ghost" type="button" class="justify-start text-destructive hover:text-destructive" brnAlertDialogTrigger title="Cerrar sesion">
              <ng-icon hlm name="lucideLogOut" size="sm" />
              <span class="label">Cerrar sesion</span>
            </button>
            <hlm-alert-dialog-content *brnAlertDialogContent="let ctx">
              <hlm-alert-dialog-header>
                <h3 hlmAlertDialogTitle>Cerrar sesion?</h3>
                <p hlmAlertDialogDescription>
                  Saldras del panel administrativo y volveras a la tienda.
                </p>
              </hlm-alert-dialog-header>
              <hlm-alert-dialog-footer>
                <button hlmBtn variant="outline" (click)="ctx.close()">Cancelar</button>
                <button hlmBtn variant="destructive" (click)="logout(ctx)">Cerrar sesion</button>
              </hlm-alert-dialog-footer>
            </hlm-alert-dialog-content>
          </hlm-alert-dialog>
        </div>
      </aside>

      <section class="admin-workspace">
        <header class="admin-topbar">
          <div class="admin-topbar-left">
            <button hlmBtn variant="ghost" size="icon" (click)="toggleSidebar()" aria-label="Alternar menú lateral" class="text-muted-foreground">
              @if (isSidebarCollapsed()) {
                <ng-icon hlm name="lucidePanelLeftOpen" size="sm" />
              } @else {
                <ng-icon hlm name="lucidePanelLeftClose" size="sm" />
              }
            </button>
            <div>
              <p>Panel ERP</p>
              <h2>Gestion de cafeteria</h2>
            </div>
          </div>
          <div class="admin-user-pill">
            Administrador
          </div>
        </header>

        <main class="admin-content">
          <router-outlet />
        </main>

        @if (isBrowser()) {
          <hlm-toaster position="bottom-right" richColors closeButton />
        }
      </section>
    </div>
  `,
})
export class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  readonly theme = inject(ThemeService);
  readonly isBrowser = signal(isPlatformBrowser(this.platformId));
  readonly isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  logout(ctx: { close: () => void }): void {
    this.auth.logout();
    ctx.close();
    this.router.navigateByUrl('/');
  }
}
