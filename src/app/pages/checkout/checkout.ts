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
  selectedPaymentMethod: any = null;
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
      notes: [''],
      payment_method: ['']
    });

    this.cartItems = this.cartService.getCart();
    //console.log(this.cartItems[0].name);
    
    this.subtotal = this.cartService.getTotalPrice();
    this.total = this.subtotal;

    this.checkoutService.getDepartments().subscribe(data => {
      this.departments = data;
    });
     this.checkoutService.getPaymentMethods().subscribe(methods => {
        this.paymentMethods = methods;
      });
  }
   
  onDepartmentChange(event: Event): void {
    let departmentId:any = +(event.target as HTMLSelectElement).value;
    if (departmentId) {
      this.checkoutService.getCities(departmentId).subscribe(res => {
        this.cities = res;
        this.checkoutForm.patchValue({ city_id: '' });
      });
    }
  }
 selectPaymentMethod(method: any) {
  this.selectedPaymentMethod = method;
  console.log('Método seleccionado:', method);
}
  onCityChange(event: Event): void {
    let cityId:any = +(event.target as HTMLSelectElement).value;
    if (cityId) {
      this.checkoutService.getShippingInfo(cityId,this.subtotal,this.cartItems).subscribe(rate => {
        this.shippingCost = rate.valor; // o rate.valor dependiendo de tu base
        this.total = this.subtotal + this.shippingCost;
      });
     
    }
  }

  validateCoupon(code: string): void {
    this.checkoutService.validateCoupon(code).subscribe(res => {
      if (res.valid) {
        this.total -= res.discount;
      }
    });
  }

  submitOrder(): void {
    //console.log('Enviando orden con los siguientes datos:', this.checkoutForm.value);
    
    if (this.checkoutForm.valid) {
      const payload = {
        ...this.checkoutForm.value,
        cart: this.cartItems,
        total: this.total,
        shippingCost: this.shippingCost,
        paymentMethod: this.selectedPaymentMethod.pmg_id
      };
      console.log('Datos de la orden:', payload);
      
      this.checkoutService.submitOrder(payload).subscribe(res => {
        console.log('✅ Orden enviada:', res);
      });
    }else {
      console.error('Formulario inválido');
    }
  }
}
