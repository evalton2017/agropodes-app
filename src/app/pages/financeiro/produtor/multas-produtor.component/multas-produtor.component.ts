import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {FinanceiroService} from '../../financeiro.service';
import {MultaProdutor} from '../../financeiro.model';
import {DetalheMultaDialogComponent} from '../modal/detalhe-multa-dialog.component';



@Component({
  selector: 'app-multas-produtor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './multas-produtor.component.html',
  styleUrls: ['./multas-produtor.component.scss']
})
export class MultasProdutorComponent implements OnInit {
  private financeiroService = inject(FinanceiroService);
  private dialog = inject(MatDialog);

  multas = signal<MultaProdutor[]>([]);
  carregando = signal<boolean>(false);
  filtroStatus = '';

  ngOnInit(): void {
    this.carregarMultas();
  }

  carregarMultas(): void {
    this.carregando.set(true);
    this.financeiroService.listarMultasProdutor(this.filtroStatus).subscribe({
      next: (dados) => {
        this.multas.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao listar multas:', err);
        this.carregando.set(false);
      }
    });
  }

  visualizarMulta(multa: MultaProdutor): void {
    this.dialog.open(DetalheMultaDialogComponent, {
      width: '650px',
      panelClass: 'custom-modal-dark',
      data: { multa }
    });
  }

  obterClasseBadge(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAGA': return 'dot-concluido';
      case 'GERADA': return 'dot-alerta';
      case 'CONTESTADA': return 'dot-andamento';
      case 'CANCELADA': return 'dot-nao-conforme';
      default: return 'dot-pendente';
    }
  }
}
