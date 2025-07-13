import { Component, OnInit,AfterViewInit } from '@angular/core';
import { ProductService } from '../../services/product';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from '../../services/cart';
import { SharedService } from '../../services/shared';
declare var $: any; // Para usar jQuery

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
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
    private sharedService: SharedService
    
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
          <th class="align-middle p-3 text-white">Características</th>
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

      // Siempre: al cambiar medida (y color si aplica), buscar la variación
      this.productForm.valueChanges.subscribe(val => {
        this.selectedVariation = variations.find(v =>
          this.hasColor
            ? v.color === val.color && v.measure === val.measure
            : v.measure === val.measure
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

  addToCart() {
    if (!this.selectedVariation) {
      alert('❌ Selección inválida');
      return;
    }

    this.cartService.addToCart({
      id: this.product.id,
      name: this.product.name,
      price: parseFloat(this.selectedVariation.price2),
      quantity: 1,
      variationId: this.selectedVariation.id,
      variationSku: this.selectedVariation.sku,
      image: this.product.images?.[0]?.url,
      measure: this.selectedVariation.measure,
      color: this.selectedVariation.color
    });
  // 🔄 Notificar al Header para que se actualice
    this.sharedService.notifyCartUpdated();

    // Mostrar la cart-dropdown manualmente
  const dropdown = document.querySelector('.cart-dropdown');
  if (dropdown) {
    dropdown.classList.add('show');

    // Ocultarla después de 2 segundos
    setTimeout(() => {
      dropdown.classList.remove('show');
    }, 2000);
  }
    console.log('🛒 Agregado al carrito:', this.selectedVariation);
  }
}
