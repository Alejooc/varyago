import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; // ← ajusta según tu ruta real
import { Login } from './pages/login/login';
import { Checkout } from './pages/checkout/checkout'; // Asegúrate de importar correctamente el componente Checkout
import { authGuard } from './guards/auth.guard'; // Asegúrate de importar correctamente el guardia de autenticación
import { Cart } from './pages/cart/cart';
import { Category } from './pages/category/category';
import { Product } from './pages/product/product';
export const routes: Routes = [

    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'cart', component: Cart },
    { path: 'category/:id', component: Category }, // ✅ Ruta dinámica
    { path: 'product/:id', component: Product }, // ✅ Ruta dinámica
    { path: 'checkout', component: Checkout}
    //{ path: 'checkout', component: Checkout, canActivate: [authGuard] }

];
