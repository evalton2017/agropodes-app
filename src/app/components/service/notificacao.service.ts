import { Injectable, inject, signal } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { timer, switchMap, repeat } from 'rxjs';
import {Notificacao} from '../model/notificacao';
import {environment} from '../../../environments/environment';
import {limparParams} from '../../shared/service/request-util';
import {CarResponse} from '../../dto/response/car';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  // Signal para armazenar a lista de notificações pendentes
  private notificationsSignal = signal<Notificacao[]>([]);

  // Expõe apenas a leitura do Signal
  public notifications = this.notificationsSignal.asReadonly();

  constructor() {
    this.startPolling();
  }

  // Inicia a consulta automática a cada 50 segundos (50000 ms)
  private startPolling(): void {
    timer(0, 50000).pipe(
      switchMap(() => this.http.get<Notificacao[]>(`${environment.url}/consulta/notificacao`))
    ).subscribe({
      next: (data) => {
        // Filtra apenas as pendentes, caso a API traga misturado
        const pendentes = data.filter(n => n.status === 'PENDENTE');
        this.notificationsSignal.set(pendentes);
      },
      error: (err) => console.error('Erro ao buscar notificações:', err)
    });
  }

  // Confirma a leitura da notificação
  marcarComoLida(id: number) {
    const request = {idNotificacao: id, statusNotificacao: 'CONFIRMADO'};

    this.http.post(`${environment.url}/consulta/notificacao/confirmar`, request ).subscribe({
      next: () => {
        // Remove a notificação da lista local após o sucesso na API
        this.notificationsSignal.update(prev => prev.filter(n => n.id !== id));
      },
      error: (err) => console.error('Erro ao confirmar notificação:', err)
    });
  }
}
