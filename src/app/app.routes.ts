import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
    {
    path: 'reportes',
    loadComponent: () => import('./reportes/reportes.page').then( (m) => m.ReportesPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

];
