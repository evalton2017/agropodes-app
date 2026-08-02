import { Component, inject, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { DashboardAnalistaService } from '../../service/dashboard-analista.service';
import { DashboardFiltroService } from '../../service/dashboard-filtro.service';

export interface RespostaAnaliseAmbientalDTO {
  conforme_pct: number;
  atencao_pct: number;
  nao_conforme_pct: number;
}

@Component({
  selector: 'dashboard-analise-ambiental',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './app-dashboard-analise-ambiental.html',
  styleUrls: ['./app-dashboard-analise-ambiental.scss']
})
export class AppDashboardAnaliseAmbiental {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  public dados = signal<RespostaAnaliseAmbientalDTO | null>(null);
  public carregando = signal<boolean>(false);

  public estiloDonutGradiente = computed(() => {
    const d = this.dados();
    if (!d) return {};

    const conf = d.conforme_pct || 0;
    const atencao = d.atencao_pct || 0;
    const naoConf = d.nao_conforme_pct || 0;

    const p1 = conf;
    const p2 = conf + atencao;

    return {
      'background': `conic-gradient(
        #10b981 0% ${p1}%,
        #f59e0b ${p1}% ${p2}%,
        #f43f5e ${p2}% 100%
      )`
    };
  });

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.apiService.obterIaAnaliseAmbiental(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) => this.dados.set(res),
        error: (err) => console.error('Erro ao carregar análise ambiental:', err)
      });
  }
}
