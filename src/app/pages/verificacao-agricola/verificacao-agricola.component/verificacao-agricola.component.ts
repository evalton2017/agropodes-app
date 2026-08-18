import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardProdutorGlebaCardComponent } from '../../../components/dashboard-produtor-gleba-card.component/dashboard-produtor-gleba-card.component';
import { SafraItem, SeletorSafrasComponent } from '../../../components/safras-glebas/seletor-safras.component';
import { AcompanhamentoAgricolaMapComponent } from '../../../components/acompanhamento-agricola-map/acompanhamento-agricola-map.component';
import { VerificacaoAgricolaService } from '../service/verificacao-agricola.service';
import { RespostaVerificacaoAgricola } from '../verificacao-agricola.model';

@Component({
  selector: 'app-verificacao-agricola',
  standalone: true,
  imports: [
    CommonModule,
    DashboardProdutorGlebaCardComponent,
    SeletorSafrasComponent,
    AcompanhamentoAgricolaMapComponent
  ],
  templateUrl: './verificacao-agricola.component.html',
  styleUrls: ['./verificacao-agricola.component.scss']
})
export class VerificacaoAgricolaComponent {
  private readonly verificacaoService = inject(VerificacaoAgricolaService);

  public glebaSelecionadaId = signal<number | null>(null);
  public safraAtiva = signal<string | null>(null);
  public carregando = signal<boolean>(false);

  public dadosVerificacao = signal<RespostaVerificacaoAgricola | null>(null);

  public onGlebaSelecionada(idGleba: number): void {
    this.glebaSelecionadaId.set(idGleba);
    this.safraAtiva.set(null);
    this.dadosVerificacao.set(null);
  }

  public onSafraSelecionada(safraItem: SafraItem): void {
    if (safraItem && safraItem.id_safra) {
      this.safraAtiva.set(safraItem.id_safra);
      this.carregarPainelAgricola();
    }
  }

  private carregarPainelAgricola(): void {
    const id = this.glebaSelecionadaId();
    const safra = this.safraAtiva();
    if (!id || !safra) return;

    this.carregando.set(true);
    this.verificacaoService.obterVerificacaoAgricola(id, safra).subscribe({
      next: (res) => {
        this.dadosVerificacao.set(res);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar dados de verificação agrícola:', err);
        this.carregando.set(false);
      }
    });
  }
}
