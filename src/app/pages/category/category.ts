import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { FiltersService } from '../../services/filter-service';
import { CommonModule } from '@angular/common';
import { ZoomCleanerService } from '../../services/zoom-cleaner';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('infiniteScrollTrigger', { static: false }) trigger!: ElementRef;

  private io?: IntersectionObserver; // <-- referencia del observer

  categoryId!: string;
  products: any[] = [];
  filters: any = {};
  availableFilters: any = {};
  page = 1;
  loading = false;
  hasMore = true;
  showFiltersMobile = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private filtersService: FiltersService,
    private zoomCleaner: ZoomCleanerService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.fetchAvailableFilters();
      this.filters = {};
      this.resetAndLoad(); // carga inicial
    });
  }

  ngAfterViewInit(): void {
    this.setupObserver(); // crea el observer UNA vez
  }

  ngOnDestroy(): void {
    this.teardownObserver(); // desconecta al destruir
  }

  // --- Observer helpers ---
  private setupObserver(): void {
    if (this.io) return; // ya existe
    this.io = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          this.loadMore();
        }
      },
      {
        threshold: 0,             // dispara cuando apenas toca
        root: null,               // viewport
        rootMargin: '300px 0px'   // pre-carga con margen
      }
    );

    // Si el ViewChild aún no está, lo observamos en el próximo microtask
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

  // Llamar esto cuando reinicias la lista (filtros/categoría)
  private pauseObserverDuringReset(): void {
    // evitar que dispare mientras reseteas y haces la 1a carga
    this.teardownObserver();
  }

  private resumeObserver(): void {
    // vuelve a observar después de completar la carga
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
      next: res => { this.availableFilters = res; },
      error: err => { console.error('❌ Error cargando filtros', err); }
    });
  }

  resetAndLoad(): void {
    // Pausamos el observer para que no dispare inmediatamente
    this.pauseObserverDuringReset();

    this.products = [];
    this.page = 1;
    this.hasMore = true;

    // Hacemos la primera carga
    this.loadMore(true); // true = es reset
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

    this.productService.getProductsByCategory(this.categoryId, this.filters, this.page).subscribe({
      next: (res: any[]) => {
        // Si backend devuelve duplicados entre páginas, los filtramos:
        const existing = new Set(this.products.map(p => p.id ?? p.slug ?? p._id));
        const unique = res.filter(p => !existing.has(p.id ?? p.slug ?? p._id));

        if (unique.length === 0) {
          // Si no llegaron nuevos, asumimos que no hay más
          this.hasMore = false;
        } else {
          this.products.push(...unique);
          this.page++;
        }

        this.loading = false;

        // Tras la primera carga del reset, reanudamos el observer
        if (isReset) {
          this.resumeObserver();
        }
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        if (isReset) {
          // Aun así reanudamos para que el usuario pueda intentar de nuevo al hacer scroll
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
}
