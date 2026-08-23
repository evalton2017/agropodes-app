import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { CadernoCampoDetalhadoComponent } from './caderno-campo-detalhado.component/caderno-campo-detalhado.component';
import { MonitoramentoService } from '../../service/monitoramento.service';
import { DashboardProdutorGlebaCardComponent } from '../../components/dashboard-produtor-gleba-card.component/dashboard-produtor-gleba-card.component';
import { SeletorSafrasComponent } from '../../components/safras-glebas/seletor-safras.component';

@Component({
  selector: 'app-caderno-campo-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    DashboardProdutorGlebaCardComponent,
    SeletorSafrasComponent,
    CadernoCampoDetalhadoComponent
  ],
  templateUrl: './caderno-campo-page.component.html',
  styleUrls: ['./caderno-campo-page.component.scss']
})
export class CadernoCampoPageComponent implements OnInit {
  private readonly monitoramentoService = inject(MonitoramentoService);
  private readonly destroyRef = inject(DestroyRef);

  public glebaSelecionadaId = signal<number | null>(null);
  public safraSelecionada = signal<string | null>(null);
  public cadernoAtivo = signal<any | null>(null);
  public carregando = signal<boolean>(false);

  ngOnInit(): void {
    console.log('Painel do Caderno de Campo Inicializado.');
  }

  public onGlebaSelecionada(idGleba: number | null): void {
    this.glebaSelecionadaId.set(idGleba);
    this.safraSelecionada.set(null);
    this.cadernoAtivo.set(null);
  }

  /**
   * Disparado quando o seletor emite as safras disponíveis ou a safra clicada
   */
  public onSafraSelecionada(event: any): void {
    console.log('🎯 [PAGE] Evento de safra recebido do componente seletor:', event);

    if (Array.isArray(event)) {
      if (event.length > 0 && !this.safraSelecionada()) {
        const primeiraSafra = event[0]?.id_safra || event[0]?.label || event[0];
        this.onSafraSelecionada(primeiraSafra);
      }
      return;
    }


    const safraString = typeof event === 'string'
      ? event
      : (event?.id_safra || event?.label || event?.safra || event?.safraAno || '');

    if (!safraString) {
      console.warn('⚠️ [PAGE] Safra string veio vazia!');
      return;
    }

    console.log('✅ [PAGE] Safra definida com sucesso:', safraString);
    this.safraSelecionada.set(safraString);
  }

  private buscarCadernoCampoGleba(idGleba: number, safra: string): void {
    this.carregando.set(true);
    this.monitoramentoService.obterCadernoCampo(idGleba, safra)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.cadernoAtivo.set(resposta);
          this.carregando.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar Caderno de Campo:', err);
          this.cadernoAtivo.set(null);
          this.carregando.set(false);
        }
      });
  }
}
