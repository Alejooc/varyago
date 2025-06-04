import { Component } from '@angular/core';
import { CartService, CartItem } from '../../services/cart';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-cart',
  imports: [],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  items: CartItem[] = [];

  constructor(private cartService: CartService) {
    this.items = cartService.getItems();
  }

  eliminar(id: number): void {
    this.cartService.removeItem(id);
    this.items = this.cartService.getItems();
  }

  total(): number {
    return this.cartService.getTotal();
  }
}
