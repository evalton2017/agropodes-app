import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import {DashboardAnalistaService} from '../../../service/dashboard-analista.service';
import {DashboardFiltroService} from '../../../service/dashboard-filtro.service';


export interface EventoClimaticoDTO {
  evento: 'Veranico' | 'Excesso de chuva' | 'Granizo' | 'Geada' | 'Vento forte';
  municipio: string;
  data: string;
  impacto: 'Alto' | 'Médio' | 'Baixo';
  glebas_afetadas: number;
}

@Component({
  selector: 'dashboard-eventos',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './dashboard-eventos.html',
  styleUrls: ['./dashboard-eventos.scss']
})
export class DashboardEventosComponent {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  public eventosClimaticos = signal<EventoClimaticoDTO[]>([]);
  public carregando = signal<boolean>(false);

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.apiService.obterEventosClimaticosRecentes(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res: any) => {
          // Trata tanto retorno direto em lista quanto envelopado no objeto "dados"
          const lista = Array.isArray(res) ? res : (res?.dados || []);
          this.eventosClimaticos.set(lista);
        },
        error: (err) => {
          console.error('Erro ao buscar eventos climáticos recentes:', err);
          this.eventosClimaticos.set([]);
        }
      });
  }

  protected obterIconeEvento(evento: string): string {
    const nome = evento?.toLowerCase() ?? '';
    if (nome.includes('chuva') || nome.includes('excesso')) return 'water_drop';
    if (nome.includes('vento') || nome.includes('tempestade')) return 'air';
    if (nome.includes('granizo')) return 'gpp_maybe';
    if (nome.includes('geada') || nome.includes('frio')) return 'ac_unit';
    return 'wb_sunny';
  }

  protected obterClasseBadgeImpacto(impacto: string): string {
    switch (impacto) {
      case 'Alto':
        return 'critico';
      case 'Médio':
        return 'alerta';
      case 'Baixo':
      default:
        return 'sucesso';
    }
  }
}
