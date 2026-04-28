import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Producto } from '../../../../core/models/producto.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-grid',
  imports: [EmptyState, ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (products().length > 0) {
      <section class="product-grid" aria-label="Productos">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" (add)="add.emit($event)" />
        }
      </section>
    } @else {
      <app-empty-state
        title="No hay productos para este filtro"
        message="Prueba otra categoria o vuelve a cargar el catalogo."
      />
    }
  `,
})
export class ProductGrid {
  products = input.required<Producto[]>();
  add = output<Producto>();
}
