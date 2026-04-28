import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from '../config/api.config';
import {
  Page,
  Producto,
  ProductoDetalle,
  ProductoFiltros,
  ProductoRequest,
} from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);

  listar(filtros: ProductoFiltros = {}): Observable<Page<Producto>> {
    let params = new HttpParams();

    if (filtros.categoria) {
      params = params.set('categoria', filtros.categoria);
    }

    if (filtros.activos !== null && filtros.activos !== undefined) {
      params = params.set('activos', filtros.activos);
    }

    if (filtros.disponible !== null && filtros.disponible !== undefined) {
      params = params.set('disponible', filtros.disponible);
    }

    if (filtros.page !== undefined) {
      params = params.set('page', filtros.page);
    }

    if (filtros.size !== undefined) {
      params = params.set('size', filtros.size);
    }

    return this.http.get<Page<Producto>>(apiUrl('/productos'), { params });
  }

  obtenerPorId(id: number): Observable<ProductoDetalle> {
    return this.http.get<ProductoDetalle>(apiUrl(`/productos/${id}`));
  }

  crear(request: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(apiUrl('/productos'), request);
  }

  actualizar(id: number, request: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(apiUrl(`/productos/${id}`), request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/productos/${id}`));
  }
}
