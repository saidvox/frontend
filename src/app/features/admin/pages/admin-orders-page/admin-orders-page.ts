import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { EstadoPedido, Pedido } from '../../../../core/models/pedido.model';
import { PedidoService } from '../../../../core/services/pedido.service';
import { estadoPedidoLabel } from '../../../../shared/utils/formatters';
import { OrdersTable } from '../../components/orders-table/orders-table';

type OrderFilter = 'TODOS' | EstadoPedido;

@Component({
  selector: 'app-admin-orders-page',
  imports: [OrdersTable, ...HlmButtonImports, ...HlmCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section-heading row">
      <div>
        <p class="eyebrow">Pedidos</p>
        <h1>Preparacion y entrega</h1>
      </div>
      <button hlmBtn variant="outline" type="button" (click)="load()" [disabled]="loading()">
        Actualizar
      </button>
    </section>

    <section class="orders-metric-grid" aria-label="Resumen de pedidos">
      <article hlmCard>
        <span>Total</span>
        <strong>{{ orders().length }}</strong>
      </article>
      <article hlmCard>
        <span>Pendientes</span>
        <strong>{{ countByStatus('PENDIENTE') }}</strong>
      </article>
      <article hlmCard>
        <span>En preparacion</span>
        <strong>{{ countByStatus('EN_PREPARACION') }}</strong>
      </article>
      <article hlmCard>
        <span>Entregados</span>
        <strong>{{ countByStatus('ENTREGADO') }}</strong>
      </article>
    </section>

    <section class="orders-filter-bar" aria-label="Filtros de pedidos">
      @for (filter of filters; track filter) {
        <button
          hlmBtn
          size="sm"
          type="button"
          [variant]="activeFilter() === filter ? 'default' : 'outline'"
          (click)="activeFilter.set(filter)"
        >
          {{ filterLabel(filter) }}
        </button>
      }
    </section>

    <app-orders-table [pedidos]="filteredOrders()" (estadoChange)="updateStatus($event.id, $event.estado)" />
  `,
})
export class AdminOrdersPage implements OnInit {
  private readonly pedidoService = inject(PedidoService);

  readonly orders = signal<Pedido[]>([]);
  readonly loading = signal(false);
  readonly activeFilter = signal<OrderFilter>('TODOS');
  readonly filters: OrderFilter[] = ['TODOS', 'PENDIENTE', 'EN_PREPARACION', 'ENTREGADO'];
  readonly filteredOrders = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'TODOS') {
      return this.orders();
    }

    return this.orders().filter((order) => order.estado === filter);
  });

  ngOnInit(): void {
    this.load();
  }

  updateStatus(id: number, estado: EstadoPedido): void {
    this.pedidoService.actualizarEstado(id, estado).subscribe({
      next: (updatedOrder) => {
        this.orders.update((orders) =>
          orders.map((order) => order.id === id ? updatedOrder : order),
        );
        toast.success('Estado actualizado', {
          description: `Pedido #${id} ahora esta ${estado.toLowerCase().replace('_', ' ')}.`,
        });
      },
      error: () => toast.error('No se pudo actualizar el pedido'),
    });
  }

  load(): void {
    this.loading.set(true);
    this.pedidoService.listar().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.loading.set(false);
      },
    });
  }

  countByStatus(estado: EstadoPedido): number {
    return this.orders().filter((order) => order.estado === estado).length;
  }

  filterLabel(filter: OrderFilter): string {
    return filter === 'TODOS' ? 'Todos' : estadoPedidoLabel(filter);
  }
}
