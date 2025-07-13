import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../config";

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private readonly baseUrl = `${environment.API_BASE_URL}/api/home`;

  constructor(private http: HttpClient) {}

  getPage(page:string): Observable<any> {
    const params = new HttpParams().set('slug', page);
    return this.http.get<any>(this.baseUrl+'/pages', { params: params});
  }
}
