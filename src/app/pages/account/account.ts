import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { ActivatedRoute,Router,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/client';

@Component({
  selector: 'app-account',
  imports: [RouterModule,CommonModule],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  //username: string = '';
  user: any = {};
   perfil: any = {};
  direcciones: any[] = [];
  ordenes: any[] = [];

  // Aquí puedes agregar propiedades y métodos específicos para la página de cuenta
  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private clienteService: ClienteService
    
  ) {
    // Inicialización si es necesario
  }

  ngOnInit(): void {
    this.user= JSON.parse(sessionStorage.getItem('cl') || '{}');
      this.cargarDatos();
    // Lógica de inicialización si es necesario
  }
   cargarDatos() {
    this.clienteService.getPerfil().subscribe(data => this.perfil = data);
    this.clienteService.getDirecciones().subscribe(data => this.direcciones = data as any[]);
    this.clienteService.getOrdenes().subscribe(data => this.ordenes = data as any[]);
  }
  // Métodos para manejar la lógica de la cuenta, como cargar datos del usuario, actualizar perfil, etc.  
   onLogout(): void {
    this.cartService.clearCart(); // Limpia el carrito al cerrar sesión
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
