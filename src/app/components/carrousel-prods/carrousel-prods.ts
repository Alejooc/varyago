import { CommonModule,NgOptimizedImage } from '@angular/common';
import {
  Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy,
  ViewChild, ElementRef, ChangeDetectorRef, NgZone
} from '@angular/core';
import { Service } from './service';
import { RouterModule } from '@angular/router';

declare const $: any;

type CarouselVariant = 'hot' | 'cards' | 'thumbs';

@Component({
  selector: 'app-carrousel-prods',
  standalone: true,
  imports: [CommonModule,RouterModule,NgOptimizedImage],
  templateUrl: './carrousel-prods.html',
  styleUrl: './carrousel-prods.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarrouselProds implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() show_title: boolean = true;
  @Input() products: any[] = [];     // ids o payload que tu service usa
  @Input() variant: CarouselVariant = 'cards';
  @Input() autoplay = false;
  @Input() perView = 1;

  elements: any[] = [];

  @ViewChild('owlEl', { static: false }) owlEl!: ElementRef<HTMLElement>;
  private initialized = false;

  constructor(
    private service: Service,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    // Carga de datos
    this.service.getProducts(this.products).subscribe({
      next: (res) => {
        this.elements = res || [];
        this.cdr.markForCheck();                  // OnPush: notifica cambio
        // espera al render del *ngIf y *ngFor antes de iniciar Owl
        setTimeout(() => this.initOrRefresh(), 0);
      },
      error: (err) => {
        console.error('❌ Error carrousel:', err);
        this.elements = [];
        this.cdr.markForCheck();
        this.destroyOwl();
      }
    });

    // Si este carrusel vive dentro de tabs, refresca al mostrarse
    $(document).on('shown.bs.tab.carprod', 'a[data-toggle="tab"]', () => this.initOrRefresh());
  }

  ngOnDestroy(): void {
    $(document).off('.carprod');
    this.destroyOwl();
  }

  // ---- Owl helpers ----
  private initOrRefresh(): void {
    if (!this.owlEl || !this.elements?.length) return;

    this.zone.runOutsideAngular(() => {
      const $el = $(this.owlEl.nativeElement);

      // Lee opciones desde data-owl-options para respetar tu HTML
      const raw = $el.attr('data-owl-options');
      let opts: any;
      try {
        opts = raw ? JSON.parse(raw) : {};
      } catch {
        opts = {};
      }
      // Fallbacks suaves sin pisar tus data-attrs
      opts = Object.assign(
        {
          loop: false,
          margin: 20,
          nav: false,
          dots: true,
          autoplay: this.autoplay
        },
        opts
      );

      if ($el.hasClass('owl-loaded')) {
        $el.trigger('refresh.owl.carousel');
      } else {
        $el.owlCarousel(opts);
        this.initialized = true;
        // un micro-refresh ayuda con alturas/anchos
        setTimeout(() => $el.trigger('refresh.owl.carousel'), 0);
      }
    });
  }

  private destroyOwl(): void {
    if (!this.owlEl) return;
    const $el = $(this.owlEl.nativeElement);
    if ($el.hasClass('owl-loaded')) {
      $el.trigger('destroy.owl.carousel');
      // limpieza para volver al HTML plano
      $el.find('.owl-stage-outer').children().unwrap();
      $el.removeClass('owl-loaded owl-center owl-text-select-on');
    }
    this.initialized = false;
  }
truncateText(text: string, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
  // trackBy para que no se desordene al cambiar elements
  trackById = (_: number, it: any) => it?.id ?? _;
}
