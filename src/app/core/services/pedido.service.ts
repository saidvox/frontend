import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from '../config/api.config';
import { EstadoPedido, Pedido, PedidoRequest } from '../models/pedido.model';
import { RealtimeService } from './realtime.service';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly realtimeService = inject(RealtimeService);

  readonly orderChanges$ = this.realtimeService.events('/realtime/admin/pedidos', { auth: true });

  listar(estado?: EstadoPedido | null): Observable<Pedido[]> {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<Pedido[]>(apiUrl('/pedidos'), { params });
  }

  crear(request: PedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(apiUrl('/pedidos'), request);
  }

  actualizarEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(apiUrl(`/pedidos/${id}/estado`), { estado });
  }
}
