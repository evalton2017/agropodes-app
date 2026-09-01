import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AlertService } from '../../../../components/service/alert.service';
import {PerfisService} from '../../perfis.service';
import {ManutencaoService} from '../../manutencao.service';


@Component({
  selector: 'app-modulo-cadastro',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './modulo-cadastro.component.html',
  styleUrls: ['./modulo-cadastro.component.scss']
})
export class ModuloCadastroComponent implements OnInit {
  private readonly perfisService = inject(PerfisService);
  private readonly manutencaoService = inject(ManutencaoService);
  private readonly alertService = inject(AlertService);

  listaModulos = signal<any[]>([]);
  drawerAberto = signal<boolean>(false);

  novoModulo = {
    nomeModulo: '',
    chaveRota: '',
    descricao: ''
  };

  ngOnInit(): void {
    this.carregarModulos();
  }

  carregarModulos() {
    this.perfisService.listarTodosModulos().subscribe({
      next: (res) => this.listaModulos.set(res),
      error: () => this.alertService.error('Erro ao carregar módulos.')
    });
  }

  abrirActionbar() {
    this.novoModulo = { nomeModulo: '', chaveRota: '', descricao: '' };
    this.drawerAberto.set(true);
  }

  fecharActionbar() {
    this.drawerAberto.set(false);
  }

  salvarModulo() {
    if (!this.novoModulo.nomeModulo || !this.novoModulo.chaveRota) {
      this.alertService.warning('Preencha todos os campos.');
      return;
    }

    this.manutencaoService.cadastrarModulo(this.novoModulo).subscribe({
      next: () => {
        this.alertService.success('Módulo cadastrado com sucesso!');
        this.fecharActionbar();
        this.carregarModulos();
      },
      error: (err) => {
        console.log(err);
        const msg = err.error.detail || 'Erro ao cadastrar módulo.';
        this.alertService.error(msg);
      }
    });
  }
}
