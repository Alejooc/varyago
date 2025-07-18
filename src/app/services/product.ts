import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category_id: string;
  color?: string;
  size?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = `${environment.API_BASE_URL}/api/products`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener productos por categoría con filtros y paginación
   */
  getProductsByCategory(
    categoryId: string,
    filters: any = {},
    page: number = 1
  ): Observable<Product[]> {
    let params = new HttpParams()
      .set('category', categoryId)
      .set('page', page);

    for (const key in filters) {
      if (filters[key] != null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    }

    return this.http.get<Product[]>(this.baseUrl, { params });
  }
  getProductsBySearch(
    categoryId: string,
    filters: any = {},
    page: number = 1
  ): Observable<Product[]> {
    let params = new HttpParams()
      .set('category', categoryId)
      .set('page', page);

    for (const key in filters) {
      if (filters[key] != null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    }

    return this.http.get<Product[]>(this.baseUrl+'/search', { params });
  }

  /**
   * Obtener un solo producto por ID
   */
  getProductById(id: string): Observable<Product> {
    const params = new HttpParams().set('slug', id);
    return this.http.get<Product>(this.baseUrl+'/detail', { params: params});

  }

  /**
   * Obtener productos destacados, ofertas, etc.
   */
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/featured`);
  }
}
