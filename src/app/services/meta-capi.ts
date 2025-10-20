// src/app/services/meta-capi.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config';

export interface MetaContent {
  id: string;
  quantity: number;
  item_price?: number;
}

export interface MetaCapiPayload {
  event_id: string;
  value?: number;
  currency?: string;
  contents?: MetaContent[];
  client_user_agent: string;
  event_source_url?: string;
  order_id?: string;
  // NUEVO: señales extra
  fbp?: string;        // _fbp cookie
  fbc?: string;        // fb.1.<ts>.<fbclid> o _fbc cookie
  email?: string;      // sin hash (se hashea en el server)
  phone?: string;      // sin hash (se hashea en el server)
  external_id?: string; // tu userId/cliente (se hashea en el server)
  login_id?: string;   // si el usuario inició sesión con FB (poco común)
  test_event_code?: string;
}

@Injectable({ providedIn: 'root' })
export class MetaCapi {
  private base = `${environment.API_BASE_URL}/api/meta/capi`;

  constructor(private http: HttpClient) {}

  sendEvent(eventName: string, payload: MetaCapiPayload) {
    return this.http.post(`${this.base}/event/${eventName}`, payload);
  }
}
