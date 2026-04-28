import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';

import { Categoria } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-product-form',
  imports: [...HlmButtonImports, ...HlmCardImports, ...HlmInputImports, ...HlmTextareaImports, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form hlmCard class="form-panel" [formGroup]="form()" (ngSubmit)="submitted.emit()">
      <label>
        Nombre
        <input hlmInput formControlName="nombre" />
      </label>
      <label>
        Descripcion
        <textarea hlmTextarea formControlName="descripcion" rows="4"></textarea>
      </label>
      <div class="form-grid">
        <label>
          Precio
          <input hlmInput formControlName="precio" type="number" min="0.01" step="0.01" />
        </label>
        <label>
          Stock
          <input hlmInput formControlName="stock" type="number" min="0" step="1" />
        </label>
      </div>
      <label>
        Imagen URL
        <input hlmInput formControlName="imagenUrl" />
      </label>
      <label>
        Categoria
        <select formControlName="categoriaId">
          @for (category of categories(); track category.id) {
            <option [value]="category.id">{{ category.nombre }}</option>
          }
        </select>
      </label>
      <label class="checkbox-row">
        <input formControlName="activo" type="checkbox" />
        Producto activo
      </label>
      <button hlmBtn size="lg" type="submit" [disabled]="form().invalid">
        Guardar producto
      </button>
    </form>
  `,
})
export class ProductForm {
  form = input.required<FormGroup>();
  categories = input.required<Categoria[]>();
  submitted = output<void>();
}
