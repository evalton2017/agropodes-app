import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { DashboardAnalistaService } from '../../service/dashboard-analista.service';
import { DashboardFiltroService } from '../../service/dashboard-filtro.service';

export interface AtestadoDTO {
  codigo_gleba: string;
  produtor: string;
  municipio: string;
  data: string;
  status: string;
}

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

  public ultimosAtestados = signal<AtestadoDTO[]>([]);
  public carregando = signal<boolean>(false);

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.apiService.obterUltimosAtestados(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res: any) => {
          const lista = Array.isArray(res) ? res : (res?.dados || []);
          this.ultimosAtestados.set(lista);
        },
        error: (err) => {
          console.error('Erro ao buscar últimos atestados emitidos:', err);
          this.ultimosAtestados.set([]);
        }
      });
  }

  protected obterClasseStatus(status: string): string {
    const st = (status || '').toLowerCase();
    if (st.includes('emitido') || st.includes('válido') || st.includes('valido')) return 'sucesso';
    if (st.includes('pendente') || st.includes('processando')) return 'alerta';
    return 'critico';
  }
}
