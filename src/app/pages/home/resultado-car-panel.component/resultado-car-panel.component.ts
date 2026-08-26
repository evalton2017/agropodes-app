import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {ResultadoComplianceCAR} from '../../model/compliance-car.model';
import {PublicService} from '../public.service';


@Component({
  selector: 'app-resultado-car-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './resultado-car-panel.component.html',
  styleUrl: './resultado-car-panel.component.scss'
})
export class ResultadoCarPanelComponent implements OnInit {
  private readonly publicService = inject(PublicService);
  private readonly dialogRef = inject(MatDialogRef<ResultadoCarPanelComponent>);

  codCarInput = signal<string>('');
  loading = signal<boolean>(false);
  dadosResultado = signal<ResultadoComplianceCAR | null>(null);
  erroMensagem = signal<string | null>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { codCarInicial?: string }) {
    if (data?.codCarInicial) {
      this.codCarInput.set(data.codCarInicial);
    }
  }

  ngOnInit(): void {
    if (this.codCarInput()) {
      this.buscarCompliance();
    }
  }

  buscarCompliance(): void {
    const carValido = this.codCarInput().trim();
    if (!carValido) {
      this.erroMensagem.set('Informe um código CAR válido para consulta.');
      return;
    }

    this.loading.set(true);
    this.erroMensagem.set(null);

    this.publicService.obterCompliancePorCar(carValido).subscribe({
      next: (res) => {
        this.dadosResultado.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro na consulta do CAR:', err);
        this.erroMensagem.set('Não foi possível encontrar dados para o CAR informado.');
        this.loading.set(false);
      }
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
