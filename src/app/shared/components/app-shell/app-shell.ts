import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmToaster } from '@spartan-ng/helm/sonner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon, lucideLogOut, lucideUser } from '@ng-icons/lucide';

import { AuthService } from '../../../core/services/auth.service';
import { CustomerAuthService } from '../../../core/services/customer-auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AdminLoginDialogComponent } from '../admin-login-dialog/admin-login-dialog';
import { CartSheetComponent } from '../cart-sheet/cart-sheet.component';
import { SearchCommandComponent } from '../search-command/search-command';
import { UserLoginDialogComponent } from '../user-login-dialog/user-login-dialog';

@Component({
  selector: 'app-shell',
  imports: [
    ...HlmButtonImports,
    HlmToaster,
    HlmIconImports,
    RouterLink,
    RouterOutlet,
    ...BrnAlertDialogImports,
    ...HlmAlertDialogImports,
    AdminLoginDialogComponent,
    CartSheetComponent,
    SearchCommandComponent,
    UserLoginDialogComponent,
  ],
  providers: [provideIcons({ lucideSun, lucideMoon, lucideLogOut, lucideUser })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell flex flex-col min-h-screen">
      <!-- TOP PROMO BAR -->
      <div class="bg-primary text-primary-foreground text-center py-1.5 px-4 text-xs sm:text-sm font-medium tracking-wide">
        ☕ ENVÍO GRATIS en pedidos superiores a $50 | ¡Usa el código CAFEBARRIO!
      </div>

      <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="container flex h-16 items-center justify-between gap-4 md:gap-8 px-4 md:px-6 mx-auto">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 text-2xl font-black tracking-tighter uppercase shrink-0">
            CAFÉ DE BARRIO
          </a>

          <!-- Search Command -->
          <app-search-command class="flex flex-1 max-w-xl" />

          <!-- Actions -->
          <div class="flex items-center gap-1 md:gap-2">
            <app-cart-sheet />

            <button hlmBtn variant="ghost" size="icon" (click)="theme.toggleTheme()" aria-label="Cambiar tema">
              @if (theme.isDark()) {
                <ng-icon hlm name="lucideSun" size="sm" />
              } @else {
                <ng-icon hlm name="lucideMoon" size="sm" />
              }
            </button>

            @if (auth.isAuthenticated()) {
              <a hlmBtn variant="outline" size="sm" routerLink="/admin" class="hidden sm:inline-flex">
                Admin
              </a>
              <hlm-alert-dialog>
                <button hlmBtn variant="ghost" size="icon" class="text-muted-foreground hover:text-destructive" brnAlertDialogTrigger aria-label="Cerrar sesión">
                  <ng-icon hlm name="lucideLogOut" size="sm" />
                </button>
                <hlm-alert-dialog-content *brnAlertDialogContent="let ctx">
                  <hlm-alert-dialog-header>
                    <h3 hlmAlertDialogTitle>¿Cerrar sesión?</h3>
                    <p hlmAlertDialogDescription>
                      Deberás volver a ingresar tus credenciales.
                    </p>
                  </hlm-alert-dialog-header>
                  <hlm-alert-dialog-footer>
                    <button hlmBtn variant="outline" (click)="ctx.close()">Cancelar</button>
                  <button hlmBtn variant="destructive" (click)="logout(ctx)">Salir</button>
                </hlm-alert-dialog-footer>
              </hlm-alert-dialog-content>
            </hlm-alert-dialog>
            } @else if (customerAuth.isAuthenticated()) {
              <div class="hidden items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold sm:flex">
                <ng-icon hlm name="lucideUser" size="sm" />
                <span>{{ customerAuth.session()?.nombre }}</span>
                <button
                  type="button"
                  class="text-muted-foreground transition hover:text-destructive"
                  (click)="customerAuth.logout()"
                  aria-label="Cerrar sesion de cliente"
                >
                  Salir
                </button>
              </div>
            } @else {
              <app-user-login-dialog
                triggerLabel="Cliente"
                triggerVariant="ghost"
                triggerClass="h-9 px-3"
                [redirectToCheckout]="false"
              />
              <app-admin-login-dialog />
            }
          </div>
        </div>
      </header>

      <main id="main-content" class="flex-1 container mx-auto px-4 md:px-6 py-8">
        <router-outlet />
      </main>

      <footer class="border-t py-6 mt-auto text-center text-sm text-muted-foreground">
        <div class="container mx-auto px-4 flex justify-between items-center">
          <p>&copy; 2026 Café de Barrio. Todos los derechos reservados.</p>
          <div>
            @if (auth.isAuthenticated()) {
              <a routerLink="/admin" class="hover:underline">Dashboard Admin</a>
            } @else {
              <span>Acceso admin en el menu superior</span>
            }
          </div>
        </div>
      </footer>

      <!--
        Toaster: se renderiza SOLO en el navegador (nunca en SSR).
        Razón: HlmToaster usa getBoundingClientRect internamente, que no existe
        en el entorno de Node.js/SSR. La solución correcta es @if (isBrowser())
        en lugar de @defer (que causaba NG0751 al conflictuar con HMR).
      -->
      @if (isBrowser()) {
        <hlm-toaster position="bottom-right" richColors closeButton />
      }
    </div>
  `,
})
export class AppShell {
  readonly auth = inject(AuthService);
  readonly customerAuth = inject(CustomerAuthService);
  readonly theme = inject(ThemeService);

  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Signal que indica si estamos ejecutando en el navegador.
   * Se evalúa una sola vez en la construcción del componente.
   * En SSR → false (el toaster no se renderiza en el servidor).
   * En browser → true (el toaster se monta normalmente).
   */
  readonly isBrowser = signal(isPlatformBrowser(this.platformId));

  logout(ctx: { close: () => void }) {
    this.auth.logout();
    ctx.close();
  }
}
