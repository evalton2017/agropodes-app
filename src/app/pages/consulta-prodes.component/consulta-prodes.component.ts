import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Importações do Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import {ProdesResponse} from '../../dto/response/prodes-response';
import {ConsultaCarService} from '../../service/consulta-car.service';
import {MapModalComponent} from '../../components/modal/map-modal-component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-consulta-prodes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './consulta-prodes.component.html',
  styleUrl: './consulta-prodes.component.scss'
})
export class ConsultaProdesComponent {
  private readonly fb = inject(FormBuilder);

  constructor(private readonly service: ConsultaCarService,
              private readonly dialog: MatDialog) {
  }

  consultaForm: FormGroup = this.fb.group({
    poligono: ['', [Validators.required, Validators.minLength(20)]]
  });

  resultados: ProdesResponse[] = [];
  erroMensagem: string | null = null;

  // Definição das colunas que serão exibidas na mat-table
  colunasExibidas: string[] = ['idFid', 'ano', 'tipoClasse', 'area', 'estado', 'sateliteSensor', 'dataImagem', 'poligono'];

  onSubmit(): void {
    if (this.consultaForm.invalid) {
      this.consultaForm.markAllAsTouched();
      return;
    }

    const { poligono } = this.consultaForm.value;
    this.erroMensagem = null;

    this.service.consultaProdes( poligono)
      .subscribe({
        next: (res) => {
          this.resultados = res;
          this.consultaForm.reset();
        },
        error: (err) => {
          this.erroMensagem = 'Erro ao consultar o polígono. Tente novamente.';
          console.error(err);
        }
      });
  }

  visualizarPoligono(prodes: ProdesResponse){
    this.dialog.open(MapModalComponent, {
      width: '600px',
      disableClose: false,
      data: { wkt: prodes.poligono }
    });
  }
}
