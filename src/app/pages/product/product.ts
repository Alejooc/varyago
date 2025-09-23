import {
  Component,
  OnInit,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
} from '@angular/core';
import { ProductService } from '../../services/product';
import { ActivatedRoute,RouterModule  } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from '../../services/cart';
import { SharedService } from '../../services/shared';
import { MetaPixel } from '../../services/meta-pixel';
import { MetaCapi } from '../../services/meta-capi';
import { Gtm } from '../../services/gtm';

declare var $: any; // Para usar jQuery
const uuid = () => crypto.randomUUID();
const isMobile = () =>
  window.matchMedia('(pointer: coarse), (max-width: 991px)').matches;
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule ],
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
    @Inject(DOCUMENT) private doc: Document
  ) {
  }
 ngAfterViewInit() {
  if (!$.fn) return;

  const $img = $('#product-zoom');                 // IMG principal
  const $gallery = $('#product-zoom-gallery');     // Contenedor de miniaturas

  const isTouch = () =>
    window.matchMedia('(pointer: coarse), (max-width: 991px)').matches;

  const destroyZoom = () => {
    const ez = $img.data('elevateZoom');
    if (ez && ez.destroy) ez.destroy();
    $('.zoomContainer').remove();
    $img.removeData('elevateZoom');
    $img.off('.elevateZoom');
    $img.css('touch-action', 'pan-y');
  };

  const initDesktopNoZoom = () => {
    destroyZoom();
    if ($.fn.elevateZoom) {
      $img.elevateZoom({
        zoomEnabled: false,
        gallery: 'product-zoom-gallery',
        galleryActiveClass: 'active',
        responsive: true,
        scrollZoom: false
      });
    }
  };

  const setup = () => {
    if (isTouch()) {
      // Móvil: nada de plugin para no bloquear el scroll
      destroyZoom();
    } else {
      // Desktop: plugin solo para gestionar galería (sin zoom)
      initDesktopNoZoom();
    }
  };

  // ---- SWAP robusto (funciona con y sin plugin) ----
  const swapImage = (aEl: HTMLElement) => {
    const $a = $(aEl);

    // Toma las rutas de forma tolerante
    const medium =
      $a.attr('data-image') ||
      $a.find('img').attr('src') ||
      $a.attr('href') || '';
    const big =
      $a.attr('data-zoom-image') ||
      $a.attr('href') ||
      medium;

    // Marca activa
    $gallery.find('a').removeClass('active');
    $a.addClass('active');

    const ez = $img.data('elevateZoom');

    if (ez && typeof ez.swaptheimage === 'function') {
      // Desktop con plugin: usa su API
      ez.swaptheimage(medium, big);
    } else {
      // Móvil (o sin plugin): cambia atributos directamente
      $img.attr('src', medium);
      $img.attr('data-zoom-image', big);

      // Si tu imagen principal está envuelta en un <a>, actualiza su href
      const $wrapLink = $img.closest('a');
      if ($wrapLink.length) $wrapLink.attr('href', big);

      // Si usas <picture>, actualiza sources (opcional)
      const $picture = $img.closest('picture');
      if ($picture.length) {
        $picture.find('source').each((_: any, s: any) => {
          const $s = $(s);
          const srcset = $s.attr('data-srcset') || $s.attr('srcset');
          if (srcset) $s.attr('srcset', srcset.replace(/[^ ,]+/g, medium));
        });
      }
    }
  };

  // ---- Delegación de eventos (sirve aunque Angular re-renderice) ----
  $gallery.off('click.vg').on('click.vg', 'a',  (e: any) => {
    e.preventDefault();
    swapImage(e.currentTarget);
  });

  // ---- Popup: arma lista con o sin elevateZoom ----
  $('#btn-product-gallery').off('click.vg').on('click.vg', (e: any) => {
    e.preventDefault();
    if (!$.fn.magnificPopup) return;

    const ez = $img.data('elevateZoom');
    const items = ez
      ? ez.getGalleryList()
      : $gallery.find('a').map( () => {
          return { src: $(this).attr('href')! };
        }).get();

    $.magnificPopup.open(
      {
        items,
        type: 'image',
        gallery: { enabled: true },
        fixedContentPos: false,
        removalDelay: 600,
        closeBtnInside: false
      },
      0
    );
  });

  // ---- Inicializa y re-evalúa en resize/orientación ----
  const kick = () => setTimeout(setup, 0); // deja que Angular pinte
  kick();
  let t: any;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(setup, 200); });
  window.addEventListener('orientationchange', () => setTimeout(setup, 200));
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
  truncateDesc(text: string, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
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
    this.capi
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
      });
  }
  toNumber(v: any): number {
    return typeof v === 'number' ? v : Number(String(v).replace(/[^\d.]/g, ''));
  }
}
