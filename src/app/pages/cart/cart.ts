import { Component } from '@angular/core';
import { CartService, CartItem } from '../../services/cart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  cart: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private seoService: SeoService
  ) { }

  ngOnInit(): void {
    this.cart = this.cartService.getCart();

    // Set SEO for cart page
    this.seoService.updateTags({
      title: 'Carrito de Compras | VaryaGO',
      description: 'Revisa los productos en tu carrito de compras. Finaliza tu compra con envío a todo Colombia.',
      keywords: 'carrito, compras, varyago, checkout',
      url: 'https://varyago.com/cart',
      type: 'website'
    });
  }

  updateQuantity(item: CartItem, qty: number) {
    if (qty < 1) return;
    this.cartService.updateQuantity(item.id, item.variationId, qty);
    this.cart = this.cartService.getCart();
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id, item.variationId);
    this.cart = this.cartService.getCart();
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }
}
