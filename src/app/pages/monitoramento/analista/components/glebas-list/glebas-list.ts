import { Component, inject, effect, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import {DashboardAnalistaService} from '../../../../dashboard/service/dashboard-analista.service';
import {DashboardFiltroService} from '../../../../dashboard/service/dashboard-filtro.service';


export interface GlebaItemDTO {
  id_gleba: number;
  codigo_gleba: string;
  produtor: string;
  cpf_cnpj: string;
  car_codigo: string;
  municipio: string;
  uf: string;
  area_ha: number;
  status_conformidade: 'Conforme' | 'Pendente' | 'Com Conflito';
}

@Component({
  selector: 'app-glebas-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './glebas-list.html',
  styleUrls: ['./glebas-list.scss']
})
export class AppGlebasListComponent {
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroGlobalService = inject(DashboardFiltroService);
  private readonly router = inject(Router);

  // 🟢 ENTRADAS PARA DIVERSIFICAR O USO DO COMPONENTE REUTILIZÁVEL
  @Input() modoExibicao: 'GERAL' | 'CLIMA' | 'IA_CULTURAS' | 'ZARC' = 'GERAL';
  @Input() modoSelecao: 'ROTA' | 'EMIT' = 'ROTA';
  @Input() exibirHeader: boolean = true;

  // 🟢 SAÍDA DISPARADA AO CLICAR NO ÍCONE DE AÇÃO (QUANDO EM MODO 'EMIT')
  @Output() onSelecionarGleba = new EventEmitter<GlebaItemDTO>();

  public glebas = signal<GlebaItemDTO[]>([]);
  public carregando = signal<boolean>(false);
  public filtroTexto: string = '';

  constructor() {
    effect(() => {
      const filtrosGlobal = this.filtroGlobalService.filtrosAtivos();
      this.carregarGlebas(filtrosGlobal);
    });
  }

  private carregarGlebas(filtros: any): void {
    this.carregando.set(true);

    this.apiService.obterGlebasListagem({
      ...filtros,
      busca: this.filtroTexto,
      contexto: this.modoExibicao
    })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res: any) => {
          const lista = Array.isArray(res) ? res : (res?.dados || []);
          this.glebas.set(lista);
        },
        error: (err) => {
          console.error('Erro ao carregar lista de glebas:', err);
          this.glebas.set([]);
        }
      });
  }

  public aplicarBuscaLocal(): void {
    const filtrosGlobal = this.filtroGlobalService.filtrosAtivos();
    this.carregarGlebas(filtrosGlobal);
  }

  /**
   * Trata a seleção da gleba conforme o modo configurado no pai
   */
  public selecionarGleba(gleba: GlebaItemDTO): void {
    if (this.modoSelecao === 'EMIT') {
      this.onSelecionarGleba.emit(gleba);
    } else {
      this.router.navigate(['/glebas/detalhe', gleba.id_gleba]);
    }
  }

  protected obterClasseBadge(status: string): string {
    switch (status) {
      case 'Conforme': return 'sucesso';
      case 'Pendente': return 'alerta';
      case 'Com Conflito': return 'critico';
      default: return 'padrao';
    }
  }
}
