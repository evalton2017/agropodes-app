import { Component, inject, computed, signal, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {DashboardFiltroService} from '../../../service/dashboard-filtro.service';
import {DashboardProdutorService} from '../../../service/dashboard-produtor.service';
import {PessoaService} from '../../../../../service/pessoa.service';
import {
  GlebaGeometriaResponse,
  RespostaConformidadeAmbientalDTO,
  RespostaStatusAtividades
} from '../../../model/dashboard-produtor.model';
import {
  DashboardProdutorTabelaComponent
} from '../dashboard-produtor-tabela/dashboard-produtor-tabela.component/dashboard-produtor-tabela.component';
import {
  DashboardProdutorStatusAtividadesComponent
} from '../dashboard-produtor-tabela/dashboard-produtor-status-atividades.component/dashboard-produtor-status-atividades.component';
import {
  DashboardProdutorMapaComponent
} from '../dashboard-produtor-mapa.component/dashboard-produtor-mapa.component';


;

@Component({
  selector: 'app-dashboard-produtor-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    DashboardProdutorMapaComponent,
    DashboardProdutorTabelaComponent,
    DashboardProdutorStatusAtividadesComponent
  ],
  templateUrl: './dashboard-produtor-detalhes.component.html',
  styleUrls: ['./dashboard-produtor-detalhes.component.scss']
})
export class DashboardProdutorDetalhesComponent {
  private readonly filtroService = inject(DashboardFiltroService);
  private readonly produtorService = inject(DashboardProdutorService);
  private readonly pessoaService = inject(PessoaService);
  private readonly destroyRef = inject(DestroyRef);

  produtor = computed(() => this.pessoaService.produtorAtual());

  // Signals contendo o estado para os 3 componentes filhos
  dadosMapa = signal<GlebaGeometriaResponse[]>([]);
  dadosTabela = signal<RespostaConformidadeAmbientalDTO | null>(null);
  dadosStatusAtividades = signal<RespostaStatusAtividades | null>(null);

  constructor() {
    effect(() => {
      const user = this.produtor();
      const filtros = this.filtroService.filtrosAtivos();

      if (!user || !user.id) return;

      // Dispara as consultas de forma unificada e performática
      forkJoin({
        mapa: this.produtorService.obterGlebasGeometria(user.id),
        tabela: this.produtorService.obterConformidadeAmbiental(user.id, filtros),
        atividades: this.produtorService.obterStatusEAtividades(user.id, filtros)
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.dadosMapa.set(res.mapa);
            this.dadosTabela.set(res.tabela);
            this.dadosStatusAtividades.set(res.atividades);
          },
          error: (err) => console.error('Erro ao sincronizar widgets da segunda linha:', err)
        });
    });
  }
}
