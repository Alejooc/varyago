import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../config";

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private readonly baseUrl =`${environment.API_BASE_URL}/api/home`;

  constructor(private http: HttpClient) {}

  getGral(): Observable<any> {
    return this.http.get<any>(this.baseUrl+'/gral');
  }
}
