// src/app/services/cliente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../config";

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private API_URL = `${environment.API_BASE_URL}/api/account`; // actualiza esto

  constructor(private http: HttpClient) {}
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
  }
  getPerfil(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  getDirecciones(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/direcciones`, {
      headers: this.getAuthHeaders()
    });
  }

  getOrdenes(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/ordenes`, {
      headers: this.getAuthHeaders()
    });
  }
}
