import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core'; // Adicionado computed
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
import {NotificationButtonComponent} from '../button/notificacao-button.component';

@Component({
  selector: 'layout-app',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatToolbarModule, MatButtonModule, MatIconModule,
    MatExpansionModule, FooterComponent,
    MatMenuModule, NotificationButtonComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly keycloak = inject(Keycloak);
  private readonly platformId = inject(PLATFORM_ID);

  username = signal<string>('Usuário');
  isMobile = signal(false);
  isExpanded = signal(false);

  // Signal para armazenar as roles ativas capturadas do Keycloak
  private userRoles = signal<string[]>([]);

  // Lista base com mapeamento das roles configuradas nas suas rotas
  private readonly allMenuItems: MenuItem[] = [
    {
      route: '/home',
      label: 'Home',
      icon: 'home',
      roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR']
    },
    {
      route: '/consulta-car',
      label: 'Consulta Car',
      icon: 'grain',
      roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR']
    },
    {
      route: '/consulta-prodes',
      label: 'Consulta Prodes',
      icon: 'forest',
      roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR']
    },
    {
      label: 'Analises',
      icon: 'rate_review',
      roles: ['USER_ADMIN', 'USER_ANALISTA'], // Pai restrito
      children: [
        { route: '/consulta-analise', label: 'Consultar Analise', icon: 'search', roles: ['USER_ADMIN', 'USER_ANALISTA'] },
      ]
    },
    {
      label: 'Territórios',
      icon: 'terrain',
      roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'],
      children: [
        { route: '/cadastro-territorio', label: 'Cadastrar', icon: 'add_location', roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] },
        { route: '/consulta-territorio', label: 'Consultar', icon: 'terrain', roles: ['USER_ADMIN', 'USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
      ]
    }
  ];

  // Signal Computado: Filtra os menus dinamicamente e reativamente
  menuItems = computed(() => {
    const roles = this.userRoles();
    return this.filterMenusByRoles(this.allMenuItems, roles);
  });

  constructor() {
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile.set(result.matches);
      if (result.matches) {
        this.isExpanded.set(false);
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
      this.extractUserRoles(); // Captura as permissões ao iniciar
    }
  }

  private extractUserRoles(): void {
    if (this.keycloak.authenticated) {
      const realmRoles = this.keycloak.realmAccess?.roles || [];
      const resourceRoles = this.keycloak.resourceAccess
        ? Object.values(this.keycloak.resourceAccess).flatMap(access => access.roles || [])
        : [];

      // Consolida todas as roles do usuário e atualiza o Signal
      this.userRoles.set([...realmRoles, ...resourceRoles]);
    }
  }

  // Função utilitária recursiva para filtrar menus e submenus (children)
  private filterMenusByRoles(menus: MenuItem[], roles: string[]): MenuItem[] {
    return menus
      .filter(item => !item.roles || item.roles.some(r => roles.includes(r)))
      .map(item => {
        if (item.children) {
          return {
            ...item,
            children: this.filterMenusByRoles(item.children, roles)
          };
        }
        return item;
      })
      .filter(item => !item.children || item.children.length > 0); // Remove menus pai vazios
  }

  private async loadUserProfile() {
    try {
      if (this.keycloak.authenticated) {
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

  expandMenu() { if (!this.isMobile()) this.isExpanded.set(true); }
  collapseMenu() { if (!this.isMobile()) this.isExpanded.set(false); }
}
