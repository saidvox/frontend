import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { Producto } from '../../../../core/models/producto.model';
import { ProductoService } from '../../../../core/services/producto.service';
import { AdminNav } from '../../components/admin-nav/admin-nav';

@Component({
  selector: 'app-admin-products-page',
  imports: [AdminNav, CurrencyPipe, ...HlmBadgeImports, ...HlmButtonImports, ...HlmTableImports, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-admin-nav />
    <section class="section-heading row">
      <div>
        <p class="eyebrow">Catalogo</p>
        <h1>Mantenimiento de productos</h1>
      </div>
      <a hlmBtn size="lg" routerLink="/admin/productos/nuevo">Nuevo producto</a>
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
          @for (product of products(); track product.id) {
            <tr hlmTr>
              <td hlmTd>{{ product.nombre }}</td>
              <td hlmTd>{{ product.categoriaNombre }}</td>
              <td hlmTd>{{ product.precio | currency: 'PEN' : 'symbol' : '1.2-2' }}</td>
              <td hlmTd>
                <span [class.stock-low]="product.stock <= 5">{{ product.stock }}</span>
              </td>
              <td hlmTd>
                <span hlmBadge [variant]="product.activo ? 'secondary' : 'outline'">
                  {{ product.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td hlmTd class="table-actions">
                <a hlmBtn variant="outline" [routerLink]="['/admin/productos', product.id, 'editar']">
                  Editar
                </a>
                @if (product.activo) {
                  <button hlmBtn variant="destructive" type="button" (click)="deactivate(product.id)">
                    Desactivar
                  </button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminProductsPage implements OnInit {
  private readonly productoService = inject(ProductoService);
  readonly products = signal<Producto[]>([]);

  ngOnInit(): void {
    this.load();
  }

  deactivate(id: number): void {
    this.productoService.desactivar(id).subscribe(() => {
      toast.success('Producto desactivado');
      this.load();
    });
  }

  private load(): void {
    this.productoService.listar({ activos: false }).subscribe({
      next: (page) => this.products.set(page.content),
      error: () => this.products.set([]),
    });
  }
}
