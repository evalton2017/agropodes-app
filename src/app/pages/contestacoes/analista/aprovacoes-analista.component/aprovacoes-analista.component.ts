import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DetalhesContestacaoCompleto } from '../../model/contestacao.model';
import {
  VisualizarContestacaoModalComponent
} from '../../modal/visualizar-contestacao/visualizar-contestacao-modal.component';
import {ContestacaoService} from '../../service/contestacaoService.service';

@Component({
  selector: 'app-aprovacoes-analista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    VisualizarContestacaoModalComponent
  ],
  templateUrl: './aprovacoes-analista.component.html',
  styleUrls: ['./aprovacoes-analista.component.scss']
})
export class AprovacoesAnalistaComponent implements OnInit {
  private contestacaoService = inject(ContestacaoService);

  pendentes = signal<DetalhesContestacaoCompleto[]>([]);
  carregando = signal<boolean>(false);
  processandoParecer = signal<boolean>(false);

  // Controle de Modais
  modalMapaAberto = false;
  modalParecerAberto = false;
  contestacaoSelecionada: DetalhesContestacaoCompleto | null = null;

  // Formulário de Parecer
  parecerTexto = '';
  statusDecisao: 'DEFERIDO' | 'INDEFERIDO' = 'DEFERIDO';
  arquivosSelecionados: File[] = [];

  ngOnInit(): void {
    this.carregarPendentes();
  }

  carregarPendentes(): void {
    this.carregando.set(true);
    this.contestacaoService.obterAprovacoesPendentes().subscribe({
      next: (dados) => {
        this.pendentes.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar aprovações pendentes:', err);
        this.carregando.set(false);
      }
    });
  }

  visualizarMapa(item: DetalhesContestacaoCompleto): void {
    this.carregando.set(true);
    this.contestacaoService.obterDetalhesContestacao(item.id_contestacao).subscribe({
      next: (detalhes) => {
        this.contestacaoSelecionada = detalhes;
        this.modalMapaAberto = true;
        this.carregando.set(false);
      },
      error: () => {
        this.contestacaoSelecionada = item;
        this.modalMapaAberto = true;
        this.carregando.set(false);
      }
    });
  }

  fecharModalMapa(): void {
    this.modalMapaAberto = false;
    this.contestacaoSelecionada = null;
  }

  abrirModalParecer(item: DetalhesContestacaoCompleto, acao: 'DEFERIDO' | 'INDEFERIDO'): void {
    this.contestacaoSelecionada = item;
    this.statusDecisao = acao;
    this.parecerTexto = '';
    this.arquivosSelecionados = [];
    this.modalParecerAberto = true;
  }

  fecharModalParecer(): void {
    this.modalParecerAberto = false;
    this.contestacaoSelecionada = null;
    this.arquivosSelecionados = [];
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.arquivosSelecionados = Array.from(input.files);
    }
  }

  removerArquivo(index: number): void {
    this.arquivosSelecionados.splice(index, 1);
  }

  submeterParecer(): void {
    if (!this.contestacaoSelecionada) return;
    if (!this.parecerTexto.trim()) {
      alert('Por favor, informe a fundamentação/parecer técnico.');
      return;
    }

    this.processandoParecer.set(true);
    this.contestacaoService
      .enviarParecerAnalistaMultipart(
        this.contestacaoSelecionada.id_contestacao,
        this.parecerTexto,
        this.statusDecisao,
        this.arquivosSelecionados
      )
      .subscribe({
        next: () => {
          this.processandoParecer.set(false);
          this.fecharModalParecer();
          this.carregarPendentes();
        },
        error: (err) => {
          console.error('Erro ao enviar parecer:', err);
          this.processandoParecer.set(false);
          alert('Ocorreu um erro ao processar o parecer do analista.');
        }
      });
  }
}
