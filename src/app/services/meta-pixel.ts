import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../config';

declare global {
  interface Window {
    fbq: any;
  }
}

@Injectable({ providedIn: 'root' })
export class MetaPixel {
  private loaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  init() {
    if (!isPlatformBrowser(this.platformId) || this.loaded) return;
    const id = environment.metaPixelId;
    if (!id) return;

    // Cargar script de Meta Pixel
    (function(f: any, b: Document, e: string) {
      if (typeof f.fbq !== 'undefined') return;
      const n: any = function() {
        if (n.callMethod) {
          n.callMethod.apply(n, arguments);
        } else {
          n.queue.push(arguments);
        }
      };
      f.fbq = n;
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      const t: HTMLScriptElement = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const s: Element | null = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      }
    })(window, document, 'script');

    window.fbq('init', id);      // Inicializa
    window.fbq('track', 'PageView'); // Primer PageView
    this.loaded = true;
  }

  track(event: string, data: Record<string, any> = {}) {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', event, data);
    }
  }

  // Helpers de eventos comunes
  viewContent(payload: MetaViewContent) { this.track('ViewContent', payload); }
  addToCart(payload: MetaAddToCart) { this.track('AddToCart', payload); }
  initiateCheckout(payload: MetaInitiateCheckout) { this.track('InitiateCheckout', payload); }
  purchase(payload: MetaPurchase) { this.track('Purchase', payload); }
}

export type MetaItem = {
  id: string; // SKU/ID interno
  quantity?: number;
};

export type MetaViewContent = {
  content_ids: string[];    // ['SKU123']
  content_type: 'product'|'product_group';
  value?: number;
  currency?: string;        // 'COP'
};

export type MetaAddToCart = MetaViewContent & { contents?: MetaItem[] };
export type MetaInitiateCheckout = {
  contents?: MetaItem[];
  num_items?: number;
  value?: number;
  currency?: string;
};
export type MetaPurchase = {
  contents?: MetaItem[];
  value: number;
  currency: string;
  order_id?: string;
  event_id?: string;  // Para deduplicar con CAPI
};
