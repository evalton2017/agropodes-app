import { Routes } from '@angular/router';
import { authGuard } from '../auth/auth.guard';
import {PropriedadeComponent} from '../pages/propriedades/propriedade.component/propriedade.component';

export const PRODUTOR_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    data: { roles: ['USER_PRODUTOR'] },
    children: [
      {
        path: 'consulta-gleba',
        loadComponent: () =>
          import('../pages/produtor/consulta-gleba/consulta-gleba').then(m => m.ConsultaGlebaComponent)
      },
      {
        path: 'cadastro-gleba',
        loadComponent: () =>
          import('../pages/produtor/cadastro-gleba/cadastro-gleba.component').then(m => m.CadastroGlebaComponent)
      },
      {
        path: 'cadastrar-contestacao/:idGleba',
        loadComponent: () =>
          import('../pages/contestacoes/components/cadastro-contestacao/cadastro-contestacao').then(m => m.CadastroContestacaoComponent)
      },
      {
        path: 'cadastro-contestacao-propriedade/:idPropriedade',
        loadComponent: () => import('../pages/contestacoes/components/cadastro-contestacao-propriedade/cadastro-contestacao-propriedade.component')
          .then(m => m.CadastroContestacaoPropriedadeComponent)
      },
      {
        path: 'acompanhamento-contestacao',
        loadComponent: () => import('../pages/contestacoes/components/acompanhamento-contestacao.component/acompanhamento-contestacao.component')
          .then(m => m.AcompanhamentoContestacaoComponent)
      },
      {
        path: 'consulta-analise-produtor',
        loadComponent: () =>
          import('../pages/produtor/painel-analise.component/painel-analise.component').then(m => m.PainelAnaliseComponent)
      },
      {
        path: 'atestados-produtor',
        loadComponent: () =>
          import('../pages/relatorios/produtor/relatorio-produtor.component/relatorio-produtor.component').then(m => m.RelatorioProdutorComponent)
      },
      {
        path: 'relatorio-detalhe-car',
        loadComponent: () =>
          import('../pages/relatorios/produtor/detalhe-car/relatorio-detalhe-car.component').then(m => m.RelatorioDetalheCarComponent)
      },
      {
        path: 'glebas',
        loadComponent: () =>
          import('../pages/monitoramento/analista/components/glebas-list/glebas-list').then(m => m.AppGlebasListComponent)
      },
      {
        path: 'caderno-campo',
        loadComponent: () =>
          import('../pages/caderno-campo/caderno-campo-page.component').then(m => m.CadernoCampoPageComponent)
      },
      {
        path: 'verificacao-agricola',
        loadComponent: () =>
          import('../pages/verificacao-agricola/verificacao-agricola.component/verificacao-agricola.component').then(m => m.VerificacaoAgricolaComponent)
      },
      {
        path: 'contestacao-produtor',
        loadComponent: () =>
          import('../pages/contestacoes/produtor/contestacaoes-produtor/contestacao-produtor').then(m => m.ContestacaoProdutorComponent)
      },
      {
        path: 'contestacao-propriedade',
        loadComponent: () =>
          import('../pages/contestacoes/produtor/contestacao-propriedade.component/contestacao-propriedade.component').then(m => m.ContestacaoPropriedadeComponent),
        data: { origem: 'contestacao' }
      },
      {
        path: 'propriedades',
        component: PropriedadeComponent,
        data: { origem: 'propriedades' }
      }
    ]
  }
];
