import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { FiltersService } from '../../services/filter-service';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('infiniteScrollTrigger', { static: false }) trigger!: ElementRef;

  private io?: IntersectionObserver;

  categoryId!: string;
  searchQuery: string = '';
  products: any[] = [];
  filters: any = {};
  availableFilters: any = {};
  page: number = 1;
  loading = false;
  hasMore = true;
  showFiltersMobile = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private filtersService: FiltersService,
    private seoService: SeoService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.searchQuery = params['id'] || '';
      this.fetchAvailableFilters();
      this.resetAndLoad();

      // Set SEO for search page
      this.updateSEO();
    });
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.teardownObserver();
  }

  // --- Observer helpers ---
  private setupObserver(): void {
    if (this.io) return;
    this.io = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          this.loadMore();
        }
      },
      {
        threshold: 0,
        root: null,
        rootMargin: '300px 0px'
      }
    );

    queueMicrotask(() => {
      if (this.trigger?.nativeElement) {
        this.io!.observe(this.trigger.nativeElement);
      }
    });
  }

  private teardownObserver(): void {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
  }

  private pauseObserverDuringReset(): void {
    this.teardownObserver();
  }

  private resumeObserver(): void {
    this.setupObserver();
  }

  // --- UI ---
  toggleBackdrop(open: boolean) {
    this.showFiltersMobile = open;
  }

  closeFilters() {
    this.showFiltersMobile = false;
    const collapse = document.getElementById('filtersAside');
    if (collapse?.classList.contains('show')) {
      collapse.classList.remove('show');
    }
  }

  // --- Data ---
  fetchAvailableFilters(): void {
    this.filtersService.getFilters(this.categoryId).subscribe({
      next: res => {
        this.availableFilters = res;
      },
      error: err => {
        console.error('❌ Error cargando filtros', err);
      }
    });
  }

  resetAndLoad(): void {
    this.pauseObserverDuringReset();
    this.products = [];
    this.page = 1;
    this.hasMore = true;
    this.loadMore(true);
  }

  applyFilters(filters: any): void {
    this.filters = filters;
    this.resetAndLoad();
  }

  truncateText(text: string, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  loadMore(isReset = false): void {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    this.productService.getProductsBySearch(this.categoryId, this.filters, this.page).subscribe({
      next: (res: any[]) => {
        const existing = new Set(this.products.map(p => p.id ?? p.slug ?? p._id));
        const unique = res.filter(p => !existing.has(p.id ?? p.slug ?? p._id));

        if (unique.length === 0) {
          this.hasMore = false;
        } else {
          this.products.push(...unique);
          this.page++;
        }

        this.loading = false;

        if (isReset) {
          this.resumeObserver();
        }
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        if (isReset) {
          this.resumeObserver();
        }
      }
    });
  }

  onFilterChange(type: string, value: any, checked: boolean) {
    if (!this.filters[type] && type !== 'order_By') this.filters[type] = [];

    if (type === 'order_By') {
      this.filters[type] = value;
    } else {
      if (checked) {
        if (!this.filters[type].includes(value)) this.filters[type].push(value);
      } else {
        this.filters[type] = this.filters[type].filter((v: any) => v !== value);
      }
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

  getOrderValue(event: Event): any {
    return (event.target as HTMLInputElement)?.value ?? 0;
  }

  onPriceChange(value: any) {
    this.filters.min_price = value;
    this.applyFilters(this.filters);
  }

  private updateSEO(): void {
    const query = this.searchQuery || 'productos';
    const resultsCount = this.products.length;

    this.seoService.updateTags({
      title: `Búsqueda: ${query} | VaryaGO`,
      description: `Resultados de búsqueda para "${query}". Encuentra ${resultsCount > 0 ? resultsCount + ' productos' : 'productos'} en VaryaGO con envío a todo Colombia.`,
      keywords: `${query}, búsqueda, varyago, tienda online, colombia`,
      url: `https://varyago.com/search/${encodeURIComponent(query)}`,
      type: 'website'
    });
  }
}
