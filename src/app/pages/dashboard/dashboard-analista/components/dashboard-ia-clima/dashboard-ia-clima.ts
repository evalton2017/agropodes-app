import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import {AppModalPainelClimatico} from './modal/modal-painel-climatico';
import {DashboardAnalistaService} from '../../../service/dashboard-analista.service';
import {DashboardFiltroService} from '../../../service/dashboard-filtro.service';

export interface ResumoClimaticoEstadoDTO {
  uf: string;
  chuva_acumulada_mm: number;
  variacao_chuva_pct: number;
  temp_media_celsius: number;
  variacao_temp_celsius: number;
  dias_sem_chuva: number;
  variacao_dias_sem_chuva: number;
  vel_vento_kmh: number;
  variacao_vel_vento: number;
}

@Component({
  selector: 'dashboard-ia-clima',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule, MatDialogModule],
  templateUrl: './dashboard-ia-clima.html',
  styleUrls: ['./dashboard-ia-clima.scss'],
})
export class AppDashboardIaClima {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);
  private readonly dialog = inject(MatDialog);

  public dados = signal<ResumoClimaticoEstadoDTO[]>([]);
  public carregando = signal<boolean>(false);

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.apiService.obterIaResumoClimatico(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res: any) => {
          const lista = Array.isArray(res) ? res : (res?.dados || []);
          this.dados.set(lista);
        },
        error: (err) => {
          console.error('Erro no widget de resumo climático:', err);
          this.dados.set([]);
        }
      });
  }

  public abrirModalPainelCompleto(): void {
    if (!this.dados().length) return;

    this.dialog.open(AppModalPainelClimatico, {
      width: '900px',
      maxWidth: '95vw',
      data: this.dados()
    });
  }

  public formatarSinal(valor: number, sufixo: string = ''): string {
    if (valor === 0) return `0${sufixo}`;
    const sinal = valor > 0 ? '+' : '';
    return `${sinal}${valor}${sufixo}`;
  }
}
