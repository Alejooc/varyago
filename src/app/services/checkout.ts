import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../config";

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly API = `${environment.API_BASE_URL}/api/checkout`;

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/departments`);
  }

  getCities(departmentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/cities/${departmentId}`);
  }
  getPaymentMethods(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/payment-methods`);
  }

  getShippingInfo(cityId: string, total: number, cart: any): Observable<any> {
    const payload = { city: cityId, total, cart };
    return this.http.post<any>(`${this.API}/shipping`, payload);
  }

  validateCoupon(code: string): Observable<any> {
    return this.http.post<any>(`${this.API}/coupon/validate`, { code });
  }

  submitOrder(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API}/order`, payload);
  }
}
