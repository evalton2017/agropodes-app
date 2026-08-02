import {
  Component,
  inject,
  signal,
  computed,
  effect,
  DestroyRef,
  OnInit,
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DashboardFiltroService } from '../service/dashboard-filtro.service';
import { DashboardProdutorService } from '../service/dashboard-produtor.service';
import { PessoaService } from '../../../service/pessoa.service';
import {
  RespostaDashboardProdutor,
  ProdutividadeEstimadaResponse,
  ClimaResumoResponse
} from '../model/dashboard-produtor.model';

import { DashboardProdutorResumoComponent } from './components/dashboard-produtor-resumo.component/dashboard-produtor-resumo.component';
import { DashboardProdutorDetalhesComponent } from './components/dashboard-produtor-detalhes.component/dashboard-produtor-detalhes.component';
import { DashboardProdutividadeComponent } from './components/dashboard-produtividade/dashboard-produtividade';
import { DashboardClimaComponent } from './components/dashboard-clima.component/dashboard-clima.component';
import {catchError, combineLatest, EMPTY, switchMap, takeWhile, timer} from 'rxjs';

@Component({
  selector: 'app-dashboard-produtor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
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
  private readonly pessoaService = inject(PessoaService);
  private readonly destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private readonly cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  total_glebas: number = 0;

  // Formulário Reativo para seleção do Período de Análise
  public rangeData = new FormGroup({
    inicio: new FormControl<Date | null>(new Date('2021-06-01')),
    fim: new FormControl<Date | null>(new Date('2026-06-13')),
  });

  // Controles reativos da barra de filtros mapeados no HTML
  public filtroSafra = '2025/2026';
  public listaSafras: string[] = [];

  // Sinal computado para ler reativamente a sessão assíncrona do Keycloak
  produtor = computed(() => this.pessoaService.produtorAtual());

  // Sinais de estado para armazenar as respostas das consultas analíticas
  dadosProdutor = signal<RespostaDashboardProdutor | null>(null);
  dadosProdutividade = signal<ProdutividadeEstimadaResponse | null>(null);
  dadosClima = signal<ClimaResumoResponse | null>(null);

  constructor() {
    this.listaSafras = this.generarListaSafras();
    this.filtroSafra = this.listaSafras[5] || '2025/2026';

    // O effect() monitora as mutações do Keycloak e dos Filtros Ativos de forma atômica
    effect(() => {
      const produtorLogado = this.produtor();
      const filtrosAtivos = this.filtroService.filtrosAtivos();

      if (!produtorLogado || !produtorLogado.id) {
        console.warn('⚠️ [VMG Dashboard] Aguardando autenticação estável do Keycloak...');
        return;
      }

      // 1. Busca assíncrona: Resumo Geral do Produtor
      this.produtorService.obterResumoProdutor(produtorLogado.id, filtrosAtivos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resposta) => {
            this.total_glebas = resposta.glebas_ativas_total
            this.dadosProdutor.set(resposta);
            this.inicializarPipelinePolling();
          },
          error: (err) => console.error('Erro ao processar resumo do produtor no Ledger:', err)
        });

      // 2. Busca assíncrona: Produtividade Estimada via IA
      this.produtorService.obterProdutividadeEstimada(produtorLogado.id, filtrosAtivos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resposta) => this.dadosProdutividade.set(resposta),
          error: (err) => console.error('Erro ao obter dados de produtividade por IA:', err)
        });

      // 3. Busca assíncrona: Resumo Climático (Últimos 60 dias padrão)
      this.produtorService.obterResumoClimatico(produtorLogado.id, filtrosAtivos, 60)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resposta) => this.dadosClima.set(resposta),
          error: (err) => console.error('Erro ao obter resumo climatológico regional:', err)
        });
    });
  }

  ngOnInit(): void {
    this.publicarFiltros();
  }

  public aplicarFiltros(): void {
    this.publicarFiltros();
  }

  private publicarFiltros(): void {
    const dataInicioFormatada = this.rangeData.value.inicio?.toISOString().split('T')[0];
    const dataFimFormatada = this.rangeData.value.fim?.toISOString().split('T')[0];

    this.filtroService.definirFiltros({
      safra: this.filtroSafra ? this.filtroSafra.trim() : '2025/2026',
      inicio: dataInicioFormatada,
      fim: dataFimFormatada,
      estado: 'Todos'
    });
  }

  private generarListaSafras(): string[] {
    const anoAtual = new Date().getFullYear();
    const safras: string[] = [];

    for (let i = -5; i <= 0; i++) {
      const anoInicio = anoAtual + i;
      const anoFim = anoInicio + 1;
      safras.push(`${anoInicio}/${anoFim}`);
    }

    return safras;
  }

  private inicializarPipelinePolling(): void {
    // 1. Converte as fontes de dados reativas (Signals) para Observables RxJS
    const produtor$ = toObservable(this.produtor, { injector: this.injector });
    const filtros$ = toObservable(this.filtroService.filtrosAtivos, { injector: this.injector });
    // 2. Combina os fluxos para reagir instantaneamente a qualquer mudança de filtro ou usuário logado
    combineLatest([produtor$, filtros$]).pipe(
      switchMap(([produtorLogado, filtrosAtivos]) => {
        // Cláusula de barreira caso o Keycloak ou a sessão ainda não estejam estáveis
        if (!produtorLogado || !produtorLogado.id) {
          console.warn('⚠️ [VMG Dashboard] Aguardando autenticação estável do Keycloak...');
          return EMPTY;
        }

        // 3. Dispara o POLLING: Emite 0 imediatamente, e repete a cada 30 segundos (30000ms)
        return timer(0, 30000).pipe(
          switchMap(() => {
            console.log('🔄 [VMG Polling] Verificando atualizações de dados e conformidade do Ledger...');
            this.dispararChamadasSecundarias(produtorLogado.id, filtrosAtivos);
            return this.produtorService.obterResumoProdutor(produtorLogado.id, filtrosAtivos).pipe(
              catchError((err) => {
                console.error('Erro ao processar resumo do produtor no Ledger:', err);
                return EMPTY;
              })
            );
          }),
          takeWhile(resposta => resposta.glebas_ativas_total === 0, true)
        );
      })
    ).subscribe({
      next: (resposta) => {
        // Atualiza os estados visuais da aplicação
        this.total_glebas = resposta.glebas_ativas_total;
        this.dadosProdutor.set(resposta);
        this.cd.detectChanges();

        if (resposta.glebas_ativas_total > 0) {
          console.log('✅ [VMG Polling] Glebas encontradas no Ledger! Polling encerrado com sucesso.');
        }
      }
    });
  }

  private dispararChamadasSecundarias(produtorId: number, filtrosAtivos: any): void {
    // 2. Busca assíncrona: Produtividade Estimada via IA
    this.produtorService.obterProdutividadeEstimada(produtorId, filtrosAtivos).pipe(
      catchError(err => { console.error('Erro ao obter dados de produtividade por IA:', err); return EMPTY; })
    ).subscribe(resposta => this.dadosProdutividade.set(resposta));

    // 3. Busca assíncrona: Resumo Climático (Últimos 60 dias padrão)
    this.produtorService.obterResumoClimatico(produtorId, filtrosAtivos, 60).pipe(
      catchError(err => { console.error('Erro ao obter resumo climatológico regional:', err); return EMPTY; })
    ).subscribe(resposta => this.dadosClima.set(resposta));
  }

}
