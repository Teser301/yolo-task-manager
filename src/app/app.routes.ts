import { Routes } from '@angular/router';
import { Categories } from './components/categories/categories';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/home').then((m) => m.Home)

    },
    {
        path: 'category/:id',
        component: Categories
    }
];