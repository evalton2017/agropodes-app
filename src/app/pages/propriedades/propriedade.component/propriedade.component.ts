import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropriedadeService } from '../propriedade.service';
import { Propriedade } from '../propriedade.model';
import {ListarPropriedadeComponent} from '../components/listar-propriedade.component/listar-propriedade.component';
import {
  CadastrarPropriedadeComponent
} from '../components/cadastrar-propriedade.component/cadastrar-propriedade.component';
import {
  DetalhesPropriedadeComponent
} from '../components/detalhes-propriedade.component/detalhes-propriedade.component';

export type ModoViewPropriedade = 'LISTA' | 'CADASTRO' | 'DETALHES' | 'EDICAO';

@Component({
  selector: 'app-propriedade',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ListarPropriedadeComponent,
    CadastrarPropriedadeComponent,
    DetalhesPropriedadeComponent
  ],
  templateUrl: './propriedade.component.html',
  styleUrl: './propriedade.component.scss'
})
export class PropriedadeComponent implements OnInit {

  viewModo = signal<ModoViewPropriedade>('LISTA');
  listaPropriedades = signal<Propriedade[]>([]);
  idPropriedadeSelecionada = signal<number | null>(null);

  private propriedadeService = inject(PropriedadeService);

  ngOnInit(): void {
    this.carregarPropriedades();
  }

  carregarPropriedades(): void {
    this.propriedadeService.listarPropriedadesProdutor().subscribe({
      next: (dados) => this.listaPropriedades.set(dados),
      error: (err) => console.error('Erro ao carregar propriedades:', err)
    });
  }

  abrirCadastro(): void {
    this.viewModo.set('CADASTRO');
  }

  verDetalhes(prop: Propriedade): void {
    this.idPropriedadeSelecionada.set(prop.id_propriedade);
    this.viewModo.set('DETALHES');
  }

  abrirModalAdicionarSocio(prop: Propriedade): void {
    this.idPropriedadeSelecionada.set(prop.id_propriedade);
    this.viewModo.set('EDICAO');
  }

  voltarParaLista(): void {
    this.viewModo.set('LISTA');
    this.idPropriedadeSelecionada.set(null);
  }

  onCadastradoComSucesso(): void {
    this.carregarPropriedades();
    this.voltarParaLista();
  }
}
