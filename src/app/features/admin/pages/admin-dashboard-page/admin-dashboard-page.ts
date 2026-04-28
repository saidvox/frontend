import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { Pedido } from '../../../../core/models/pedido.model';
import { Producto } from '../../../../core/models/producto.model';
import { PedidoService } from '../../../../core/services/pedido.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { AdminNav } from '../../components/admin-nav/admin-nav';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [AdminNav, ...HlmCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-admin-nav />
    <section class="section-heading">
      <p class="eyebrow">Panel administrativo</p>
      <h1>Resumen operativo</h1>
    </section>

    <section class="metric-grid">
      <article hlmCard>
        <span>Productos activos</span>
        <strong>{{ activeProducts() }}</strong>
      </article>
      <article hlmCard>
        <span>Stock bajo</span>
        <strong>{{ lowStock() }}</strong>
      </article>
      <article hlmCard>
        <span>Pedidos pendientes</span>
        <strong>{{ pendingOrders() }}</strong>
      </article>
    </section>
  `,
})
export class AdminDashboardPage implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly pedidoService = inject(PedidoService);

  readonly products = signal<Producto[]>([]);
  readonly orders = signal<Pedido[]>([]);
  readonly activeProducts = () => this.products().filter((product) => product.activo).length;
  readonly lowStock = () => this.products().filter((product) => product.stock <= 5).length;
  readonly pendingOrders = () =>
    this.orders().filter((order) => order.estado === 'PENDIENTE').length;

  ngOnInit(): void {
    this.productoService.listar({ activos: false }).subscribe({
      next: (page) => this.products.set(page.content),
      error: () => this.products.set([]),
    });
    this.pedidoService.listar().subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => this.orders.set([]),
    });
  }
}
