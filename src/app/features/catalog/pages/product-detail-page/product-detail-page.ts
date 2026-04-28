import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { Producto, ProductoDetalle } from '../../../../core/models/producto.model';
import { ProductoService } from '../../../../core/services/producto.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { CartStore } from '../../../cart/cart.store';
import { ProductCarousel } from '../../components/product-carousel/product-carousel';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmCardImports,
    EmptyState,
    LoadingState,
    RouterLink,
    ProductCarousel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-loading-state message="Cargando producto..." />
    } @else if (product()) {
      <div class="max-w-6xl mx-auto px-2 md:px-6">
        <!-- Breadcrumb / Volver -->
        <div class="mb-6">
          <a hlmBtn variant="link" routerLink="/" class="text-link px-0 text-muted-foreground hover:text-primary">
            ← Volver al catálogo
          </a>
        </div>

        <!-- Producto Detalle Layout -->
        <article class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          <!-- Imagen -->
          <div class="w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-secondary/30 border shadow-sm">
            @if (product()?.imagenUrl) {
              <img [src]="product()?.imagenUrl" [alt]="product()?.nombre" class="w-full h-full object-cover" />
            } @else {
              <div class="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                <span class="font-serif text-2xl opacity-50">Sin imagen</span>
              </div>
            }
          </div>

          <!-- Informacion -->
          <div class="flex flex-col space-y-6 md:py-4">
            <div>
              <span hlmBadge variant="secondary" class="mb-4 text-sm">{{ product()?.categoriaNombre }}</span>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-primary leading-tight mb-4">{{ product()?.nombre }}</h1>
              <p class="text-lg text-muted-foreground leading-relaxed">{{ product()?.descripcion }}</p>
            </div>
            
            <div class="flex flex-col gap-2 pt-6 border-t border-border/50">
              <div class="flex items-end justify-between">
                <strong class="price-text is-large">
                  <span class="currency">S/</span>{{ product()?.precio?.toFixed(2) }}
                </strong>
                <span class="text-sm font-medium px-3 py-1 rounded-full bg-secondary/50" 
                      [class.text-destructive]="(product()?.stock ?? 0) < 10" 
                      [class.text-muted-foreground]="(product()?.stock ?? 0) >= 10">
                  {{ product()?.stock }} unidades disponibles
                </span>
              </div>
            </div>

            <button hlmBtn size="lg" type="button" class="w-full md:w-auto mt-6 text-base h-14" (click)="addToCart()">
              Agregar al carrito
            </button>
          </div>
        </article>

        <!-- Productos Relacionados -->
        @if (relatedProducts().length > 0) {
          <section class="mt-24 pt-12 border-t border-border/50">
            <div class="flex justify-between items-end mb-8 px-2 md:px-4">
              <h2 class="text-3xl font-serif font-bold text-primary">Te podría interesar</h2>
              <a hlmBtn variant="link" routerLink="/" class="text-muted-foreground hover:text-primary hidden md:inline-flex">
                Ver más productos →
              </a>
            </div>
            <!-- Carrusel Infinito que implementamos antes -->
            <app-product-carousel [products]="relatedProducts()" (add)="addToCart($event)" />
            
            <div class="mt-8 text-center md:hidden">
              <a hlmBtn variant="outline" routerLink="/" class="w-full">
                Ver más productos
              </a>
            </div>
          </section>
        }
      </div>
    } @else {
      <app-empty-state
        title="Producto no encontrado"
        message="El producto solicitado no existe o no está disponible."
      />
    }
  `,
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productoService = inject(ProductoService);
  private readonly cart = inject(CartStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly product = signal<ProductoDetalle | null>(null);
  readonly relatedProducts = signal<Producto[]>([]);
  readonly loading = signal(true);
  readonly currentProductId = signal<number | null>(null);

  ngOnInit(): void {
    this.productoService.productChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const id = this.currentProductId();
        if (id) {
          this.loadProduct(id, false);
        }
      });

    // Escuchar cambios de parametros para recargar si navegamos desde productos relacionados a otro detalle
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.currentProductId.set(id);
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number, scrollToTop = true): void {
    this.loading.set(true);
    // Hacer scroll arriba al cargar un nuevo producto
    if (scrollToTop && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.productoService.obtenerPorId(id).subscribe({
      next: (product) => {
        if (!product.activo) {
          this.product.set(null);
          this.relatedProducts.set([]);
          this.loading.set(false);
          return;
        }

        this.product.set(product);
        this.loading.set(false);
        this.loadRelatedProducts(product);
      },
      error: () => {
        this.product.set(null);
        this.loading.set(false);
      },
    });
  }

  loadRelatedProducts(product: ProductoDetalle): void {
    // Traemos productos de la misma categoria. Maximo 6 para filtrar el actual y quedarnos con 5
    this.productoService.listar({ categoria: product.categoriaId, size: 6 }).subscribe({
      next: (page) => {
        // Filtrar el producto actual y tomar maximo 5
        const related = page.content.filter(p => p.id !== product.id).slice(0, 5);
        this.relatedProducts.set(related);
      }
    });
  }

  addToCart(prod?: Producto): void {
    const productToAdd = prod || this.product();

    if (productToAdd) {
      this.cart.add(productToAdd);
      toast.success('Producto agregado', {
        description: `${productToAdd.nombre} está en el carrito.`,
      });
    }
  }
}
