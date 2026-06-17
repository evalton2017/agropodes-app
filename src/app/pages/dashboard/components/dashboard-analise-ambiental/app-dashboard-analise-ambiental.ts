import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { DashboardAnalistaService } from '../../service/dashboard-analista.service';
import { DashboardFiltroService } from '../../service/dashboard-filtro.service';

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
    this.apiService.obterIaAnaliseAmbiental(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe(res => this.dados.set(res));
  }
}
