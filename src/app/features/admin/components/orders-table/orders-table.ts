import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { EstadoPedido, Pedido } from '../../../../core/models/pedido.model';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { estadoPedidoLabel } from '../../../../shared/utils/formatters';

@Component({
  selector: 'app-orders-table',
  imports: [DatePipe, ...HlmButtonImports, ...HlmTableImports, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pedidos().length === 0) {
      <section class="admin-empty-panel">
        <strong>No hay pedidos en esta vista</strong>
        <span>Cuando entren pedidos nuevos apareceran aqui para su preparacion.</span>
      </section>
    } @else {
      <div hlmTableContainer class="table-wrap orders-table-wrap">
        <table hlmTable class="orders-table">
          <thead hlmTHead>
            <tr hlmTr>
              <th hlmTh>Pedido</th>
              <th hlmTh>Cliente</th>
              <th hlmTh>Productos</th>
              <th hlmTh>Fecha</th>
              <th hlmTh>Total</th>
              <th hlmTh>Estado</th>
              <th hlmTh>Actualizar</th>
            </tr>
          </thead>
          <tbody hlmTBody>
            @for (pedido of pedidos(); track pedido.id) {
              <tr hlmTr>
                <td hlmTd>
                  <div class="order-id">
                    <strong>#{{ pedido.id }}</strong>
                    <span>{{ pedido.detalles.length }} item(s)</span>
                  </div>
                </td>
                <td hlmTd>
                  <div class="order-client">
                    <strong>{{ pedido.clienteNombre }}</strong>
                    <span>{{ pedido.celular }}</span>
                    <small>{{ pedido.direccion }}</small>
                  </div>
                </td>
                <td hlmTd>
                  <div class="order-items-mini">
                    @for (detalle of pedido.detalles.slice(0, 2); track detalle.id) {
                      <span>{{ detalle.cantidad }}x {{ detalle.productoNombre }}</span>
                    }
                    @if (pedido.detalles.length > 2) {
                      <small>+{{ pedido.detalles.length - 2 }} mas</small>
                    }
                  </div>
                </td>
                <td hlmTd>
                  <span class="order-muted">{{ pedido.fecha | date: 'short' }}</span>
                </td>
                <td hlmTd>
                  <strong class="price-text">
                    <span class="currency">S/</span>{{ pedido.total.toFixed(2) }}
                  </strong>
                </td>
                <td hlmTd><app-status-badge [estado]="pedido.estado" /></td>
                <td hlmTd>
                  <div class="order-status-actions" role="group" aria-label="Actualizar estado">
                    @for (estado of estados; track estado) {
                      <button
                        hlmBtn
                        size="sm"
                        type="button"
                        [variant]="pedido.estado === estado ? 'default' : 'outline'"
                        [disabled]="pedido.estado === estado"
                        (click)="estadoChange.emit({ id: pedido.id, estado })"
                      >
                        {{ shortLabel(estado) }}
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class OrdersTable {
  pedidos = input.required<Pedido[]>();
  estadoChange = output<{ id: number; estado: EstadoPedido }>();

  readonly estados: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO'];

  shortLabel(estado: EstadoPedido): string {
    if (estado === 'EN_PREPARACION') {
      return 'Preparacion';
    }

    return estadoPedidoLabel(estado);
  }
}
