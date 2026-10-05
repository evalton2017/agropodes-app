import { Component, inject, signal, computed, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Subscription } from 'rxjs';

import { ComprovanteResponseDTO, RequisicaoPagamentoDTO } from '../../../financeiro.model';
import { FinanceiroService } from '../../../financeiro.service';

@Component({
  selector: 'app-checkout-pagamento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './checkout-pagamento-modal.component.html',
  styleUrl: './checkout-pagamento-modal.component.scss'
})
export class CheckoutPagamentoModalComponent implements OnDestroy {
  private pagamentoService = inject(FinanceiroService);
  private dialogRef = inject(MatDialogRef<CheckoutPagamentoModalComponent>);
  private destroyRef = inject(DestroyRef);

  public data = inject<{ idPagamento: number; valor: number }>(MAT_DIALOG_DATA);

  metodoSelecionado = signal<'PIX' | 'CREDITO' | 'DEBITO'>('PIX');
  parcelas = signal<number>(1);
  loading = signal<boolean>(false);
  comprovanteGerado = signal<ComprovanteResponseDTO | null>(null);

  // Estados do Pix
  pixGerado = signal<boolean>(false);
  tempoRestante = signal<number>(10);
  codigoPixCopiaECola = signal<string>('');
  urlQrCodePix = signal<string>('');
  copiadoSucesso = signal<boolean>(false);
  private timerSubscription?: Subscription;

  // Formulário do Cartão
  numeroCartao = '';
  nomeTitular = '';
  cpfTitular = '';
  validade = '';
  cvv = '';
  bandeira = 'VISA';

  opcoesParcelas = computed(() => {
    const valorTotal = this.data?.valor || 0;
    const lista = [];
    for (let i = 1; i <= 5; i++) {
      const valorParcela = valorTotal / i;
      lista.push({
        qtd: i,
        label: `${i}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${i === 1 ? 'à vista' : 'sem juros'}`
      });
    }
    return lista;
  });

  confirmarPagamento(): void {
    if (this.metodoSelecionado() === 'PIX' && !this.pixGerado()) {
      this.iniciarFluxoPix();
      return;
    }

    this.executarProcessamentoPagamento();
  }

  private iniciarFluxoPix(): void {
    this.loading.set(true);

    const payloadPix = `00020126580014BR.GOV.BCB.PIX0136tx-${this.data.idPagamento}-${Date.now()}5204000053039865405${this.data.valor.toFixed(2)}5802BR5913AGROPRODES6008BRASILIA62070503***63041D2E`;
    this.codigoPixCopiaECola.set(payloadPix);
    this.urlQrCodePix.set(`https://quickchart.io/qr?text=${encodeURIComponent(payloadPix)}&size=220`);

    this.loading.set(false);
    this.pixGerado.set(true);

    // Contagem regressiva de 10 segundos
    this.tempoRestante.set(10);
    this.timerSubscription = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const atual = this.tempoRestante();
        if (atual > 1) {
          this.tempoRestante.set(atual - 1);
        } else {
          this.pararTimer();
          this.executarProcessamentoPagamento();
        }
      });
  }

  private executarProcessamentoPagamento(): void {
    this.loading.set(true);

    const payload: RequisicaoPagamentoDTO = {
      idPagamento: this.data.idPagamento,
      metodoPagamento: this.metodoSelecionado(),
      parcelas: this.metodoSelecionado() === 'CREDITO' ? Number(this.parcelas()) : 1,
      ...(this.metodoSelecionado() !== 'PIX' && {
        dadosCartao: {
          numero: this.numeroCartao,
          nomeTitular: this.nomeTitular,
          cpfTitular: this.cpfTitular,
          validade: this.validade,
          cvv: this.cvv,
          bandeira: this.bandeira
        }
      })
    };

    this.pagamentoService.processarPagamento(payload).subscribe({
      next: (comprovante) => {
        this.loading.set(false);
        this.comprovanteGerado.set(comprovante);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Erro ao processar pagamento:', err);
      }
    });
  }

  copiarChavePix(): void {
    navigator.clipboard.writeText(this.codigoPixCopiaECola());
    this.copiadoSucesso.set(true);
    setTimeout(() => this.copiadoSucesso.set(false), 2000);
  }

  private pararTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  imprimirComprovante(): void {
    window.print();
  }

  fecharModal(): void {
    this.pararTimer();
    this.dialogRef.close(this.comprovanteGerado());
  }

  ngOnDestroy(): void {
    this.pararTimer();
  }
}
