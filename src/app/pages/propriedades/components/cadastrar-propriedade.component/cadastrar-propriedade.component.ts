import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PropriedadeService } from '../../propriedade.service';
import { ComplianceCARResponse } from '../../propriedade.model';
import {
  DashboardProdutorGlebaCardComponent
} from '../../../../components/dashboard-produtor-gleba-card.component/dashboard-produtor-gleba-card.component';
import {GlebaGeometriaResponse} from '../../../dashboard/model/dashboard-produtor.model';


@Component({
  selector: 'app-cadastrar-propriedade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DashboardProdutorGlebaCardComponent
  ],
  templateUrl: './cadastrar-propriedade.component.html',
  styleUrl: './cadastrar-propriedade.component.scss'
})
export class CadastrarPropriedadeComponent {
  private readonly propriedadeService = inject(PropriedadeService);

  @Output() cadastradoSucesso = new EventEmitter<void>();

  codCarInput = signal<string>('');
  loadingConsulta = signal<boolean>(false);
  loadingSalvar = signal<boolean>(false);
  erroMensagem = signal<string | null>(null);
  complianceResultado = signal<ComplianceCARResponse | null>(null);

  // Executado automaticamente ao clicar em um card de Gleba
  onGlebaSelecionada(gleba: GlebaGeometriaResponse): void {
    if (gleba && gleba.codigoCar) {
      this.codCarInput.set(gleba.codigoCar);
      this.buscarCompliance();
    }
  }

  buscarCompliance(): void {
    const carValido = this.codCarInput().trim();
    if (!carValido) {
      this.erroMensagem.set('Informe ou selecione uma gleba com código CAR válido.');
      return;
    }

    this.loadingConsulta.set(true);
    this.erroMensagem.set(null);
    this.complianceResultado.set(null);

    this.propriedadeService.consultarComplianceCar(carValido).subscribe({
      next: (res) => {
        this.complianceResultado.set(res);
        this.loadingConsulta.set(false);
      },
      error: (err) => {
        console.error(err);
        this.erroMensagem.set('Propriedade não localizada no banco do CAR ou falha no PostGIS.');
        this.loadingConsulta.set(false);
      }
    });
  }

  confirmarEGravar(): void {
    const resultado = this.complianceResultado();
    const car = this.codCarInput().trim();

    // Trava de segurança: impede gravação caso o valor da multa seja 0 ou inválido
    if (!car || !resultado || !resultado.valor_multa_indenizatoria || resultado.valor_multa_indenizatoria <= 0) {
      this.erroMensagem.set('Propriedades isentas ou sem multa indenizatória devida não necessitam de cadastro.');
      return;
    }

    this.loadingSalvar.set(true);
    this.propriedadeService.cadastrarPropriedade(car).subscribe({
      next: () => {
        this.loadingSalvar.set(false);
        this.cadastradoSucesso.emit();
      },
      error: (err) => {
        console.error(err);
        this.erroMensagem.set('Erro ao efetivar o cadastro da propriedade no banco.');
        this.loadingSalvar.set(false);
      }
    });
  }
}
