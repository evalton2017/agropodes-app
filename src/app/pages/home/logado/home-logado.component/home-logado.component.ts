import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

// Importações do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider'; // Adicionado para separar as seções

// Serviços e Modelos Reais do Projeto
import { TerritorioService } from '../../../../service/territorio.service';
import { AnaliseService } from '../../../../service/analise.service';
import { Territorio } from '../../../territorio/consulta-territorio.component/consulta-territorio.component';
import { Analise } from '../../../../model/analise';

@Component({
  selector: 'home-logado',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './home-logado.component.html',
  styleUrls: ['./home-logado.component.scss']
})
export class HomeLogadoComponent implements OnInit {
  private territorioService = inject(TerritorioService);
  private analiseService = inject(AnaliseService);

  // Sinais de Estado
  territorios = signal<Territorio[]>([]);
  analises = signal<Analise[]>([]);
  carregando = signal<boolean>(true);
  erro = signal<string | null>(null);

  // Configuração da Tabela
  colunasExibidas: string[] = ['id', 'nomePropriedade', 'numeroCar', 'imagens'];

  // Sinais Computados para o Painel Dinâmico
  totalTerritorios = computed(() => this.territorios().length);
  totalAnalises = computed(() => this.analises().length);

  statusContagem = computed(() => {
    const list = this.analises();
    return {
      emAnalise: list.filter(a => a.statusAnalise === 'EM_ANALISE').length,
      comPendencia: list.filter(a => a.statusAnalise === 'COM_PENDENCIA').length,
      aprovado: list.filter(a => a.statusAnalise === 'APROVADO').length,
      reprovado: list.filter(a => a.statusAnalise === 'REPROVADO').length
    };
  });

  ngOnInit(): void {
    forkJoin({
      territorios: this.territorioService.consultaTerritorios(),
      analises: this.analiseService.consultaAnalise()
    }).subscribe({
      next: (res) => {
        // Correção de atribuição preventiva baseada nas propriedades dos serviços reais
        this.territorios.set(res.territorios || []);
        this.analises.set(res.analises || []);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set('Erro ao carregar os dados do painel.');
        this.carregando.set(false);
        console.error(err);
      }
    });
  }
}
