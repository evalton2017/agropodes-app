import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardFiltroService } from '../service/dashboard-filtro.service';
import { DashboardKpisComponent } from './components/dashboard-kpis.component/dashboard-kpis.component';
import { AppDashboardGraficoCulturas } from './components/dashboard-grafico-culturas/app-dashboard-grafico-culturas';
import { AppDashboardGraficoEstados } from './components/dashboard-grafico-estados/app-dashboard-grafico-estados';
import { AppDashboardAlertas } from './components/dashboard-alertas.ts/app-dashboard-alertas';
import { AppDashboardContratosEstado } from './components/dashboard-contratos-estado/app-dashboard-contratos-estado';
import { AppDashboardIaClassificacao } from './components/dashboard-ia-classificacao/dashboard-ia-classificacao';
import { AppDashboardIaProdutividade } from './components/dashboard-ia-produtividade/dashboard-ia-produtividade';
import { AppDashboardIaClima } from './components/dashboard-ia-clima/dashboard-ia-clima';
import { DashboardEventosComponent } from './components/dashboard-eventos/dashboard-eventos';
import { AppDashboardAtestadosComponent } from './components/dashboard-atestados/dashboard-atestados';
import { AppDashboardAnaliseAmbiental } from './components/dashboard-analise-ambiental/app-dashboard-analise-ambiental';
import { DashboardAnalistaService } from '../service/dashboard-analista.service';

@Component({
  selector: 'app-dashboard-analista',
  standalone: true,
  imports: [
    CommonModule,
    DashboardKpisComponent,
    AppDashboardGraficoCulturas,
    AppDashboardGraficoEstados,
    AppDashboardAlertas,
    AppDashboardContratosEstado,
    AppDashboardAnaliseAmbiental,
    AppDashboardIaClassificacao,
    AppDashboardIaProdutividade,
    AppDashboardIaClima,
    DashboardEventosComponent,
    AppDashboardAtestadosComponent
  ],
  templateUrl: './dashboard-analista.component.html',
  styleUrls: ['./dashboard-analista.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardAnalistaComponent implements OnInit {
  private readonly filtroService = inject(DashboardFiltroService);
  private readonly dashboardService = inject(DashboardAnalistaService);

  listaSafras: string[] = [];
  filtroSafra: string = '2025/2026';
  safraVigenteSistema: string = '2026/2027';

  ngOnInit(): void {
    this.carregarSafras();
  }

  public carregarSafras(): void {
    this.dashboardService.obterSafrasDisponiveis().subscribe({
      next: (safras) => {
        if (safras && safras.length > 0) {
          this.listaSafras = safras;
          this.safraVigenteSistema = safras[0]; // A mais recente retornada pelo backend (ex: 2026/2027)
          this.filtroSafra = safras[0];
        }
        // Dispara a publicação dos filtros com a safra obtida do banco
        this.publicarFiltros();
      },
      error: (err) => {
        console.error('Erro ao carregar safras dinâmicas:', err);
        this.publicarFiltros();
      }
    });
  }

  public selecionarSafra(safra: string): void {
    if (this.filtroSafra !== safra) {
      this.filtroSafra = safra;
      this.publicarFiltros();
    }
  }

  private publicarFiltros(): void {
    this.filtroService.definirFiltros({
      safra: this.filtroSafra ? this.filtroSafra.trim() : '2025/2026',
      estado: 'Todos'
    });
  }

  public isSafraVigente(safra: string): boolean {
    return safra === this.safraVigenteSistema;
  }
}
