import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { DashboardAnalistaService } from '../../service/dashboard-analista.service';
import { DashboardFiltroService } from '../../service/dashboard-filtro.service';
import { AlertaCritico } from '../../model/dashboard-analista.model';

@Component({
  selector: 'app-dashboard-alertas',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './app-dashboard-alertas.html',
  styleUrls: ['./app-dashboard-alertas.scss']
})
export class AppDashboardAlertas {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  public alertas = signal<AlertaCritico[]>([]);
  public carregando = signal<boolean>(false);
  public erro = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.filtroService.filtrosAtivos();
      this.buscarAlertas();
    });
  }

  private buscarAlertas(): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.apiService.obterDashboardAlertas()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) => this.alertas.set(res || []),
        error: (err) => {
          console.error('Erro no widget de alertas:', err);
          this.erro.set(true);
        }
      });
  }
}
