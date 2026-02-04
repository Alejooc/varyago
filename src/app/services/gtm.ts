import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Servicio genérico para Google Tag Manager (GTM) + GA4 (ecommerce) en Angular.
 *
 * Características:
 * - Seguro para SSR (no rompe en server-side rendering).
 * - Cola de eventos hasta que dataLayer esté listo.
 * - Helpers para page_view, login, sign_up, search, share, view_item, add_to_cart, begin_checkout, purchase, etc.
 * - Posibilidad de activar modo debug.
 * - Seteo de usuario y consentimiento (consent mode v2 básico).
 * - Integración opcional con Router para page_view automáticos.
 *
 * Cómo usar (rápido):
 * 1) Provee el ID de contenedor en tu environment (opcional si ya inyectaste el snippet de GTM):
 *    environment.gtmContainerId = 'GTM-XXXXXXX'
 * 2) En tu AppComponent, llama a this.gtm.init() y (opcional) this.gtm.bindRouter(this.router)
 * 3) Dispara eventos: this.gtm.event('login', { method: 'email' }) o helpers como this.gtm.addToCart(...)
 */

// ======== Tipos GA4 Ecommerce (simplificados) ========
export interface GA4Item {
  item_id?: string;           // SKU o ID
  item_name?: string;         // Nombre del producto
  affiliation?: string;
  coupon?: string;
  currency?: string;          // "COP", "USD", etc.
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;             // Precio unitario
  quantity?: number;          // Cantidad
}

export interface PageViewParams {
  page_location?: string; // URL completa
  page_referrer?: string;
  page_title?: string;
}

export interface PurchaseParams {
  transaction_id: string;
  value: number;
  tax?: number;
  shipping?: number;
  currency?: string;
  coupon?: string;
  items: GA4Item[];
}

export interface BeginCheckoutParams {
  value?: number;
  currency?: string;
  coupon?: string;
  items: GA4Item[];
}

export interface AddToCartParams {
  value?: number;
  currency?: string;
  items: GA4Item[];
}

export interface ViewItemParams {
  currency?: string;
  value?: number;
  items: GA4Item[]; // normalmente un solo item
}

export interface GTMConfig {
  containerId?: string;   // GTM-XXXXXXX (si el snippet no está en tu index.html, puede inyectarse)
  dataLayerName?: string; // por defecto 'dataLayer'
  debug?: boolean;        // logs en consola
  autoInit?: boolean;     // inyectar script GTM si containerId está definido
}

declare global {
  interface Window {
    dataLayer: any[];
    [key: string]: any;
  }
}

