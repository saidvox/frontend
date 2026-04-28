import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-quantity-stepper',
  imports: [...HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="quantity-stepper" role="group" aria-label="Cantidad">
      <button hlmBtn variant="ghost" size="icon-sm" type="button" [disabled]="value() <= min()" (click)="change.emit(value() - 1)">
        -
      </button>
      <span aria-live="polite">{{ value() }}</span>
      <button hlmBtn variant="ghost" size="icon-sm" type="button" [disabled]="value() >= max()" (click)="change.emit(value() + 1)">
        +
      </button>
    </div>
  `,
})
export class QuantityStepper {
  value = input.required<number>();
  min = input(1);
  max = input(99);
  change = output<number>();
}
