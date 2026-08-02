import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ConsultaCarComponent} from './pages/consulta-car/consulta-car.component';
import {ConsultaProdesComponent} from './pages/descontinuados/consulta-prodes/consulta-prodes.component';
import {CadastraTerritorioComponent} from './pages/descontinuados/cadastrar-territorio.ts/cadastra-territorio.ts';
import {
  ConsultaTerritorioComponent
} from './pages/descontinuados/consulta-territorio.component/consulta-territorio.component';
import {authGuard} from './auth/auth.guard';
import {ConsultaAnaliseComponent} from './pages/descontinuados/anlista/consulta-analise.component';
import {AcessoNegadoComponent} from './pages/acesso-negado/acesso-negado.component';
import {CadastroComponent} from './pages/cadastro/cadastro.component';
import {RelatorioDetalheCarComponent} from './pages/relatorios/produtor/detalhe-car/relatorio-detalhe-car.component';
import {RelatorioAnalistaComponent} from './pages/relatorios/analista/relatorio-analista.component';
import {ConsultaAnaliseProdutorComponent} from './pages/descontinuados/produtor/consulta-analise-produtor.component';
import {CadastroGlebaComponent} from './pages/produtor/cadastro-gleba/cadastro-gleba.component';
import {ConsultaGlebaComponent} from './pages/produtor/consulta-gleba/consulta-gleba';
import {PainelAnaliseComponent} from './pages/produtor/painel-analise.component/painel-analise.component';
import {AtestadosPageComponent} from './pages/relatorios/produtor/atestados-page.component.ts/atestados-page.component';


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
    path: 'cadastro-gleba-territorio',
    component: CadastraTerritorioComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
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
    path: 'consulta-prodes',
    component: ConsultaProdesComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
  },
  {
    path: 'consulta-analise',
    component: ConsultaAnaliseComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA'] }
  },
  {
    path: 'consulta-analise-produtor',
    component: PainelAnaliseComponent,
    canActivate: [authGuard],
    data: { roles: ['USER_PRODUTOR'] }
  },
  {
    path: 'relatorio-atestados',
    component: AtestadosPageComponent,
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
    path: 'glebas',
    loadComponent: () => import('./pages/analista/glebas-list/glebas-list').then(m => m.AppGlebasListComponent)
  },
  {
    path: 'glebas/detalhe/:id',
    loadComponent: () => import('./pages/analista/glebas-list/gleba-detalhe/gleba-detalhe').then(m => m.AppGlebaDetalheComponent)
  },
  {
    path: 'acesso-negado',
    component: AcessoNegadoComponent
  },
  { path: '**', redirectTo: 'home' }
];
