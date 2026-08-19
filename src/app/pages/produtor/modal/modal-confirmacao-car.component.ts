import {Component, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {CarFeicoesAmbientaisResponse} from '../../model/gleba.model';

export interface ModalCarData {
  dadosCar: CarFeicoesAmbientaisResponse;
  podeAvancar: boolean;
}

@Component({
  selector: 'app-modal-confirmacao-car',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon [color]="data.podeAvancar ? 'primary' : 'warn'">
        {{ data.podeAvancar ? 'verified' : 'warning' }}
      </mat-icon>
      Validação de Cadastro Ambiental Rural (CAR)
    </h2>

    <mat-dialog-content class="dialog-content">
      @if (!data.podeAvancar) {
        <div class="alert-box alert-danger">
          <mat-icon>error_outline</mat-icon>
          <div>
            <strong>Situação Irregular Detectada!</strong>
            <p>
              O CAR informado está com o status <strong>{{ data.dadosCar.status }} ({{ data.dadosCar.descricao_status }})</strong>.
              É necessário regularizar a situação junto ao órgão ambiental antes de cadastrar a área agrícola.
            </p>
          </div>
        </div>
      } @else {
        <div class="alert-box alert-success">
          <mat-icon>check_circle_outline</mat-icon>
          <span>CAR Ativo e Regular. Por favor, confirme os dados abaixo para continuar:</span>
        </div>
      }

      <div class="info-grid">
        <div class="info-item">
          <span class="label">Código do Imóvel:</span>
          <span class="value strong">{{ data.dadosCar.cod_imovel }}</span>
        </div>

        <div class="info-item">
          <span class="label">Nome da Propriedade:</span>
          <span class="value">{{ data.dadosCar.nom_imovel || 'Não Informado' }}</span>
        </div>

        <div class="info-item">
          <span class="label">Área Total Declarada:</span>
          <span class="value">{{ data.dadosCar.area_total_declarada_ha | number:'1.2-2':'pt-BR' }} ha</span>
        </div>

        <div class="info-item">
          <span class="label">Situação / Status:</span>
          <span class="badge" [ngClass]="data.podeAvancar ? 'status-ativo' : 'status-inativo'">
            {{ data.dadosCar.status }} - {{ data.dadosCar.descricao_status }}
          </span>
        </div>

        <div class="info-item">
          <span class="label">Última Atualização:</span>
          <span class="value">{{ data.dadosCar.ultima_atualizacao | date:'dd/MM/yyyy' }}</span>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="modal-actions">
      <!-- Botão Corrigir CAR em Laranja -->
      <button mat-flat-button class="btn-corrigir" (click)="cancelar()">
        {{ data.podeAvancar ? 'Corrigir CAR' : 'Fechar' }}
      </button>

      <!-- Botão Confirmar em Verde -->
      @if (data.podeAvancar) {
        <button mat-flat-button class="btn-confirmar" (click)="confirmar()">
          Confirmar Dados e Avançar
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px !important;
    }
    .alert-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .alert-danger {
      background-color: #fde8e8;
      color: #9b1c1c;
      border: 1px solid #f8b4b4;
    }
    .alert-success {
      background-color: #def7ec;
      color: #03543f;
      border: 1px solid #84e1bc;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
    }
    .value {
      font-size: 0.95rem;
      color: #111827;
    }
    .value.strong {
      font-weight: bold;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      width: fit-content;
      margin-top: 2px;
    }
    .status-ativo {
      background-color: #03543f;
      color: #ffffff;
    }
    .status-inativo {
      background-color: #9b1c1c;
      color: #ffffff;
    }

    /* Estilização dos Botões de Ação */
    .modal-actions {
      padding: 16px 24px 20px 24px;
      gap: 12px;
    }

    .btn-corrigir {
      background-color: #ea580c !important; /* Laranja */
      color: #ffffff !important;
      font-weight: 600;
      border-radius: 8px;
      padding: 0 20px;
      height: 42px;

      &:hover {
        background-color: #c2410c !important;
      }
    }

    .btn-confirmar {
      background-color: #16a34a !important; /* Verde */
      color: #ffffff !important;
      font-weight: 700;
      border-radius: 8px;
      padding: 0 24px;
      height: 42px;

      &:hover {
        background-color: #15803d !important;
      }
    }
  `]
})
export class ModalConfirmacaoCarComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalConfirmacaoCarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalCarData
  ) {}

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
