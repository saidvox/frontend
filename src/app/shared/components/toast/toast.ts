import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message()) {
      <div class="toast" role="status" aria-live="polite">
        {{ message() }}
      </div>
    }
  `,
})
export class Toast {
  message = input<string | null>(null);
}
