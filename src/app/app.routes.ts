import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CadastroComponent } from './dto/cadastro/cadastro.component';
import { AcessoNegadoComponent } from './components/acesso-negado/acesso-negado.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    data: { roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
  },

  // Módulos Carregados via Lazy Loading
  {
    path: '',
    loadChildren: () => import('./routes/produtor.routes').then(m => m.PRODUTOR_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./routes/analista.routes').then(m => m.ANALISTA_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./routes/compartilhado.routes').then(m => m.COMPARTILHADO_ROUTES)
  },

  {
    path: 'cadastrar-usuario',
    component: CadastroComponent
  },
  {
    path: 'acesso-negado',
    component: AcessoNegadoComponent
  },
  { path: '**', redirectTo: 'home' }
];
