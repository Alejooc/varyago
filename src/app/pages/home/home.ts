import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, PLATFORM_ID, Inject } from '@angular/core';
import { HomeService, HomeData } from '../../services/home';
import { CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarrouselProds } from "../../components/carrousel-prods/carrousel-prods";
import { register } from 'swiper/element/bundle';
import { SeoService } from '../../services/seo';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, CarrouselProds, NgOptimizedImage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Home implements OnInit {

  data: any = [];
  banners: any[] = [];
  loading = true;

  constructor(
    private homeService: HomeService,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Register Swiper web components only in browser
    if (isPlatformBrowser(this.platformId)) {
      register();
    }
  }

  ngOnInit(): void {
    // Set SEO for home page
    this.seoService.updateTags({
      title: 'VaryaGO: Variedad que llega contigo',
      description: 'Descubre una amplia gama de productos para el hogar. Muebles, decoración, electrodomésticos y más. Envío a todo Colombia.',
      keywords: 'varyago, tienda online, productos hogar, muebles, decoración, electrodomésticos, colombia',
      url: 'https://varyago.com',
      type: 'website'
    });

    this.homeService.getHomeData().subscribe({
      next: (res: any) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading home data:', err);
        this.loading = false;
      }
    });
  }
}
