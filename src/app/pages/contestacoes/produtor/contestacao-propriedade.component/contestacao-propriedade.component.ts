import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ListarPropriedadeComponent
} from '../../../propriedades/components/listar-propriedade.component/listar-propriedade.component';
import {
  CadastrarPropriedadeComponent
} from '../../../propriedades/components/cadastrar-propriedade.component/cadastrar-propriedade.component';
import {PropriedadeService} from '../../../propriedades/propriedade.service';
import {Propriedade} from '../../../propriedades/propriedade.model';


@Component({
  selector: 'app-contestacao-propriedade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ListarPropriedadeComponent,
    CadastrarPropriedadeComponent
  ],
  templateUrl: './contestacao-propriedade.component.html',
  styleUrl: './contestacao-propriedade.component.scss'
})
export class ContestacaoPropriedadeComponent implements OnInit {
  private readonly propriedadeService = inject(PropriedadeService);

  // Estados de navegação interna
  viewModo = signal<'LISTA' | 'CADASTRO' | 'CONTESTACAO_DETECOES'>('LISTA');

  listaPropriedades = signal<Propriedade[]>([]);
  loadingPropriedades = signal<boolean>(false);

  // Propriedade selecionada para contestação
  propriedadeSelecionada = signal<Propriedade | null>(null);
  deteccoesSelecionadas = signal<number[]>([]);
  motivoContestacao = signal<string>('');
  loadingEnvio = signal<boolean>(false);
  mensagemSucesso = signal<string | null>(null);

  ngOnInit(): void {
    this.carregarPropriedades();
  }

  carregarPropriedades(): void {
    this.loadingPropriedades.set(true);
    this.propriedadeService.listarPropriedadesProdutor().subscribe({
      next: (dados) => {
        this.listaPropriedades.set(dados);
        this.loadingPropriedades.set(false);
      },
      error: () => this.loadingPropriedades.set(false)
    });
  }

  abrirCadastro(): void {
    this.viewModo.set('CADASTRO');
  }

  onCadastradoComSucesso(): void {
    this.viewModo.set('LISTA');
    this.carregarPropriedades();
  }

  iniciarFluxoContestacao(prop: Propriedade): void {
    this.propriedadeSelecionada.set(prop);
    this.deteccoesSelecionadas.set([]);
    this.motivoContestacao.set('');
    this.mensagemSucesso.set(null);
    this.viewModo.set('CONTESTACAO_DETECOES');
  }

  toggleSelecaoDeteccao(idDeteccao: number): void {
    const selecionados = [...this.deteccoesSelecionadas()];
    const index = selecionados.indexOf(idDeteccao);

    if (index > -1) {
      selecionados.splice(index, 1);
    } else {
      selecionados.push(idDeteccao);
    }

    this.deteccoesSelecionadas.set(selecionados);
  }

  enviarContestacao(): void {
    const prop = this.propriedadeSelecionada();
    const ids = this.deteccoesSelecionadas();
    const motivo = this.motivoContestacao().trim();

    if (!prop || ids.length === 0 || !motivo) return;

    this.loadingEnvio.set(true);

    this.propriedadeService.enviarContestacao({
      id_propriedade: prop.id_propriedade,
      ids_deteccoes: ids,
      motivo_contestacao: motivo
    }).subscribe({
      next: () => {
        this.loadingEnvio.set(false);
        this.mensagemSucesso.set('Contestação enviada com sucesso para análise do órgão ambiental!');
        setTimeout(() => {
          this.viewModo.set('LISTA');
          this.carregarPropriedades();
        }, 2000);
      },
      error: () => this.loadingEnvio.set(false)
    });
  }

  voltarParaLista(): void {
    this.viewModo.set('LISTA');
  }
}
