import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ConsultaCarComponent} from './pages/consulta-car/consulta-car.component';
import {ConsultaProdesComponent} from './pages/consulta-prodes/consulta-prodes.component';
import {CadastraTerritorioComponent} from './pages/territorio/cadastrar-territorio.ts/cadastra-territorio.ts';
import {
  ConsultaTerritorioComponent
} from './pages/territorio/consulta-territorio.component/consulta-territorio.component';
import {authGuard} from './auth/auth.guard';
import {ConsultaAnaliseComponent} from './pages/analise/anlista/consulta-analise.component';
import {AcessoNegadoComponent} from './pages/acesso-negado/acesso-negado.component';
import {CadastroComponent} from './pages/cadastro/cadastro.component';
import {RelatorioDetalheCarComponent} from './pages/relatorios/produtor/detalhe-car/relatorio-detalhe-car.component';
import {RelatorioAnalistaComponent} from './pages/relatorios/analista/relatorio-analista.component';
import {ConsultaAnaliseProdutorComponent} from './pages/analise/produtor/consulta-analise-produtor.component';
import {CadastroGlebaComponent} from './pages/gleba/cadastro/cadastro-gleba.component';


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
    path: 'cadastro-territorio',
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
    path: 'consulta-territorio',
    component: ConsultaTerritorioComponent,
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
    component: ConsultaAnaliseProdutorComponent,
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
    path: 'acesso-negado',
    component: AcessoNegadoComponent
  },
  { path: '**', redirectTo: 'home' }
];
