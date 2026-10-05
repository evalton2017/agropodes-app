import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {FinanceiroService} from '../../../financeiro/financeiro.service';
import {ModalSucessoMultaComponent} from '../sucesso-multa/modal-sucesso-multa.component';
import {AlertService} from '../../../../components/service/alert.service';
import {SimulacaoMultaResponse} from '../../../financeiro/financeiro.model';


@Component({
  selector: 'app-modal-verificar-multa',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './modal-verificar-multa.component.html',
  styleUrl: './modal-verificar-multa.component.scss'
})
export class ModalVerificarMultaComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ModalVerificarMultaComponent>);
  private financeiroService = inject(FinanceiroService);
  readonly data = inject<{ idPropriedade: number; idProdutor: number }>(MAT_DIALOG_DATA);

  carregando = signal<boolean>(true);
  processandoGeracao = signal<boolean>(false);
  dadosSimulacao = signal<SimulacaoMultaResponse | null>(null);
  private dialog = inject(MatDialog);
  private alertService = inject(AlertService);

  ngOnInit(): void {
    this.carregarSimulacao();
  }

  carregarSimulacao(): void {
    this.carregando.set(true);
    this.financeiroService.simularMultasPropriedade(this.data.idPropriedade).subscribe({
      next: (res) => {
        this.dadosSimulacao.set(res);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao consultar prévia da multa:', err);
        this.carregando.set(false);
      }
    });
  }

  gerarMulta(): void {
    if (!this.data.idProdutor) return;

    this.processandoGeracao.set(true);
    this.financeiroService.processarMultasPropriedade(this.data.idPropriedade, this.data.idProdutor).subscribe({
      next: () => {
        this.processandoGeracao.set(false);
        // 1. Fecha a modal atual de prévia de multa
        this.dialogRef.close();

        // 2. 🟢 APLICAÇÃO DA MODAL DE SUCESSO
        this.dialog.open(ModalSucessoMultaComponent, {
          width: '520px',
          disableClose: true,
          panelClass: 'custom-modal-dark'
        });
      },
      error: (err) => {
        console.error('Erro ao consultar multa:', err);
        this.alertService.error(err.error.detail);
        this.processandoGeracao.set(false);
      }
    });
  }

  fechar(): void {
    this.dialogRef.close(false);
  }
}
