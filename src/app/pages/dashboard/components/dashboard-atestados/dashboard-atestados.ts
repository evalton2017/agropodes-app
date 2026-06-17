import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { DashboardAnalistaService } from '../../service/dashboard-analista.service';
import { DashboardFiltroService } from '../../service/dashboard-filtro.service';

@Component({
  selector: 'dashboard-atestados',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './dashboard-atestados.html',
  styleUrls: ['./dashboard-atestados.scss']
})
export class AppDashboardAtestadosComponent {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  public ultimosAtestados = signal<any[]>([]);
  public carregando = signal<boolean>(false);

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.apiService.getUltimosAtestados()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) => this.ultimosAtestados.set(res || []),
        error: () => this.ultimosAtestados.set([])
      });
  }
}
