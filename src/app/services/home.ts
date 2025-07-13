import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config';
import { Observable } from 'rxjs';

export interface HomeData {
  layaout: any[];
  
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly baseUrl = `${environment.API_BASE_URL}/api/home`;

  constructor(private http: HttpClient) {}

  getHomeData(): Observable<HomeData> {
    return this.http.get<HomeData>(this.baseUrl);
  }
}
