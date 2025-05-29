import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; // ← ajusta según tu ruta real
import { Login } from './pages/login/login';
import { Checkout } from './pages/checkout/checkout'; // Asegúrate de importar correctamente el componente Checkout
import { authGuard } from './guards/auth.guard'; // Asegúrate de importar correctamente el guardia de autenticación
export const routes: Routes = [

    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'checkout', component: Checkout, canActivate: [authGuard] }

];
