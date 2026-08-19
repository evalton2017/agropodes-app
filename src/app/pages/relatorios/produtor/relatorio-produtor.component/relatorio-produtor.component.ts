import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DashboardProdutorGlebaCardComponent } from '../../../../components/dashboard-produtor-gleba-card.component/dashboard-produtor-gleba-card.component';
import { SafraItem, SeletorSafrasComponent } from '../../../../components/safras-glebas/seletor-safras.component';
import { AtestadoDetalhadoComponent } from '../atestado-detalhado.component/atestado-detalhado.component';
import { RelatorioService } from '../../relatorio.service';
import { AtestadoDetalhadoResponse } from '../relatorio-produtor.model';

@Component({
  selector: 'app-relatorio-produtor',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DashboardProdutorGlebaCardComponent,
    SeletorSafrasComponent,
    AtestadoDetalhadoComponent
  ],
  templateUrl: './relatorio-produtor.component.html',
  styleUrls: ['./relatorio-produtor.component.scss']
})
export class RelatorioProdutorComponent {
  private readonly relatorioService = inject(RelatorioService);

  public glebaSelecionadaId = signal<number | null>(null);
  public safraAtiva = signal<string | null>(null);
  public carregando = signal<boolean>(false);

  public dadosAtestado = signal<AtestadoDetalhadoResponse | null>(null);

  /**
   * Disparado quando o usuário clica em uma gleba no topo.
   * Recebe diretamente o ID numérico enviado por (glebaSelecionadaChange).
   */
  public onGlebaSelecionada(idGleba: number): void {
    if (!idGleba) return;

    this.glebaSelecionadaId.set(idGleba);
    this.safraAtiva.set(null);
    this.dadosAtestado.set(null);
  }

  /**
   * Disparado quando o componente <app-seletor-safras> emite a safra escolhida.
   */
  public onSafraSelecionada(safraItem: SafraItem): void {
    if (safraItem && safraItem.id_safra) {
      this.safraAtiva.set(safraItem.id_safra);
      this.carregarRelatorioAtestado();
    }
  }

  /**
   * Busca os dados do atestado na API enviando o ID da gleba e a safra ativa.
   */
  private carregarRelatorioAtestado(): void {
    const idGleba = this.glebaSelecionadaId();
    const safra = this.safraAtiva();

    if (!idGleba || !safra) return;

    this.carregando.set(true);
    this.relatorioService.obterAtestadoPorGlebaESafra(idGleba, safra).subscribe({
      next: (dados) => {
        this.dadosAtestado.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar dados do atestado:', err);
        this.dadosAtestado.set(null);
        this.carregando.set(false);
      }
    });
  }
}
