import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { DashboardAnalistaService } from '../../service/dashboard-analista.service';
import { DashboardFiltroService } from '../../service/dashboard-filtro.service';

export interface TopCulturaItem {
  nome: string;
  percentual: number;
}

export interface RespostaIaClassificacaoDTO {
  acuracia_media: number;
  total_glebas_analisadas: number;
  ultima_analise: string;
  top_culturas: TopCulturaItem[];
}

@Component({
  selector: 'dashboard-ia-classificacao',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './dashboard-ia-classificacao.html',
  styleUrls: ['./dashboard-ia-classificacao.scss']
})
export class AppDashboardIaClassificacao {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  public dados = signal<RespostaIaClassificacaoDTO | null>(null);
  public carregando = signal<boolean>(false);

  private readonly paletaCoresDot = ['b-green', 'b-amber', 'b-purple', 'b-blue', 'b-slate'];

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.apiService.obterIaClassificacaoCulturas(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) => this.dados.set(res),
        error: (err) => console.error('Erro ao carregar classificação de culturas:', err)
      });
  }

  // Define a cor da bolinha da legenda conforme o índice da cultura
  public obterClasseDot(index: number): string {
    return this.paletaCoresDot[index % this.paletaCoresDot.length];
  }
}
