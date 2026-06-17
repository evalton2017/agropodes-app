import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { DashboardAnalistaService } from '../../service/dashboard-analista.service';
import { DashboardFiltroService } from '../../service/dashboard-filtro.service';

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

  public dados = signal<any>(null);
  public carregando = signal<boolean>(false);

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
      .subscribe(res => this.dados.set(res));
  }
}
