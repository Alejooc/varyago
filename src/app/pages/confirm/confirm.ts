import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
@Component({
  selector: 'app-confirm',
  imports: [CommonModule, RouterModule],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss'
})
export class Confirm implements OnInit {
  orderDetails: any = {};
  orderId: string | null = null;
  error = '';

  constructor(private confirmService: ConfirmService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // 1) Lee id de param o de query (?id=...)
    const ref = this.route.snapshot.paramMap.get('ref');   // referencia en la ruta
    const txId = this.route.snapshot.queryParamMap.get('id'); // transaction_id (query)

    if (!ref) {
      this.error = 'Referencia no recibida.'; return;
    }
    console.log(ref);

    this.orderId = ref;      // tu "track"
    // 2) Normaliza: si vino como query, conviértelo a /confirm/:id
    if (!ref) {
      this.router.navigate(['/confirm', ref], { replaceUrl: true });
      return;
    }

    // 3) Carga detalles
    this.orderId = txId;
    this.fetchOrderDetails(ref);

    /*this.orderId = this.getOrderIdFromRoute();
    if (this.orderId) {
      this.fetchOrderDetails(this.orderId);
    }*/
  }

  getOrderIdFromRoute() {

    // Aquí deberías implementar la lógica para obtener el ID de la orden desde la ruta
    // Por ejemplo, usando ActivatedRoute si estás en un componente de Angular
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
    });
    return this.orderId;
  }

  private fetchOrderDetails(id: string): void {
    this.confirmService.getOrderDetails(id).subscribe({
      next: (data) => { this.orderDetails = data; },
      error: (err) => {
        console.error('Error fetching order details:', err);
        this.error = 'No se pudo verificar la transacción.';
      }
    });
  }

}
