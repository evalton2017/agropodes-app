import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {RelatorioService} from '../../../../service/relatorio.service';
import {SolicitacaoRelatorio} from '../../../../model/solicitacao-relatorio';

@Component({
  selector: 'app-relatorio-produtor',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './relatorio-detalhe-car.component.html',
  styleUrls: ['./relatorio-detalhe-car.component.scss']
})
export class RelatorioDetalheCarComponent implements OnInit {
  // Injeção de dependência moderna do Angular (sem necessidade de constructor)
  private relatorioService = inject(RelatorioService);

  // Colunas da tabela
  displayedColumns: string[] = ['codigoCar', 'statusImovel', 'municipio', 'estado', 'relatorio', 'acoes'];

  // Utilização de Signals para controle de estado reativo e nativo
  dataSource = new MatTableDataSource<SolicitacaoRelatorio>();
  carregando = signal<boolean>(false);
  erroMsg = signal<string>('');

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando.set(true);
    this.erroMsg.set('');

    this.relatorioService.detalharCar().subscribe({
      next: (dados: SolicitacaoRelatorio[]) => {
        this.dataSource.data = Array.isArray(dados) ? dados : [dados];
        this.carregando.set(false);
      },
      error: (err) => {
        this.erroMsg.set('Erro ao carregar os dados do CAR.');
        this.carregando.set(false);
        console.error(err);
      }
    });
  }

  gerarRelatorio(item: SolicitacaoRelatorio): void {
    this.carregando.set(true);

    this.relatorioService.baixarRelatorio(item.id).subscribe({
      next: (blob: Blob) => {
        // Cria um link temporário na memória do navegador
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;

        // Define o nome padrão do arquivo caso o header dê fallback
        link.download = `Relatorio_CAR_${item.consultaCar?.codigoCar || item.id}.pdf`;

        // Simula o clique do usuário para iniciar o download e limpa a memória
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlBlob);

        this.carregando.set(false);
      },
      error: (err) => {
        this.erroMsg.set('Erro ao baixar o relatório em formato PDF.');
        this.carregando.set(false);
        console.error(err);
      }
    });
  }
}
