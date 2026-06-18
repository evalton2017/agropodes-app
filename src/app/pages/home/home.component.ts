import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import Keycloak from 'keycloak-js';
import {HomePublicoComponent} from './logado/home-publico.component/home-publico.component';
import {DashboardAnalistaComponent} from '../dashboard/dashboard-analista/dashboard-analista.component';
import {DashboardProdutorComponent} from '../dashboard/dashboard-produtor/dashboard-produtor';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    HomePublicoComponent,
    DashboardAnalistaComponent,
    DashboardProdutorComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly keycloak = inject(Keycloak);


  isAutenticado(): boolean {
    return !!this.keycloak.authenticated;
  }


  possuiRole(role: string): boolean {
    if (!this.isAutenticado()) {
      return false;
    }
    return this.keycloak.hasRealmRole(role) || this.keycloak.hasResourceRole(role);
  }
}
