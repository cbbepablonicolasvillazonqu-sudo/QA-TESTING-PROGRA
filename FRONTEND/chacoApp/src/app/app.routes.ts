import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'hito/junio-1932'
  },
  {
    path: 'hito/:codigo',
    loadComponent: () =>
      import('./features/hito-detalle/hito-detalle').then((m) => m.HitoDetalleComponent)
  },
  {
    path: '**',
    redirectTo: 'hito/junio-1932'
  }
];
