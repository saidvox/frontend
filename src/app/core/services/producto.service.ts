import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';

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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productChangesSubject = new Subject<void>();
  private readonly channel = this.createChannel();

  readonly productChanges$ = this.productChangesSubject.asObservable();

  constructor() {
    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data === 'products:changed') {
          this.productChangesSubject.next();
        }
      };
    }
  }

  listar(filtros: ProductoFiltros = {}): Observable<Page<Producto>> {
    let params = new HttpParams();

    if (filtros.categoria) {
      params = params.set('categoria', filtros.categoria);
    }

    const nombre = filtros.nombre?.trim();
    if (nombre) {
      params = params.set('nombre', nombre);
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
    return this.http.post<Producto>(apiUrl('/productos'), request).pipe(
      tap(() => this.notifyProductChanges()),
    );
  }

  actualizar(id: number, request: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(apiUrl(`/productos/${id}`), request).pipe(
      tap(() => this.notifyProductChanges()),
    );
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/productos/${id}`)).pipe(
      tap(() => this.notifyProductChanges()),
    );
  }

  private notifyProductChanges(): void {
    this.productChangesSubject.next();
    this.channel?.postMessage('products:changed');
  }

  private createChannel(): BroadcastChannel | null {
    if (!isPlatformBrowser(this.platformId) || typeof BroadcastChannel === 'undefined') {
      return null;
    }

    return new BroadcastChannel('cafe-de-barrio-products');
  }
}
