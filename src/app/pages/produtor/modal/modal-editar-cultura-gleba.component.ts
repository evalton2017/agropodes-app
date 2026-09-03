import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GlebaService } from '../../../service/gleba.service';
import {CULTURAS_PERMITIDAS} from '../../model/gleba.model';

export interface ModalEditarCulturaData {
  idGleba: number;
  nomeGleba: string;
  culturaAtual: string;
}


@Component({
  selector: 'app-modal-editar-cultura-gleba',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">Alterar Cultura Declarada</h2>

    <mat-dialog-content class="dialog-content">
      <p class="gleba-info">Gleba: <strong>{{ data.nomeGleba }}</strong></p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Cultura Declarada</mat-label>
        <mat-select [(ngModel)]="culturaSelecionada">
          @for (cultura of opcoesCulturas; track cultura) {
            <mat-option [value]="cultura">{{ cultura }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="salvando">Cancelar</button>
      <button mat-flat-button color="primary" (click)="salvar()" [disabled]="salvando || !culturaSelecionada">
        @if (salvando) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <span>Salvar Alteração</span>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { color: #80ed99; margin: 0; }
    .dialog-content { min-width: 320px; padding-top: 12px; }
    .gleba-info { color: #e2e8f0; font-size: 0.9rem; margin-bottom: 16px; }
    .full-width { width: 100%; }
  `]
})
export class ModalEditarCulturaGlebaComponent {
  private readonly dialogRef = inject(MatDialogRef<ModalEditarCulturaGlebaComponent>);
  public readonly data: ModalEditarCulturaData = inject(MAT_DIALOG_DATA);
  private readonly glebaService = inject(GlebaService);

  public culturaSelecionada: string = this.data.culturaAtual;
  public opcoesCulturas = CULTURAS_PERMITIDAS;
  public salvando = false;

  salvar(): void {
    if (!this.culturaSelecionada) return;

    this.salvando = true;
    this.glebaService.atualizarCulturaGleba(this.data.idGleba, this.culturaSelecionada).subscribe({
      next: () => {
        this.salvando = false;
        this.dialogRef.close(this.culturaSelecionada);
      },
      error: (err) => {
        console.error('Erro ao atualizar cultura:', err);
        this.salvando = false;
      }
    });
  }
}
