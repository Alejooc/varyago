// src/app/services/meta-capi.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config';

export interface CapiItem {
  id: string;
  quantity: number;
  item_price?: number; // opcional
}

export interface CapiPurchasePayload {
  event_id: string;            // mismo que usas en Pixel purchase
  order_id: string | number;
  value: number;
  currency: string;            // 'COP'
  contents: CapiItem[];
  client_user_agent: string;   // navigator.userAgent
  // opcionales si tienes consentimiento:
  email?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class MetaCapi {
  private base = `${environment.API_BASE_URL}/api/meta/capi`; // ajusta si usas otro host

  constructor(private http: HttpClient) {}

  sendPurchase(p: CapiPurchasePayload) {
    return this.http.post(`${this.base}/purchase`, p);
  }
}
