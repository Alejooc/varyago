import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-confirm',
  imports: [CommonModule],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss'
})
export class Confirm implements OnInit {
  orderDetails: any = {};
  orderId: string | null = null;

  constructor(private confirmService: ConfirmService,private route: ActivatedRoute,) {}

  ngOnInit(): void {
    this.orderId = this.getOrderIdFromRoute();
    if (this.orderId) {
      this.fetchOrderDetails(this.orderId);
    }
  }

  getOrderIdFromRoute() {

    // Aquí deberías implementar la lógica para obtener el ID de la orden desde la ruta
    // Por ejemplo, usando ActivatedRoute si estás en un componente de Angular
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
    });
    return this.orderId;
  }

  fetchOrderDetails(orderId: string): void {
    // Aquí deberías implementar la lógica para obtener los detalles de la orden
    // Por ejemplo, llamando a un servicio que haga una petición HTTP
    this.confirmService.getOrderDetails(orderId).subscribe(
      (data) => {
        this.orderDetails = data;
      },
      (error) => {
        console.error('Error fetching order details:', error);
      }
    );
  }

}
