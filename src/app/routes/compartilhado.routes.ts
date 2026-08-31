import { Routes } from '@angular/router';
import { authGuard } from '../auth/auth.guard';

export const COMPARTILHADO_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'consulta-car',
        data: { roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] },
        loadComponent: () =>
          import('../components/consulta-car/consulta-car.component').then(m => m.ConsultaCarComponent)
      },
      {
        path: 'glebas/detalhe/:id',
        data: { roles: ['USER_PRODUTOR', 'USER_ANALISTA'] },
        loadComponent: () =>
          import('../pages/monitoramento/analista/components/glebas-list/gleba-detalhe/gleba-detalhe').then(m => m.AppGlebaDetalheComponent)
      }
    ]
  }
];
