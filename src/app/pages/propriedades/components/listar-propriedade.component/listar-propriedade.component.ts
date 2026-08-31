import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Propriedade} from '../../propriedade.model';
import {Router} from '@angular/router';


@Component({
  selector: 'app-listar-propriedade',
  standalone: true,
  imports: [CommonModule, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './listar-propriedade.component.html',
  styleUrl: './listar-propriedade.component.scss'
})
export class ListarPropriedadeComponent {
  @Input() propriedades: Propriedade[] = [];
  @Output() iniciarContestacao = new EventEmitter<Propriedade>();
  @Output() novaPropriedadeClick = new EventEmitter<void>();

  private router = inject(Router);

  onContestar(prop: Propriedade): void {
    this.router.navigateByUrl(`/cadastro-contestacao-propriedade/${prop.id_propriedade}`);
  }
}
