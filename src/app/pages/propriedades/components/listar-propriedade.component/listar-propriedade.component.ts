import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Propriedade } from '../../propriedade.model';

export type ModoExibicaoLista = 'GERENCIAMENTO' | 'CONTESTACAO';

@Component({
  selector: 'app-listar-propriedade',
  standalone: true,
  imports: [CommonModule, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './listar-propriedade.component.html',
  styleUrl: './listar-propriedade.component.scss'
})
export class ListarPropriedadeComponent {
  @Input() propriedades: Propriedade[] = [];
  @Input() modo: ModoExibicaoLista = 'GERENCIAMENTO';

  @Output() iniciarContestacao = new EventEmitter<Propriedade>();
  @Output() novaPropriedadeClick = new EventEmitter<void>();
  @Output() detalhesClick = new EventEmitter<Propriedade>();
  @Output() adicionarSocioClick = new EventEmitter<Propriedade>();
  @Output() verificarMultaClick = new EventEmitter<Propriedade>();

  private router = inject(Router);

  onContestar(prop: Propriedade): void {
    // Se houver listener pai registrado, emite o evento; caso contrário, realiza o roteamento padrão
    if (this.iniciarContestacao.observed) {
      this.iniciarContestacao.emit(prop);
    } else {
      this.router.navigateByUrl(`/cadastro-contestacao-propriedade/${prop.id_propriedade}`);
    }
  }

  onDetalhes(prop: Propriedade): void {
    this.detalhesClick.emit(prop);
  }

  onAdicionarSocio(propriedade: Propriedade): void {
    this.adicionarSocioClick.emit(propriedade);
  }

  onVerificarMulta(propriedade: Propriedade): void {
    this.verificarMultaClick.emit(propriedade);
  }

}
