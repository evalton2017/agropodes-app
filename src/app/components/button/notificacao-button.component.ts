// notification-button.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import {NotificationService} from '../service/notificacao.service';
import Keycloak from 'keycloak-js';
import {Router} from '@angular/router';


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

  lerNotificacao(id: number): void {
    this.notificationService.marcarComoLida(id);

    console.log(this.keycloak.hasRealmRole('USER_PRODUTOR'));

    if(this.keycloak.hasRealmRole('USER_PRODUTOR')){
      this.router.navigate(['relatorio-detalhe-car']);
    }else if(!this.keycloak.hasRealmRole('USER_ANALISTA')){
      this.router.navigate(['relatorios-analista']);
    }
  }
}
