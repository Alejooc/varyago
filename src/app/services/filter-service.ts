// src/app/services/filters.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../config";
@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  private readonly API_URL = `${environment.API_BASE_URL}/api/filters`;

  constructor(private http: HttpClient) {}

  getFilters(categorySlug: string): Observable<any> {
    const params = new HttpParams().set('category', categorySlug);
    return this.http.get<any>(this.API_URL, { params });
  }
}
