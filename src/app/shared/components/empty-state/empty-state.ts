import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-empty-state',
  imports: [...HlmCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section hlmCard class="empty-state">
      <p class="eyebrow">{{ eyebrow() }}</p>
      <h2 hlmCardTitle>{{ title() }}</h2>
      <p>{{ message() }}</p>
    </section>
  `,
})
export class EmptyState {
  eyebrow = input('Sin datos');
  title = input.required<string>();
  message = input.required<string>();
}
