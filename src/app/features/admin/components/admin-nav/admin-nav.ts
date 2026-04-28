import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-admin-nav',
  imports: [...HlmButtonImports, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="admin-nav" aria-label="Navegacion administrativa">
      <a hlmBtn variant="ghost" routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        Resumen
      </a>
      <a hlmBtn variant="ghost" routerLink="/admin/productos" routerLinkActive="active">Productos</a>
      <a hlmBtn variant="ghost" routerLink="/admin/pedidos" routerLinkActive="active">Pedidos</a>
    </nav>
  `,
})
export class AdminNav {}
