import {Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {  MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {FooterComponent} from '../footer/footer.component';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatExpansionModule} from '@angular/material/expansion';
import {MenuItem} from '../../dto/menu-item';


@Component({
  selector: 'layout-app',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatToolbarModule, MatButtonModule, MatIconModule,
    MatExpansionModule,
    FooterComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);

  // Estados reativos com Signals
  isMobile = signal(false);
  isExpanded = signal(false);

  menuItems: MenuItem[] = [
    { route: '/home', label: 'Home', icon: 'home' },
    { route: '/consulta-car', label: 'Consulta Car', icon: 'grain' },
    { route: '/consulta-prodes', label: 'Consulta Prodes', icon: 'forest' },
    {
      label: 'Territórios',
      icon: 'terrain',
      children: [
        { route: '/cadastro-territorio', label: 'Cadastrar', icon: 'add_location' },
        { route: '/consulta-territorio', label: 'Consultar', icon: 'terrain' }
      ]
    }
  ];


  constructor() {
    // Monitora a tela: se for menor ou igual a 768px, ativa o modo mobile
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile.set(result.matches);
      if (result.matches) {
        this.isExpanded.set(false); // Mobile inicia fechado
      }
    });
  }

  expandMenu() {
    if (!this.isMobile()) {
      this.isExpanded.set(true);
    }
  }

  collapseMenu() {
    if (!this.isMobile()) {
      this.isExpanded.set(false);
    }
  }
}
