import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {PessoaService} from '../../../../service/pessoa.service';
import {ManutencaoService} from '../../manutencao.service';
import {MascaraUtils} from '../../../../shared/util/mascaras.util';
import {AlertService} from '../../../../components/service/alert.service';


@Component({
  selector: 'app-manutencao-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './manutencao-usuario.html',
  styleUrls: ['./manutencao-usuario.scss']
})
export class ManutencaoUsuarioComponent implements OnInit {
  private readonly manutencaoService = inject(ManutencaoService);
  private readonly pessoaService = inject(PessoaService);
  private readonly alertaService = inject(AlertService)

  displayedColumns: string[] = ['nome', 'email', 'tipo', 'cpfCnpj','empresa', 'perfil', 'acoes'];
  dataSource = signal<any[]>([]);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  drawerAberto = signal<boolean>(false);
  modoEdicao = signal<boolean>(true);

  usuarioSelecionado = signal<any>({
    nome: '',
    sobrenome: '',
    email: '',
    username: '',
    password: '',
    cnpjEmpresa: '',
    perfilId: null,
    empresaId: null,
    ativo: true
  });

  listaPerfis = signal<any[]>([]);

  ngOnInit(): void {
    this.carregarUsuarios();
    this.carregarPerfis();
  }

  carregarUsuarios(page = 0, size = 10) {
    const empresaId = this.pessoaService.produtorAtual()?.empresa?.id;
    if (!empresaId) return;

    this.manutencaoService.listarUsuariosPorEmpresa(empresaId, page, size).subscribe({
      next: (res: any) => {
        this.dataSource.set(res.content);
        this.totalElements.set(res.totalElements);
      },
      error: (err) => console.error('Erro ao buscar usuários:', err)
    });
  }

  carregarPerfis() {
    this.manutencaoService.listarPerfis().subscribe({
      next: (res: any) => {
        // Filtra para garantir que apenas perfis/contratos de produtor apareçam se necessário
        const perfisProdutor = res.filter((p: any) => !p.tipoBase?.includes('ANALISTA'));
        this.listaPerfis.set(perfisProdutor.length ? perfisProdutor : res);
      },
      error: () => {
        // Fallback caso o endpoint de perfis direto não retorne
        this.listaPerfis.set([
          { id: 1, nome: 'Contrato Básico' },
          { id: 2, nome: 'Contrato Monitoramento' }
        ]);
      }
    });
  }

  mudarPagina(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.carregarUsuarios(event.pageIndex, event.pageSize);
  }

  abrirNovoCadastro() {
    this.modoEdicao.set(false);
    this.usuarioSelecionado.set({
      nome: '',
      sobrenome: '',
      username: '',
      email: '',
      password: '',
      cpfCnpj: '',
      cnpjEmpresa: '',
      perfilId: null,
      ativo: true
    });
    this.drawerAberto.set(true);
  }


  abrirEdicao(pessoa: any) {
    this.modoEdicao.set(true);
    this.usuarioSelecionado.set({
      ...pessoa,
      cpfCnpj: pessoa.cpfCnpj || pessoa.cpf || '',
      cnpjEmpresa: pessoa.empresa?.cnpj || ''
    });
    this.drawerAberto.set(true);
  }

  onCnpjEmpresaInput(event: any) {
    const valor = event.target.value.replace(/\D/g, '');
    this.usuarioSelecionado.update(u => ({ ...u, cnpjEmpresa: valor }));

    if (valor.length >= 5) {
      this.manutencaoService.buscarEmpresaPorCnpj(valor).subscribe({
        next: (empresa) => {
          if (!empresa) {
            this.alertaService.warning('Empresa não cadastrada.');
          } else {
            this.alertaService.warning(`Empresa encontrada: ${empresa.razaoSocial}`);
          }
        },
        error: () => {
          this.alertaService.error(`Empresa não cadastrada no sistema`);
        }
      });
    }
  }


  fecharActionbar() {
    this.drawerAberto.set(false);
  }

  salvar() {
    const dados = this.usuarioSelecionado();

    if (this.modoEdicao()) {
      // Atualizar Usuário
      this.manutencaoService.atualizarUsuario(dados.id, dados.nome, dados.ativo, dados.perfilId, dados.empresaId).subscribe({
        next: () => {
          this.fecharActionbar();
          this.carregarUsuarios(this.pageIndex(), this.pageSize());
        },
        error: (err) => alert('Erro ao atualizar usuário: ' + (err.error?.message || err.message))
      });
    } else {
      // Cadastrar Novo Produtor
      const payload = {
        username: dados.username || dados.email,
        email: dados.email,
        firstName: dados.nome,
        lastName: dados.sobrenome || '',
        password: dados.password,
        cpfCnpj: dados.cpfCnpj,
        cnpjEmpresa: dados.cnpjEmpresa
      };

      this.manutencaoService.cadastrarProdutor(payload, dados.perfilId).subscribe({
        next: () => {
          alert('Produtor cadastrado com sucesso!');
          this.fecharActionbar();
          this.carregarUsuarios(this.pageIndex(), this.pageSize());
        },
        error: (err) => alert('Erro ao cadastrar produtor: ' + (err.error?.message || err.message))
      });
    }
  }

  onCpfCnpjInput(event: any) {
    const valorFormatado = MascaraUtils.aplicarCpfCnpj(event.target.value);
    this.usuarioSelecionado.update(u => ({ ...u, cpfCnpj: valorFormatado }));
  }


}
