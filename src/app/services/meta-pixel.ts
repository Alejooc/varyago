// src/app/services/meta-pixel.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../config';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

@Injectable({ providedIn: 'root' })
export class MetaPixel {
  private loaded = false;
  private initializing?: Promise<void>;
  private pixelId?: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /** Inicializa leyendo el ID del environment (una sola vez). */
  init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
    if (this.loaded) return Promise.resolve();

    const id = environment?.metaPixelId;
    if (!id) {
      // metaPixelId empty/undefined in this build
      return Promise.resolve();
    }
    return this.bootstrap(id);
  }

  /** Fuerza init con un ID concreto (para pruebas). */
  forceInit(id: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
    if (!id) {
      // forceInit called without id
      return Promise.resolve();
    }
    return this.bootstrap(id);
  }

  /** Promise que resuelve cuando fbq está listo. */
  ready(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.initializing) return this.initializing;
    // Si no hay init explícito, intenta con environment.
    return this.init();
  }

  private bootstrap(id: string): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.initializing) return this.initializing; // evita condiciones de carrera
    this.pixelId = id;

    this.initializing = new Promise<void>((resolve) => {
      // Stub oficial de FB (con cola) + carga del script:
      ((f: any, b: Document, e: string) => {
        if (!f.fbq) {
          const n: any = function () {
            if (n.callMethod) {
              n.callMethod.apply(n, arguments);
            } else {
              n.queue.push(arguments);
            }
          };
          f._fbq = f._fbq || n;
          n.push = n;
          n.loaded = true;
          n.version = '2.0';
          n.queue = [];
          f.fbq = n;
        }

        // Inserta el script si no existe
        if (!b.querySelector('script[src*="connect.facebook.net"][src*="fbevents.js"]')) {
          const t = b.createElement(e) as HTMLScriptElement;
          t.async = true;
          // en_US es estable; es_LA también sirve si prefieres local
          t.src = 'https://connect.facebook.net/en_US/fbevents.js';
          t.onload = () => {
            try {
              window.fbq!('init', id);
              window.fbq!('track', 'PageView');
              // [MetaPixel] loaded + PageView
            } catch (err) {
              console.error('[MetaPixel] Error tras onload:', err);
            } finally {
              this.loaded = true;
              resolve();
            }
          };
          (b.head || b.body || b.documentElement).appendChild(t);
        } else {
          // Script ya estaba presente
          try {
            window.fbq!('init', id);
            window.fbq!('track', 'PageView');
            // [MetaPixel] already loaded; PageView sent
          } catch (err) {
            console.error('[MetaPixel] Error init con script presente:', err);
          } finally {
            this.loaded = true;
            resolve();
          }
        }
      }).call(this, window, document, 'script');
    });

    return this.initializing;
  }

  /** PageView manual (útil en cambios de ruta SPA) */
  pageView(): Promise<void> {
    return this.ready().then(() => {
      try { window.fbq?.('track', 'PageView'); } catch { }
    });
  }

  /** Track genérico con options (ej. { eventID }) */
  track(event: string, data: Record<string, any> = {}, options?: any): Promise<void> {
    return this.ready().then(() => {
      try { window.fbq?.('track', event, data, options); }
      catch (err) { console.error('[MetaPixel] Error enviando', event, err); }
    });
  }

  // Helpers con posible eventID (deduplicación con CAPI)
  viewContent(payload: MetaViewContent, eventId?: string) {
    return this.track('ViewContent', payload, eventId ? { eventID: eventId } : undefined);
  }
  addToCart(payload: MetaAddToCart, eventId?: string) {
    return this.track('AddToCart', payload, eventId ? { eventID: eventId } : undefined);
  }
  initiateCheckout(payload: MetaInitiateCheckout, eventId?: string) {
    return this.track('InitiateCheckout', payload, eventId ? { eventID: eventId } : undefined);
  }
  purchase(payload: MetaPurchase, eventId?: string) {
    return this.track('Purchase', payload, eventId ? { eventID: eventId } : undefined);
  }
}

// Tipos
export type MetaItem = { id: string; quantity?: number; item_price?: number; };
export type MetaViewContent = { content_ids: string[]; content_type: 'product' | 'product_group'; value?: number; currency?: string; };
export type MetaAddToCart = MetaViewContent & { contents?: MetaItem[] };
export type MetaInitiateCheckout = { contents?: MetaItem[]; num_items?: number; value?: number; currency?: string; };
export type MetaPurchase = { contents?: MetaItem[]; value: number; currency: string; order_id?: string; event_id?: string; };
