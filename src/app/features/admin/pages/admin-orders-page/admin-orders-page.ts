import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';

import { EstadoPedido, Pedido } from '../../../../core/models/pedido.model';
import { PedidoService } from '../../../../core/services/pedido.service';
import { AdminNav } from '../../components/admin-nav/admin-nav';
import { OrdersTable } from '../../components/orders-table/orders-table';

@Component({
  selector: 'app-admin-orders-page',
  imports: [AdminNav, OrdersTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-admin-nav />
    <section class="section-heading">
      <p class="eyebrow">Pedidos</p>
      <h1>Preparacion y entrega</h1>
    </section>

    <app-orders-table [pedidos]="orders()" (estadoChange)="updateStatus($event.id, $event.estado)" />
  `,
})
export class AdminOrdersPage implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  readonly orders = signal<Pedido[]>([]);

  ngOnInit(): void {
    this.load();
  }

  updateStatus(id: number, estado: EstadoPedido): void {
    this.pedidoService.actualizarEstado(id, estado).subscribe(() => {
      toast.success('Estado actualizado', {
        description: `Pedido #${id} ahora esta ${estado.toLowerCase().replace('_', ' ')}.`,
      });
      this.load();
    });
  }

  private load(): void {
    this.pedidoService.listar().subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => this.orders.set([]),
    });
  }
}
