import { Component, OnInit,ViewChildren, ElementRef, QueryList, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { CheckoutService } from '../../services/checkout';
import { LoadingService } from '../../services/loader';
import { LoadingComponent } from '../loader/loader';
import { ActivatedRoute,Router,RouterModule } from '@angular/router';
import { SharedService } from '../../services/shared';
import { MetaPixel } from '../../services/meta-pixel';
import { MetaCapi } from '../../services/meta-capi';

const uuid = () => crypto.randomUUID();
@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  @ViewChildren('pmRadio') pmRadios!: QueryList<ElementRef<HTMLInputElement>>;
  trackById = (_: number, x: any) => x.id;
  formId = Date.now();                       // asegura name único
radiosVisible = true;
 checkoutForm!: FormGroup;
  cartItems: any[] = [];
  subtotal: number = 0;
  total: number = 0;
  shippingCost: number = 0;
  departments: any[] = [];
  cities: any[] = [];
  paymentMethods: any[] = [];
  selectedPaymentMethod: any = null;
  showError = false;
  shippingCod:any= 0;
  cantITems: any= 0;
  shippingCodPrice: any;
  shippingCostOrg: any;
  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router,
    private loadingService: LoadingService,
    private sharedService: SharedService,
    private pixel: MetaPixel,
    private capi: MetaCapi,
    private cdr: ChangeDetectorRef

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
  
    
    this.subtotal = this.cartService.getTotalPrice();
    this.cantITems = this.cartService.getTotalItems();
    this.total = this.subtotal;

    this.checkoutService.getDepartments().subscribe(data => {
      this.departments = data;
    });
     this.checkoutService.getPaymentMethods().subscribe(methods => {
        this.paymentMethods = methods;
      });
    const items = this.cartItems.map(p => ({ id: p.variationSku, quantity: p.quantity }));
    const eventId = uuid(); // o genera un string único
    this.pixel.initiateCheckout({
      contents: items,
      num_items: this.cantITems,
      value: Number(this.total),
      currency: 'COP'
    },eventId);
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
  // Actualiza el valor del cod si es cod
  if(method.pmg_id == 101){
    this.shippingCost =this.shippingCodPrice;
    this.total = this.subtotal + this.shippingCost;
  }else{
    
    if(this.shippingCostOrg > 0){
      this.shippingCost =this.shippingCostOrg;
      this.total = this.subtotal + this.shippingCostOrg;
    }
    
  }
}
  onCityChange(event: Event): void {
   
     const pmCtrl = this.checkoutForm.get('payment_method');
      // 1) limpiar valor del form
      pmCtrl?.setValue(null, { emitEvent: false });
      pmCtrl?.markAsPristine();
      pmCtrl?.markAsUntouched();
      pmCtrl?.updateValueAndValidity({ emitEvent: false });

      // 2) desmarcar radios nativos (por si el navegador dejó el prop.checked pegado)
      this.pmRadios?.forEach(r => r.nativeElement.checked = false);

      // 3) re-montar el bloque para borrar cualquier “memoria” del DOM
      this.radiosVisible = false;
      this.cdr.detectChanges();
      this.radiosVisible = true;
      this.shippingCod = 0;
      this.shippingCost = 0;
      this.total = this.subtotal + this.shippingCost;
      this.cdr.detectChanges();

    let cityId:any = +(event.target as HTMLSelectElement).value;
    if (cityId) {
      
      this.checkoutService.getShippingInfo(cityId,this.subtotal,this.cartItems).subscribe(rate => {
        this.shippingCostOrg = rate.valor; // o rate.valor dependiendo de tu base
        this.shippingCost = rate.valor; // o rate.valor dependiendo de tu base
        this.shippingCod = rate.contraentrega; // o rate.valor dependiendo de tu base
        this.shippingCodPrice = rate.codCost; // o rate.valor dependiendo de tu base
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
      
       this.loadingService.show();
      this.checkoutService.submitOrder(payload).subscribe(res => {
         this.loadingService.hide();
        
        if(res.type == 1){
          this.cartService.clearCart();
          this.sharedService.notifyCartUpdated();
          
          if (res.payment?.method === 'wompi_webcheckout') {
            const { endpoint, params } = res.payment;
            const form = document.createElement('form');
            form.action = endpoint;   // "https://checkout.wompi.co/p/"
            form.method = 'GET';
            Object.entries(params).forEach(([k, v]) => {
              if (v == null || v === '') return;
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = String(k);
              input.value = String(v);
              form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
            return;
          }
          this.router.navigate(['/confirm', res.order_id]);
          const eventId = uuid(); // o genera un string único
          this.pixel.purchase({
            contents: this.cartItems.map(i => ({ id: i.variationSku, quantity: i.quantity })),
            value: Number(this.total),
            currency: 'COP',
            order_id: res.order_id,
            event_id: eventId
          },eventId);
          this.capi.sendEvent('Purchase', {
            event_id: eventId,
            order_id: res.order.id,
            value: this.total,
            currency: 'COP',
            contents: this.cartItems.map(i => ({ id: i.variationSku, quantity: i.quantity, item_price: i.price2 })),
            client_user_agent: navigator.userAgent,
            event_source_url: window.location.href
          }).subscribe();
        }
      });
      this.showError = false;
    }else {
      console.error('Formulario inválido');
      this.showError = true;
       this.loadingService.hide();
    }
  }


  isCOD(pmg: any): boolean {
  return +pmg?.pmg_id === 101;
}

isDisabled(pmg: any): boolean {
  // Deshabilitado si es COD y aún no se ha habilitado (shippingCod == 0)
  return this.isCOD(pmg) && this.shippingCod == 0;
}
}
