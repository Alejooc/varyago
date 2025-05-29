import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; // ← ajusta según tu ruta real
import { Login } from './pages/login/login';
export const routes: Routes = [

    { path: '', component: Home },
    { path: 'login', component: Login }
];
