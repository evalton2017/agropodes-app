import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {catchError, forkJoin, of, switchMap} from 'rxjs'; // Adicionado "of" para tratar fluxos vazios de produtor

// Importações do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

// Serviços e Modelos Reais do Projeto
import { TerritorioService } from '../../../../service/territorio.service';
import { AnaliseService } from '../../../../service/analise.service';
import { GlebaService } from '../../../../service/gleba.service';
import { Territorio } from '../../../territorio/consulta-territorio.component/consulta-territorio.component';
import { Analise } from '../../../../model/analise';
import { Map3DViewerComponent } from '../../../../components/mapas/3dview/map-3d-view.component';
import { AnaliseClimatica } from '../../../../dto/response/analise-climatica';
import { PessoaService } from '../../../../service/pessoa.service';

// Interfaces de Tipagem do Backend
export interface GlebeApiResponse {
  id_gleba: number;
  id_produtor: number;
  codigo_car: string;
  geometria: string;
  area_hectares: number;
  data_criacao: string;
  data_estimada_plantio: string;
  cultura_declarada: string;
}

export interface AlertaClimatico {
  evento: string;
  descricao: string;
}

// Extensão local reativa para renderização do Painel/Accordion
export interface GlebaPainel extends GlebeApiResponse {
  coordenadas: [number, number][];
  indicadores: ReturnType<typeof signal<AnaliseClimatica | null>>;
  carregandoIndicadores: ReturnType<typeof signal<boolean>>;
}

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
    MatDividerModule,
    MatExpansionModule,
    Map3DViewerComponent
  ],
  templateUrl: './home-logado.component.html',
  styleUrls: ['./home-logado.component.scss']
})
export class HomeLogadoComponent implements OnInit {
  private territorioService = inject(TerritorioService);
  private analiseService = inject(AnaliseService);
  private glebaService = inject(GlebaService);
  private readonly pessoaService = inject(PessoaService);

  // Removido o sinal local "carregandoAnalises" já que o controle agora é 100% global
  readonly produtor = this.pessoaService.produtorAtual;

  // Sinais de Estado
  territorios = signal<Territorio[]>([]);
  analises = signal<Analise[]>([]);
  glebas = signal<GlebaPainel[]>([]);
  carregando = signal<boolean>(true); // Spinner principal da tela escuta este sinal
  erro = signal<string | null>(null);

  colunasExibidas: string[] = ['id', 'nomePropriedade', 'numeroCar', 'imagens'];

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
    this.carregando.set(true);

    // 1. Buscamos territórios e análises em paralelo primeiro
    forkJoin({
      territorios: this.territorioService.consultaTerritorios(),
      analises: this.analiseService.consultaAnalise()
    }).pipe(
      // 2. Usamos switchMap para encadear a requisição de glebas baseada no ID do produtor atual
      switchMap((dadosIniciais) => {
        this.territorios.set(dadosIniciais.territorios || []);
        this.analises.set(dadosIniciais.analises || []);

        const idProdutor = this.produtor()?.id;

        if (idProdutor) {
          // Se tem produtor, dispara a requisição das glebas e passa adiante no fluxo
          return this.glebaService.getGlebasByProdutorIdPanel(idProdutor).pipe(
            catchError((err) => {
              console.error('Erro ao buscar glebas:', err);
              return of([]); // Retorna array vazio em caso de erro para não quebrar o fluxo
            })
          );
        } else {
          // Se não tem produtor, passa um array vazio adiante sem bater na API
          return of([]);
        }
      })
    ).subscribe({
      next: (dadosGlebas: GlebaPainel[]) => {
        // 3. Salvamos as glebas retornadas e encerramos o carregamento global de uma vez só
        this.glebas.set(dadosGlebas);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set('Erro ao carregar os dados do painel.');
        this.carregando.set(false);
        console.error(err);
      }
    });
  }

  /**
   * Disparado ao abrir o painel da gleba.
   * Consome os valores dinâmicos de cada registro vindo do serviço Python.
   */
  carregarIndicadoresGleba(gleba: GlebaPainel): void {
    // Evita múltiplas requisições paralelas para a mesma gleba caso já possua dados
    if (gleba.indicadores() !== null) return;

    gleba.carregandoIndicadores.set(true);

    // Passagem de parâmetros 100% dinâmica baseada na linha de dados
    this.analiseService.analiseClimatica(gleba.id_gleba, gleba.cultura_declarada).subscribe({
      next: (dadosClima) => {
        gleba.indicadores.set(dadosClima);
        gleba.carregandoIndicadores.set(false);
      },
      error: (err) => {
        console.error(`Erro ao buscar clima da gleba ${gleba.id_gleba}`, err);
        gleba.carregandoIndicadores.set(false);
      }
    });
  }
}
