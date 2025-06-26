import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { FiltersService } from '../../services/filter-service'; // Nuevo servicio importado
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category implements OnInit {
  categoryId!: string;
  products: any[] = [];
  filters: any = {};
  availableFilters: any = {}; // 🎯 Filtros dinámicos desde el backend
  page: number = 1;
  loading = false;
  hasMore = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private filtersService: FiltersService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.fetchAvailableFilters();  // Carga los filtros posibles
      
      this.resetAndLoad();           // Carga productos
    });
  }

  fetchAvailableFilters(): void {
    this.filtersService.getFilters(this.categoryId).subscribe({
      next: res => {
        console.log(res);
        
        this.availableFilters = res;
      },
      error: err => {
        console.error('❌ Error cargando filtros', err);
      }
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
  truncateText(text: string, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
  loadMore(): void {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    this.productService.getProductsByCategory(this.categoryId, this.filters, this.page).subscribe({
      next: (res: any[]) => {
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
  onFilterChange(type: string, value: any, checked: boolean) {
    if (!this.filters[type]) this.filters[type] = [];
    if (checked) {
      this.filters[type].push(value);
    } else {
      this.filters[type] = this.filters[type].filter((v: any) => v !== value);
    }
    this.applyFilters(this.filters);
  }

  toggleColor(value: string) {
    this.filters.color = this.filters.color || [];
    const i = this.filters.color.indexOf(value);
    if (i > -1) {
      this.filters.color.splice(i, 1);
    } else {
      this.filters.color.push(value);
    }
    this.applyFilters(this.filters);
  }
  getCheckedValue(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }
  getRangeValue(event: Event): number {
    return Number((event.target as HTMLInputElement)?.value) ?? 0;
  }
  onPriceChange(value: any) {
    this.filters.min_price = value;
    this.applyFilters(this.filters);
  }

}
