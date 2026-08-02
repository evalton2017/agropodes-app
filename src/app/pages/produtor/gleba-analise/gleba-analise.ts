import { Component, inject, signal, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GlebaData } from '../model/gleba.model';
import { GlebaService } from '../service/gleba.service';

@Component({
  selector: 'app-gleba-analise',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './gleba-analise.html',
  styleUrls: ['./gleba-analise.scss']
})
export class GlebaAnaliseComponent implements OnChanges {
  private readonly http = inject(HttpClient);
  private glebaService: GlebaService = inject(GlebaService);

  @Input({ required: true }) idGleba!: number;
  @Output() aoVoltar = new EventEmitter<void>();

  public carregando = signal<boolean>(false);
  public gleba = signal<GlebaData | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idGleba'] && this.idGleba) {
      this.carregarLaudoDetalhado();
    }
  }

  private carregarLaudoDetalhado(): void {
    this.carregando.set(true);
    this.glebaService.obterDetalheLaudoGleba(this.idGleba)
      .subscribe({
        next: (resposta) => {
          this.gleba.set(resposta);
          this.carregando.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar laudo detalhado da gleba:', err);
          this.carregando.set(false);
        }
      });
  }

  public dispararVoltar(): void {
    this.aoVoltar.emit();
  }

  // MAPPER DINÂMICO PARA AS CORES DOS CARDS INFERIORES
  public obterClasseCorStatus(status: string | undefined): string {
    if (!status) return 'text-muted';
    const s = status.toUpperCase().trim();

    switch (s) {
      case 'CONFORME':
      case 'APROVADO':
      case 'CONDIZENTE':
      case 'CONCLUIDO':
        return 'text-success';

      case 'DIVERGENTE':
      case 'ALERTA':
      case 'REVISAO_MANUAL':
        return 'text-warning';

      case 'REPROVADO':
      case 'BLOQUEADO':
      case 'FORA_ZARC':
        return 'text-danger';

      default:
        return 'text-muted';
    }
  }

  // OPERADORES MAPPER VISUAIS DA ESTEIRA (Sincronizados com o CSS)
  public obterClasseNo(status: string | undefined): string {
    if (!status) return 'todo';
    switch (status.toUpperCase()) {
      case 'CONCLUIDO': return 'done';
      case 'EM_ANDAMENTO': return 'working';
      case 'FORA_ZARC':
      case 'DIVERGENTE':
      case 'BLOQUEADO': return 'alert-node';
      default: return 'todo';
    }
  }

  public obterIconeNo(status: string | undefined): string {
    if (!status) return 'radio_button_unchecked';
    switch (status.toUpperCase()) {
      case 'CONCLUIDO': return 'check_circle';
      case 'EM_ANDAMENTO': return 'schedule';
      case 'FORA_ZARC':
      case 'DIVERGENTE':
      case 'BLOQUEADO': return 'gpp_bad';
      default: return 'radio_button_unchecked';
    }
  }

  public obterTextoNo(status: string | undefined): string {
    if (!status) return 'Pendente';
    switch (status.toUpperCase()) {
      case 'CONCLUIDO': return 'Concluído';
      case 'EM_ANDAMENTO': return 'Em andamento';
      case 'CONDIZENTE': return 'Condizente';
      case 'DIVERGENTE': return 'Divergente';
      case 'FORA_ZARC': return 'Fora do ZARC';
      case 'BLOQUEADO': return 'Bloqueado';
      default: return 'Pendente';
    }
  }

  public obterClasseConector(statusAtual: string | undefined, proximoStatus: string | undefined): string {
    if (!statusAtual || !proximoStatus) return 'todo';
    const atual = statusAtual.toUpperCase();
    const proximo = proximoStatus.toUpperCase();

    if (['FORA_ZARC', 'DIVERGENTE', 'BLOQUEADO'].includes(atual) || ['FORA_ZARC', 'DIVERGENTE', 'BLOQUEADO'].includes(proximo)) {
      return 'alert-line';
    }
    if (atual === 'CONCLUIDO' && proximo === 'CONCLUIDO') return 'done';
    if (atual === 'CONCLUIDO' && proximo === 'EM_ANDAMENTO') return 'in-progress';
    return 'todo';
  }

  public copiarTexto(texto: string): void {
    if (texto) {
      navigator.clipboard.writeText(texto);
    }
  }
}
