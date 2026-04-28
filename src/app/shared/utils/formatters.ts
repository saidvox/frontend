import { EstadoPedido } from '../../core/models/pedido.model';

export function estadoPedidoLabel(estado: EstadoPedido): string {
  const labels: Record<EstadoPedido, string> = {
    PENDIENTE: 'Pendiente',
    EN_PREPARACION: 'En preparacion',
    ENTREGADO: 'Entregado',
  };

  return labels[estado];
}
