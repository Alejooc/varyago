import {
  Component,
  OnInit,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
} from '@angular/core';
import { ProductService } from '../../services/product';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from '../../services/cart';
import { SharedService } from '../../services/shared';
import { MetaPixel } from '../../services/meta-pixel';
import { MetaCapi } from '../../services/meta-capi';
import { Gtm } from '../../services/gtm';
import { CarrouselProds } from '../../components/carrousel-prods/carrousel-prods';
import { getFbp, getFbc } from '../../helpers/facebook-ids';
import { ProductTrustbar } from '../../components/product-trustbar/product-trustbar/product-trustbar';
import { SeoService } from '../../services/seo';


const uuid = () => crypto.randomUUID();
const isMobile = () =>
  window.matchMedia('(pointer: coarse), (max-width: 991px)').matches;
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CarrouselProds, ProductTrustbar],
  templateUrl: './product.html',
  styleUrls: ['./product.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Product implements OnInit {
  product!: any;
  productSeo: any;
  selectedVariation: any = null;
  productForm!: FormGroup;

  colors: string[] = [];
  measures: string[] = [];
  hasColor = false;
  productTableHtml: string = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder,
    private cartService: CartService,
    private sharedService: SharedService,
    private pixel: MetaPixel,
    private capi: MetaCapi,
    private gtm: Gtm,
    private title: Title,
    private meta: Meta,
    private seoService: SeoService,
    @Inject(DOCUMENT) private doc: Document
  ) {
  }
  ngAfterViewInit() {
    // Simple native image gallery without heavy jQuery plugins
    this.initImageGallery();

    // Initialize Bootstrap tabs manually after a short delay to ensure Bootstrap is loaded
    setTimeout(() => {
      this.initBootstrapTabs();
    }, 100);
  }

  private initBootstrapTabs() {
    // Try to initialize Bootstrap 5 tabs manually
    const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');

    if (tabElements.length === 0) {
      return;
    }

    // Check if Bootstrap is available
    if (typeof (window as any).bootstrap === 'undefined') {
      this.initFallbackTabs();
      return;
    }

    // Initialize each tab with Bootstrap
    tabElements.forEach((tabEl) => {
      tabEl.addEventListener('click', (e) => {
        e.preventDefault();

        // Get the target tab pane
        const target = tabEl.getAttribute('data-bs-target');
        if (!target) return;

        // Remove active from all tabs and panes
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.remove('show', 'active');
        });

        // Add active to clicked tab
        tabEl.classList.add('active');

        // Show target pane
        const targetPane = document.querySelector(target);
        if (targetPane) {
          targetPane.classList.add('show', 'active');
        }
      });
    });
  }

  private initFallbackTabs() {
    // Fallback tab handling if Bootstrap is not available
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');

    tabLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        const target = link.getAttribute('data-bs-target');
        if (!target) return;

        // Remove active from all
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => {
          p.classList.remove('show', 'active');
        });

        // Add active to current
        link.classList.add('active');
        const pane = document.querySelector(target);
        if (pane) {
          pane.classList.add('show', 'active');
        }
      });
    });
  }

  private initImageGallery() {
    // Wait for Angular to render the gallery
    setTimeout(() => {
      const galleryThumbs = document.querySelectorAll('.product-gallery-item');
      const mainImage = document.querySelector('#product-zoom') as HTMLImageElement;

      if (!mainImage || !galleryThumbs.length) {
        return;
      }

      galleryThumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const link = thumb as HTMLAnchorElement;
          const newSrc = link.getAttribute('data-image') || '';

          if (newSrc && mainImage) {
            mainImage.src = newSrc;

            // Update active state
            galleryThumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
          }
        });
      });
    }, 300);
  }

  // Simple zoom on hover for desktop
  onImageMouseMove(event: MouseEvent, img: HTMLImageElement) {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on touch devices

    const rect = img.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(1.5)';
    img.style.cursor = 'zoom-in';
  }

  onImageMouseLeave(img: HTMLImageElement) {
    img.style.transform = 'scale(1)';
    img.style.cursor = 'default';
  }



  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['id'];

      this.cargarProducto(productId); // mueves toda tu lógica aquí dentro
    });
  }

  cargarProducto(productId: string): void {
    let variations: any[] = [];
    this.productService.getProductById(productId).subscribe((res) => {
      this.product = res;
      this.product.qty = 1; // Inicializar cantidad en 1
      variations = this.product.variaciones;
      let tableRows = '';

      if (
        Array.isArray(this.product.especificaciones) &&
        this.product.especificaciones.length > 0
      ) {
        tableRows += this.product.especificaciones
          .map(
            (spec: any) => `
      <tr>
        <td class="text-center align-middle p-3"><strong>${spec.specname}</strong></td>
        <td class="text-center align-middle p-3">${spec.specvalue}</td>
      </tr>
    `
          )
          .join('');
      }

      if (
        Array.isArray(this.product.propiedades) &&
        this.product.propiedades.length > 0
      ) {
        tableRows += this.product.propiedades
          .map(
            (prop: any) => `
      <tr>
        <td class="text-center align-middle p-3"><strong>${prop.propname}</strong></td>
        <td class="text-center align-middle p-3">${prop.provalue}</td>
      </tr>
    `
          )
          .join('');
      }

      if (!tableRows) {
        tableRows = `<tr><td colspan="2" class="text-center text-muted p-3">N/A</td></tr>`;
      }

      this.productTableHtml = `
  <div class="table-responsive">
    <table class="table table-striped table-bordered table-hover shadow-sm rounded text-center">
      <thead class="thead-white bg-primary text-white">
        <tr>
          <th class="align-middle p-3 text-white">Característica</th>
          <th class="align-middle p-3 text-white">Detalle</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>
`;

      // Update SEO meta tags
      this.seoService.updateTags({
        title: this.product.name,
        description: this.truncateDesc(this.product.description, 160),
        keywords: this.product.keywords || `${this.product.name}, comprar online, varyago`,
        image: this.product.images?.[0]?.url || '',
        url: `https://varyago.com/product/${this.product.slug}`,
        type: 'product',
        price: variations[0]?.price2 || this.product.price,
        currency: 'COP',
        availability: this.product.stock > 0 ? 'in stock' : 'out of stock'
      });

      // Add Product Schema.org markup
      this.seoService.addProductSchema({
        name: this.product.name,
        description: this.product.description,
        images: this.product.images,
        sku: variations[0]?.sku || this.product.id,
        price: variations[0]?.price2 || this.product.price,
        stock: this.product.stock,
        slug: this.product.slug,
        brand: this.product.brand
      });


      // Detectar si hay colores reales
      this.colors = [
        ...new Set(
          variations.map((v) => v.color).filter((c) => !!c && c.trim() !== '')
        ),
      ];
      this.hasColor = this.colors.length > 0;

      // Crear formulario según necesidad
      this.productForm = this.fb.group({
        ...(this.hasColor ? { color: [''] } : {}),
        measure: [''],
      });

      // Si tiene color: al cambiar color, actualiza medidas disponibles
      if (this.hasColor) {
        this.productForm
          .get('color')!
          .valueChanges.subscribe((selectedColor) => {
            this.measures = [
              ...new Set(
                variations
                  .filter((v) => v.color === selectedColor)
                  .map((v) => v.measure)
                  .filter(Boolean)
              ),
            ];
            this.productForm.patchValue({ measure: '' });
            this.selectedVariation = null;
          });
      } else {
        // Si no tiene color: mostrar todas las medidas
        this.measures = [
          ...new Set(variations.map((v) => v.measure).filter(Boolean)),
        ];
      }
      this.productForm.patchValue({ measure: this.measures[0] });
      // Ejecutar valueChanges manualmente al inicializar el valor de measure
      setTimeout(() => {
        this.productForm.updateValueAndValidity();
      });
      // Siempre: al cambiar medida (y color si aplica), buscar la variación
      this.productForm.valueChanges.subscribe((val) => {
        this.selectedVariation = variations.find((v) =>
          this.hasColor
            ? v.color === val.color && v.measure === val.measure
            : v.measure === val.measure
        );
        this.gtm.viewItem({
          currency: 'COP',
          value: Number(this.selectedVariation.price2),
          items: [
            {
              item_id: this.selectedVariation.sku,
              item_name: this.product.name,
              price: this.selectedVariation.price2,
              quantity: this.product.qty,
            },
          ],
        });
        const eventId = uuid(); // o genera un string único
        this.pixel.viewContent(
          {
            content_ids: [this.selectedVariation.sku],
            content_type: 'product',
            value: Number(this.selectedVariation.price2), // precio visible
            currency: 'COP',
          },
          eventId
        );
      });
    });
  }

  selectColor(color: string): void {
    this.productForm.patchValue({ color });
  }

  onQuantityChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const qty = Number(input.value);
    this.product.qty = qty;
    console.log('Cantidad cambiada:', qty);
  }
  addToCart() {
    if (!this.selectedVariation) {
      alert('❌ Selección inválida');
      return;
    }

    this.cartService.addToCart({
      id: this.product.id,
      name: this.product.name,
      price: parseFloat(this.selectedVariation.price2),
      quantity: this.product.qty,
      variationId: this.selectedVariation.id,
      variationSku: this.selectedVariation.sku,
      image: this.product.images?.[0]?.url,
      measure: this.selectedVariation.measure,
      color: this.selectedVariation.color,
      slug: this.product.slug,
    });
    // 🔄 Notificar al Header para que se actualice
    this.sharedService.notifyCartUpdated();
    this.gtm.addToCart({
      currency: 'COP',
      value: Number(this.selectedVariation.price2) * this.product.qty,
      items: [
        {
          item_id: this.selectedVariation.sku,
          item_name: this.product.name,
          price: Number(this.selectedVariation.price2),
          quantity: this.product.qty,
        },
      ],
    });
    const eventId = uuid(); // o genera un string único
    this.pixel.addToCart(
      {
        content_ids: [this.selectedVariation.sku],
        content_type: 'product',
        value: Number(this.selectedVariation.price2), // valor del ítem agregado
        currency: 'COP',
        contents: [
          { id: this.selectedVariation.sku, quantity: this.product.qty },
        ],
      },
      eventId
    );
    this.capi.sendEvent('AddToCart', {
      event_id: eventId,
      value: Number(this.selectedVariation.price2) * this.product.qty,
      currency: 'COP',
      contents: [{ id: this.selectedVariation.sku, quantity: this.product.qty, item_price: Number(this.selectedVariation.price2) }],
      client_user_agent: navigator.userAgent,
      event_source_url: window.location.href,

      // señales extra
      fbp: getFbp(),
      fbc: getFbc(),
      // Si tienes consentimiento y datos del cliente:
      //email: this.session?.user?.email,
      //phone: this.session?.user?.phone,
      //external_id: String(this.session?.user?.id)
    }).subscribe({
      next: (res) => console.log('CAPI AddToCart enviado', res),
      error: (err) => console.error('Error CAPI AddToCart', err),
    });
    /*this.capi
      .sendEvent('AddToCart', {
        event_id: eventId, // genera un ID único
        value: Number(this.selectedVariation.price2) * this.product.qty,
        currency: 'COP',
        contents: [
          {
            id: this.selectedVariation.sku,
            quantity: this.product.qty,
            item_price: Number(this.selectedVariation.price2),
          },
        ],
        client_user_agent: navigator.userAgent,
        event_source_url: window.location.href,
      })
      .subscribe({
        next: (res) => console.log('CAPI AddToCart enviado', res),
        error: (err) => console.error('Error CAPI AddToCart', err),
      });*/
  }

  truncateDesc(text: string, maxLength: number): string {
    if (!text) return '';
    const stripped = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return stripped.length > maxLength
      ? stripped.substring(0, maxLength) + '...'
      : stripped;
  }

  toNumber(v: any): number {
    return typeof v === 'number' ? v : Number(String(v).replace(/[^\d.]/g, ''));
  }
}