@Injectable({ providedIn: 'root' })
export class Gtm {
  private ready = false;
  private queue: any[] = [];
  private dataLayerName = 'dataLayer';
  private debug = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() private router?: Router,
  ) { }

  /** Inicializa el servicio. */
  init(cfg: GTMConfig = {}): void {
    if (!isPlatformBrowser(this.platformId)) return; // SSR safe

    this.dataLayerName = cfg.dataLayerName || 'dataLayer';
    this.debug = !!cfg.debug;

    // Asegura dataLayer
    const w = window as any;
    w[this.dataLayerName] = w[this.dataLayerName] || [];

    // Marca de inicio (recomendado por GA4)
    this.pushRaw({ 'gtm.start': Date.now(), event: 'gtm.js' });

    // Inyecta GTM si se solicita y aún no existe
    if (cfg.autoInit && cfg.containerId && !document.getElementById('gtm-script')) {
      this.injectGtmScript(cfg.containerId, this.dataLayerName);
    }

    // Consideramos listo cuando existe dataLayer
    this.ready = true;

    // Drena cola
    if (this.queue.length) {
      this.queue.forEach((e) => this.pushRaw(e));
      this.queue = [];
    }

    if (this.debug) {
      console.info('[GTM] init OK', cfg);
    }
  }

  /** Vincula page_view automáticos al Router (llamar desde AppComponent si se desea). */
  bindRouter(router: Router): void {
    if (!isPlatformBrowser(this.platformId)) return;
    router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((ev) => {
      this.pageView({
        page_location: window.location.href,
        page_title: document.title,
        page_referrer: document.referrer || undefined,
      });
    });
  }

  /** Empuja objetos crudos al dataLayer (avanzado). */
  pushRaw(obj: Record<string, any>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const w = window as any;
    if (!this.ready) {
      this.queue.push(obj);
      return;
    }
    w[this.dataLayerName].push(obj);
    // if (this.debug) console.log('[GTM] push', obj);
  }

  /** Evento genérico (GA4): eventName con params. */
  event(eventName: string, params: Record<string, any> = {}): void {
    this.pushRaw({ event: eventName, ...params });
  }

  // =================== Helpers comunes ===================

  pageView(params: PageViewParams = {}): void {
    // GA4 suele mapear page_view automáticamente; si quieres enviarlo explícito:
    this.event('page_view', params);
  }

  login(method: string = 'email'): void {
    this.event('login', { method });
  }

  signUp(method: string = 'email'): void {
    this.event('sign_up', { method });
  }

  search(search_term: string): void {
    this.event('search', { search_term });
  }

  share(method: string, content_type?: string, item_id?: string): void {
    this.event('share', { method, content_type, item_id });
  }

  // =================== Ecommerce (GA4) ===================

  viewItem(p: ViewItemParams): void {
    this.event('view_item', p);
  }

  addToCart(p: AddToCartParams): void {
    this.event('add_to_cart', p);
  }

  removeFromCart(p: AddToCartParams): void {
    this.event('remove_from_cart', p);
  }

  beginCheckout(p: BeginCheckoutParams): void {
    this.event('begin_checkout', p);
  }

  addPaymentInfo(method: string, value?: number, currency?: string): void {
    this.event('add_payment_info', { payment_type: method, value, currency });
  }

  addShippingInfo(shipping_tier: string, value?: number, currency?: string): void {
    this.event('add_shipping_info', { shipping_tier, value, currency });
  }

  purchase(p: PurchaseParams): void {
    this.event('purchase', p);
  }

  refund(transaction_id: string, value?: number, currency?: string): void {
    this.event('refund', { transaction_id, value, currency });
  }

  // =================== Usuario & Consentimiento ===================

  setUser(user_id?: string, user_properties?: Record<string, any>): void {
    // Para GA4 via GTM, se suele usar event "set_user_properties" o data event personalizado
    this.pushRaw({
      event: 'set_user_properties',
      user_id,
      user_properties,
    });
  }

  setConsent(ad_storage: 'granted' | 'denied', analytics_storage: 'granted' | 'denied', region?: string[]): void {
    // Consent Mode v2 básico
    const update: any = {
      'ad_storage': ad_storage,
      'analytics_storage': analytics_storage,
    };
    if (region && region.length) update['region'] = region;
    this.pushRaw({
      event: 'consent_update',
      'consent_update': update,
    });
  }

  setCurrency(currency: string): void {
    // Útil para no repetir en cada evento
    this.pushRaw({ event: 'set_currency', currency });
  }

  // =================== Utilidades ===================

  /** Inyecta el script de GTM dinámicamente (si no usas el snippet en index.html). */
  private injectGtmScript(containerId: string, dataLayerName: string): void {
    const dlParam = dataLayerName && dataLayerName !== 'dataLayer' ? `&l=${encodeURIComponent(dataLayerName)}` : '';
    const src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}${dlParam}`;

    const s = document.createElement('script');
    s.async = true;
    s.id = 'gtm-script';
    s.src = src;

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(s, firstScript);
  }
}

/* =================== Ejemplos de uso ===================

// app.component.ts
constructor(private gtm: TagManagerService, private router: Router) {}

ngOnInit() {
  this.gtm.init({
    containerId: environment.gtmContainerId, // opcional si ya tienes el snippet GTM en index.html
    autoInit: true,                          // inyecta script
    debug: !environment.production,
  });

  // Page views automáticos
  this.gtm.bindRouter(this.router);

  // Moneda por defecto
  this.gtm.setCurrency('COP');
}

// Cuando un usuario inicia sesión
this.gtm.login('email');
this.gtm.setUser(user.id, { plan: user.plan, role: user.role });

// Ver producto
this.gtm.viewItem({
  currency: 'COP',
  value: 99900,
  items: [{ item_id: 'SKU-123', item_name: 'Sábana queen', item_brand: 'Varyago', price: 99900, quantity: 1 }]
});

// Agregar al carrito
this.gtm.addToCart({
  currency: 'COP',
  value: 199800,
  items: [{ item_id: 'SKU-123', item_name: 'Sábana queen', price: 99900, quantity: 2 }]
});

// Inicio de checkout
this.gtm.beginCheckout({
  currency: 'COP',
  value: 199800,
  items: [{ item_id: 'SKU-123', item_name: 'Sábana queen', price: 99900, quantity: 2 }]
});

// Compra
this.gtm.purchase({
  transaction_id: 'ORD-2025-0001',
  currency: 'COP',
  value: 209800,
  tax: 0,
  shipping: 10000,
  items: [
    { item_id: 'SKU-123', item_name: 'Sábana queen', price: 99900, quantity: 2 }
  ]
});

*/
