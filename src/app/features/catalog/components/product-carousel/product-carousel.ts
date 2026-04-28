import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Producto } from '../../../../core/models/producto.model';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';

@Component({
  selector: 'app-product-carousel',
  imports: [EmptyState, ProductCard, HlmCarouselImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (products().length > 0) {
      <div class="relative w-full px-12 py-4">
        <!-- El carrusel maneja internamente el arrastre (drag), scroll tactil y el loop infinito -->
        <hlm-carousel class="w-full" [options]="{ loop: true, align: 'start' }">
          <hlm-carousel-content class="-ml-4">
            @for (product of products(); track product.id) {
              <hlm-carousel-item class="pl-4 basis-auto">
                <div class="w-[280px]">
                  <app-product-card [product]="product" (add)="add.emit($event)" />
                </div>
              </hlm-carousel-item>
            }
          </hlm-carousel-content>
          
          <!-- Flechas de navegacion a los costados -->
          <button hlmCarouselPrevious class="absolute -left-4 top-1/2 -translate-y-1/2"></button>
          <button hlmCarouselNext class="absolute -right-4 top-1/2 -translate-y-1/2"></button>
        </hlm-carousel>
      </div>
    } @else {
      <app-empty-state
        title="No hay productos para esta categoria"
        message="Vuelve a cargar el catalogo mas tarde."
      />
    }
  `,
})
export class ProductCarousel {
  products = input.required<Producto[]>();
  add = output<Producto>();
}
