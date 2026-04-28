import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-loading-state',
  imports: [...HlmCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div hlmCard class="loading-state" role="status" aria-live="polite">
      <span aria-hidden="true"></span>
      {{ message() }}
    </div>
  `,
})
export class LoadingState {
  message = input('Cargando informacion...');
}
