import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../config";
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private baseUrl = `${environment.API_BASE_URL}/api/products`;

  constructor(private http: HttpClient) {}

  buscarProductos(query: string): Observable<any> {
    const params = new HttpParams().set('busqueda', query);
    return this.http.get<any>(this.baseUrl+'/buscar', { params });
  }
}
