import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly API = '/api';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/departments`);
  }

  getCities(departmentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/cities?department=${departmentId}`);
  }

  getShippingInfo(cityId: string): Observable<any> {
    return this.http.get<any>(`${this.API}/shipping?city=${cityId}`);
  }

  validateCoupon(code: string): Observable<any> {
    return this.http.post<any>(`${this.API}/coupon/validate`, { code });
  }

  submitOrder(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API}/order`, payload);
  }
}
