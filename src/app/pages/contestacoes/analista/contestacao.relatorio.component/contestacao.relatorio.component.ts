import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {RelatorioService} from '../../../relatorios/relatorio.service';
import {DashboardAnalistaService} from '../../../dashboard/service/dashboard-analista.service';
import {DashboardAnalistaResponse, FiltrosRelatorioAnalista} from '../../../model/relatorio-contestacao.model';


@Component({
  selector: 'app-contestacao-relatorio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './contestacao.relatorio.component.html',
  styleUrl: './contestacao.relatorio.component.scss'
})
export class ContestacaoRelatorioComponent implements OnInit {
  private readonly relatorioService = inject(RelatorioService);
  private readonly dashboardAnalistaService = inject(DashboardAnalistaService);

  carregando = signal<boolean>(false);
  exportandoPdfId = signal<number | null>(null);
  dadosDashboard = signal<DashboardAnalistaResponse | null>(null);

  // Safras Dinâmicas do Banco de Dados
  listaSafras = signal<string[]>([]);
  safraVigenteSistema = signal<string>('2026/2027');
  safraSelecionada = signal<string>('2026/2027');

  // Filtros Reativos Secundários
  statusSelecionado = signal<string>('');
  buscaCar = signal<string>('');
  dataInicio = signal<string>('');
  dataFim = signal<string>('');

  ngOnInit(): void {
    this.carregarSafrasDinamicas();
  }

  /**
   * 🟢 Busca todas as safras cadastradas no backend via DashboardAnalistaService
   */
  carregarSafrasDinamicas(): void {
    this.dashboardAnalistaService.obterSafrasDisponiveis().subscribe({
      next: (safras) => {
        if (safras && safras.length > 0) {
          this.listaSafras.set(safras);
          this.safraVigenteSistema.set(safras[0]); // A safra mais recente retornada pelo backend
          this.safraSelecionada.set(safras[0]);
        }
        this.carregarRelatorio();
      },
      error: (err) => {
        console.error('Erro ao carregar safras dinâmicas no relatório:', err);
        // Fallback caso falhe a busca
        this.listaSafras.set(['2026/2027', '2025/2026', '2024/2025']);
        this.carregarRelatorio();
      }
    });
  }

  selecionarSafra(safra: string): void {
    if (this.safraSelecionada() !== safra) {
      this.safraSelecionada.set(safra);
      this.carregarRelatorio();
    }
  }

  isSafraVigente(safra: string): boolean {
    return safra === this.safraVigenteSistema();
  }

  carregarRelatorio(): void {
    this.carregando.set(true);

    const filtros: FiltrosRelatorioAnalista = {
      safra: this.safraSelecionada(),
      status: this.statusSelecionado() || undefined,
      codigo_car: this.buscaCar().trim() || undefined,
      data_inicio: this.dataInicio() || undefined,
      data_fim: this.dataFim() || undefined
    };

    this.relatorioService.obterDashboardAnalista(filtros).subscribe({
      next: (dados) => {
        this.dadosDashboard.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar dados do relatório:', err);
        this.carregando.set(false);
      }
    });
  }

  limparFiltros(): void {
    if (this.listaSafras().length > 0) {
      this.safraSelecionada.set(this.listaSafras()[0]);
    }
    this.statusSelecionado.set('');
    this.buscaCar.set('');
    this.dataInicio.set('');
    this.dataFim.set('');
    this.carregarRelatorio();
  }

  baixarPdfLaudo(idContestacao: number): void {
    this.exportandoPdfId.set(idContestacao);

    this.relatorioService.exportarContestacaoPdf(idContestacao).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laudo_Contestacao_AgroProds_${idContestacao}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportandoPdfId.set(null);
      },
      error: (err) => {
        console.error('Erro ao baixar PDF da contestação:', err);
        this.exportandoPdfId.set(null);
      }
    });
  }
}
