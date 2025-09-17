import { Component, OnInit,AfterViewInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { ProductService } from '../../services/product';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from '../../services/cart';
import { SharedService } from '../../services/shared';
import { MetaPixel } from '../../services/meta-pixel';
import { MetaCapi } from '../../services/meta-capi';
import { Gtm } from '../../services/gtm';

declare var $: any; // Para usar jQuery
const uuid = () => crypto.randomUUID();
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product.html',
  styleUrl: './product.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Product implements OnInit {
  product!: any;
  selectedVariation: any = null;
  productForm!: FormGroup;

  colors: string[] = [];
  measures: string[] = [];
  hasColor = false;
  productTableHtml: string= '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder,
    private cartService: CartService,
    private sharedService: SharedService,
    private pixel: MetaPixel,
    private capi: MetaCapi,
    private gtm: Gtm
    
  ) {}
  ngAfterViewInit() {
    if ($.fn.elevateZoom) {
      $('#product-zoom').elevateZoom({
        gallery: 'product-zoom-gallery',
        galleryActiveClass: 'false',
        zoomType: 'inner',
        cursor: 'crosshair',
        zoomWindowFadeIn: 400,
        zoomWindowFadeOut: 400,
        responsive: true
      });

      $('.product-gallery-item').on('click',  (e: any) => {
        $('#product-zoom-gallery').find('a').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
      });

      const ez = $('#product-zoom').data('elevateZoom');

      $('#btn-product-gallery').on('click', function (e: any) {
        if ($.fn.magnificPopup) {
          $.magnificPopup.open({
            items: ez.getGalleryList(),
            type: 'image',
            gallery: {
              enabled: true
            },
            fixedContentPos: false,
            removalDelay: 600,
            closeBtnInside: false
          }, 0);
          e.preventDefault();
        }
      });
    }
  }
  ngOnInit(): void {
   this.route.params.subscribe(params => {
    const productId = params['id'];
    this.cargarProducto(productId); // mueves toda tu lógica aquí dentro
  });
   
  }
  cargarProducto(productId: string): void {
 let variations: any[] = [];
    this.productService.getProductById(productId).subscribe(res => {
      this.product = res;
      this.product.qty = 1; // Inicializar cantidad en 1
      variations = this.product.variaciones;
      let tableRows = '';

      if (Array.isArray(this.product.especificaciones) && this.product.especificaciones.length > 0) {
  tableRows += this.product.especificaciones
    .map((spec: any) => `
      <tr>
        <td class="text-center align-middle p-3"><strong>${spec.specname}</strong></td>
        <td class="text-center align-middle p-3">${spec.specvalue}</td>
      </tr>
    `)
    .join('');
}

if (Array.isArray(this.product.propiedades) && this.product.propiedades.length > 0) {
  tableRows += this.product.propiedades
    .map((prop: any) => `
      <tr>
        <td class="text-center align-middle p-3"><strong>${prop.propname}</strong></td>
        <td class="text-center align-middle p-3">${prop.provalue}</td>
      </tr>
    `)
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
      this.colors = [...new Set(variations.map(v => v.color).filter(c => !!c && c.trim() !== ''))];
      this.hasColor = this.colors.length > 0;

      // Crear formulario según necesidad
      this.productForm = this.fb.group({
        ...(this.hasColor ? { color: [''] } : {}),
        measure: ['']
      });

      // Si tiene color: al cambiar color, actualiza medidas disponibles
      if (this.hasColor) {
        this.productForm.get('color')!.valueChanges.subscribe(selectedColor => {
          this.measures = [
            ...new Set(
              variations
                .filter(v => v.color === selectedColor)
                .map(v => v.measure)
                .filter(Boolean)
            )
          ];
          this.productForm.patchValue({ measure: '' });
          this.selectedVariation = null;
        });
      } else {
        // Si no tiene color: mostrar todas las medidas
        this.measures = [
          ...new Set(variations.map(v => v.measure).filter(Boolean))
        ];
      }
      this.productForm.patchValue({ measure: this.measures[0] });
      // Ejecutar valueChanges manualmente al inicializar el valor de measure
      setTimeout(() => {
        this.productForm.updateValueAndValidity();
        
      });
      // Siempre: al cambiar medida (y color si aplica), buscar la variación
      this.productForm.valueChanges.subscribe(val => {
        this.selectedVariation = variations.find(v =>
          this.hasColor
            ? v.color === val.color && v.measure === val.measure
            : v.measure === val.measure
        );
         this.gtm.viewItem({
          currency: 'COP',
          value:Number(this.selectedVariation.price2),
          items: [{ item_id: this.selectedVariation.sku, item_name: this.product.name, price: this.selectedVariation.price2, quantity: this.product.qty }]
          });
          console.log('cambia la info');
          const eventId = uuid(); // o genera un string único
        this.pixel.viewContent({
          content_ids: [this.selectedVariation.sku],
          content_type: 'product',
          value: Number(this.selectedVariation.price2),   // precio visible
          currency: 'COP'
        },eventId);
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
      slug: this.product.slug
    });
  // 🔄 Notificar al Header para que se actualice
    this.sharedService.notifyCartUpdated();
    this.gtm.addToCart({
      currency: 'COP',
      value: Number(this.selectedVariation.price2) * this.product.qty,
      items: [{ item_id: this.selectedVariation.sku, item_name: this.product.name, price: Number(this.selectedVariation.price2), quantity: this.product.qty }]
    });
     const eventId = uuid(); // o genera un string único
    this.pixel.addToCart({
      content_ids: [this.selectedVariation.sku],
      content_type: 'product',
      value: Number(this.selectedVariation.price2), // valor del ítem agregado
      currency: 'COP',
      contents: [{ id: this.selectedVariation.sku, quantity: this.product.qty }]
    },eventId);
    this.capi.sendEvent('AddToCart', {
      event_id: eventId, // genera un ID único
      value: Number(this.selectedVariation.price2) * this.product.qty,
      currency: 'COP',
      contents: [{ id: this.selectedVariation.sku, quantity: this.product.qty, item_price: Number(this.selectedVariation.price2) }],
      client_user_agent: navigator.userAgent,
      event_source_url: window.location.href
    }).subscribe({
      next: res => console.log('CAPI AddToCart enviado', res),
      error: err => console.error('Error CAPI AddToCart', err)
    });
    
  }
  toNumber(v: any): number {
  return typeof v === 'number' ? v : Number(String(v).replace(/[^\d.]/g, ''));
}
}
