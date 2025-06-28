import { Component } from '@angular/core';
import { ActivatedRoute,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { HeaderService } from "../../services/header";
import { SharedService } from '../../services/shared';
@Component({
  selector: 'app-header',
  imports: [CommonModule,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  cartCount = 0;
  cartItems: any[] = [];
  menu: any ;
  totalPrice: number=0;
  constructor(
      private route: ActivatedRoute,
      private cartService: CartService,
      private headerService: HeaderService,
      private sharedService: SharedService
    ) {}

  ngOnInit(): void {
    this.cartCount = this.cartService.getTotalItems();
    this.cartItems = this.getCartItems();
    this.totalPrice = this.cartService.getTotalPrice();
    console.log(this.cartItems);
    this.getMenu();
     this.sharedService.cartUpdated$.subscribe(() => {
      this.refreshCart(); // actualiza totales o vuelve a consultar el carrito
    });
    
  }
  refreshCart() {
    // lógica para actualizar el ícono o contenido del carrito
     this.cartCount = this.cartService.getTotalItems();
      this.cartItems = this.getCartItems();
      this.totalPrice = this.cartService.getTotalPrice();
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
  getMenu() {
  this.headerService.getDepartments().subscribe(data => {
    this.menu = data.map((item: any) => {
     
      return {
        ...item,
        submenuColumns: this.splitIntoColumns(item.submenu, 5)
      };
    });
    console.log(this.menu);
    
  });
}

// Función para dividir en columnas
splitIntoColumns(items: any[], itemsPerColumn: number = 5): any[][] {
  const result = [];
  for (let i = 0; i < items.length; i += itemsPerColumn) {
    result.push(items.slice(i, i + itemsPerColumn));
  }
  return result;
}
}
