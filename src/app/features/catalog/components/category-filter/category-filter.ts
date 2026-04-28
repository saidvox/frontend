import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-category-filter',
  imports: [...HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1" aria-label="Filtros de catalogo">
      <h3 class="font-semibold text-lg mb-2 px-4">Categorias</h3>
      <button
        hlmBtn
        type="button"
        [variant]="selectedId() === null ? 'secondary' : 'ghost'"
        class="w-full justify-start font-normal"
        [class.active]="selectedId() === null"
        (click)="selected.emit(null)"
      >
        Todos los productos
      </button>
      @for (category of categories(); track category.id) {
        <button
          hlmBtn
          type="button"
          [variant]="selectedId() === category.id ? 'secondary' : 'ghost'"
          class="w-full justify-start font-normal"
          [class.active]="selectedId() === category.id"
          (click)="selected.emit(category.id)"
        >
          {{ category.nombre }}
        </button>
      }
    </div>
  `,
})
export class CategoryFilter {
  categories = input.required<Categoria[]>();
  selectedId = input<number | null>(null);
  selected = output<number | null>();
}
