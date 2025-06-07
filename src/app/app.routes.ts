import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/home').then((m) => m.Home)
    },
    {
        path: 'category/:categoryId',
        children: [
            {
                path: "",
                loadComponent: () => import('./pages/category/category').then((m) => m.CategoryView)
            },
            {
                path: "task/:taskId",
                loadComponent: () => import('./pages/task/task').then((m) => m.TaskView)
            }
        ]
    }
];