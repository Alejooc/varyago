import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../config";

@Injectable({ providedIn: 'root' })
export class Service {
  private readonly API = `${environment.API_BASE_URL}/api/widgets`;

  constructor(private http: HttpClient) {}
  getProducts(prods: any=[]): Observable<any> {
    const payload = { elements: prods };
    return this.http.post<any>(`${this.API}/crr`, payload);
  }
}
