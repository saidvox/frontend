export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  activo: boolean;
  categoriaId: number;
  categoriaNombre: string;
}

export interface ProductoDetalle extends Producto {}

export interface ProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  activo: boolean;
  categoriaId: number;
}

export interface ProductoFiltros {
  categoria?: number | null;
  nombre?: string | null;
  activos?: boolean | null;
  disponible?: boolean | null;
  page?: number;
  size?: number;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
