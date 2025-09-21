// product.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from '../../services/product';

@Injectable({ providedIn: 'root' })
export class ProductResolver implements Resolve<any> {
  constructor(private productSvc: ProductService) {}
  resolve(route: ActivatedRouteSnapshot) {
    const slug = route.paramMap.get('id')!;
    return this.productSvc.getProductById(slug); // devuelve { name, shortDescription, imageUrl, price, ... }
  }
}
