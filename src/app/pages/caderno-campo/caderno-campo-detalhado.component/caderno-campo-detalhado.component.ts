import { Component, Input, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {MonitoramentoService} from '../../../service/monitoramento.service';
import {MapaGrid3dComponent} from '../mapa-grid.component/mapa-grid.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';



@Component({
  selector: 'app-caderno-campo-detalhado',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MapaGrid3dComponent,
    MatProgressSpinner
  ],
  templateUrl: './caderno-campo-detalhado.component.html',
  styleUrls: ['./caderno-campo-detalhado.component.scss']
})
export class CadernoCampoDetalhadoComponent implements OnInit {
  @Input({ required: true }) glebaId!: number;
  @Input({ required: true }) caderno!: any;

  private readonly monitoramentoService = inject(MonitoramentoService);
  private readonly destroyRef = inject(DestroyRef);

  public dadosClima = signal<any | null>(null);
  public carregandoClima = signal<boolean>(false);

  ngOnInit(): void {
    if (this.glebaId) {
      this.carregarAnaliseClimatica(this.glebaId);
    }
  }

  private carregarAnaliseClimatica(idGleba: number): void {
    this.carregandoClima.set(true);
    const cultura = this.caderno?.analise_vegetativa_ia?.cultura_identificada || 'SOJA';

    this.monitoramentoService.obterAnaliseClima(idGleba, cultura)
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
}
