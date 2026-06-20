import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Chart from 'chart.js/auto';
import {ProdutividadeEstimadaResponse} from '../../../model/dashboard-produtor.model';

@Component({
  selector: 'app-dashboard-produtividade',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './dashboard-produtividade.html',
  styleUrls: ['./dashboard-produtividade.scss']
})
export class DashboardProdutividadeComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) dados!: ProdutividadeEstimadaResponse;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chartInstance?: Chart;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dados'] && !changes['dados'].firstChange) {
      this.renderizarGrafico();
    }
  }

  ngAfterViewInit(): void {
    this.renderizarGrafico();
  }

  private renderizarGrafico(): void {
    if (!this.chartCanvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.dados.grafico_linha.map(item => item.mes);
    const valores = this.dados.grafico_linha.map(item => item.valor);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'sc/ha',
          data: valores,
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#2e7d32',
          pointRadius: 4,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 30,
            max: 90,
            ticks: { stepSize: 15, color: '#666' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: { grid: { display: false }, ticks: { color: '#666' } }
        }
      }
    });
  }
}
