import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from '../../services/cart';

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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.params['id'];
    let variations: any[] = [];
    this.productService.getProductById(productId).subscribe(res => {
      this.product = res;

      variations = this.product.variaciones;

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

    console.log('🛒 Agregado al carrito:', this.selectedVariation);
  }
}
