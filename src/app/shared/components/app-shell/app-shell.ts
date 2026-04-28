import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmToaster } from '@spartan-ng/helm/sonner';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SearchService } from '../../../core/services/search.service';
import { AdminLoginDialogComponent } from '../admin-login-dialog/admin-login-dialog';
import { CartSheetComponent } from '../cart-sheet/cart-sheet.component';

@Component({
  selector: 'app-shell',
  imports: [...HlmButtonImports, HlmToaster, RouterLink, RouterOutlet, ...BrnAlertDialogImports, ...HlmAlertDialogImports, AdminLoginDialogComponent, CartSheetComponent],
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
          <a routerLink="/" class="flex items-center gap-2 text-2xl font-black tracking-tighter uppercase">
            CAFÉ DE BARRIO
          </a>

          <!-- Search Bar -->
          <div class="hidden md:flex flex-1 max-w-xl relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
            <input 
              class="flex h-10 w-full rounded-full border border-input bg-secondary/50 px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              placeholder="Busca tus productos..." 
              (input)="onSearch($event)"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 md:gap-4">
            <button hlmBtn variant="ghost" size="icon" class="md:hidden" aria-label="Buscar">🔍</button>
            
            <app-cart-sheet />

            <button hlmBtn variant="outline" size="icon" (click)="theme.toggleTheme()" aria-label="Cambiar tema">
              @if (theme.isDark()) {
                <span>🌞</span>
              } @else {
                <span>🌙</span>
              }
            </button>

            @if (auth.isAuthenticated()) {
              <hlm-alert-dialog>
                <button hlmBtn variant="destructive" size="sm" brnAlertDialogTrigger>Salir</button>
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
              <app-admin-login-dialog />
            }
          </div>
        </div>
      </footer>

      @defer {
        <hlm-toaster position="bottom-right" richColors closeButton />
      }
    </div>
  `,
})
export class AppShell {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly searchService = inject(SearchService);

  logout(ctx: { close: () => void }) {
    this.auth.logout();
    ctx.close();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.setSearchTerm(input.value);
  }
}
