import {Component, effect, ElementRef, inject, PLATFORM_ID, signal, viewChild, ViewEncapsulation} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {finalize} from 'rxjs/operators';
import Chart from 'chart.js/auto';
import {DashboardAnalistaService} from '../../../service/dashboard-analista.service';
import {DashboardFiltroService} from '../../../service/dashboard-filtro.service';
import {DataEstado} from '../../../model/dashboard-analista.model';

@Component({
  selector: 'dashboard-contratos-estado',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './app-dashboard-contratos-estado.html',
  styleUrls: ['./app-dashboard-contratos-estado.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppDashboardContratosEstado {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  chartBarInstance: Chart | null = null;
  canvasBarras = viewChild<ElementRef<HTMLCanvasElement>>('canvasBarras');

  public dadosEstados = signal<DataEstado[]>([]);
  public carregando = signal<boolean>(false);

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private async buscarDados(filtros: any): Promise<void> {
    this.carregando.set(true);
    this.apiService.obterDashboardDistribuicaoEstado(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe(res => {
        this.dadosEstados.set(res?.data ?? []);
        this.inicializarGraficosEMapa();
      });
  }

  private async inicializarGraficosEMapa(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const refBarras = this.canvasBarras();

    if (this.dadosEstados().length > 0 && refBarras) {
      this.renderizarGraficoBarras(refBarras.nativeElement, this.dadosEstados());
    }

  }


  private renderizarGraficoBarras(canvas: HTMLCanvasElement, dados: DataEstado[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.chartBarInstance) this.chartBarInstance.destroy();
    this.chartBarInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: dados.map(d => d.estado),
        datasets: [{
          data: dados.map(d => d.quantidade),
          backgroundColor: '#16a34a',
          borderRadius: 4,
          barThickness: 10
        }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
          y: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 500 }, color: '#475569' } }
        }
      }
    });
  }


}
