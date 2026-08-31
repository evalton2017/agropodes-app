import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {ManutencaoUsuarioComponent} from '../components/manutencao-usuario/manutencao-usuario';
import {ManutencaoEmpresaComponent} from '../components/manutencao-empresa/manutencao-empresa';
import {PerfisModulosComponent} from '../components/manutencao-perfil.component/perfis-modulos.componen';
import {ModuloCadastroComponent} from '../components/modulo-cadastro.component/modulo-cadastro.component';



@Component({
  selector: 'app-operacoes',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ManutencaoUsuarioComponent,
    ManutencaoEmpresaComponent,
    PerfisModulosComponent,
    ModuloCadastroComponent
  ],
  templateUrl: './operacoes.component.html',
  styleUrls: ['./operacoes.component.scss']
})
export class OperacoesComponent {

  abaAtiva = signal<'usuarios' | 'empresas' | 'modulos' | 'perfis'>('usuarios');

  selecionarAba(aba: 'usuarios' | 'empresas' | 'modulos' | 'perfis') {
    this.abaAtiva.set(aba);
  }
}
