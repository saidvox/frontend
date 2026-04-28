import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideFilter, lucideRefreshCw, lucideSearch, lucideX } from '@ng-icons/lucide';

import { Categoria } from '../../../../core/models/categoria.model';
import { Page, Producto, ProductoRequest } from '../../../../core/models/producto.model';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { ProductForm } from '../../components/product-form/product-form';

type ProductStatusFilter = 'all' | 'active' | 'available';

@Component({
  selector: 'app-admin-products-page',
  imports: [...HlmBadgeImports, ...HlmButtonImports, ...HlmTableImports, ...BrnSheetImports, ...HlmSheetImports, HlmIconImports, ProductForm],
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight, lucideFilter, lucideRefreshCw, lucideSearch, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section-heading row">
      <div>
        <p class="eyebrow">Catalogo</p>
        <h1>Mantenimiento de productos</h1>
      </div>
      <button hlmBtn size="lg" type="button" (click)="openCreateDialog()">Nuevo producto</button>
    </section>

    <section class="admin-filter-bar" aria-label="Filtros de productos">
      <div class="admin-filter-title">
        <ng-icon hlm name="lucideFilter" size="sm" />
        <div>
          <strong>Filtros</strong>
          <span>{{ selectedCategoryLabel() }} - {{ totalElements() }} producto(s)</span>
        </div>
      </div>

      <label class="admin-filter-field search">
        Buscar producto
        <span class="admin-search-input">
          <ng-icon hlm name="lucideSearch" size="sm" />
          <input
            type="search"
            [value]="searchTerm()"
            (input)="onSearchChange($event)"
            placeholder="Nombre del producto..."
            autocomplete="off"
          />
        </span>
      </label>

      <label class="admin-filter-field">
        Categoria
        <select [value]="selectedCategoryId() ?? ''" (change)="onCategoryChange($event)">
          <option value="">Todas las categorias</option>
          @for (category of categories(); track category.id) {
            <option [value]="category.id">{{ category.nombre }}</option>
          }
        </select>
      </label>

      <label class="admin-filter-field">
        Estado
        <select [value]="statusFilter()" (change)="onStatusChange($event)">
          <option value="all">Todos</option>
          <option value="active">Solo activos</option>
          <option value="available">Activos con stock</option>
        </select>
      </label>

      <label class="admin-filter-field compact">
        Por pagina
        <select [value]="pageSize()" (change)="onPageSizeChange($event)">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </label>

      <button hlmBtn variant="outline" type="button" (click)="resetFilters()" [disabled]="loading()">
        <ng-icon hlm name="lucideRefreshCw" size="sm" />
        Limpiar
      </button>
    </section>

    <div hlmTableContainer class="table-wrap">
      <table hlmTable>
        <thead hlmTHead>
          <tr hlmTr>
            <th hlmTh>Producto</th>
            <th hlmTh>Categoria</th>
            <th hlmTh>Precio</th>
            <th hlmTh>Stock</th>
            <th hlmTh>Estado</th>
            <th hlmTh>Acciones</th>
          </tr>
        </thead>
        <tbody hlmTBody>
          @if (loading()) {
            <tr hlmTr>
              <td hlmTd colspan="6" class="table-empty">Cargando productos...</td>
            </tr>
          } @else {
            @for (product of products(); track product.id) {
              <tr hlmTr>
                <td hlmTd>{{ product.nombre }}</td>
                <td hlmTd>{{ product.categoriaNombre }}</td>
                <td hlmTd>
                  <span class="price-text text-sm">
                    <span class="currency">S/</span>{{ product.precio.toFixed(2) }}
                  </span>
                </td>
                <td hlmTd>
                  <span [class.stock-low]="product.stock <= 5">{{ product.stock }}</span>
                </td>
                <td hlmTd>
                  <span hlmBadge [variant]="product.activo ? 'secondary' : 'outline'">
                    {{ product.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td hlmTd class="table-actions">
                  <button hlmBtn size="sm" variant="outline" type="button" (click)="openEditDialog(product)">
                    Editar
                  </button>
                  @if (product.activo) {
                    <button hlmBtn size="sm" variant="destructive" type="button" (click)="deactivate(product.id)">
                      Desactivar
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              <tr hlmTr>
                <td hlmTd colspan="6" class="table-empty">
                  No hay productos para los filtros seleccionados.
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    @if (productPage()) {
      <nav class="admin-pagination" aria-label="Paginacion de productos">
        <span>Mostrando {{ pageStart() }} a {{ pageEnd() }} de {{ totalElements() }}</span>

        <div class="admin-pagination-actions">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            type="button"
            [disabled]="loading() || currentPage() === 0"
            (click)="changePage(currentPage() - 1)"
            aria-label="Pagina anterior"
          >
            <ng-icon hlm name="lucideChevronLeft" size="sm" />
            Anterior
          </button>

          <strong>Pagina {{ currentPage() + 1 }} de {{ totalPages() }}</strong>

          <button
            hlmBtn
            variant="outline"
            size="sm"
            type="button"
            [disabled]="loading() || currentPage() >= totalPages() - 1"
            (click)="changePage(currentPage() + 1)"
            aria-label="Pagina siguiente"
          >
            Siguiente
            <ng-icon hlm name="lucideChevronRight" size="sm" />
          </button>
        </div>
      </nav>
    }

    <hlm-sheet side="right" [state]="sheetState()" (stateChanged)="onSheetStateChange($event)">
      <hlm-sheet-content *brnSheetContent="let ctx" class="w-full sm:w-[500px] border-l shadow-2xl p-0 flex flex-col h-full bg-background">
        <hlm-sheet-header class="px-6 py-5 border-b flex flex-row items-center justify-between">
          <div class="flex flex-col gap-1">
            <p hlmSheetDescription class="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              {{ editingProductId() ? 'Edicion' : 'Creacion' }}
            </p>
            <h3 hlmSheetTitle class="text-xl font-bold text-foreground">
              {{ editingProductId() ? 'Editar producto' : 'Nuevo producto' }}
            </h3>
          </div>
          <button hlmBtn variant="ghost" size="icon" (click)="closeDialog()" aria-label="Cerrar">
            <ng-icon hlm name="lucideX" size="sm" />
          </button>
        </hlm-sheet-header>

        <div class="flex-1 overflow-y-auto p-6 bg-secondary/5">
          <app-product-form
            [form]="form"
            [categories]="categories()"
            [submitLabel]="editingProductId() ? 'Guardar cambios' : 'Crear producto'"
            [submitting]="saving()"
            (submitted)="save()"
            (cancelled)="closeDialog()"
          />
        </div>
      </hlm-sheet-content>
    </hlm-sheet>
  `,
})
export class AdminProductsPage implements OnInit, OnDestroy {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);

  readonly products = signal<Producto[]>([]);
  readonly productPage = signal<Page<Producto> | null>(null);
  readonly categories = signal<Categoria[]>([]);
  readonly sheetState = signal<'closed' | 'open'>('closed');
  readonly editingProductId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<ProductStatusFilter>('all');
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  readonly totalElements = computed(() => this.productPage()?.totalElements ?? 0);
  readonly totalPages = computed(() => Math.max(this.productPage()?.totalPages ?? 1, 1));
  readonly pageStart = computed(() => {
    const page = this.productPage();
    if (!page || page.totalElements === 0) {
      return 0;
    }

    return page.number * page.size + 1;
  });
  readonly pageEnd = computed(() => {
    const page = this.productPage();
    if (!page) {
      return 0;
    }

    return Math.min((page.number * page.size) + page.numberOfElements, page.totalElements);
  });
  readonly selectedCategoryLabel = computed(() => {
    const categoryId = this.selectedCategoryId();
    if (!categoryId) {
      return 'Todas las categorias';
    }

    return this.categories().find((category) => category.id === categoryId)?.nombre ?? 'Categoria seleccionada';
  });

  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    precio: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    stock: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    imagenUrl: new FormControl<string | null>(null),
    activo: new FormControl(true, { nonNullable: true }),
    categoriaId: new FormControl(1, { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.load();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategoryId.set(value ? Number(value) : null);
    this.currentPage.set(0);
    this.load();
  }

  onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(0);

    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }

    this.searchDebounce = setTimeout(() => {
      this.searchDebounce = null;
      this.load();
    }, 250);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ProductStatusFilter;
    this.statusFilter.set(value);
    this.currentPage.set(0);
    this.load();
  }

  onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(value);
    this.currentPage.set(0);
    this.load();
  }

  resetFilters(): void {
    this.selectedCategoryId.set(null);
    this.searchTerm.set('');
    this.statusFilter.set('all');
    this.currentPage.set(0);
    this.load();
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.load();
  }

  openCreateDialog(): void {
    this.editingProductId.set(null);
    this.form.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagenUrl: null,
      activo: true,
      categoriaId: this.categories()[0]?.id ?? 1,
    });
    this.sheetState.set('open');
  }

  openEditDialog(product: Producto): void {
    this.editingProductId.set(product.id);
    this.form.reset({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      imagenUrl: product.imagenUrl,
      activo: product.activo,
      categoriaId: product.categoriaId,
    });
    this.sheetState.set('open');
  }

  closeDialog(): void {
    if (this.saving()) {
      return;
    }

    this.sheetState.set('closed');
  }

  onSheetStateChange(state: 'closed' | 'open') {
    this.sheetState.set(state);
    if (state === 'closed') {
      this.editingProductId.set(null);
    }
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    const request: ProductoRequest = this.form.getRawValue();
    const productId = this.editingProductId();
    const action = productId
      ? this.productoService.actualizar(productId, request)
      : this.productoService.crear(request);

    action.subscribe({
      next: () => {
        toast.success(productId ? 'Producto actualizado' : 'Producto creado');
        this.saving.set(false);
        this.closeDialog();
        if (!productId) {
          this.currentPage.set(0);
        }
        this.load();
      },
      error: () => {
        toast.error('No se pudo guardar el producto');
        this.saving.set(false);
      },
    });
  }

  deactivate(id: number): void {
    this.productoService.desactivar(id).subscribe(() => {
      toast.success('Producto desactivado');
      this.load();
    });
  }

  private load(): void {
    const status = this.statusFilter();

    this.loading.set(true);
    this.productoService.listar({
      categoria: this.selectedCategoryId(),
      nombre: this.searchTerm(),
      activos: status === 'all' ? false : true,
      disponible: status === 'available' ? true : null,
      page: this.currentPage(),
      size: this.pageSize(),
    }).subscribe({
      next: (page) => {
        if (page.empty && this.currentPage() > 0) {
          this.currentPage.update((currentPage) => currentPage - 1);
          this.load();
          return;
        }

        this.currentPage.set(page.number);
        this.productPage.set(page);
        this.products.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.productPage.set(null);
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.categoriaService.listar().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
  }
}
