import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  DestroyRef
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MonitoramentoService } from '../../../service/monitoramento.service';
import { MapaGrid3dComponent } from '../mapa-grid.component/mapa-grid.component';

@Component({
  selector: 'app-caderno-campo-detalhado',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MapaGrid3dComponent
  ],
  templateUrl: './caderno-campo-detalhado.component.html',
  styleUrls: ['./caderno-campo-detalhado.component.scss']
})
export class CadernoCampoDetalhadoComponent implements OnInit, OnChanges {
  @Input() glebaId!: number;
  @Input() safra?: string;
  @Input() caderno!: any;
  @Input() perfilAnalista: boolean = true;
  @Input() focoAbaInicial: 'GERAL' | 'CLIMA' | 'IA_CULTURAS' | 'PRODUTIVIDADE' = 'GERAL';

  private readonly monitoramentoService = inject(MonitoramentoService);
  private readonly destroyRef = inject(DestroyRef);

  public cadernoDados = signal<any | null>(null);
  public dadosClima = signal<any | null>(null);
  public carregandoCaderno = signal<boolean>(false);
  public carregandoClima = signal<boolean>(false);

  ngOnInit(): void {
    console.log('🔍 [DETALHADO] ngOnInit executado | glebaId:', this.glebaId, '| safra:', this.safra, '| caderno:', this.caderno);
    this.processarEBuscarDados();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 [DETALHADO] ngOnChanges detectou mudanças:', changes);
    if (changes['glebaId'] || changes['caderno'] || changes['safra']) {
      this.processarEBuscarDados();
    }
  }

  private processarEBuscarDados(): void {
    const idFinal = this.glebaId || this.caderno?.id_gleba || this.caderno?.id;
    console.log('⚙️ [DETALHADO] processarEBuscarDados | idFinal:', idFinal, '| safra atual:', this.safra);

    if (!idFinal) {
      console.warn('⚠️ [DETALHADO] ID da gleba não informado.');
      return;
    }

    this.glebaId = idFinal;

    if (this.safra && this.perfilAnalista) {
      console.log('🚀 [DETALHADO] Forçando carregamento via Safra informada:', this.safra);
      this.carregarCadernoAnalista(idFinal);
    } else if (this.caderno && Object.keys(this.caderno).length > 5 && this.caderno.analise_vegetativa_ia) {
      console.log('📦 [DETALHADO] Usando objeto de caderno passado via Input.');
      this.cadernoDados.set(this.caderno);
      this.carregarAnaliseClimatica(idFinal);
    } else if (this.perfilAnalista) {
      console.log('📡 [DETALHADO] Caderno ausente. Buscando via API do analista...');
      this.carregarCadernoAnalista(idFinal);
    }
  }

  private carregarCadernoAnalista(idGleba: number): void {
    this.carregandoCaderno.set(true);
    console.log(`🌐 [API] Requisitando Caderno de Campo para Gleba ${idGleba}, Safra: ${this.safra || 'N/D'}`);

    this.monitoramentoService.obterCadernoCampo(idGleba, this.safra)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('✅ [API] Caderno de Campo retornado com sucesso:', res);
          this.cadernoDados.set(res);
          this.carregandoCaderno.set(false);
          this.carregarAnaliseClimatica(idGleba);
        },
        error: (err) => {
          console.error('❌ [API] Erro ao carregar o Caderno de Campo:', err);
          this.carregandoCaderno.set(false);
        }
      });
  }


  private carregarAnaliseClimatica(idGleba: number): void {
    this.carregandoClima.set(true);

    const cultura = this.cadernoDados()?.analise_vegetativa_ia?.cultura_identificada
      || this.caderno?.analise_vegetativa_ia?.cultura_identificada
      || 'SOJA';

    // 🟢 Garante o envio da safra para a consulta climática
    this.monitoramentoService.obterAnaliseClima(idGleba, cultura, this.safra)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dadosClima.set(res);
          this.carregandoClima.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar análise climática:', err);
          this.carregandoClima.set(false);
        }
      });
  }

  protected obterCadernoAtual(): any {
    return this.cadernoDados() || this.caderno;
  }

  protected obterDiasSemChuva(): number {
    return this.dadosClima()?.indicadores_acumulados?.total_dias_sem_chuva
      ?? this.obterCadernoAtual()?.diagnostico_climatico?.total_dias_sem_chuva
      ?? 0;
  }

  protected obterDiasChuvasExcessivas(): number {
    return this.dadosClima()?.indicadores_acumulados?.dias_com_chuvas_excessivas
      ?? this.obterCadernoAtual()?.diagnostico_climatico?.dias_com_chuvas_excessivas
      ?? 0;
  }

  protected obterAlertasUnicos(): any[] {
    const alertasClima = this.dadosClima()?.alertas_emitidos || [];
    const alertasCaderno = this.obterCadernoAtual()?.alertas_ambientais_emitidos || [];

    const combinados = [...alertasClima, ...alertasCaderno];
    
    const unicos = combinados.filter((alerta, index, self) =>
        index === self.findIndex((a) => (
          a?.evento === alerta?.evento && a?.descricao === alerta?.descricao
        ))
    );

    return unicos;
  }
}
