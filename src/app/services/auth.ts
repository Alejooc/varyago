import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../config';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private readonly API_URL = `${environment.API_BASE_URL}/auth`;
  private readonly API_URL = `${environment.API_BASE_URL}/api/auth`;

  private readonly TOKEN_KEY = environment.TOKEN_KEY;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.API_URL}/login`, { email, password });
  }
register(name:string,email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.API_URL}/register`, { name,email, password });
  }
  storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
