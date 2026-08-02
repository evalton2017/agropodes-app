import {Component, inject, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {DashboardFiltroService} from '../service/dashboard-filtro.service';

//  Módulos / Componentes Filhos Autônomos (Widgets)
import {DashboardKpisComponent} from '../components/dashboard-kpis.component/dashboard-kpis.component';
import {AppDashboardGraficoCulturas} from '../components/dashboard-grafico-culturas/app-dashboard-grafico-culturas';
import {AppDashboardGraficoEstados} from '../components/dashboard-grafico-estados/app-dashboard-grafico-estados';
import {AppDashboardAlertas} from '../components/dashboard-alertas.ts/app-dashboard-alertas';
import {AppDashboardContratosEstado} from '../components/dashboard-contratos-estado/app-dashboard-contratos-estado';
import {AppDashboardAnaliseAmbiental} from '../components/dashboard-analise-ambiental/app-dashboard-analise-ambiental';
import {AppDashboardIaClassificacao} from '../components/dashboard-ia-classificacao/dashboard-ia-classificacao';
import {AppDashboardIaProdutividade} from '../components/dashboard-ia-produtividade/dashboard-ia-produtividade';
import {AppDashboardIaClima} from '../components/dashboard-ia-clima/dashboard-ia-clima';
import {DashboardEventosComponent} from '../components/dashboard-eventos/dashboard-eventos';
import {AppDashboardAtestadosComponent} from '../components/dashboard-atestados/dashboard-atestados';


@Component({
  selector: 'app-dashboard-analista',
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
    DashboardKpisComponent,
    DashboardKpisComponent,
    AppDashboardGraficoCulturas,
    AppDashboardGraficoCulturas,
    AppDashboardGraficoEstados,
    AppDashboardAlertas,
    AppDashboardContratosEstado,
    AppDashboardAnaliseAmbiental,
    AppDashboardIaClassificacao,
    AppDashboardIaProdutividade,
    AppDashboardIaClima,
    DashboardEventosComponent,
    AppDashboardAtestadosComponent,
    AppDashboardAtestadosComponent
  ],
  templateUrl: './dashboard-analista.component.html',
  styleUrls: ['./dashboard-analista.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardAnalistaComponent implements OnInit {
  // Injeta o serviço de comunicação de filtros utilizando o padrão moderno inject()
  private readonly filtroService = inject(DashboardFiltroService);

  // Formulário Reativo para a seleção do Período de Análise
  public rangeData = new FormGroup({
    inicio: new FormControl<Date | null>(new Date('2021-06-01')),
    fim: new FormControl<Date | null>(new Date('2026-06-13')),
  });

  // Variáveis de controle dos filtros da barra superior vinculadas via [(value)] no HTML
  public filtroSafra = '2025/2026';
  public filtroEstado = 'Todos';
  public filtroMunicipio: number | undefined;
  public listaSafras: string[] = [];

  constructor() {
    this.listaSafras = this.gerarListaSafras();
    this.filtroSafra = this.listaSafras[0] || '2025/2026';
  }

  ngOnInit(): void {
    this.publicarFiltros();
  }

  /**
   * Função chamada exclusivamente pelo clique do botão "Filtrar" no HTML
   */
  public aplicarFiltros(): void {
    this.publicarFiltros();
  }

  /**
   * Captura o estado atual dos inputs da tela, formata os dados e atualiza o Signal centralizador
   */
  private publicarFiltros(): void {
    const dataInicioFormatada = this.rangeData.value.inicio?.toISOString().split('T')[0];
    const dataFimFormatada = this.rangeData.value.fim?.toISOString().split('T')[0];

    this.filtroService.definirFiltros({
      safra: this.filtroSafra ? this.filtroSafra.trim() : '2025/2026',
      inicio: dataInicioFormatada,
      fim: dataFimFormatada,
      estado: this.filtroEstado
    });
  }

  /**
   * Gera dinamicamente o array de safras para alimentar o mat-select
   */
  private gerarListaSafras(): string[] {
    const anoAtual = new Date().getFullYear();
    const safras: string[] = [];

    // Gera as safras de forma dinâmica (ex: 2024/2025, 2025/2026, 2026/2027)
    for (let i = -5; i <= 1; i++) {
      const anoInicio = anoAtual + i;
      const anoFim = anoInicio + 1;
      safras.push(`${anoInicio}/${anoFim}`);
    }
    return safras;
  }
}
