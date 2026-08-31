import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {AppAlertComponent} from '../../../../components/alert/app-alert.component';
import {ManutencaoService} from '../../manutencao.service';
import {PessoaService} from '../../../../service/pessoa.service';
import {ViaCepService} from '../../../../shared/service/viacep.service';
import {MascaraUtils} from '../../../../shared/util/mascaras.util';
import {Empresa, EmpresaPageResponse, Endereco, Telefone} from '../../manutencao.model';

@Component({
  selector: 'app-manutencao-empresa',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatTooltipModule, MatFormFieldModule,
    MatInputModule, AppAlertComponent
  ],
  templateUrl: './manutencao-empresa.html',
  styleUrls: ['./manutencao-empresa.scss']
})
export class ManutencaoEmpresaComponent implements OnInit {
  private readonly manutencaoService = inject(ManutencaoService);
  private readonly pessoaService = inject(PessoaService);
  private readonly viaCepService = inject(ViaCepService);

  isAdmin = signal<boolean>(false);
  alertaMsg = signal<string>('');
  alertaTipo = signal<'success' | 'error' | 'warning'>('success');

  displayedColumns: string[] = ['razaoSocial', 'cnpj', 'status', 'acoes'];
  dataSource = signal<Empresa[]>([]);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);

  drawerAberto = signal<boolean>(false);
  modoEdicao = signal<boolean>(false);

  // 🟢 Estrutura adaptada para suportar múltiplos endereços e telefones
  empresaSelecionada = signal<Partial<Empresa> & {
    enderecos: Partial<Endereco>[];
    telefones: Partial<Telefone>[];
  }>({
    razaoSocial: '',
    cnpj: '',
    ativo: true,
    enderecos: [],
    telefones: []
  });

  ngOnInit(): void {
    this.verificarPermissaoAdmin();
  }

  verificarPermissaoAdmin() {
    const produtor = this.pessoaService.produtorAtual();
    const admin = !!(produtor?.tipo === 'ADMIN' || produtor?.perfil?.nome?.toUpperCase().includes('ADMIN'));
    this.isAdmin.set(admin);
    if (admin) this.carregarEmpresas();
  }

  carregarEmpresas(page = 0, size = 10) {
    this.manutencaoService.listarEmpresasPaginated(page, size).subscribe({
      next: (res: EmpresaPageResponse) => {
        this.dataSource.set(res.content);
        this.totalElements.set(res.totalElements);
      },
      error: () => this.mostrarAlerta('Erro ao carregar empresas.', 'error')
    });
  }

  mudarPagina(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.carregarEmpresas(event.pageIndex, event.pageSize);
  }

  abrirNovoCadastro() {
    this.modoEdicao.set(false);
    this.empresaSelecionada.set({
      razaoSocial: '',
      cnpj: '',
      ativo: true,
      enderecos: [{ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }],
      telefones: [{ ddd: '', numero: '', tipo: 'COMERCIAL' }]
    });
    this.drawerAberto.set(true);
  }

  abrirEdicao(empresa: Empresa) {
    this.modoEdicao.set(true);
    this.empresaSelecionada.set({
      ...empresa,
      enderecos: empresa.enderecos?.length ? [...empresa.enderecos] : [{ cep: '', logradouro: '', numero: '' }],
      telefones: empresa.telefones?.length ? [...empresa.telefones] : [{ ddd: '', numero: '', tipo: 'COMERCIAL' }]
    });
    this.drawerAberto.set(true);
  }

  fecharActionbar() {
    this.drawerAberto.set(false);
  }

  // Métodos para adicionar ou remover linhas dinâmicas
  adicionarEndereco() {
    this.empresaSelecionada.update(e => ({
      ...e,
      enderecos: [...(e.enderecos || []), { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }]
    }));
  }

  removerEndereco(index: number) {
    this.empresaSelecionada.update(e => ({
      ...e,
      enderecos: e.enderecos?.filter((_, i) => i !== index)
    }));
  }

  adicionarTelefone() {
    this.empresaSelecionada.update(e => ({
      ...e,
      telefones: [...(e.telefones || []), { ddd: '', numero: '', tipo: 'COMERCIAL' }]
    }));
  }

  removerTelefone(index: number) {
    this.empresaSelecionada.update(e => ({
      ...e,
      telefones: e.telefones?.filter((_, i) => i !== index)
    }));
  }

  aplicarMascaraCnpj(event: any) {
    const formatado = MascaraUtils.aplicarCnpj(event.target.value);
    this.empresaSelecionada.update(e => ({ ...e, cnpj: formatado }));
  }

  buscarCep(index: number, event: any) {
    const cepLimpo = event.target.value.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      this.viaCepService.consultarCep(cepLimpo).subscribe({
        next: (dados) => {
          if (dados) {
            this.empresaSelecionada.update(e => {
              const ends = [...(e.enderecos || [])];
              ends[index] = {
                ...ends[index],
                cep: dados.cep,
                logradouro: dados.logradouro,
                bairro: dados.bairro,
                cidade: dados.localidade,
                estado: dados.uf
              };
              return { ...e, enderecos: ends };
            });
          }
        }
      });
    }
  }

  salvar() {
    const dados = this.empresaSelecionada();

    if (this.modoEdicao() && dados.id) {
      this.manutencaoService.atualizarEmpresa(dados.id, dados).subscribe({
        next: () => {
          this.mostrarAlerta('Endereços e telefones atualizados com sucesso!', 'success');
          this.fecharActionbar();
          this.carregarEmpresas(this.pageIndex(), this.pageSize());
        },
        error: (err) => this.mostrarAlerta(err.error?.message || 'Erro ao atualizar empresa.', 'error')
      });
    } else {
      this.manutencaoService.cadastrarEmpresa(dados).subscribe({
        next: () => {
          this.mostrarAlerta('Empresa cadastrada com sucesso!', 'success');
          this.fecharActionbar();
          this.carregarEmpresas(this.pageIndex(), this.pageSize());
        },
        error: (err) => this.mostrarAlerta(err.error?.message || 'Erro ao salvar empresa.', 'error')
      });
    }
  }

  mostrarAlerta(msg: string, tipo: 'success' | 'error' | 'warning') {
    this.alertaMsg.set(msg);
    this.alertaTipo.set(tipo);
  }
}
