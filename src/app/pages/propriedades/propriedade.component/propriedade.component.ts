import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';

import {PropriedadeService} from '../propriedade.service';
import {Propriedade} from '../propriedade.model';


import {ListarPropriedadeComponent} from '../components/listar-propriedade.component/listar-propriedade.component';
import {
  CadastrarPropriedadeComponent
} from '../components/cadastrar-propriedade.component/cadastrar-propriedade.component';
import {
  DetalhesPropriedadeComponent
} from '../components/detalhes-propriedade.component/detalhes-propriedade.component';
import {ModalCadastrarSocioComponent} from '../modal/modal-cadastrar-socio.component';
import {PessoaService} from '../../../service/pessoa.service';

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

  produtor = computed(() => this.pessoaService.produtorAtual());
  private readonly pessoaService = inject(PessoaService);
  readonly idProdutorLogado = this.pessoaService.idProdutorLogado;

  private dialog = inject(MatDialog);
  private propriedadeService = inject(PropriedadeService);


  ngOnInit(): void {
    this.carregarPropriedades();
  }


  /**
   * Consulta apenas as propriedades vinculadas estritamente ao idProdutor logado
   */
  carregarPropriedades(): void {
    const idProdutor = this.idProdutorLogado();

    if(idProdutor){
      this.propriedadeService.listarPropriedadesProdutor(idProdutor).subscribe({
        next: (dados) => this.listaPropriedades.set(dados),
        error: (err) => console.error('Erro ao carregar propriedades do produtor:', err)
      });
    }

  }

  abrirCadastro(): void {
    this.viewModo.set('CADASTRO');
  }

  /**
   * Garante a validação de segurança antes de abrir os detalhes da propriedade
   */
  verDetalhes(prop: Propriedade): void {
    if (!this.idProdutorLogado()) {
      console.warn('Acesso negado: Tentativa de visualização de propriedade de outro titular.');
      return;
    }

    this.idPropriedadeSelecionada.set(prop.id_propriedade);
    this.viewModo.set('DETALHES');
  }

  abrirModalAdicionarSocio(propriedade: Propriedade): void {
    const dialogRef = this.dialog.open(ModalCadastrarSocioComponent, {
      width: '440px',
      data: {
        idPropriedade: propriedade.id_propriedade,
        codigoCar: propriedade.codigo_car,
        idProdutor: this.idProdutorLogado()
      }
    });

    dialogRef.afterClosed().subscribe((recarregar) => {
      if (recarregar) {
        this.carregarPropriedades();
      }
    });
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
