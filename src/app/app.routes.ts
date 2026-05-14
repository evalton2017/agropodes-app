import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ConsultaCarComponent} from './pages/consulta-car.component/consulta-car.component';
import {ConsultaProdesComponent} from './pages/consulta-prodes.component/consulta-prodes.component';
import {CadastraTerritorioComponent} from './pages/territorio/cadastrar-territorio.ts/cadastra-territorio.ts';
import {
  ConsultaTerritorioComponent
} from './pages/territorio/consulta-territorio.component/consulta-territorio.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Rotas dos componentes
  { path: 'home', component: HomeComponent },
  { path: 'cadastro-territorio', component: CadastraTerritorioComponent },
  { path: 'consulta-territorio', component: ConsultaTerritorioComponent },
  { path: 'consulta-car', component: ConsultaCarComponent },
  { path: 'consulta-prodes', component: ConsultaProdesComponent },
  { path: '**', redirectTo: 'home' }
];
