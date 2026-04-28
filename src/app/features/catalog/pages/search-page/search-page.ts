import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

import { Categoria } from '../../../../core/models/categoria.model';
import { Producto, Page } from '../../../../core/models/producto.model';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { SearchService } from '../../../../core/services/search.service';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { CartStore } from '../../../cart/cart.store';
import { CategoryFilter } from '../../components/category-filter/category-filter';
import { ProductGrid } from '../../components/product-grid/product-grid';

@Component({
  selector: 'app-search-page',
  imports: [CategoryFilter, LoadingState, ProductGrid, ...HlmButtonImports, ...HlmIconImports],
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-8 max-w-7xl mx-auto px-4 md:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Catalogo Completo</h1>
        <p class="text-muted-foreground mt-2">Explora todos nuestros productos y filtra por categoria.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 items-start">
        <!-- Sidebar Categorias -->
        <aside class="sticky top-20 hidden md:block border-r pr-6 border-border/50">
          <app-category-filter
            [categories]="categories()"
            [selectedId]="selectedCategory()"
            (selected)="selectCategory($event)"
          />
        </aside>

        <!-- Main Content -->
        <main>
          <!-- Filtros moviles (si quisieramos agregarlos en el futuro) -->
          <div class="md:hidden mb-6">
             <app-category-filter
              [categories]="categories()"
              [selectedId]="selectedCategory()"
              (selected)="selectCategory($event)"
            />
          </div>

          @if (loading()) {
            <app-loading-state message="Cargando productos..." />
          } @else {
            <app-product-grid [products]="filteredProducts()" (add)="addToCart($event)" />

            @if (productPage()?.totalElements === 0) {
              <div class="text-center py-12 text-muted-foreground">
                No se encontraron productos en esta categoria.
              </div>
            }

            <!-- Paginacion -->
            @if (productPage() && productPage()!.totalPages > 1) {
              <div class="flex items-center justify-center gap-4 mt-12">
                <button 
                  hlmBtn 
                  variant="outline" 
                  size="icon" 
                  [disabled]="currentPage() === 0"
                  (click)="changePage(currentPage() - 1)">
                  <ng-icon hlm name="lucideChevronLeft" size="sm" />
                </button>
                
                <span class="text-sm font-medium">
                  Pagina {{ currentPage() + 1 }} de {{ productPage()?.totalPages }}
                </span>

                <button 
                  hlmBtn 
                  variant="outline" 
                  size="icon" 
                  [disabled]="currentPage() >= productPage()!.totalPages - 1"
                  (click)="changePage(currentPage() + 1)">
                  <ng-icon hlm name="lucideChevronRight" size="sm" />
                </button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
})
export class SearchPage implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly searchService = inject(SearchService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly cart = inject(CartStore);

  readonly productPage = signal<Page<Producto> | null>(null);
  
  // Computed para filtrar localmente por el termino de busqueda (header search bar)
  readonly filteredProducts = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    const page = this.productPage();
    if (!page) return [];
    if (!term) return page.content;
    return page.content.filter(p => 
      p.nombre.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term)
    );
  });

  readonly categories = signal<Categoria[]>([]);
  readonly selectedCategory = signal<number | null>(null);
  readonly loading = signal(true);
  readonly currentPage = signal(0);
  readonly pageSize = 12; // Productos por pagina en busqueda

  ngOnInit(): void {
    this.loadCategories();
    
    // Leer parametro de la URL si se viene desde "Ver mas" de la Landing
    this.route.queryParams.subscribe(params => {
      const catId = params['categoria'] ? Number(params['categoria']) : null;
      if (catId !== this.selectedCategory()) {
        this.selectedCategory.set(catId);
        this.currentPage.set(0); // Reiniciar pagina al cambiar categoria
      }
      this.loadProducts();
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(0);
    // Actualizar URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoryId || null },
      queryParamsHandling: 'merge'
    });
    this.loadProducts();
  }

  changePage(newPage: number): void {
    this.currentPage.set(newPage);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(product: Producto): void {
    this.cart.add(product);
    toast.success('Producto agregado', {
      description: `${product.nombre} esta en el carrito.`,
    });
  }

  private loadCategories(): void {
    this.categoriaService.listar().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productoService
      .listar({
        categoria: this.selectedCategory(),
        activos: true,
        disponible: true,
        page: this.currentPage(),
        size: this.pageSize
      })
      .subscribe({
        next: (page) => {
          this.productPage.set(page);
          this.loading.set(false);
        },
        error: () => {
          this.productPage.set(null);
          this.loading.set(false);
          toast.error('No se pudo cargar el catalogo de busqueda');
        },
      });
  }
}
