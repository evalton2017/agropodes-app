import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from '../footer/footer.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MenuItem } from '../../dto/menu-item';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'layout-app',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatToolbarModule, MatButtonModule, MatIconModule,
    MatExpansionModule, FooterComponent,
    MatMenuModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private keycloak = inject(Keycloak);
  private platformId = inject(PLATFORM_ID);

  // Seu Signal existente para gerenciar o nome do usuário reativamente
  username = signal<string>('Usuário');

  // Estados reativos com Signals
  isMobile = signal(false);
  isExpanded = signal(false);

  menuItems: MenuItem[] = [
    { route: '/home', label: 'Home', icon: 'home' },
    { route: '/consulta-car', label: 'Consulta Car', icon: 'grain' },
    { route: '/consulta-prodes', label: 'Consulta Prodes', icon: 'forest' },
    {
      label: 'Analises',
      icon: 'rate_review',
      children: [
        { route: '/consulta-analise', label: 'Consultar Analise', icon: 'search' },
      ]
    },
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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
    }
  }

  private async loadUserProfile() {
    try {
      if (this.keycloak.authenticated) {
        // Tenta carregar os dados completos do perfil do Keycloak
        const profile = await this.keycloak.loadUserProfile();
        const displayName = profile.firstName
          ? `${profile.firstName} ${profile.lastName || ''}`
          : (this.keycloak.tokenParsed as any)?.preferred_username;

        if (displayName) {
          this.username.set(displayName.trim());
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário no layout:', error);
    }
  }

  async logout() {
    if (isPlatformBrowser(this.platformId)) {
      await this.keycloak.logout({
        redirectUri: environment.postLogoutRedirectUri
      });
    }
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
