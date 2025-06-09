import { Component } from '@angular/core';
import { ActivatedRoute,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-header',
  imports: [CommonModule,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  cartCount = 0;
  cartItems: any[] = [];
  constructor(
      private route: ActivatedRoute,
      private cartService: CartService
    ) {}

  ngOnInit(): void {
    this.cartCount = this.cartService.getTotalItems();
    this.cartItems = this.getCartItems();
    console.log(this.cartItems);
    
  }
  ngOnDestroy(): void {
    // Aquí podrías limpiar recursos si es necesario
  }
  delItem(id: number, variationId: number | undefined) {
    this.cartService.removeItem(id, variationId);
    this.ngOnInit();
  }
  getCartItems() {
    return this.cartService.getCart();
  }
}
