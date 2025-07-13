import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {  environment} from "../config";
@Injectable({
    providedIn: 'root'
})
export class HeaderService {
    private readonly API = `${environment.API_BASE_URL}/api/home`;

    constructor(private http: HttpClient) {}

    getDepartments(): Observable<any[]> {
        return this.http.get<any[]>(this.API+'/menu');
    }
}