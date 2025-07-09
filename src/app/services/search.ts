import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private baseUrl = '/api/products';

  constructor(private http: HttpClient) {}

  buscarProductos(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/buscar/?busqueda=${encodeURIComponent(query)}`);
  }
}
