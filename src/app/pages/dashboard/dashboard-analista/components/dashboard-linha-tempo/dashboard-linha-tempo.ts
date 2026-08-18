import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import {DashboardAnalistaService} from '../../../service/dashboard-analista.service';
import {DashboardFiltroService} from '../../../service/dashboard-filtro.service';


@Component({
  selector: 'dashboard-linha-tempo',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './dashboard-linha-tempo.html',
  styleUrls: ['./dashboard-linha-tempo.scss']
})
export class AppDashboardLinhaTempoComponent {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  public passosTimeline = signal<any[]>([]);
  public carregando = signal<boolean>(false);

  constructor() {
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    // Chame sua API de contagem por etapa (Exemplo usando ID padrão ou genérico)
    this.apiService.obterTimelineGleba(0)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) => {
          this.passosTimeline.set(res?.length ? res : [
            { nome: 'Validação Geométrica', count: '5.981', status: 'sucesso', icone: 'check_circle' },
            { nome: 'Consulta CAR', count: '5.981', status: 'sucesso', icone: 'check_circle' },
            { nome: 'Análise Ambiental', count: '5.432', status: 'alerta', icone: 'radio_button_checked' },
            { nome: 'IA - Classificação de Culturas', count: '5.981', status: 'alerta', icone: 'warning' },
            { nome: 'ZARC - Zoneamento', count: '5.764', status: 'alerta', icone: 'radio_button_checked' },
            { nome: 'Produtividade (IA)', count: '4.937', status: 'critico', icone: 'radio_button_checked' },
            { nome: 'Emissão de Atestado', count: '4.558', status: 'sucesso', icone: 'check_circle' }
          ]);
        },
        error: () => this.carregando.set(false)
      });
  }
}
