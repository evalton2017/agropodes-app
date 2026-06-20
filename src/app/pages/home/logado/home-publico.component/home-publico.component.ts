import {Component, signal, inject, effect, OnInit} from '@angular/core'; // Adicionado effect
import { CommonModule, Location } from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import Keycloak from 'keycloak-js';
import {MatDialog} from '@angular/material/dialog';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {ContatoModalComponent} from '../../../../components/modal/email/contato-modal.component';

interface CarouselItem {
  url: string;
  alt: string;
}

@Component({
  selector: 'home-publico',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatCardModule, MatIconModule, MatMenu, MatMenuTrigger],
  templateUrl: './home-publico.component.html',
  styleUrls: ['./home-publico.component.scss']
})
export class HomePublicoComponent  {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly keycloak = inject(Keycloak);
  private dialog = inject(MatDialog);

  carouselImages = signal<CarouselItem[]>([
    { url: 'images/consulta-prode.jpg', alt: 'Conslulta por satélite' },
    { url: 'images/regeneracao.png', alt: 'Maquinário agrícola moderno' },
    { url: 'images/plantacao-soja.png', alt: 'Plantação de soja com tecnologia' },
  ]);

  public passosPRODES = signal([
    { id: 1, titulo: 'Carga do CAR', descricao: 'Leitura geométrica dos polígonos declarados.', status: 'concluido' },
    { id: 2, titulo: 'Filtro de Nuvem', descricao: 'Tratamento de imagens de satélite do INPE.', status: 'processando' },
    { id: 3, titulo: 'Cruzamento Espacial', descricao: 'Análise de alertas de desmatamento PRODES.', status: 'pendente' },
    { id: 4, titulo: 'Geração de Laudo', descricao: 'Consolidação de históricos e mapas finais.', status: 'pendente' }
  ]);

  currentIndex = signal<number>(0);

  constructor() {
    // Cria um efeito que roda quando o componente inicia e limpa o timer quando o componente é destruído
    effect((onCleanup) => {
      const timer = setInterval(() => {
        this.nextSlide();
      }, 4000); // Muda a foto a cada 4 segundos (4000ms)

      // Evita vazamento de memória (memory leak) limpando o intervalo se o usuário sair da página
      onCleanup(() => clearInterval(timer));
    });
  }

  resolveImageUrl(url: string): string {
    return this.location.prepareExternalUrl(url);
  }

  nextSlide(): void {
    this.currentIndex.update(index =>
      index === this.carouselImages().length - 1 ? 0 : index + 1
    );
  }

  prevSlide(): void {
    this.currentIndex.update(index =>
      index === 0 ? this.carouselImages().length - 1 : index - 1
    );
  }

  fazerLogin(): void {
    this.router.navigate(['consulta-car']);
  }

  cadastrarUsuario(){
    this.router.navigate(['cadastrar-usuario']);
  }


  isAutenticado(): boolean {
    if(this.keycloak.authenticated) {
      return true;
    }
    return false;
  }

  abrirModalContato() {
    this.dialog.open(ContatoModalComponent, {
      width: '450px',
      disableClose: true
    });
  }

}
