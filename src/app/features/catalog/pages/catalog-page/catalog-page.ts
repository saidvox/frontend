import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { Categoria } from '../../../../core/models/categoria.model';
import { Producto } from '../../../../core/models/producto.model';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { CartStore } from '../../../cart/cart.store';
import { ProductCarousel } from '../../components/product-carousel/product-carousel';

@Component({
  selector: 'app-catalog-page',
  imports: [LoadingState, ProductCarousel, ...HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero-panel">
      <div>
        <p class="eyebrow">Cafe de Barrio</p>
        <h1>Mostrador digital para cafe, kits y accesorios</h1>
        <p>
          Encuentra tus productos favoritos agrupados por categoria.
        </p>
      </div>
    </section>

    @if (loadingCategories()) {
      <app-loading-state message="Cargando catalogo..." />
    } @else {
      @for (category of topCategories(); track category.id) {
        <div class="mb-12">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold tracking-tight text-foreground">{{ category.nombre }}</h2>
            <button hlmBtn variant="ghost" (click)="viewAll(category.id)">
              Ver mas
            </button>
          </div>
          
          @if (productsByCategory()[category.id]) {
            <app-product-carousel [products]="productsByCategory()[category.id]" (add)="addToCart($event)" />
          } @else {
             <app-loading-state message="Cargando productos..." />
          }
        </div>
      }
    }
  `,
})
export class CatalogPage implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly cart = inject(CartStore);

  readonly topCategories = signal<Categoria[]>([]);
  readonly productsByCategory = signal<Record<number, Producto[]>>({});
  readonly loadingCategories = signal(true);

  ngOnInit(): void {
    this.loadTopCategories();
    this.productoService.productChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadVisibleProducts());
  }

  viewAll(categoryId: number): void {
    this.router.navigate(['/buscar'], { queryParams: { categoria: categoryId } });
  }

  addToCart(product: Producto): void {
    this.cart.add(product);
    toast.success('Producto agregado', {
      description: `${product.nombre} esta en el carrito.`,
    });
  }

  private loadTopCategories(): void {
    this.loadingCategories.set(true);
    this.categoriaService.listar().subscribe({
      next: (categories) => {
        const top = categories.slice(0, 3); // Maximo 3 categorias
        this.topCategories.set(top);
        this.loadingCategories.set(false);
        
        top.forEach(category => this.loadProductsForCategory(category.id));
      },
      error: () => {
        this.loadingCategories.set(false);
        toast.error('No se pudo cargar las categorias');
      },
    });
  }

  private loadProductsForCategory(categoryId: number): void {
    this.productoService
      .listar({
        categoria: categoryId,
        activos: true,
        disponible: true,
        page: 0,
        size: 10 // Maximo 10 productos por categoria
      })
      .subscribe({
        next: (page) => {
          this.productsByCategory.update(prev => ({ ...prev, [categoryId]: page.content }));
        },
        error: () => {
          this.productsByCategory.update(prev => ({ ...prev, [categoryId]: [] }));
        },
      });
  }

  private reloadVisibleProducts(): void {
    const categories = this.topCategories();
    if (categories.length === 0) {
      this.loadTopCategories();
      return;
    }

    this.productsByCategory.set({});
    categories.forEach((category) => this.loadProductsForCategory(category.id));
  }
}
