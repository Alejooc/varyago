import { Component,OnInit  } from '@angular/core';
import { ProductService} from '../../services/product';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-product',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class Product implements OnInit {
  product!: any; // Replace 'any' with the actual type of the product if known, e.g., ProductType[]
  selectedVariation: any;
  productForm!: FormGroup;
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.params['id'];
    this.productService.getProductById(productId).subscribe(res => {
      this.product = res;
      this.setupForm();
    });
  }
  setupForm() {
    this.productForm = this.fb.group({
      variationId: [null]
    });
  }

  onVariationChange(variationId: number) {
    //this.selectedVariation = this.product.variations.find(v => v.id === +variationId);
  }

  addToCart() {
    console.log('🛒 Agregado al carrito:', this.selectedVariation);
  }

}
