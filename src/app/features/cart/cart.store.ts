import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { Producto } from '../../core/models/producto.model';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

const CART_KEY = 'cafe_de_barrio_cart';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly itemsState = signal<CartItem[]>(this.readItems());

  readonly items = this.itemsState.asReadonly();
  readonly totalItems = computed(() =>
    this.itemsState().reduce((total, item) => total + item.cantidad, 0),
  );
  readonly total = computed(() =>
    this.itemsState().reduce((total, item) => total + item.producto.precio * item.cantidad, 0),
  );

  add(producto: Producto, cantidad = 1): void {
    this.itemsState.update((items) => {
      const current = items.find((item) => item.producto.id === producto.id);

      if (!current) {
        return this.persist([...items, { producto, cantidad }]);
      }

      return this.persist(
        items.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, producto.stock) }
            : item,
        ),
      );
    });
  }

  updateQuantity(productoId: number, cantidad: number): void {
    this.itemsState.update((items) =>
      this.persist(
        items
          .map((item) =>
            item.producto.id === productoId
              ? { ...item, cantidad: Math.min(Math.max(cantidad, 1), item.producto.stock) }
              : item,
          )
          .filter((item) => item.cantidad > 0),
      ),
    );
  }

  remove(productoId: number): void {
    this.itemsState.update((items) =>
      this.persist(items.filter((item) => item.producto.id !== productoId)),
    );
  }

  clear(): void {
    this.itemsState.set(this.persist([]));
  }

  private readItems(): CartItem[] {
    if (!this.browser) {
      return [];
    }

    const raw = localStorage.getItem(CART_KEY);

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]): CartItem[] {
    if (this.browser) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }

    return items;
  }
}
