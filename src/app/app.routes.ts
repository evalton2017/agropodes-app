import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {authGuard} from './auth/auth.guard';
import {RelatorioDetalheCarComponent} from './pages/relatorios/produtor/detalhe-car/relatorio-detalhe-car.component';
import {RelatorioAnalistaComponent} from './pages/relatorios/analista/relatorio-analista.component';
import {CadastroGlebaComponent} from './pages/produtor/cadastro-gleba/cadastro-gleba.component';
import {ConsultaGlebaComponent} from './pages/produtor/consulta-gleba/consulta-gleba';
import {PainelAnaliseComponent} from './pages/produtor/painel-analise.component/painel-analise.component';
import {AtestadosPageComponent} from './pages/relatorios/produtor/atestados-page.component.ts/atestados-page.component';
import {CadastroComponent} from './dto/cadastro/cadastro.component';
import {ConsultaCarComponent} from './components/consulta-car/consulta-car.component';
import {ClimaPageComponent} from './pages/monitoramento/analista/clima/clima-page.component';
import {AcessoNegadoComponent} from './components/acesso-negado/acesso-negado.component';
import {AppGlebasListComponent} from './pages/monitoramento/analista/components/glebas-list/glebas-list';
import {
  AppGlebaDetalheComponent
} from './pages/monitoramento/analista/components/glebas-list/gleba-detalhe/gleba-detalhe';
import {CadernoCampoPageComponent} from './pages/caderno-campo/caderno-campo-page.component';
import {
  VerificacaoAgricolaComponent
} from './pages/verificacao-agricola/verificacao-agricola.component/verificacao-agricola.component';
import {
  RelatorioProdutorComponent
} from './pages/relatorios/produtor/relatorio-produtor.component/relatorio-produtor.component';



export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
  },
  {
    path: 'cadastrar-usuario',
    component: CadastroComponent
  },
  {
    path: 'cadastro-gleba',
    component: CadastroGlebaComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
  },
  {
    path: 'consulta-gleba',
    component: ConsultaGlebaComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
  },
  {
    path: 'consulta-car',
    component: ConsultaCarComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
  },
  {
    path: 'consulta-analise-produtor',
    component: PainelAnaliseComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_PRODUTOR'] }
  },
  {
    path: 'atestados-produtor',
    component: RelatorioProdutorComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_PRODUTOR'] }
  },
  {
    path: 'relatorio-detalhe-car',
    component: RelatorioDetalheCarComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_PRODUTOR'] }
  },
  {
    path: 'relatorios-analista',
    component: RelatorioAnalistaComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA'] }
  },
  {
    path: 'monitoramento-clima',
    component: ClimaPageComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_ANALISTA'] }
  },
  {
    path: 'glebas',
    component: AppGlebasListComponent,
    data: { roles: ['USER_PRODUTOR', 'USER_ANALISTA'] }
  },
  {
    path: 'glebas/detalhe/:id',
    component: AppGlebaDetalheComponent,
    data: { roles: ['USER_PRODUTOR', 'USER_ANALISTA'] }
  },
  {
    path:'caderno-campo',
    component: CadernoCampoPageComponent,
    data: { roles: ['USER_PRODUTOR', 'USER_ANALISTA'] }
  },
  {
    path: 'verificacao-agricola',
    component: VerificacaoAgricolaComponent,
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA'] }
  },
  {
    path: 'acesso-negado',
    component: AcessoNegadoComponent
  },
  { path: '**', redirectTo: 'home' }
];
