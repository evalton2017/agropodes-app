import { Routes } from '@angular/router';
import { authGuard } from '../auth/auth.guard';

export const ANALISTA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'operacoes',
        data: { roles: ['USER_ADMIN'] },
        loadComponent: () =>
          import('../pages/operacoes/operacoes.component/operacoes.component').then(m => m.OperacoesComponent)
      },
      {
        path: 'relatorios-analista',
        data: { roles: ['USER_ADMIN', 'USER_ANALISTA'] },
        loadComponent: () =>
          import('../pages/relatorios/analista/relatorio-analista.component').then(m => m.RelatorioAnalistaComponent)
      },
      {
        path: 'monitoramento-clima',
        data: { roles: ['USER_ANALISTA'] },
        loadComponent: () =>
          import('../pages/monitoramento/analista/clima/clima-page.component').then(m => m.ClimaPageComponent)
      }
    ]
  }
];
