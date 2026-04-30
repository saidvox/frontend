export interface RealtimeMessage {
  type: 'connected' | 'catalog-changed' | 'orders-changed';
  pedidoId?: number | null;
  productoIds?: number[];
  occurredAt?: string;
}
