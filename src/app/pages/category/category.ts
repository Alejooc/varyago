import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-category',
  imports: [CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category {
  categoryId!: number;
  products: any[] = [];
  filters: any = {};
  page: number = 1;
  loading = false;
  hasMore = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id'];
      this.resetAndLoad();
    });
  }

  resetAndLoad(): void {
    this.products = [];
    this.page = 1;
    this.hasMore = true;
    this.loadMore();
  }

  applyFilters(filters: any): void {
    this.filters = filters;
    this.resetAndLoad();
  }

  loadMore(): void {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    this.productService.getProductsByCategory(this.categoryId, this.filters, this.page).subscribe({
      next: (res: string | any[]) => {
        if (res.length === 0) this.hasMore = false;
        this.products.push(...res);
        this.page++;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
