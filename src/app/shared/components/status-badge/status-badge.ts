import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { EstadoPedido } from '../../../core/models/pedido.model';
import { estadoPedidoLabel } from '../../utils/formatters';

@Component({
  selector: 'app-status-badge',
  imports: [...HlmBadgeImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span hlmBadge variant="outline" [class]="badgeClass()">{{ label() }}</span>`,
})
export class StatusBadge {
  estado = input.required<EstadoPedido>();
  label = computed(() => estadoPedidoLabel(this.estado()));
  badgeClass = computed(() => `status-badge status-${this.estado().toLowerCase()}`);
}
