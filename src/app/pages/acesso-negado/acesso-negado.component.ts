import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-acesso-negado',
  imports: [],
  templateUrl: './acesso-negado.component.html',
  styleUrl: './acesso-negado.component.scss',
})
export class AcessoNegadoComponent {

  private router = inject(Router);

  voltar() {
    this.router.navigate(['/home']);
  }
}
