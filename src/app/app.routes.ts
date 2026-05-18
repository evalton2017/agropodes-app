import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ConsultaCarComponent} from './pages/consulta-car.component/consulta-car.component';
import {ConsultaProdesComponent} from './pages/consulta-prodes.component/consulta-prodes.component';
import {CadastraTerritorioComponent} from './pages/territorio/cadastrar-territorio.ts/cadastra-territorio.ts';
import {
  ConsultaTerritorioComponent
} from './pages/territorio/consulta-territorio.component/consulta-territorio.component';
import {authGuard} from './auth/auth.guard';


export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {path: 'cadastro-territorio', component: CadastraTerritorioComponent, canActivate: [authGuard]},
  {path: 'consulta-territorio', component: ConsultaTerritorioComponent, canActivate: [authGuard]},
  {path: 'consulta-car', component: ConsultaCarComponent, canActivate: [authGuard]},
  {path: 'consulta-prodes', component: ConsultaProdesComponent, canActivate: [authGuard]},
  {path: '**', redirectTo: 'home'}
];
