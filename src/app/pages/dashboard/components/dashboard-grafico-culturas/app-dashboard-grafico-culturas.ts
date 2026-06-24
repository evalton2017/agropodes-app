import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {finalize} from 'rxjs/operators';
import {DashboardAnalistaService} from '../../service/dashboard-analista.service';
import {DashboardFiltroService} from '../../service/dashboard-filtro.service';
import {DataCultura} from '../../model/dashboard-analista.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'dashboard-grafico-culturas',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './app-dashboard-grafico-culturas.html',
  styleUrls: ['./app-dashboard-grafico-culturas.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppDashboardGraficoCulturas {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  canvasCultura = viewChild<ElementRef<HTMLCanvasElement>>('canvasCultura');
  chartDonutInstance: Chart | null = null;
  L: any = null;

  public dadosCulturas = signal<DataCultura[]>([]);
  public carregando = signal<boolean>(false);
  public erro = signal<boolean>(false);

  public totalContratosCultura = computed(() => {
    return this.dadosCulturas().reduce((acc, item) => acc + item.quantidade, 0);
  });

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.apiService.obterDashboardCultura(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) => {
          const dadosMapeados = res?.data.map((item: any) => ({
            cultura: item.cultura,
            quantidade: item.quantidade,
            percentual: item.percentual
          })) ?? [];

          this.dadosCulturas.set(dadosMapeados);
          this.renderizarDonut();
        },
        error: (err) => {
          console.error('Erro no widget de culturas:', err);
          this.erro.set(true);
        }
      });
  }

  private renderizarDonut(): void {
    const refDonut = this.canvasCultura();

    if (this.dadosCulturas().length > 0 && refDonut) {
      this.renderizarGraficoDonut(refDonut.nativeElement, this.dadosCulturas());
    }

  }

  private renderizarGraficoDonut(canvas: HTMLCanvasElement, dados: DataCultura[]): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.chartDonutInstance) this.chartDonutInstance.destroy();
    this.chartDonutInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: dados.map(d => d.cultura),
        datasets: [{
          data: dados.map(d => d.quantidade),
          backgroundColor: ['#16a34a', '#eab308', '#a855f7', '#f97316', '#2563eb', '#94a3b8'],
          borderWidth: 0
        }]
      },
      options: {responsive: true, maintainAspectRatio: false, cutout: '78%', plugins: {legend: {display: false}}}
    });
  }

  public dadosCulturasComPercentual = computed(() => {
    const total = this.totalContratosCultura();
    if (total === 0) return this.dadosCulturas().map(item => ({ ...item, percentual: 0 }));

    return this.dadosCulturas().map(item => ({
      ...item,
      percentual: parseFloat(((item.quantidade / total) * 100).toFixed(1)) // Retorna ex: 33.3
    }));
  });
}
