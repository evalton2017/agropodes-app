import { Component, inject, signal, effect, OnInit, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GlebaAnaliseComponent } from '../gleba-analise/gleba-analise';
import { PessoaService } from '../../../service/pessoa.service';
import { GlebeApiResponse } from '../../../dto/response/gleba.response';
import {GlebaService} from '../../../service/gleba.service';
import {GlebaData} from '../../model/gleba.model';

@Component({
  selector: 'app-painel-analise',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule, GlebaAnaliseComponent],
  templateUrl: './painel-analise.component.html',
  styleUrls: ['./painel-analise.component.scss']
})
export class PainelAnaliseComponent implements OnInit {
  private readonly glebaService = inject(GlebaService);
  private readonly pessoaService = inject(PessoaService);
  private readonly destroyRef = inject(DestroyRef);
  produtor = computed(() => this.pessoaService.produtorAtual());

  // Sinais de controle de estado visual
  public listaGlebasSidebar = signal<GlebeApiResponse[]>([]);
  public glebaSelecionadaId = signal<number | null>(null);
  public laudoDetalhadoAtivo = signal<GlebaData | null>(null);

  public carregandoLista = signal<boolean>(false);
  public carregandoDetalhe = signal<boolean>(false);

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
        this.buscarLaudoDetalhadoGleba(idGleba);
      } else {
        this.laudoDetalhadoAtivo.set(null);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    console.log('ngOnInit');
  }

  private carregarListaLateralGlebas(idProdutor: number): void {
    this.carregandoLista.set(true);
    this.glebaService.getGlebasByProdutorId(idProdutor)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (glebas) => {
          this.listaGlebasSidebar.set(glebas);
          this.carregandoLista.set(false);

          // UX Smart: Mantém auto-seleção apenas se NÃO estiver em tela mobile
          // Isso evita que o mobile abra o detalhe direto sem mostrar a lista primeiro
          if (glebas && glebas.length > 0 && window.innerWidth > 768) {
            const primeiroItem = glebas[0];
            const idAlvo = primeiroItem.idGleba;
            if (idAlvo) {
              this.selecionarGleba(idAlvo);
            }
          }
        },
        error: (err) => {
          console.error('Erro ao carregar barra lateral de glebas:', err);
          this.carregandoLista.set(false);
        }
      });
  }

  public selecionarGleba(idGleba: number): void {
    if (this.glebaSelecionadaId() === idGleba) return;
    this.glebaSelecionadaId.set(idGleba);
  }

  public limparSelecaoMobile(): void {
    this.glebaSelecionadaId.set(null);
  }

  private buscarLaudoDetalhadoGleba(idGleba: number): void {
    this.carregandoDetalhe.set(true);
    this.glebaService.obterDetalheLaudoGleba(idGleba)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (laudoCompleto) => {
          this.laudoDetalhadoAtivo.set(laudoCompleto);
          this.carregandoDetalhe.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar bloco detalhado do Ledger:', err);
          this.carregandoDetalhe.set(false);
        }
      });
  }
}
