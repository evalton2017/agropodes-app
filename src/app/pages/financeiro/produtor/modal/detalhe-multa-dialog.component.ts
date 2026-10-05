import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MultaProdutor} from '../../financeiro.model';

@Component({
  selector: 'app-detalhe-multa-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dialog-header">
      <div class="flex items-center gap-2">
        <mat-icon class="icon-verde">gavel</mat-icon>
        <h2>Detalhes da Infração / Multa #{{ data.multa.id_multa }}</h2>
      </div>
      <button mat-icon-button (click)="fechar()"><mat-icon>close</mat-icon></button>
    </div>

    <div class="dialog-body">
      <div class="info-grid">
        <div class="info-box">
          <label>Propriedade / CAR</label>
          <span>{{ data.multa.nome_propriedade || 'N/A' }} ({{ data.multa.codigo_car }})</span>
        </div>
        <div class="info-box">
          <label>Tipo de Infração</label>
          <span>{{ data.multa.tipo_infracao }}</span>
        </div>
        <div class="info-box">
          <label>Área Afetada</label>
          <span>{{ data.multa.area_afetada_ha | number:'1.2-2':'pt-BR' }} ha</span>
        </div>
        <div class="info-box">
          <label>Valor Base / ha</label>
          <span>R$ {{ data.multa.valor_base_ha | number:'1.2-2':'pt-BR' }}</span>
        </div>
        <div class="info-box highlight">
          <label>Valor Total da Multa</label>
          <span class="valor-total">R$ {{ data.multa.valor_total_multa | number:'1.2-2':'pt-BR' }}</span>
        </div>
        <div class="info-box">
          <label>Data de Geração</label>
          <span>{{ data.multa.data_geracao | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
      </div>

      @if (data.multa.detalhes_calculo_json) {
        <div class="detalhes-json-box">
          <label>Memória de Cálculo (Regulatório MAPA / CMN)</label>
          <pre>{{ data.multa.detalhes_calculo_json | json }}</pre>
        </div>
      }
    </div>

    <div class="dialog-footer">
      <button mat-stroked-button class="btn-fechar" (click)="fechar()">Fechar</button>
    </div>
  `,
  styles: [`
    :host { display: block; background: #112217; color: #f1f5f9; padding: 20px; border-radius: 12px; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e3827; padding-bottom: 12px; }
    .dialog-header h2 { margin: 0; font-size: 18px; font-weight: 800; color: #f1f5f9; }
    .icon-verde { color: #4ade80; }
    .dialog-body { padding: 16px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .info-box { background: #0b1a10; padding: 12px; border-radius: 8px; border: 1px solid #183321; }
    .info-box label { font-size: 11px; color: #86efac; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .info-box span { font-size: 13.5px; font-weight: 600; color: #f8fafc; }
    .info-box.highlight { background: #143820; border-color: #225431; }
    .valor-total { color: #4ade80 !important; font-size: 16px !important; font-weight: 800 !important; }
    .detalhes-json-box { margin-top: 16px; background: #08120b; padding: 12px; border-radius: 8px; border: 1px solid #183321; }
    .detalhes-json-box label { font-size: 11px; color: #86efac; font-weight: 700; }
    .detalhes-json-box pre { font-size: 11px; color: #cbd5e1; margin-top: 8px; overflow-x: auto; }
    .dialog-footer { display: flex; justify-content: flex-end; border-top: 1px solid #1e3827; padding-top: 12px; }
    .btn-fechar { color: #f1f5f9 !important; border-color: #1e3827 !important; }
  `]
})
export class DetalheMultaDialogComponent {
  private dialogRef = inject(MatDialogRef<DetalheMultaDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { multa: MultaProdutor }) {}

  fechar(): void {
    this.dialogRef.close();
  }
}
