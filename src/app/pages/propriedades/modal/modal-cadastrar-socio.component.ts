import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PropriedadeService } from '../propriedade.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AlertService} from '../../../components/service/alert.service';

export interface ModalSocioData {
  idPropriedade: number;
  codigoCar: string;
}

@Component({
  selector: 'app-modal-cadastrar-socio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">ADICIONAR SÓCIO / CO-PROPRIETÁRIO</h2>

    <mat-dialog-content class="dialog-content">
      <p class="subtitle">CAR: <strong>{{ data.codigoCar }}</strong></p>

      <form #formSocio="ngForm" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>CPF / CNPJ</mat-label>
          <input matInput [(ngModel)]="socio.cpf_cnpj" name="cpf_cnpj" required placeholder="000.000.000-00" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome Completo / Razão Social</mat-label>
          <input matInput [(ngModel)]="socio.nome" name="nome" required />
        </mat-form-field>

        <!-- 🟢 Campo de E-mail Obrigatório/Adicionado no Modal -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-mail do Sócio</mat-label>
          <input matInput type="email" [(ngModel)]="socio.email" name="email" required placeholder="socio@dominio.com" />
        </mat-form-field>

        <div class="row-flex">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Participação (%)</mat-label>
            <input matInput type="number" [(ngModel)]="socio.percentual_participacao" name="percentual" min="0" max="100" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Tipo de Vínculo</mat-label>
            <mat-select [(ngModel)]="socio.tipo_vinculo" name="tipo_vinculo">
              <mat-option value="SOCIO">Sócio</mat-option>
              <mat-option value="CO_PROPRIETARIO">Co-Proprietário</mat-option>
              <mat-option value="ARRENDATARIO">Arrendatário</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="salvando">Cancelar</button>
      <button mat-flat-button class="btn-save" (click)="salvar()" [disabled]="salvando || !formSocio.form.valid">
        @if (salvando) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <span>Vincular Sócio</span>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { color: #80ed99; font-size: 1.1rem; font-weight: bold; }
    .dialog-content { min-width: 380px; }
    .subtitle { color: #94a3b8; font-family: monospace; font-size: 0.8rem; margin-bottom: 16px; }
    .form-grid { display: flex; flex-direction: column; gap: 4px; }
    .row-flex { display: flex; gap: 12px; }
    .flex-1 { flex: 1; }
    .full-width { width: 100%; }
    .btn-save { background-color: #80ed99; color: #000; font-weight: bold; }
  `]
})
export class ModalCadastrarSocioComponent {
  private readonly dialogRef = inject(MatDialogRef<ModalCadastrarSocioComponent>);
  public readonly data: ModalSocioData = inject(MAT_DIALOG_DATA);
  private readonly propriedadeService = inject(PropriedadeService);
  private readonly alerta = inject(AlertService);

  public salvando = false;
  public socio = {
    cpf_cnpj: '',
    nome: '',
    email: '',
    percentual_participacao: 0,
    tipo_vinculo: 'SOCIO'
  };

  salvar(): void {
    this.salvando = true;
    this.propriedadeService.vincularSocio(this.data.idPropriedade, this.socio).subscribe({
      next: () => {
        this.salvando = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.alerta.error(err.message);
        this.salvando = false;
      }
    });
  }
}
