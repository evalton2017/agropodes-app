import { Injectable, signal } from '@angular/core';

export interface FiltrosDashboard {
  safra?: string;
  estado?: string;
  inicio?: string;
  fim?: string;
  idGleba?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardFiltroService {

  filtrosAtivos = signal<FiltrosDashboard>({
    safra: '2025/2026',
    estado: 'Todos'
  });

  definirFiltros(novosFiltros: FiltrosDashboard) {
    this.filtrosAtivos.set(novosFiltros);
  }
}
