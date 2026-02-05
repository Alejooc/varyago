import { AfterViewInit, Component, DOCUMENT, HostListener, Inject, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { HeaderService } from "../../services/header";
import { SharedService } from '../../services/shared';
import { debounceTime, Subject } from 'rxjs';
import { SearchService } from '../../services/search';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth';
import { ProgressGoalBar } from '../progress-goal-bar/progress-goal-bar/progress-goal-bar';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, ProgressGoalBar],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements AfterViewInit {
  cartCount = 0;
  isSearchOpen = false;
  cartItems: any[] = [];
  menu: any;
  totalPrice: number = 0;
  results: any[] = [];
  notifyMessages = [
    '🚚 Envio gratis en pedidos superiores a $99.900',
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
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
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


  openSearch(e?: Event) {
    if (e) e.preventDefault();
    if (this.isSearchOpen) return;
    this.isSearchOpen = true;

    // bloquea scroll del body para lograr full-modal vibes
    this.renderer.addClass(this.document.body, 'overflow-hidden');
    // Opcional: auto-focus al input
    setTimeout(() => {
      const el = this.document.getElementById('q') as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  closeSearch() {
    if (!this.isSearchOpen) return;
    this.isSearchOpen = false;
    this.renderer.removeClass(this.document.body, 'overflow-hidden');
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
    this.closeSearch();
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
        this.closeSearch();
      }
    });
  }

  reiniciarMenuMolla(): void {
    // Skip on server-side rendering
    if (typeof document === 'undefined') return;

    const menu = document.querySelector('.mobile-menu');
    const body = document.body;
    const toggler = document.querySelector('.mobile-menu-toggler');

    if (!menu || !toggler) return;

    // Toggle mobile menu
    toggler.removeEventListener('click', this.toggleMobileMenu);
    toggler.addEventListener('click', this.toggleMobileMenu.bind(this));

    // 1. Add mmenu-btn to items with submenu
    const menuItems = menu.querySelectorAll('li');
    menuItems.forEach((li) => {
      const hasSubmenu = li.querySelector('ul');
      const hasButton = li.querySelector('span.mmenu-btn');

      if (hasSubmenu && !hasButton) {
        const btn = document.createElement('span');
        btn.className = 'mmenu-btn';
        const link = li.querySelector('a');
        if (link) {
          link.insertAdjacentElement('afterend', btn);
        }
      }
    });

    // 2. Handle submenu toggle
    document.removeEventListener('click', this.handleSubmenuClick);
    document.addEventListener('click', this.handleSubmenuClick.bind(this));

    // 3. Handle menu link clicks
    document.removeEventListener('click', this.handleMenuLinkClick);
    document.addEventListener('click', this.handleMenuLinkClick.bind(this));
  }

  private toggleMobileMenu = (e: Event) => {
    e.preventDefault();
    document.body.classList.toggle('mmenu-active');
    const toggler = document.querySelector('.mobile-menu-toggler');
    toggler?.classList.toggle('active');
  }

  public closeMobileMenu() {
    document.body.classList.remove('mmenu-active');
    const toggler = document.querySelector('.mobile-menu-toggler');
    toggler?.classList.remove('active');
  }

  private handleSubmenuClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('mmenu-btn')) return;

    e.preventDefault();
    e.stopPropagation();

    const parent = target.closest('li');
    if (!parent) return;

    const submenu = parent.querySelector('ul') as HTMLElement;
    if (!submenu) return;

    if (!parent.classList.contains('open')) {
      this.slideDown(submenu, 300, () => parent.classList.add('open'));
    } else {
      this.slideUp(submenu, 300, () => parent.classList.remove('open'));
    }
  }

  private handleMenuLinkClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.matches('.mobile-menu li a')) return;

    const li = target.closest('li');
    if (!li) return;

    // If NOT a submenu item, close mobile menu
    if (!li.classList.contains('has-submenu')) {
      document.body.classList.remove('mmenu-active');
      const toggler = document.querySelector('.mobile-menu-toggler');
      toggler?.classList.remove('active');
    } else {
      // Toggle submenu
      const submenu = li.querySelector('ul') as HTMLElement;
      if (!submenu) return;

      if (!li.classList.contains('open')) {
        this.slideDown(submenu, 300, () => li.classList.add('open'));
      } else {
        this.slideUp(submenu, 300, () => li.classList.remove('open'));
      }
      e.stopPropagation();
      e.preventDefault();
    }
  }

  // Vanilla JS slide animations
  private slideDown(element: HTMLElement, duration: number, callback?: () => void) {
    element.style.removeProperty('display');
    let display = typeof window !== 'undefined' ? window.getComputedStyle(element).display : 'block';
    if (display === 'none') display = 'block';
    element.style.display = display;

    const height = element.scrollHeight;
    element.style.overflow = 'hidden';
    element.style.height = '0';
    element.style.transition = `height ${duration}ms ease`;

    setTimeout(() => {
      element.style.height = height + 'px';
    }, 0);

    setTimeout(() => {
      element.style.removeProperty('height');
      element.style.removeProperty('overflow');
      element.style.removeProperty('transition');
      if (callback) callback();
    }, duration);
  }

  private slideUp(element: HTMLElement, duration: number, callback?: () => void) {
    element.style.overflow = 'hidden';
    element.style.height = element.scrollHeight + 'px';
    element.style.transition = `height ${duration}ms ease`;

    setTimeout(() => {
      element.style.height = '0';
    }, 0);

    setTimeout(() => {
      element.style.display = 'none';
      element.style.removeProperty('height');
      element.style.removeProperty('overflow');
      element.style.removeProperty('transition');
      if (callback) callback();
    }, duration);
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
      this.closeSearch();
      this.results = []; // limpia la lista
      this.router.navigate(['search', query]);

    }
  }
  account() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const user: any = jwtDecode(token);
      // console.log(user);
      this.router.navigate(['account']);
    } else {

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
  onFreeShippingReached() {
    // Aquí puedes mostrar un mensaje, activar una animación, etc.
  }
}
