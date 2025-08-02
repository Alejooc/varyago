import { Injectable } from '@angular/core';
import { environment } from '../config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private readonly API = `${environment.API_BASE_URL}/api/confirm`;

  constructor(private http: HttpClient) {}

  getOrderDetails(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.API}/order`, { orderId });
  }
  
}
