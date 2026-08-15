import {
  Component,
  inject,
  signal,
  computed,
  DestroyRef,
  OnInit,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { DashboardFiltroService, FiltrosDashboard } from '../service/dashboard-filtro.service';
import { DashboardProdutorService } from '../service/dashboard-produtor.service';
import { PessoaService } from '../../../service/pessoa.service';
import { GlebaService } from '../../produtor/service/gleba.service';

import {
  RespostaDashboardProdutor,
  ProdutividadeEstimadaResponse,
  ClimaResumoResponse
} from '../model/dashboard-produtor.model';

import { DashboardProdutorResumoComponent } from './components/dashboard-produtor-resumo.component/dashboard-produtor-resumo.component';
import { DashboardProdutorDetalhesComponent } from './components/dashboard-produtor-detalhes.component/dashboard-produtor-detalhes.component';
import { DashboardProdutividadeComponent } from './components/dashboard-produtividade/dashboard-produtividade';
import { DashboardClimaComponent } from './components/dashboard-clima.component/dashboard-clima.component';

@Component({
  selector: 'app-dashboard-produtor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DashboardProdutorResumoComponent,
    DashboardProdutorDetalhesComponent,
    DashboardProdutividadeComponent,
    DashboardClimaComponent
  ],
  templateUrl: './dashboard-produtor.html',
  styleUrls: ['./dashboard-produtor.scss']
})
export class DashboardProdutorComponent implements OnInit {
  private readonly filtroService = inject(DashboardFiltroService);
  private readonly produtorService = inject(DashboardProdutorService);
  private readonly glebaService = inject(GlebaService);
  private readonly pessoaService = inject(PessoaService);
  private readonly destroyRef = inject(DestroyRef);

  total_glebas: number = 0;

  // Sinais de controle da interface
  public listaSafras = signal<string[]>([]);
  public safraSelecionada = signal<string>('');

  // Controle de Glebas
  public listaGlebas = signal<any[]>([]);
  public glebaSelecionada = signal<any | null>(null);
  public carregandoGlebas = signal<boolean>(false);

  // Sinal computado para ler a sessão
  produtor = computed(() => this.pessoaService.produtorAtual());

  // Sinais de estado para respostas analíticas
  dadosProdutor = signal<RespostaDashboardProdutor | null>(null);
  dadosProdutividade = signal<ProdutividadeEstimadaResponse | null>(null);
  dadosClima = signal<ClimaResumoResponse | null>(null);

  constructor() {
    effect(() => {
      const produtorLogado = this.produtor();

      if (produtorLogado && produtorLogado.id) {
        const id = produtorLogado.id;

        // 1. Carrega as glebas do produtor
        this.carregarGlebasProdutor(id);

        // 2. Carrega as safras
        this.carregarSafrasEInicializar(id);
      }
    });
  }

  ngOnInit(): void {}

  /**
   * Busca a lista de glebas do proprietário
   */
  private carregarGlebasProdutor(idProdutor: number): void {
    this.carregandoGlebas.set(true);
    this.glebaService.consultarGlebaProdutor(idProdutor)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (glebas) => {
          this.listaGlebas.set(glebas || []);
          this.carregandoGlebas.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar glebas do produtor:', err);
          this.carregandoGlebas.set(false);
        }
      });
  }

  /**
   * Chamado ao selecionar um card de gleba
   */
  public selecionarGleba(gleba: any): void {
    this.glebaSelecionada.set(gleba);
    const idProdutor = this.produtor()?.id;
    if (idProdutor && this.safraSelecionada()) {
      this.publicarFiltrosEBuscarDados(idProdutor, this.safraSelecionada(), gleba.idGleba);
    }
  }

  /**
   * Busca as safras disponíveis do produtor na API
   */
  private carregarSafrasEInicializar(idProdutor: number): void {
    this.produtorService.obterSafrasDisponiveis(idProdutor)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.listaSafras.set(res.safras);
          const safraInicial = res.safra_principal || res.safras[0];
          this.safraSelecionada.set(safraInicial);

          // Carrega o resumo geral consolidado (sem filtro de glebas)
          this.carregarResumoGeral(idProdutor, safraInicial);
        },
        error: (err) => console.error('Erro ao buscar safras dinâmicas:', err)
      });
  }

  /**
   * Chamado ao clicar nos botões de safra
   */
  public selecionarSafra(safra: string): void {
    const idProdutor = this.produtor()?.id;
    if (!idProdutor) return;

    this.safraSelecionada.set(safra);
    const glebaId = this.glebaSelecionada()?.idGleba;

    // Atualiza o resumo geral do produtor para a nova safra
    this.carregarResumoGeral(idProdutor, safra);

    // Se uma gleba estiver selecionada, recarrega o dashboard específico dela
    if (glebaId) {
      this.publicarFiltrosEBuscarDados(idProdutor, safra, glebaId);
    }
  }

  /**
   * Atualiza o serviço global de filtros e dispara busca de dados
   */
  private publicarFiltrosEBuscarDados(idProdutor: number, safra: string, idGleba?: number): void {
    const safraLimpa = safra.trim();

    this.filtroService.definirFiltros({
      safra: safraLimpa,
      estado: 'Todos',
      idGleba: idGleba
    });

    this.carregarDadosDashboardGleba(idProdutor, safraLimpa, idGleba);
  }

  /**
   * Resumo do produtor (nível geral, sem filtro por id_gleba)
   */
  private carregarResumoGeral(idProdutor: number, safra: string): void {
    const filtro: FiltrosDashboard = { safra, estado: 'Todos' };

    this.produtorService.obterResumoProdutor(idProdutor, filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.total_glebas = resposta.glebas_ativas_total;
          this.dadosProdutor.set(resposta);
        },
        error: (err) => console.error('Erro ao processar resumo do produtor:', err)
      });
  }

  /**
   * Consultas específicas para a gleba selecionada
   */
  private carregarDadosDashboardGleba(idProdutor: number, safra: string, idGleba?: number): void {
    const filtro: FiltrosDashboard = {
      safra: safra,
      estado: 'Todos',
      idGleba: idGleba
    };

    this.produtorService.obterProdutividadeEstimada(idProdutor, filtro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => this.dadosProdutividade.set(resposta),
        error: (err) => console.error('Erro ao obter produtividade:', err)
      });

    this.produtorService.obterResumoClimatico(idProdutor, filtro, 60)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => this.dadosClima.set(resposta),
        error: (err) => console.error('Erro ao obter clima:', err)
      });
  }
}
