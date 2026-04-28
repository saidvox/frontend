import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';

import { Categoria } from '../../../../core/models/categoria.model';
import { ProductoRequest } from '../../../../core/models/producto.model';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  selector: 'app-admin-product-form-page',
  imports: [ProductForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section-heading">
      <p class="eyebrow">Producto</p>
      <h1>{{ productId() ? 'Editar producto' : 'Nuevo producto' }}</h1>
    </section>

    <app-product-form [form]="form" [categories]="categories()" (submitted)="save()" />
  `,
})
export class AdminProductFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);

  readonly categories = signal<Categoria[]>([]);
  readonly productId = signal<number | null>(null);

  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    precio: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    stock: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    imagenUrl: new FormControl<string | null>(null),
    activo: new FormControl(true, { nonNullable: true }),
    categoriaId: new FormControl(1, { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.productId.set(id ? Number(id) : null);

    this.categoriaService.listar().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });

    if (this.productId()) {
      this.productoService.obtenerPorId(this.productId() as number).subscribe((product) => {
        this.form.patchValue({
          nombre: product.nombre,
          descripcion: product.descripcion,
          precio: product.precio,
          stock: product.stock,
          imagenUrl: product.imagenUrl,
          activo: product.activo,
          categoriaId: product.categoriaId,
        });
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const request: ProductoRequest = this.form.getRawValue();
    const id = this.productId();
    const action = id
      ? this.productoService.actualizar(id, request)
      : this.productoService.crear(request);

    action.subscribe(() => {
      toast.success(id ? 'Producto actualizado' : 'Producto creado');
      this.router.navigateByUrl('/admin/productos');
    });
  }
}
