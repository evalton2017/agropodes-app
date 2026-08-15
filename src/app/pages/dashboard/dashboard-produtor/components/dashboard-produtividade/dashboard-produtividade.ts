import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Chart from 'chart.js/auto';
import { ProdutividadeEstimadaResponse } from '../../../model/dashboard-produtor.model';

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

    const labels = this.dados?.grafico_linha?.map(item => item.mes) || [];
    const valores = this.dados?.grafico_linha?.map(item => item.valor) || [];

    // Cria gradiente vertical para o fundo da linha
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(163, 230, 53, 0.35)'); // Verde Lima no topo
    gradient.addColorStop(1, 'rgba(163, 230, 53, 0.0)');  // Transparente na base

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'sc/ha',
          data: valores,
          borderColor: '#A3E635',             // Linha principal Verde Lima
          backgroundColor: gradient,            // Preenchimento gradiente
          borderWidth: 3,                       // Espessura da linha
          pointBackgroundColor: '#A3E635',      // Ponto Verde Lima
          pointBorderColor: '#122B24',          // Borda do ponto igual ao fundo do card
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false                      // Oculta legenda desnecessária
          },
          tooltip: {
            backgroundColor: '#06120E',
            titleColor: '#A3E635',
            bodyColor: '#FFFFFF',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            padding: 10,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(255, 255, 255, 0.08)' // Linhas horizontais sutis
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',  // Texto claro no eixo Y
              font: { family: 'Inter', size: 11 }
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)' // Linhas verticais discretas
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',  // Texto claro no eixo X
              font: { family: 'Inter', size: 11 }
            }
          }
        }
      }
    });
  }
}
