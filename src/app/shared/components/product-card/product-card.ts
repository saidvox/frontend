import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, ...HlmBadgeImports, ...HlmButtonImports, ...HlmCardImports, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article hlmCard class="product-card">
      <a class="product-media" [routerLink]="['/productos', product().id]">
        @if (product().imagenUrl) {
          <img [src]="product().imagenUrl" [alt]="product().nombre" loading="lazy" />
        } @else {
          <span aria-hidden="true">Cafe</span>
        }
      </a>

      <div class="product-body">
        <div>
          <div class="card-kicker">
            <span hlmBadge variant="secondary">{{ product().categoriaNombre }}</span>
            @if (product().stock <= 5) {
              <span hlmBadge variant="outline" class="stock-chip">Stock bajo</span>
            }
          </div>
          <h2 hlmCardTitle>{{ product().nombre }}</h2>
          <p class="product-description">{{ product().descripcion }}</p>
        </div>

        <div class="product-meta">
          <strong>{{ product().precio | currency: 'PEN' : 'symbol' : '1.2-2' }}</strong>
          <span [class.stock-low]="product().stock <= 5">
            {{ product().stock }} en stock
          </span>
        </div>

        <button
          hlmBtn
          size="lg"
          type="button"
          [disabled]="product().stock < 1"
          (click)="add.emit(product())"
        >
          Agregar
        </button>
      </div>
    </article>
  `,
})
export class ProductCard {
  product = input.required<Producto>();
  add = output<Producto>();
}
