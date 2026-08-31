import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
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
import {MENU_ITEMS} from '../model/menu-item';
import { MatTooltipModule } from "@angular/material/tooltip";
import {PessoaService} from '../../service/pessoa.service';


@Component({
  selector: 'layout-app',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatToolbarModule, MatButtonModule, MatIconModule,
    MatExpansionModule, FooterComponent, MatTooltipModule,
    MatMenuModule, NotificationButtonComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly keycloak = inject(Keycloak);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly pessoaService = inject(PessoaService);
  username = signal<string>('Usuário');
  isMobile = signal(false);
  isExpanded = signal(false);

  private readonly userRoles = signal<string[]>([]);

  private readonly allMenuItems: MenuItem[] = MENU_ITEMS;

  menuItems = computed(() => {
    const pessoa = this.pessoaService.produtorAtual();
    const carregando = this.pessoaService.carregandoPerfil();

    // 🟢 ENQUANTO ESTIVER CARREGANDO, RETORNA VAZIO (Evita mostrar todos os menus)
    if (carregando || !pessoa || !pessoa.perfil || !pessoa.perfil.modulos) {
      return [];
    }

    // Extrai as chaves de rotas permitidas do banco de dados daquela pessoa
    const rotasPermitidas = pessoa.perfil.modulos.map((m: any) => m.chaveRota);
    return this.filtrarMenuPorRotas(this.allMenuItems, rotasPermitidas);
  });

  private filtrarMenuPorRotas(menus: MenuItem[], rotasPermitidas: string[]): MenuItem[] {
    return menus
      .map(item => {
        // Se o item tem filhos (submenus), filtra recursivamente os filhos
        if (item.children) {
          const filhosFiltrados = this.filtrarMenuPorRotas(item.children, rotasPermitidas);
          return { ...item, children: filhosFiltrados };
        }
        return item;
      })
      .filter(item => {
        // O item permanece se tiver filhos válidos OU se a rota principal estiver na lista permitida
        const temFilhosValidos = item.children && item.children.length > 0;
        const rotaPermitida = item.route ? rotasPermitidas.includes(item.route) : false;

        // O Dashboard (/home) costuma ser comum, garanta que ele passe se necessário
        const ehDashboard = item.route === '/home';

        return temFilhosValidos || rotaPermitida || ehDashboard;
      });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
      this.extractUserRoles();
      this.consultarProdutorLogado();
    }
  }

  private extractUserRoles(): void {
    if (this.keycloak.authenticated) {
      const realmRoles = this.keycloak.realmAccess?.roles || [];
      const resourceRoles = this.keycloak.resourceAccess
        ? Object.values(this.keycloak.resourceAccess).flatMap(access => access.roles || [])
        : [];

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
      .filter(item => !item.children || item.children.length > 0);
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

  private async consultarProdutorLogado(): Promise<void> {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed) {
      const idKeycloak = this.keycloak.tokenParsed.sub;
      if (idKeycloak) {
        await this.pessoaService.carregarProdutorPorKeycloakId(idKeycloak);
      }
    }
  }

  async logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.pessoaService.limparSessao();
      await this.keycloak.logout({
        redirectUri: environment.postLogoutRedirectUri
      });
    }
  }

  expandMenu() { if (!this.isMobile()) this.isExpanded.set(true); }
  collapseMenu() { if (!this.isMobile()) this.isExpanded.set(false); }
}
