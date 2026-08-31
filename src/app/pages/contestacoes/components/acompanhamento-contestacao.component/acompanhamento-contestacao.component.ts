import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContestacaoService } from '../../service/contestacaoService.service';
import { ContestacaoItemAcompanhamento, DetalhesContestacaoCompleto } from '../../model/contestacao.model';
import { LoadingService } from '../../../../shared/service/loading.service';
import {
  VisualizarContestacaoModalComponent
} from '../../modal/visualizar-contestacao/visualizar-contestacao-modal.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@Component({
  selector: 'app-acompanhamento-contestacao',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    VisualizarContestacaoModalComponent
  ],
  templateUrl: './acompanhamento-contestacao.component.html',
  styleUrls: ['./acompanhamento-contestacao.component.scss']
})
export class AcompanhamentoContestacaoComponent implements OnInit {
  public idProdutor: number = 1; // Substituir pelo ID dinâmico do usuário/produtor logado
  public listaContestacoes: ContestacaoItemAcompanhamento[] = [];
  public carregando: boolean = true;

  public modalCancelarAberto: boolean = false;
  public contestacaoParaCancelar?: ContestacaoItemAcompanhamento;

  // Modal de Detalhes
  public modalDetalhesAberto: boolean = false;
  public contestacaoSelecionada?: DetalhesContestacaoCompleto;
  isBaixandoRelatorio = false;
  downloadEmAndamentoId: number | null = null;

  public displayedColumns: string[] = [
    'id',
    'tipo',
    'alvo',
    'car',
    'data',
    'status',
    'acoes'
  ];

  constructor(
    private contestacaoService: ContestacaoService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarAcompanhamento();
  }

  carregarAcompanhamento(): void {
    this.carregando = true;
    this.loadingService.show();

    this.contestacaoService.listarAcompanhamento(this.idProdutor).subscribe({
      next: (data) => {
        this.listaContestacoes = data;
        this.carregando = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar contestações:', err);
        this.carregando = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  onVisualizar(idContestacao: number): void {
    this.loadingService.show();
    this.contestacaoService.obterDetalhesContestacao(idContestacao).subscribe({
      next: (detalhes) => {
        this.contestacaoSelecionada = detalhes;
        this.modalDetalhesAberto = true;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar detalhes da contestação:', err);
        this.loadingService.hide();
      }
    });
  }

  onGerarRelatorio(idContestacao: number): void {
    if (this.downloadEmAndamentoId === idContestacao) return;

    this.downloadEmAndamentoId = idContestacao;

    this.contestacaoService.downloadRelatorioPdf(idContestacao).subscribe({
      next: (blob: Blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `Relatorio_Contestacao_${idContestacao}.pdf`;

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

  fecharModalDetalhes(): void {
    this.modalDetalhesAberto = false;
    this.contestacaoSelecionada = undefined;
  }

  onCancelar(contestacao: ContestacaoItemAcompanhamento): void {
    this.contestacaoParaCancelar = contestacao;
    this.modalCancelarAberto = true;
  }

  confirmarCancelamento(): void {
    if (!this.contestacaoParaCancelar) return;

    const id = this.contestacaoParaCancelar.id_contestacao;
    this.modalCancelarAberto = false;
    this.loadingService.show();

    this.contestacaoService.cancelarContestacao(id).subscribe({
      next: () => {
        this.contestacaoParaCancelar = undefined;
        this.carregarAcompanhamento();
      },
      error: (err) => {
        console.error('Erro ao cancelar contestação:', err);
        this.contestacaoParaCancelar = undefined;
        this.loadingService.hide();
      }
    });
  }

  fecharModalCancelar(): void {
    this.modalCancelarAberto = false;
    this.contestacaoParaCancelar = undefined;
  }
}
