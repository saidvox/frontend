import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { EstadoPedido, Pedido } from '../../../../core/models/pedido.model';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-orders-table',
  imports: [CurrencyPipe, DatePipe, ...HlmTableImports, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div hlmTableContainer class="table-wrap">
      <table hlmTable>
        <thead hlmTHead>
          <tr hlmTr>
            <th hlmTh>Pedido</th>
            <th hlmTh>Cliente</th>
            <th hlmTh>Fecha</th>
            <th hlmTh>Total</th>
            <th hlmTh>Estado</th>
            <th hlmTh>Actualizar</th>
          </tr>
        </thead>
        <tbody hlmTBody>
          @for (pedido of pedidos(); track pedido.id) {
            <tr hlmTr>
              <td hlmTd>#{{ pedido.id }}</td>
              <td hlmTd>
                <strong>{{ pedido.clienteNombre }}</strong>
                <span>{{ pedido.celular }}</span>
              </td>
              <td hlmTd>{{ pedido.fecha | date: 'short' }}</td>
              <td hlmTd>{{ pedido.total | currency: 'PEN' : 'symbol' : '1.2-2' }}</td>
              <td hlmTd><app-status-badge [estado]="pedido.estado" /></td>
              <td hlmTd>
                <select
                  [value]="pedido.estado"
                  (change)="estadoChange.emit({ id: pedido.id, estado: $any($event.target).value })"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PREPARACION">En preparacion</option>
                  <option value="ENTREGADO">Entregado</option>
                </select>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class OrdersTable {
  pedidos = input.required<Pedido[]>();
  estadoChange = output<{ id: number; estado: EstadoPedido }>();
}
