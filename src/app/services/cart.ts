import { Injectable } from '@angular/core';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: CartItem[] = [];

  getItems(): CartItem[] {
    return this.cart;
  }

  addItem(item: CartItem): void {
    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      existing.cantidad += item.cantidad;
    } else {
      this.cart.push(item);
    }
  }

  removeItem(id: number): void {
    this.cart = this.cart.filter(item => item.id !== id);
  }

  clearCart(): void {
    this.cart = [];
  }

  getTotal(): number {
    return this.cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }
}
