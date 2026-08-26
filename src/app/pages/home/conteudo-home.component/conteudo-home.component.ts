import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {SaidaPlataformaComponent} from '../saida-plataforma.component/saida-plataforma.component';
import {ModelosCamadasComponent} from '../modelos-camadas.component/modelos-camadas.component';
import {EvidenciasFaqComponent} from '../evidencias-faq.component/evidencias-faq.component';
import {ResultadoCarPanelComponent} from '../resultado-car-panel.component/resultado-car-panel.component';
import {MatDialog} from '@angular/material/dialog';

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
  private readonly dialog = inject(MatDialog);

  preencherExemplo(): void {
    this.identificadorUnico.set(this.identificadorExemplo);
  }

  consultarAtestado(event?: Event): void {
    this.dialog.open(ResultadoCarPanelComponent, {
      width: '650px',
      maxWidth: '90vw',
      panelClass: 'modal-car-center-overlay',
      autoFocus: false,
      data: { codCarInicial: '' }
    });
  }

  conhecerPlataforma(){

  }

  verModulo(tipo: string): void {

  }
}
