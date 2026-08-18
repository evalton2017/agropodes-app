import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CadernoCampoDetalhadoComponent
} from '../../../caderno-campo/caderno-campo-detalhado.component/caderno-campo-detalhado.component';
import {AppGlebasListComponent} from '../components/glebas-list/glebas-list';

@Component({
  selector: 'app-clima-page',
  standalone: true,
  imports: [
    CommonModule,
    AppGlebasListComponent,
    CadernoCampoDetalhadoComponent
  ],
  templateUrl: './clima-page.component.html',
  styleUrls: ['./clima-page.component.scss']
})
export class ClimaPageComponent {
  public glebaSelecionada = signal<any | null>(null);

  /**
   * Abre a visão detalhada do caderno de campo para a gleba selecionada.
   */
  public abrirDetalhamento(gleba: any): void {
    this.glebaSelecionada.set(gleba);
  }

  /**
   * Retorna para a listagem da Gestão de Glebas Monitoradas.
   */
  public voltarParaListagem(): void {
    this.glebaSelecionada.set(null);
  }
}
