import {
  Component,
  inject,
  computed,
  signal,
  DestroyRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardFiltroService, FiltrosDashboard } from '../../../service/dashboard-filtro.service';
import { DashboardProdutorService } from '../../../service/dashboard-produtor.service';
import { PessoaService } from '../../../../../service/pessoa.service';
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
} from '../../../../../components/dashboard-produtor-mapa.component/dashboard-produtor-mapa.component';


@Component({
  selector: 'app-dashboard-produtor-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    DashboardProdutorMapaComponent,
    DashboardProdutorTabelaComponent,
    DashboardProdutorStatusAtividadesComponent
  ],
  templateUrl: './dashboard-produtor-detalhes.component.html',
  styleUrls: ['./dashboard-produtor-detalhes.component.scss']
})
export class DashboardProdutorDetalhesComponent implements OnChanges {
  protected readonly filtroService = inject(DashboardFiltroService);
  private readonly produtorService = inject(DashboardProdutorService);
  private readonly pessoaService = inject(PessoaService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() idGleba?: number;
  @Input() safra?: string;

  produtor = computed(() => this.pessoaService.produtorAtual());

  carregando = signal<boolean>(false);

  dadosMapa = signal<GlebaGeometriaResponse[]>([]);
  dadosTabela = signal<RespostaConformidadeAmbientalDTO | null>(null);
  dadosStatusAtividades = signal<RespostaStatusAtividades | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    // Dispara a atualização sempre que o idGleba ou a safra mudarem via @Input
    if (changes['idGleba'] || changes['safra']) {
      this.carregarDadosDetalhes();
    }
  }

  private carregarDadosDetalhes(): void {
    const user = this.produtor();
    if (!user || !user.id || !this.idGleba) return;

    // 1. Limpa os estados anteriores para impedir o acúmulo e a duplicação na tela
    this.dadosMapa.set([]);
    this.dadosTabela.set(null);
    this.dadosStatusAtividades.set(null);
    this.carregando.set(true);

    // 2. Monta o filtro forçando o idGleba recebido via Input
    const filtros: FiltrosDashboard = {
      safra: this.safra || this.filtroService.filtrosAtivos().safra,
      estado: 'Todos',
      idGleba: this.idGleba
    };

    // 3. Executa as chamadas combinadas
    forkJoin({
      mapa: this.produtorService.obterGlebasGeometria(user.id, filtros),
      tabela: this.produtorService.obterConformidadeAmbiental(user.id, filtros),
      atividades: this.produtorService.obterStatusEAtividades(user.id, filtros)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dadosMapa.set(res.mapa || []);
          this.dadosTabela.set(res.tabela);
          this.dadosStatusAtividades.set(res.atividades);
          this.carregando.set(false);
        },
        error: (err) => {
          console.error('Erro ao sincronizar detalhes da gleba:', err);
          this.carregando.set(false);
        }
      });
  }
}
