import { Component, inject, signal, computed, effect, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DashboardFiltroService } from '../service/dashboard-filtro.service';
import { DashboardProdutorService } from '../service/dashboard-produtor.service';
import { PessoaService } from '../../../service/pessoa.service';
import { RespostaDashboardProdutor } from '../model/dashboard-produtor.model';
import { DashboardProdutorResumoComponent } from './components/dashboard-produtor-resumo.component/dashboard-produtor-resumo.component';
import {
  DashboardProdutorDetalhesComponent
} from './components/dashboard-produtor-detalhes.component/dashboard-produtor-detalhes.component';

@Component({
  selector: 'app-dashboard-produtor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    DashboardProdutorResumoComponent,
    DashboardProdutorDetalhesComponent,
    // Adicione aqui os futuros widgets da tela do produtor (ex: Tabelas, Gráficos)
  ],
  templateUrl: './dashboard-produtor.html',
  styleUrls: ['./dashboard-produtor.scss']
})
export class DashboardProdutorComponent implements OnInit {
  private readonly filtroService = inject(DashboardFiltroService);
  private readonly produtorService = inject(DashboardProdutorService);
  private readonly pessoaService = inject(PessoaService);
  private readonly destroyRef = inject(DestroyRef);

  // Formulário Reativo para seleção do Período de Análise (Igual ao Analista)
  public rangeData = new FormGroup({
    inicio: new FormControl<Date | null>(new Date('2021-06-01')),
    fim: new FormControl<Date | null>(new Date('2026-06-13')),
  });

  // Controles reativos da barra de filtros mapeados no HTML
  public filtroSafra = '2025/2026';
  public listaSafras: string[] = [];

  // Sinal computado para ler reativamente a sessão assíncrona do Keycloak
  produtor = computed(() => this.pessoaService.produtorAtual());

  // Sinal que guardará o resultado consolidado vindo da API Python
  dadosProdutor = signal<RespostaDashboardProdutor | null>(null);

  constructor() {
    this.listaSafras = this.generarListaSafras();
    this.filtroSafra = this.listaSafras[1] || '2025/2026';

    // O effect() monitora as mutações do Keycloak e dos Filtros Ativos de forma atômica
    effect(() => {
      const produtorLogado = this.produtor();
      const filtrosAtivos = this.filtroService.filtrosAtivos();

      if (!produtorLogado || !produtorLogado.id) {
        console.warn('⚠️ [VMG Dashboard] Aguardando autenticação estável do Keycloak...');
        return;
      }

      // Executa a busca assíncrona baseada no barramento estável de dados
      this.produtorService.obterResumoProdutor(produtorLogado.id, filtrosAtivos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resposta) => this.dadosProdutor.set(resposta),
          error: (err) => console.error('Erro ao processar resumo do produtor no Ledger:', err)
        });
    });
  }

  ngOnInit(): void {
    this.publicarFiltros();
  }

  public aplicarFiltros(): void {
    this.publicarFiltros();
  }

  private publicarFiltros(): void {
    const dataInicioFormatada = this.rangeData.value.inicio?.toISOString().split('T')[0];
    const dataFimFormatada = this.rangeData.value.fim?.toISOString().split('T')[0];

    this.filtroService.definirFiltros({
      safra: this.filtroSafra ? this.filtroSafra.trim() : '2025/2026',
      inicio: dataInicioFormatada,
      fim: dataFimFormatada,
      estado: 'Todos' // O Dashboard do produtor foca nas propriedades dele, mantendo o default
    });
  }

  private generarListaSafras(): string[] {
    const anoAtual = new Date().getFullYear();
    const safras: string[] = [];
    for (let i = -1; i <= 1; i++) {
      const anoInicio = anoAtual + i;
      const anoFim = anoInicio + 1;
      safras.push(`${anoInicio}/${anoFim}`);
    }
    return safras;
  }
}
