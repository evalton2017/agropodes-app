
import { Component, inject, signal, computed, effect, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {AtestadoDetalhadoComponent} from '../atestado-detalhado.component/atestado-detalhado.component';
import {GlebaService} from '../../../produtor/service/gleba.service';
import {PessoaService} from '../../../../service/pessoa.service';
import {RelatorioService} from '../../relatorio.service';
import {GlebeApiResponse} from '../../../../dto/response/gleba.response';
import {AtestadoDetalhadoResponse} from '../relatorio-produtor.model';

@Component({
  selector: 'app-atestados-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    AtestadoDetalhadoComponent
  ],
  templateUrl: './atestados-page.component.html',
  styleUrls: ['./atestados-page.component.scss']
})
export class AtestadosPageComponent implements OnInit {
  private readonly glebaService = inject(GlebaService);
  private readonly pessoaService = inject(PessoaService);
  private readonly relatorioService = inject(RelatorioService);
  private readonly destroyRef = inject(DestroyRef);
  public produtor = computed(() => this.pessoaService.produtorAtual());


  public listaGlebasSidebar = signal<(GlebeApiResponse & { coordenadas?: [number, number][] })[]>([]);
  public glebaSelecionadaId = signal<number | null>(null);
  public laudoDetalhadoAtivo = signal<AtestadoDetalhadoResponse | null>(null);

  public carregandoLista = signal<boolean>(false);
  public carregandoDetalhe = signal<boolean>(false);


  public buscaTexto = signal<string>('');
  gleba: any;

  constructor() {
    effect(() => {
      const usuarioLogado = this.produtor();
      if (usuarioLogado && usuarioLogado.id) {
        this.carregarListaLateralGlebas(usuarioLogado.id);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const idGleba = this.glebaSelecionadaId();
      if (idGleba) {
        this.buscarAtestadoDetalhadoGleba(idGleba);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    console.log('Painel Geral de Atestados Inicializado.');
  }

  private carregarListaLateralGlebas(idProdutor: number): void {
    this.carregandoLista.set(true);
    this.glebaService.getGlebasByProdutorId(idProdutor)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (glebas) => {
          this.listaGlebasSidebar.set(glebas);
          this.carregandoLista.set(false);

          if (glebas && glebas.length > 0) {
            const primeiroItem = glebas[0];
            this.gleba = {wkt: primeiroItem.geometria, id_gleba: primeiroItem.idGleba};
            if (primeiroItem.idGleba) {
              this.selecionarGleba(primeiroItem.idGleba);
            }
          }
        },
        error: (err) => {
          console.error('Erro ao carregar barra lateral de glebas:', err);
          this.carregandoLista.set(false);
        }
      });
  }

  private buscarAtestadoDetalhadoGleba(idGleba: number): void {
    this.carregandoDetalhe.set(true);
    this.relatorioService.obterDetalhesAtestadoPorGleba(idGleba)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.laudoDetalhadoAtivo.set(resposta);
          this.carregandoDetalhe.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar metadados do atestado no Ledger:', err);
          this.carregandoDetalhe.set(false);
        }
      });
  }

  public selecionarGleba(idGleba: number): void {
    if (this.glebaSelecionadaId() === idGleba) return;
    this.glebaSelecionadaId.set(idGleba);
  }

  // Filtro computado síncrono para a busca por texto na barra lateral
  public glebasFiltradas = computed(() => {
    const lista = this.listaGlebasSidebar();
    const texto = this.buscaTexto().toLowerCase().trim();
    if (!texto) return lista;

    return lista.filter(g =>
      g.codigoCar?.toLowerCase().includes(texto) ||
      g.idGleba?.toString().includes(texto)
    );
  });
}
