import { Injectable } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  variationId?: number;
  image?: string;
  variationSku?: string;
  measure?: string;
  color?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'cart_items';

  constructor() {}

  getCart(): CartItem[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }

  addToCart(product: CartItem): void {
    const cart = this.getCart();
    const index = cart.findIndex(
      item =>
        item.id === product.id &&
        item.variationId === product.variationId
    );

    if (index !== -1) {
      cart[index].quantity += product.quantity;
    } else {
      cart.push({ ...product });
    }

    this.saveCart(cart);
  }

  updateQuantity(id: number, variationId: number | undefined, qty: number): void {
    const cart = this.getCart();
    const index = cart.findIndex(
      item => item.id === id && item.variationId === variationId
    );

    if (index !== -1) {
      cart[index].quantity = qty;
      this.saveCart(cart);
    }
  }

  removeItem(id: number, variationId: number | undefined): void {
    const cart = this.getCart().filter(
      item => !(item.id === id && item.variationId === variationId)
    );
    this.saveCart(cart);
  }

  clearCart(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getTotalItems(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity * item.price, 0);
  }
}
