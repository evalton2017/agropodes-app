import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {SaidaPlataformaComponent} from '../saida-plataforma.component/saida-plataforma.component';
import {ModelosCamadasComponent} from '../modelos-camadas.component/modelos-camadas.component';
import {EvidenciasFaqComponent} from '../evidencias-faq.component/evidencias-faq.component';

@Component({
  selector: 'app-conteudo-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, SaidaPlataformaComponent, ModelosCamadasComponent, EvidenciasFaqComponent],
  templateUrl: './conteudo-home.component.html',
  styleUrls: ['./conteudo-home.component.scss']
})
export class ConteudoHomeComponent {
  identificadorUnico = signal('');
  identificadorExemplo = 'AGP-2026-SOJ-0007391';

  preencherExemplo(): void {
    this.identificadorUnico.set(this.identificadorExemplo);
  }

  consultarAtestado(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const codigo = this.identificadorUnico().trim();
    if (codigo) {
      alert(`Consultando atestado com o Identificador Único: ${codigo}`);
    } else {
      alert('Por favor, informe o Identificador Único.');
    }
  }

  conhecerPlataforma(){

  }

  verModulo(tipo: string): void {

  }
}
