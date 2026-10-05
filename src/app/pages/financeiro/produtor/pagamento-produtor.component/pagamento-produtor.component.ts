import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CheckoutPagamentoModalComponent } from '../modal/ckeckout-modal/checkout-pagamento-modal.component';
import { FinanceiroService } from '../../financeiro.service';
import { Pagamento } from '../../financeiro.model';
import { PessoaService } from '../../../../service/pessoa.service';

@Component({
  selector: 'app-pagamento-produtor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule // 🟢 MANTÉM APENAS O MATDIALOGMODULE AQUI
  ],
  templateUrl: './pagamento-produtor.component.html',
  styleUrls: ['./pagamento-produtor.component.scss']
})
export class PagamentoProdutorComponent implements OnInit {
  private financeiroService = inject(FinanceiroService);
  private pessoaService = inject(PessoaService);
  private dialog = inject(MatDialog);

  pagamentos = signal<Pagamento[]>([]);
  carregando = signal<boolean>(false);
  filtroStatus = '';

  readonly idProdutorLogado = this.pessoaService.idProdutorLogado;

  ngOnInit(): void {
    this.carregarPagamentos();
  }

  carregarPagamentos(): void {
    const idProdutor = this.idProdutorLogado();
    if (!idProdutor) return;

    this.carregando.set(true);
    this.financeiroService.listarPagamentosProdutor(idProdutor, this.filtroStatus).subscribe({
      next: (dados) => {
        this.pagamentos.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar pagamentos:', err);
        this.carregando.set(false);
      }
    });
  }

  // ABERTURA DO MODAL VIA MATDIALOG PASSANDO ID E VALOR
  abrirModalPagamento(item: Pagamento): void {
    const dialogRef = this.dialog.open(CheckoutPagamentoModalComponent, {
      width: '520px',
      data: {
        idPagamento: item.idPagamento,
        valor: item.valor
      },
      disableClose: true // Impede fechar clicando fora durante o pagamento
    });

    dialogRef.afterClosed().subscribe((comprovante) => {
      // Se um comprovante foi gerado, recarrega a lista para atualizar os status (ex: PAGO)
      if (comprovante) {
        this.carregarPagamentos();
      }
    });
  }

  obterClasseBadge(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAGO':
        return 'dot-concluido';
      case 'PENDENTE':
        return 'dot-andamento';
      default:
        return 'dot-nao-conforme';
    }
  }
}
