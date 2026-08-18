import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {finalize} from 'rxjs/operators';
import {DashboardAnalistaService} from '../../../service/dashboard-analista.service';
import {DashboardFiltroService} from '../../../service/dashboard-filtro.service';


@Component({
  selector: 'app-dashboard-kpis',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard-kpis.component.html',
  styleUrls: ['./dashboard-kpis.component.scss'],
  standalone: true,
})
export class DashboardKpisComponent  {
  private apiService = inject(DashboardAnalistaService);
  private filtroService = inject(DashboardFiltroService);

  dados = signal<any>(null);
  carregando = signal<boolean>(true);
  erro = signal<boolean>(false);

  constructor() {
    effect(() => {
      const filtrosAtuais = this.filtroService.filtrosAtivos();
      this.carregarDados(filtrosAtuais);
    });
  }

  private carregarDados(filtros: any) {
    this.carregando.set(true);
    this.erro.set(false);

    this.apiService.obterDashboardKbpis(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) =>{
          this.dados.set(res)
        },
        error: (err) => {
          console.error('Erro no widget KPIs:', err);
          this.erro.set(true);
          this.dados.set(null);
        }
      });
  }
}
