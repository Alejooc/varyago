import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { CheckoutService } from '../../services/checkout';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
 checkoutForm!: FormGroup;
  cartItems: any[] = [];
  subtotal: number = 0;
  total: number = 0;
  shippingCost: number = 0;
  departments: any[] = [];
  cities: any[] = [];
  paymentMethods: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      doctype: ['cc', Validators.required],
      document: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address1: ['', Validators.required],
      address2: [''],
      department: ['', Validators.required],
      city: ['', Validators.required],
      notes: ['']
    });

    this.cartItems = this.cartService.getCart();
    this.subtotal = this.cartService.getTotalPrice();
    this.total = this.subtotal;

    this.checkoutService.getDepartments().subscribe(data => {
      this.departments = data;
    });
  }

  onDepartmentChange(deptId: string): void {
    this.checkoutService.getCities(deptId).subscribe(data => {
      this.cities = data;
    });
  }

  onCityChange(cityId: string): void {
    this.checkoutService.getShippingInfo(cityId).subscribe(data => {
      this.shippingCost = data.cost;
      this.total = this.subtotal + this.shippingCost;
      this.paymentMethods = data.methods;
    });
  }

  validateCoupon(code: string): void {
    this.checkoutService.validateCoupon(code).subscribe(res => {
      if (res.valid) {
        this.total -= res.discount;
      }
    });
  }

  submitOrder(): void {
    if (this.checkoutForm.valid) {
      const payload = {
        ...this.checkoutForm.value,
        cart: this.cartItems,
        total: this.total
      };
      this.checkoutService.submitOrder(payload).subscribe(res => {
        console.log('✅ Orden enviada:', res);
      });
    }
  }
}
