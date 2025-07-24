import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private cartUpdated = new Subject<void>();
  cartUpdated$ = this.cartUpdated.asObservable();

  notifyCartUpdated() {
    this.cartUpdated.next();
  }
  toggleCart() {
    this.notifyCartUpdated();
  }
}
