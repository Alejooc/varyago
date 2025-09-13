// src/app/services/meta-capi.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config';

export interface MetaContent {
  id: string;
  quantity: number;
  item_price?: number; // opcional
}

export interface MetaCapiPayload {
  event_id: string;             // mismo que usas en Pixel para deduplicación
  value?: number;
  currency?: string;            // 'COP'
  contents?: MetaContent[];
  client_user_agent: string;    // navigator.userAgent
  event_source_url?: string;    // window.location.href
  order_id?: string | number;   // solo en Purchase
  email?: string;               // opcional, si hay consentimiento
  phone?: string;               // opcional, si hay consentimiento
  test_event_code?: string;     // opcional, solo para pruebas
}

@Injectable({ providedIn: 'root' })
export class MetaCapi {
  private base = `${environment.API_BASE_URL}/api/meta/capi`; // ajusta si usas otro host

  constructor(private http: HttpClient) {}

   /**
   * Envía cualquier evento de CAPI (Purchase, AddToCart, etc.)
   * @param eventName Nombre del evento (Purchase, AddToCart, InitiateCheckout, ViewContent, etc.)
   * @param payload Datos del evento (debe incluir event_id y user_agent al menos)
   */
  sendEvent(eventName: string, payload: MetaCapiPayload) {
    return this.http.post(`${this.base}/event/${eventName}`, payload);
  }
}
