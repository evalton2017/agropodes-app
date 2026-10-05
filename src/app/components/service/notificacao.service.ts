import { inject, Injectable, signal, computed, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {switchMap, timer, filter, catchError, of} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Notificacao } from '../model/notificacao';
import { environment } from '../../../environments/environment';
import {PessoaService} from '../../service/pessoa.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private pessoaService = inject(PessoaService);
  private destroyRef = inject(DestroyRef);

  readonly idUsuarioLogado = this.pessoaService.idProdutorLogado;

  // Signal com a lista de notificações pendentes/não lidas
  private notificationsSignal = signal<Notificacao[]>([]);

  // Exposição somente leitura dos signals
  public notifications = this.notificationsSignal.asReadonly();

  // Signal computado para a contagem no badge do ícone do sininho
  public unreadCount = computed(() => this.notificationsSignal().length);

  constructor() {
    this.iniciarPolling();
  }

  /**
   *  Inicia o Polling a cada 30 segundos usando o idUsuario logado
   */
  private iniciarPolling(): void {
    timer(0, 30000)
      .pipe(
        filter(() => !!this.idUsuarioLogado()), // Executa apenas se o usuário estiver logado
        switchMap(() =>
          this.http.get<Notificacao[]>(`${environment.url}/notificacao/pendentes/${this.idUsuarioLogado()}`).pipe(
            catchError((err) => {
              console.error('Erro ao buscar notificações via polling:', err);
              return of([]); // Evita que o fluxo do timer seja quebrado por erros HTTP
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef) // Cancela o timer se a aplicação/serviço for destruído
      )
      .subscribe((data) => {
        this.notificationsSignal.set(data);
      });
  }

  /**
   *  Confirma a leitura de uma notificação individual
   */
  marcarComoLida(idNotificacao: number): void {
    const payload = { idNotificacao, statusNotificacao: 'CONCLUIDO' };

    this.http.patch(`${environment.url}/notificacao/confirmar`, payload).subscribe({
      next: () => {
        // Atualiza a lista removendo o item lido
        this.notificationsSignal.update((prev) => prev.filter((n) => n.idNotificacao !== idNotificacao));
      },
      error: (err) => console.error('Erro ao marcar notificação como lida:', err)
    });
  }

  /**
   *  Limpa todas as notificações não lidas
   */
  marcarTodasComoLidas(): void {
    const idUsuario = this.idUsuarioLogado();
    if (!idUsuario) return;

    this.http.patch(`${environment.url}/notificacao/confirmar-todas/${idUsuario}`, {}).subscribe({
      next: () => {
        this.notificationsSignal.set([]);
      },
      error: (err) => console.error('Erro ao marcar todas como lidas:', err)
    });
  }
}
