import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {finalize} from 'rxjs/operators';
import {Chart, registerables} from 'chart.js';
import {DashboardAnalistaService} from '../../service/dashboard-analista.service';
import {DashboardFiltroService} from '../../service/dashboard-filtro.service';

Chart.register(...registerables);

@Component({
  selector: 'dashboard-ia-produtividade',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './dashboard-ia-produtividade.html',
  styleUrls: ['./dashboard-ia-produtividade.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppDashboardIaProdutividade implements OnDestroy {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('miniGraficoLinha') miniGraficoLinha!: ElementRef<HTMLCanvasElement>;

  public dados = signal<any>(null);
  public carregando = signal<boolean>(false);
  private chartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.apiService.obterIaProdutividadeEstimada(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) => {
          this.dados.set(res);

          if (!isPlatformBrowser(this.platformId)) return;

          requestAnimationFrame(() => {
            this.renderizarMiniGrafico();
          });
        },
        error: (err) => {
          console.error('Erro no widget de produtividade IA:', err);
          this.dados.set(null);
          this.destruirGraficoExistente();
        }
      });
  }

  private renderizarMiniGrafico(): void {
    // 🛑 TRAVA CRÍTICA: Bloqueia a execução do Chart.js e manipulação de Canvas Context no Servidor
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.miniGraficoLinha) return;

    this.destruirGraficoExistente();

    const historico = this.dados()?.evolucao_produtividade ?? [];
    let labels: string[] = [];
    let valores: number[] = [];

    if (historico && historico.length > 0) {
      historico.forEach((item: any) => {
        const safraLabel = item.safra ?? item.ano ?? item.periodo ?? '';
        labels.push(String(safraLabel));

        const valorBruto = item.valor ?? item.sacas ?? item.produtividade ?? item.quantidade ?? 0;

        let numeroPuro = 0;
        if (typeof valorBruto === 'string') {
          const apenasNumeros = valorBruto.replace(/[^0-9.,-]/g, '').replace(',', '.');
          numeroPuro = parseFloat(apenasNumeros);
        } else {
          numeroPuro = Number(valorBruto);
        }

        valores.push(isNaN(numeroPuro) || numeroPuro === 0 ? 59 : numeroPuro);
      });
    } else {
      labels = ['21/22', '22/23', '23/24', '24/25', '25/26'];
      valores = [] ;
    }

    const ctx = this.miniGraficoLinha.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sacas/ha',
          data: valores,
          borderColor: '#2563eb',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: chartCtx, chartArea } = chart;
            if (!chartArea) return 'transparent';
            const gradient = chartCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0.15)');
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
            return gradient;
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => ` ${context.parsed.y} sc/ha`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 9, weight: 500 } }
          },
          y: {
            min: 30,
            max: 90,
            grid: { color: '#f1f5f9' },
            ticks: { color: '#94a3b8', font: { size: 9 }, stepSize: 20 }
          }
        }
      }
    });
  }

  private destruirGraficoExistente(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  ngOnDestroy(): void {
    this.destruirGraficoExistente();
  }
}
