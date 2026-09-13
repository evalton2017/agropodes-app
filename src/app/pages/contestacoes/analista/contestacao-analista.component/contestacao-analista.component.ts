import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {ContestacaoService} from '../../service/contestacaoService.service';
import {ContestacaoAnalista, DetalhesContestacaoCompleto} from '../../model/contestacao.model';
import {
  VisualizarContestacaoModalComponent
} from '../../modal/visualizar-contestacao/visualizar-contestacao-modal.component';

@Component({
  selector: 'app-contestacao-analista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    VisualizarContestacaoModalComponent
  ],
  templateUrl: './contestacao-analista.component.html',
  styleUrls: ['./contestacao-analista.component.scss']
})
export class ContestacaoAnalistaComponent implements OnInit {
  private contestacaoService = inject(ContestacaoService);

  contestacoes = signal<ContestacaoAnalista[]>([]);
  carregando = signal<boolean>(false);

  // Controle do Modal Reutilizável
  modalDetalhesAberto = false;
  contestacaoSelecionada: DetalhesContestacaoCompleto | null = null;
  isBaixandoRelatorio = false;
  downloadEmAndamentoId: number | null = null;

  // Filtros de busca
  dataInicio = '';
  dataFim = '';
  statusFiltro = '';

  ngOnInit(): void {
    this.carregarContestacoes();
  }

  carregarContestacoes(): void {
    this.carregando.set(true);
    this.contestacaoService
      .listarContestacoes(this.dataInicio, this.dataFim, this.statusFiltro)
      .subscribe({
        next: (dados) => {
          this.contestacoes.set(dados);
          this.carregando.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar contestações:', err);
          this.carregando.set(false);
        }
      });
  }

  limparFiltros(): void {
    this.dataInicio = '';
    this.dataFim = '';
    this.statusFiltro = '';
    this.carregarContestacoes();
  }

  detalharContestacao(item: ContestacaoAnalista): void {
    this.carregando.set(true);

    this.contestacaoService.obterDetalhesContestacao(item.id_contestacao).subscribe({
      next: (dadosDetalhados) => {
        this.contestacaoSelecionada = dadosDetalhados;
        this.modalDetalhesAberto = true;
        this.carregando.set(false);
      },
      error: (err) => {
        console.error(`Erro ao obter detalhes da contestação #${item.id_contestacao}:`, err);
        this.carregando.set(false);
      }
    });
  }

  fecharModalDetalhes(): void {
    this.modalDetalhesAberto = false;
    this.contestacaoSelecionada = null;
  }

  emitirRelatorio(item: ContestacaoAnalista): void {
    if (this.downloadEmAndamentoId === item.id_contestacao) return;

    this.downloadEmAndamentoId = item.id_contestacao;

    this.contestacaoService.downloadRelatorioPdf(item.id_contestacao).subscribe({
      next: (blob: Blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `Relatorio_Contestacao_${item.id_contestacao}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(urlBlob);
        this.downloadEmAndamentoId = null;
      },
      error: (err) => {
        console.error('Erro ao baixar o relatório:', err);
        this.downloadEmAndamentoId = null;
      }
    });
  }


  obterClasseBadge(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DEFERIDO':
      case 'APROVADO':
        return 'dot-concluido';
      case 'PENDENTE':
      case 'EM_ANALISE':
        return 'dot-andamento';
      case 'INDEFERIDO':
      case 'REPROVADO':
        return 'dot-nao-conforme';
      default:
        return 'dot-pendente';
    }
  }
}
