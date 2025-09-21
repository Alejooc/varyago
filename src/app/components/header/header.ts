import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute,Router,RouterModule,NavigationEnd  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { HeaderService } from "../../services/header";
import { SharedService } from '../../services/shared';
import { debounceTime, Subject } from 'rxjs';
import { SearchService } from '../../services/search';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth';

declare var $: any;
@Component({
  selector: 'app-header',
  imports: [CommonModule,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements AfterViewInit {
  cartCount = 0;
  cartItems: any[] = [];
  menu: any ;
  totalPrice: number=0;
  results: any[] = [];
  notifyMessages = [
    '🚚 Envio gratis en pedidos superiores a $250.000',
    '🆕 Nuevos productos cada semana',
    '📞 Atencion al cliente 24/7',
    '💸 Garantia de devolucion de dinero',
    '🔒 Pagos seguros en linea',
    '🎁 Sorpresas y descuentos exclusivos',
    '⭐ Productos de alta calidad garantizada',
    '🌍 Enviamos a todo el pais',
    '🛒 Compra facil y rapida',
  ];
  isCartOpen: boolean = false;


  private searchSubject = new Subject<string>();
  constructor(
      private route: ActivatedRoute,
      private cartService: CartService,
      private headerService: HeaderService,
      private sharedService: SharedService,
      private searchService: SearchService,
      private authService: AuthService,
       private router: Router,
      
    ) {
      this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      if (query.length > 2) {
        this.fetchResults(query);
      } else {
        this.results = [];
      }
    });
  }
  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  fetchResults(query: string): void {
    this.searchService.buscarProductos(query).subscribe(data => {
     
      this.results = data;
    });
  }

 onSelectItem(slug: string): void {
  this.results = []; // limpia la lista
  //this.router.navigate(['/product', slug]); // redirección a la página de producto
}
  preventSubmit(event: Event): void {
    event.preventDefault();
  }
  ngAfterViewInit(): void {
    this.results = [];
    this.getMenu(); // Carga el menú y luego ejecuta reinicio con delay
     // Cierra el carrito cuando cambia de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isCartOpen = false;
      }
    });
  }
  
 reiniciarMenuMolla(): void {
  const $menu = $('.mobile-menu');
  const $body = $('body');

  $('.mobile-menu-toggler').off('click').on('click', function (this: any, e: Event) {
    $body.toggleClass('mmenu-active');
    $(this).toggleClass('active');
    e.preventDefault();
  });

  // 1. Añadir flechas .mmenu-btn a items con submenú
  $menu.find('li').each(function (this: any) {
    const $this = $(this);
    if ($this.children('ul').length && $this.children('span.mmenu-btn').length === 0) {
      $('<span class="mmenu-btn"></span>').insertAfter($this.children('a'));
    }
  });

  // 2. Controlar apertura/cierre de submenús
  $(document).off('click', '.mmenu-btn').on('click', '.mmenu-btn', function (this: any,e: Event) {
    const $parent = $(this).closest('li');
    const $submenu = $parent.children('ul');

    if (!$parent.hasClass('open')) {
      $submenu.stop(true, true).slideDown(300, () => $parent.addClass('open'));
    } else {
      $submenu.stop(true, true).slideUp(300, () => $parent.removeClass('open'));
    }

    e.preventDefault();
    e.stopPropagation();
  });

  $(document).off('click', '.mobile-menu li a').on('click', '.mobile-menu li a', function (this: any, e:Event) {
  const $li = $(this).closest('li');

  // Si NO es un menú con submenú (type !== '4'), cerrar menú
  if (!$li.hasClass('has-submenu')) {
    $('body').removeClass('mmenu-active');
    $('.mobile-menu-toggler').removeClass('active');
  } else {
    // Solo evita que el enlace navegue, pero NO cierres el menú móvil
    const $parent = $(this).closest('li');
    const $submenu = $parent.children('ul');

    if (!$parent.hasClass('open')) {
      $submenu.stop(true, true).slideDown(300, () => $parent.addClass('open'));
    } else {
      $submenu.stop(true, true).slideUp(300, () => $parent.removeClass('open'));
    }
    e.stopPropagation();
    e.preventDefault();
  }
});
}
  ngOnInit(): void {
    this.cartCount = this.cartService.getTotalItems();
    this.cartItems = this.getCartItems();
    this.totalPrice = this.cartService.getTotalPrice();
    //this.getMenu();
     this.sharedService.cartUpdated$.subscribe(() => {
      this.refreshCart(); // actualiza totales o vuelve a consultar el carrito
    });
    
  }
  refreshCart() {
    // lógica para actualizar el ícono o contenido del carrito
     this.cartCount = this.cartService.getTotalItems();
      this.cartItems = this.getCartItems();
      this.totalPrice = this.cartService.getTotalPrice();
      this.toggleCart();
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
    // Una vez cargado el menú, aplicar lógica jQuery
    setTimeout(() => this.reiniciarMenuMolla(), 100);
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
  searchMore(query: string): void {
    if (query.length > 2) {
      this.results = []; // limpia la lista
      this.router.navigate(['search', query]);
      
    }
  }
  account(){
    const token = localStorage.getItem('auth_token');
    if (token) {
      const user: any = jwtDecode(token);
     // console.log(user);
      this.router.navigate(['account']);
    }else{
      
      this.router.navigate(['login']); // redirige a login si no hay token
      return;
    }
    
  }
  onLogout(): void {
    this.cartService.clearCart(); // Limpia el carrito al cerrar sesión
    this.authService.logout();
    this.router.navigate(['/']);
  }
  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }
  goToCheckout(): void {
    this.toggleCart(); // Cierra el aside si quieres
    this.router.navigate(['/checkout']);
  }

}
