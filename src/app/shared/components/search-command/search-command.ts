import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucidePackage, lucideSearch } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { HlmIconImports } from '@spartan-ng/helm/icon';

import { Producto } from '../../../core/models/producto.model';
import { ProductoService } from '../../../core/services/producto.service';

@Component({
  selector: 'app-search-command',
  imports: [...HlmCommandImports, ...HlmButtonImports, ...HlmIconImports],
  providers: [provideIcons({ lucideSearch, lucideArrowRight, lucidePackage })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    app-search-command {
      display: flex;
      flex: 1 1 auto;
      min-width: 0;
    }

    .search-command-trigger {
      min-width: 0;
    }

    .search-command-backdrop {
      background:
        radial-gradient(circle at top, rgb(220 179 138 / 0.16), transparent 42%),
        rgb(17 9 7 / 0.72);
      backdrop-filter: blur(10px);
    }

    .search-command-panel-host {
      width: min(92vw, 640px);
      max-width: 640px;
    }

    .search-command-panel {
      background: var(--popover);
      border: 1px solid color-mix(in srgb, var(--border), transparent 8%);
      border-radius: 18px;
      box-shadow:
        0 28px 90px rgb(0 0 0 / 0.45),
        inset 0 1px 0 rgb(255 255 255 / 0.08);
      color: var(--popover-foreground);
      overflow: hidden;
      width: 100%;
      animation: searchCommandPanelIn 150ms ease-out;
    }

    .search-command-surface {
      background: transparent;
      border: 0;
      box-shadow: none;
    }

    .search-command-list {
      max-height: min(58dvh, 430px);
      overflow-y: auto;
      padding: 6px;
      scrollbar-width: thin;
    }

    .search-command-item {
      border-radius: 12px;
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr) auto 20px;
      gap: 12px;
      min-height: 64px;
      padding: 10px 12px;
    }

    .search-command-thumb {
      align-items: center;
      background: var(--secondary);
      border-radius: 10px;
      display: flex;
      height: 44px;
      justify-content: center;
      overflow: hidden;
      width: 44px;
    }

    .search-command-thumb img {
      height: 100%;
      object-fit: cover;
      width: 100%;
    }

    .search-command-footer {
      border-top: 1px solid color-mix(in srgb, var(--border), transparent 42%);
      display: flex;
      gap: 14px;
      padding: 10px 14px;
    }

    @keyframes searchCommandPanelIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 640px) {
      .search-command-panel-host {
        width: calc(100vw - 24px);
      }

      .search-command-item {
        grid-template-columns: 40px minmax(0, 1fr) 18px;
        gap: 10px;
        min-height: 58px;
      }

      .search-command-price {
        display: none;
      }
    }
  `],
  template: `
    <button
      class="search-command-trigger hidden h-9 w-full flex-1 items-center gap-2 rounded-full border border-input bg-secondary/50 px-4 text-sm text-muted-foreground transition-all hover:border-ring hover:bg-secondary md:flex"
      type="button"
      (click)="open()"
      aria-label="Abrir busqueda"
    >
      <ng-icon hlm name="lucideSearch" size="sm" class="shrink-0 text-muted-foreground" />
      <span class="min-w-0 flex-1 truncate text-left">Busca tus productos...</span>
      <kbd class="hidden h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground lg:inline-flex">
        Ctrl K
      </kbd>
    </button>

    <button
      hlmBtn
      variant="ghost"
      size="icon"
      type="button"
      class="md:hidden"
      (click)="open()"
      aria-label="Buscar"
    >
      <ng-icon hlm name="lucideSearch" size="sm" />
    </button>

    <ng-template #commandPanel>
      <section class="search-command-panel" role="dialog" aria-modal="true" aria-label="Buscador de productos">
        <hlm-command
          [filter]="customFilter"
          (searchChange)="onSearch($event)"
          class="search-command-surface"
        >
          <hlm-command-input placeholder="Buscar productos por nombre..." />

          <hlm-command-list class="search-command-list">
            @if (loading()) {
              <div hlmCommandEmpty class="py-8 text-center text-sm text-muted-foreground">
                Buscando productos...
              </div>
            }

            @if (!loading() && results().length === 0 && searchTerm().length > 0) {
              <div hlmCommandEmpty class="flex flex-col items-center gap-2 py-10 text-center text-sm">
                <ng-icon hlm name="lucidePackage" class="text-muted-foreground" />
                <p>No encontramos "<strong>{{ searchTerm() }}</strong>"</p>
                <p class="text-xs text-muted-foreground">Prueba con otro nombre de producto.</p>
              </div>
            }

            @if (results().length > 0) {
              <hlm-command-group>
                <hlm-command-group-label>Productos</hlm-command-group-label>

                @for (product of results(); track product.id) {
                  <button
                    hlmCommandItem
                    [value]="product.nombre"
                    (selected)="goToProduct(product)"
                    class="search-command-item cursor-pointer"
                  >
                    <div class="search-command-thumb">
                      @if (product.imagenUrl) {
                        <img [src]="product.imagenUrl" [alt]="product.nombre" />
                      } @else {
                        <span class="text-xs font-black text-muted-foreground">CAFE</span>
                      }
                    </div>

                    <div class="min-w-0">
                      <span class="block truncate text-sm font-semibold">{{ product.nombre }}</span>
                      <span class="block truncate text-xs text-muted-foreground">{{ product.categoriaNombre }}</span>
                    </div>

                    <span class="search-command-price whitespace-nowrap text-sm font-bold text-primary">
                      PEN {{ product.precio.toFixed(2) }}
                    </span>

                    <ng-icon hlm name="lucideArrowRight" size="sm" class="text-muted-foreground" />
                  </button>
                }
              </hlm-command-group>

              <hlm-command-separator />
            }

            <hlm-command-group>
              <hlm-command-group-label>Accesos rapidos</hlm-command-group-label>
              <button
                hlmCommandItem
                value="catalogo"
                (selected)="navigate('/buscar')"
                class="cursor-pointer rounded-xl px-3 py-2.5"
              >
                <ng-icon hlm name="lucideSearch" size="sm" class="text-muted-foreground" />
                <span class="text-sm">Ver catalogo completo</span>
                <ng-icon hlm name="lucideArrowRight" size="sm" class="ml-auto text-muted-foreground" />
              </button>
            </hlm-command-group>
          </hlm-command-list>

          <div class="search-command-footer hidden text-xs text-muted-foreground sm:flex">
            <span><kbd class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Flechas</kbd> navegar</span>
            <span><kbd class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> seleccionar</span>
            <span><kbd class="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> cerrar</span>
          </div>
        </hlm-command>
      </section>
    </ng-template>
  `,
  host: {
    '(document:keydown)': 'handleDocumentKeydown($event)',
  },
})
export class SearchCommandComponent implements OnDestroy {
  @ViewChild('commandPanel') private readonly commandPanel?: TemplateRef<unknown>;

  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = signal(false);
  readonly loading = signal(false);
  readonly results = signal<Producto[]>([]);
  readonly searchTerm = signal('');

  private overlayRef: OverlayRef | null = null;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.productoService.productChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isOpen()) {
          return;
        }

        const term = this.searchTerm();
        if (term) {
          this.searchProducts(term);
        } else {
          this.loadInitial();
        }
      });
  }

  open(): void {
    if (this.isOpen() || !this.commandPanel) {
      return;
    }

    this.isOpen.set(true);
    this.attachOverlay();
    this.loadInitial();
    this.focusInput();
  }

  close(): void {
    this.isOpen.set(false);
    this.results.set([]);
    this.searchTerm.set('');
    this.loading.set(false);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }

    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.close();
  }

  handleDocumentKeydown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && key === 'k') {
      event.preventDefault();
      this.open();
      return;
    }

    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    }
  }

  loadInitial(): void {
    this.loading.set(true);
    this.productoService.listar({ size: 8 }).subscribe({
      next: (page) => {
        this.results.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    const trimmedTerm = term.trim();
    this.searchTerm.set(trimmedTerm);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!trimmedTerm) {
      this.loadInitial();
      return;
    }

    this.loading.set(true);
    this.searchTimeout = setTimeout(() => {
      this.searchProducts(trimmedTerm);
    }, 220);
  }

  goToProduct(product: Producto): void {
    this.close();
    this.router.navigate(['/productos', product.id]);
  }

  navigate(path: string): void {
    this.close();
    this.router.navigateByUrl(path);
  }

  customFilter = (_value: string, _search: string): boolean => true;

  private attachOverlay(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'search-command-backdrop',
      panelClass: 'search-command-panel-host',
      positionStrategy: this.overlay.position().global().top('86px').centerHorizontally(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    });

    this.overlayRef.attach(new TemplatePortal(this.commandPanel!, this.viewContainerRef));
  }

  private focusInput(): void {
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.search-command-panel input')?.focus();
    }, 30);
  }

  private searchProducts(term: string): void {
    this.loading.set(true);
    this.productoService.listar({ nombre: term, size: 10 }).subscribe({
      next: (page) => {
        this.results.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.loading.set(false);
      },
    });
  }
}
