import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardFiltroService } from '../service/dashboard-filtro.service';
import {DashboardKpisComponent} from './components/dashboard-kpis.component/dashboard-kpis.component';
import {AppDashboardGraficoCulturas} from './components/dashboard-grafico-culturas/app-dashboard-grafico-culturas';
import {AppDashboardGraficoEstados} from './components/dashboard-grafico-estados/app-dashboard-grafico-estados';
import {AppDashboardAlertas} from './components/dashboard-alertas.ts/app-dashboard-alertas';
import {AppDashboardContratosEstado} from './components/dashboard-contratos-estado/app-dashboard-contratos-estado';
import {AppDashboardIaClassificacao} from './components/dashboard-ia-classificacao/dashboard-ia-classificacao';
import {AppDashboardIaProdutividade} from './components/dashboard-ia-produtividade/dashboard-ia-produtividade';
import {AppDashboardIaClima} from './components/dashboard-ia-clima/dashboard-ia-clima';
import {DashboardEventosComponent} from './components/dashboard-eventos/dashboard-eventos';
import {AppDashboardAtestadosComponent} from './components/dashboard-atestados/dashboard-atestados';
import {AppDashboardAnaliseAmbiental} from './components/dashboard-analise-ambiental/app-dashboard-analise-ambiental';



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

  public filtroSafra = '2025/2026';
  public filtroEstado = 'Todos';
  public listaSafras: string[] = [];

  constructor() {
    this.listaSafras = this.gerarListaSafrasFormatadas();
    this.filtroSafra = this.listaSafras[0] || '2025/2026';
  }

  ngOnInit(): void {
    this.publicarFiltros();
  }

  /**
   * Dispara a re-filtragem instantânea de todos os widgets ao clicar na safra
   */
  public selecionarSafra(safra: string): void {
    if (this.filtroSafra !== safra) {
      this.filtroSafra = safra;
      this.publicarFiltros();
    }
  }

  private publicarFiltros(): void {
    this.filtroService.definirFiltros({
      safra: this.filtroSafra ? this.filtroSafra.trim() : '2025/2026',
      estado: this.filtroEstado
    });
  }

  private gerarListaSafrasFormatadas(): string[] {
    const anoAtual = new Date().getFullYear(); // 2026
    const safras: string[] = [];

    for (let i = 0; i < 6; i++) {
      const anoInicio = (anoAtual - 1) - i;
      const anoFim = anoInicio + 1;
      safras.push(`${anoInicio}/${anoFim}`);
    }

    return safras;
  }
}
