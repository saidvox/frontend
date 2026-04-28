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
    <form [formGroup]="form()" (ngSubmit)="submitted.emit()" class="flex flex-col gap-6">
      <div class="space-y-4">
        <label hlmLabel class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre del producto</span>
          <input hlmInput formControlName="nombre" placeholder="Ej. Espresso Doble" class="bg-secondary/30 border-transparent focus:bg-background transition-colors" />
        </label>
        
        <label hlmLabel class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Descripción</span>
          <textarea hlmTextarea formControlName="descripcion" rows="3" placeholder="Detalles del producto..." class="bg-secondary/30 border-transparent focus:bg-background transition-colors resize-none"></textarea>
        </label>
        
        <div class="grid grid-cols-2 gap-4">
          <label hlmLabel class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio (S/)</span>
            <input hlmInput formControlName="precio" type="number" min="0.01" step="0.01" class="bg-secondary/30 border-transparent focus:bg-background transition-colors font-mono" />
          </label>
          <label hlmLabel class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock Actual</span>
            <input hlmInput formControlName="stock" type="number" min="0" step="1" class="bg-secondary/30 border-transparent focus:bg-background transition-colors font-mono" />
          </label>
        </div>
        
        <label hlmLabel class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Imagen URL</span>
          <input hlmInput formControlName="imagenUrl" placeholder="https://..." class="bg-secondary/30 border-transparent focus:bg-background transition-colors" />
        </label>
        
        <label hlmLabel class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoría</span>
          <select hlmInput formControlName="categoriaId" class="bg-secondary/30 border-transparent focus:bg-background transition-colors h-10 px-3 py-2 rounded-md appearance-none">
            @for (category of categories(); track category.id) {
              <option [value]="category.id">{{ category.nombre }}</option>
            }
          </select>
        </label>
        
        <label hlmLabel class="flex items-center gap-3 p-4 rounded-lg bg-secondary/20 border border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors mt-2">
          <input formControlName="activo" type="checkbox" class="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary accent-primary" />
          <div class="flex flex-col">
            <span class="text-sm font-semibold">Producto activo</span>
            <span class="text-xs text-muted-foreground">Visible para los clientes en el catálogo</span>
          </div>
        </label>
      </div>
      
      <div class="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-border/50">
        <button hlmBtn variant="ghost" type="button" (click)="cancelled.emit()" class="text-muted-foreground">
          Cancelar
        </button>
        <button hlmBtn type="submit" [disabled]="form().invalid || submitting()" class="px-8 shadow-md">
          {{ submitLabel() }}
        </button>
      </div>
    </form>
  `,
})
export class ProductForm {
  form = input.required<FormGroup>();
  categories = input.required<Categoria[]>();
  submitLabel = input('Guardar producto');
  submitting = input(false);
  submitted = output<void>();
  cancelled = output<void>();
}
