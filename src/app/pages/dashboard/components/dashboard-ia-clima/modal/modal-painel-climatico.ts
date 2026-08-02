import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {ResumoClimaticoEstadoDTO} from '../dashboard-ia-clima';

@Component({
  selector: 'app-modal-painel-climatico',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './modal-painel-climatico.html',
  styleUrls: ['./modal-painel-climatico.scss']
})
export class AppModalPainelClimatico {
  public filtroTexto: string = '';

  constructor(
    public dialogRef: MatDialogRef<AppModalPainelClimatico>,
    @Inject(MAT_DIALOG_DATA) public estados: ResumoClimaticoEstadoDTO[]
  ) {}

  public get estadosFiltrados(): ResumoClimaticoEstadoDTO[] {
    if (!this.filtroTexto.trim()) return this.estados;
    const termo = this.filtroTexto.toLowerCase();
    return this.estados.filter(e => e.uf.toLowerCase().includes(termo));
  }

  public fechar(): void {
    this.dialogRef.close();
  }

  public formatarSinal(valor: number, sufixo: string = ''): string {
    if (valor === 0) return `0${sufixo}`;
    const sinal = valor > 0 ? '+' : '';
    return `${sinal}${valor}${sufixo}`;
  }
}
