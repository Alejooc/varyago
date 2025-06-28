import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private readonly baseUrl = "/api/home";

  constructor(private http: HttpClient) {}

  getGral(): Observable<any> {
    return this.http.get<any>(this.baseUrl+'/gral');
  }
}
