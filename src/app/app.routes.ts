import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'account',
        loadComponent: () => import('./pages/account/account').then(m => m.Account),
        canActivate: [authGuard]
    },
    {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart').then(m => m.Cart)
    },
    {
        path: 'category/:id',
        loadComponent: () => import('./pages/category/category').then(m => m.Category)
    },
    {
        path: 'product/:id',
        loadComponent: () => import('./pages/product/product').then(m => m.Product)
    },
    {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout)
    },
    {
        path: 'pages/:id',
        loadComponent: () => import('./pages/page/page').then(m => m.Page)
    },
    {
        path: 'search/:id',
        loadComponent: () => import('./pages/search/search').then(m => m.Search)
    },
    {
        path: 'confirm',
        loadComponent: () => import('./pages/confirm/confirm').then(m => m.Confirm)
    },
    {
        path: 'confirm/:ref',
        loadComponent: () => import('./pages/confirm/confirm').then(m => m.Confirm)
    },
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound)
    }
];
