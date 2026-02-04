import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  Component, Input, ChangeDetectionStrategy, OnInit,
  ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { Service } from './service';
import { RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';

type CarouselVariant = 'hot' | 'cards' | 'thumbs';

@Component({
  selector: 'app-carrousel-prods',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './carrousel-prods.html',
  styleUrl: './carrousel-prods.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CarrouselProds implements OnInit {
  @Input() title: string = '';
  @Input() show_title: boolean = true;
  @Input() products: any[] = [];
  @Input() variant: CarouselVariant = 'cards';
  @Input() autoplay = true;
  @Input() perView = 1;

  elements: any[] = [];

  constructor(
    private service: Service,
    private cdr: ChangeDetectorRef
  ) {
    // Register Swiper web components
    register();
  }

  ngOnInit(): void {
    // Load product data
    this.service.getProducts(this.products).subscribe({
      next: (res) => {
        this.elements = res || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Error loading carousel products:', err);
        this.elements = [];
        this.cdr.markForCheck();
      }
    });
  }

  truncateText(text: string, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  // trackBy for better performance
  trackById = (_: number, it: any) => it?.id ?? _;
}

