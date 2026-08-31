import {Component, computed, DestroyRef, effect, inject, OnInit, signal, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {GlebaDetalheComponent} from '../../../produtor/gleba-detalhe/gleba-detalhe';
import {GlebaService} from '../../../../service/gleba.service';
import {PessoaService} from '../../../../service/pessoa.service';
import {GlebaData, RespostaConsultaGlebasPainel} from '../../../model/gleba.model';
import {Router} from '@angular/router';



@Component({
  selector: 'app-contestacao-produtor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    GlebaDetalheComponent
  ],
  templateUrl: './contestacao-produtor.html',
  styleUrls: ['./contestacao-produtor.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContestacaoProdutorComponent implements OnInit {
  private readonly produtorService = inject(GlebaService);
  private readonly pessoaService = inject(PessoaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);


  public carregando = signal<boolean>(false);
  public dadosPainel = signal<RespostaConsultaGlebasPainel | null>(null);
  produtorLogado = computed(() => this.pessoaService.produtorAtual());
  public glebaSelecionada = signal<GlebaData | null>(null);

  public termoBusca = signal<string>('');
  public paginaAtual = signal<number>(1);
  public itensPorPagina = signal<number>(5);
  public opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  glebasFiltradas = computed(() => {
    const painel = this.dadosPainel();
    if (!painel) return [];


    const busca = this.termoBusca().toLowerCase().trim();
    if (!busca) return painel.glebas;

    return painel.glebas.filter(g =>
      g.codigo.toLowerCase().includes(busca) ||
      g.nomeGleba.toLowerCase().includes(busca) ||
      g.municipio.toLowerCase().includes(busca) ||
      g.culturaDeclarada.toLowerCase().includes(busca)
    );
  });

  glebasPaginadas = computed(() => {
    const filtradas = this.glebasFiltradas();
    const tamanhoPagina = this.itensPorPagina();
    const indiceInicio = (this.paginaAtual() - 1) * tamanhoPagina;

    return filtradas.slice(indiceInicio, indiceInicio + tamanhoPagina);
  });

  totalPaginas = computed(() => {
    return Math.ceil(this.glebasFiltradas().length / this.itensPorPagina()) || 1;
  });

  listaIndicesPaginas = computed(() => {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas(); i++) {
      paginas.push(i);
    }
    return paginas;
  });

  constructor() {
    effect(() => {
      const produtor = this.produtorLogado();
      if (produtor && produtor.id) {
        this.carregarDadosPainel(produtor.id);
      }
    });
  }

  ngOnInit(): void {}

  private carregarDadosPainel(idProdutor: number): void {
    this.carregando.set(true);
    this.produtorService.obterPainelGerencialGlebas(idProdutor)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.dadosPainel.set(resposta);
          this.paginaAtual.set(1);
          this.carregando.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar painel de glebas:', err);
          this.carregando.set(false);
        }
      });
  }

  public atualizarTermoBusca(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.termoBusca.set(input.value);
    this.paginaAtual.set(1);
  }

  public alterarPagina(novaPagina: number): void {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginas()) {
      this.paginaAtual.set(novaPagina);
    }
  }

  public alterarItensPorPagina(event: any): void {
    this.itensPorPagina.set(event.value);
    this.paginaAtual.set(1);
  }

  public visualizarGleba(idGleba: number): void {
    this.produtorService.obterDetalheLaudoGleba(idGleba).subscribe({
      next: (res) => {
        this.glebaSelecionada.set(res);
      }
    });
  }

  public criarContestacao(idGleba: number): void {
    this.router.navigateByUrl(`/cadastrar-contestacao/${idGleba}`);
  }

  public cancelarContestacao(idGleba: number): void {
    console.log(`Solicitar cancelamento da contestação da gleba: ${idGleba}`);
  }

  protected readonly Math = Math;
}
