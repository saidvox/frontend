export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO';

export interface PedidoItemRequest {
  productoId: number;
  cantidad: number;
}

export interface PedidoRequest {
  clienteNombre: string;
  celular: string;
  direccion: string;
  items: PedidoItemRequest[];
}

export interface DetallePedido {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteNombre: string;
  celular: string;
  direccion: string;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  detalles: DetallePedido[];
}
