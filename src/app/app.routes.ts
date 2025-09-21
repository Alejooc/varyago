import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; // ← ajusta según tu ruta real
import { Login } from './pages/login/login';
import { Checkout } from './pages/checkout/checkout'; // Asegúrate de importar correctamente el componente Checkout
import { authGuard } from './guards/auth.guard'; // Asegúrate de importar correctamente el guardia de autenticación
import { Cart } from './pages/cart/cart';
import { Category } from './pages/category/category';
import { Product } from './pages/product/product';
import { Account } from './pages/account/account';
import { Page } from './pages/page/page';
import { Search } from './pages/search/search';
import { Confirm } from './pages/confirm/confirm';
import { NotFound } from './pages/not-found/not-found';
export const routes: Routes = [

    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'account', component: Account, canActivate: [authGuard] }, // Asegúrate de importar correctamente el componente Account
    { path: 'cart', component: Cart },
    { path: 'category/:id', component: Category }, // ✅ Ruta dinámica
    { path: 'product/:id', component: Product }, // ✅ Ruta dinámica
    { path: 'checkout', component: Checkout},
    { path: 'pages/:id', component: Page},
    { path: 'search/:id', component: Search },
    { path: 'confirm', component: Confirm },
    { path: 'confirm/:ref', component: Confirm }, // Asegúrate de importar correctamente el componente confirm
    //{ path: 'checkout', component: Checkout, canActivate: [authGuard] }
    { path: '**', component: NotFound }, // 👈 SIEMPRE al final
];
