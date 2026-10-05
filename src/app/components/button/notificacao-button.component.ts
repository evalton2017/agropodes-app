import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

import { NotificationService } from '../service/notificacao.service';
import { Notificacao, PayloadExtraNotificacao } from '../model/notificacao';

@Component({
  selector: 'app-notification-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './notification-button.component.html',
  styleUrls: ['./notification-button.component.scss']
})
export class NotificationButtonComponent {
  protected notificationService = inject(NotificationService);
  private readonly keycloak = inject(Keycloak);
  private readonly router = inject(Router);

  lerNotificacao(notif: Notificacao): void {
    console.log(notif);
    // 1. Marcar como lida via API
    this.notificationService.marcarComoLida(notif.idNotificacao);

    // 2. Tentar extrair o payload contendo a rota ou dados extras
    let payload: PayloadExtraNotificacao | null = null;
    if (typeof notif.payloadExtra === 'string') {
      try {
        payload = JSON.parse(notif.payloadExtra);
      } catch (e) {
        console.error('Erro ao converter payloadExtra JSON:', e);
      }
    } else if (typeof notif.payloadExtra === 'object') {
      payload = notif.payloadExtra;
    }

    // 3. Redirecionamento Dinâmico por Tipo de Entidade / Rota do Payload
    if (payload?.rota_front) {
      this.router.navigate([payload.rota_front]);
      return;
    }

    // Roteamento baseado no perfil Keycloak e Tipo da Notificação
    const isProdutor = this.keycloak.hasRealmRole('USER_PRODUTOR');
    const isAnalista = this.keycloak.hasRealmRole('USER_ANALISTA');

    console.log(isProdutor);
    console.log(notif.tipoEntidade);

    switch (notif.tipoEntidade) {
      case 'PAGAMENTO':
        this.router.navigate(['pagamento-podutor']);
        break;

      case 'CONTESTACAO':
        this.router.navigate([isAnalista ? 'analise-contestacao' : 'contestacao']);
        break;

      case 'ALERTA_AMBIENTAL':
      case 'GLEBA':
      case 'PROPRIEDADE':
        if (isProdutor) {
          this.router.navigate(['relatorio-detalhe-car']);
        } else if (isAnalista) {
          this.router.navigate(['relatorios-analista']);
        }
        break;

      default:
        // Caso genérico ou SISTEMA
        if (isProdutor) {
          this.router.navigate(['relatorio-detalhe-car']);
        } else {
          this.router.navigate(['relatorios-analista']);
        }
        break;
    }
  }

  // Helper para obter o ícone de cada tipo no dropdown
  getIconeNotificacao(tipoEntidade: string): string {
    switch (tipoEntidade) {
      case 'PAGAMENTO': return 'payments';
      case 'ALERTA_AMBIENTAL': return 'warning';
      case 'CONTESTACAO': return 'gavel';
      case 'GLEBA':
      case 'PROPRIEDADE': return 'landscape';
      default: return 'notifications';
    }
  }

  marcarTodasComoLidas(): void {
    this.notificationService.marcarTodasComoLidas();
  }
}
