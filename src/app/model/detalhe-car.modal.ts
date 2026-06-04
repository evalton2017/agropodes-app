import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, DecimalPipe } from '@angular/common';
import {ConsultaCarService} from '../service/consulta-car.service';
import {DetalheCarResponse} from '../dto/response/detalhe-car-response';


@Component({
  selector: 'app-detalhe-modal',
  standalone: true,
  imports: [
    MatDialogModule, MatCardModule, MatButtonModule,
    MatDividerModule, MatProgressSpinnerModule, DatePipe, DecimalPipe
  ],
  template: `
    <h2 mat-dialog-title>Relatório Detalhado do CAR</h2>

    <mat-dialog-content class="mat-typography">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Buscando informações...</p>
        </div>
      } @else if (dados()) {
        <mat-card class="report-card">
          <mat-card-header>
            <mat-card-title class="car-code">{{ dados()?.codigoCar }}</mat-card-title>
            <mat-card-subtitle>Consulta realizada em: {{ dados()?.dataConsulta | date:'dd/MM/yyyy HH:mm' }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="report-grid">
              <div class="section-title">Localização e Status</div>
              <p><strong>Município/UF:</strong> {{ dados()?.municipio }} - {{ dados()?.estado }}</p>
              <p><strong>Status Imóvel:</strong> {{ dados()?.statusImovel }}</p>
              <p><strong>Condição Análise:</strong> {{ dados()?.condicaoAnalise }}</p>

              <mat-divider></mat-divider>

              <div class="section-title">Métricas de Área (Hectares)</div>
              <p><strong>Área Total:</strong> {{ dados()?.areaTotalHa | number:'1.2-2' }} ha</p>
              <p><strong>Módulos Fiscais:</strong> {{ dados()?.modulosFiscais | number:'1.1-2' }}</p>
              <p><strong>Uso Consolidado:</strong> {{ dados()?.areaUsoConsolidadoHa | number:'1.2-2' }} ha</p>
              <p><strong>Reserva Legal Nativa:</strong> {{ dados()?.areaReservaLegalNativaHa | number:'1.2-2' }} ha</p>
              <p><strong>Área APP Total:</strong> {{ dados()?.areaAppTotalHa | number:'1.2-2' }} ha</p>

              <mat-divider></mat-divider>

              <div class="section-title">Restrições e Passivos</div>
              <p><strong>Sobreposição Imóveis:</strong> {{ dados()?.areaSobreposicaoImoveisHa | number:'1.2-2' }} ha</p>
              <p><strong>Sobreposição Assentamento:</strong> {{ dados()?.areaSobreposicaoAssentamentoHa | number:'1.2-2' }} ha</p>
              <p><strong>Déficit Reserva Legal:</strong> {{ dados()?.deficitReservaLegalHa | number:'1.2-2' }} ha</p>
              <p><strong>Situação Reserva Legal:</strong> {{ dados()?.situacaoReservaLegal }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <p class="error-msg">Não foi possível carregar os dados deste CAR.</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="primary">Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 20px; }
    .report-card { border-left: 5px solid #2e7d32; background: #fafafa; }
    .car-code { font-weight: bold; color: #2e7d32; word-break: break-all; font-size: 16px; }
    .section-title { font-weight: bold; color: #555; margin: 15px 0 5px 0; font-size: 14px; text-transform: uppercase; }
    .report-grid p { margin: 6px 0; font-size: 14px; }
    mat-divider { margin: 10px 0; }
    .error-msg { color: #d32f2f; text-align: center; padding: 20px; }
  `]
})
export class DetalheCarModal {
  private dialogRef = inject(MatDialogRef<DetalheCarModal>);
  private carService = inject(ConsultaCarService);
  protected data = inject<{ numeroCar: string }>(MAT_DIALOG_DATA);

  loading = signal(true);
  dados = signal<DetalheCarResponse | null>(null);

  constructor() {
    this.carService.detalharCar(this.data.numeroCar).subscribe({
      next: (res) => {
        if(res.consultaCar){
          this.dados.set(res?.consultaCar);
          this.loading.set(false);
        }

      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
