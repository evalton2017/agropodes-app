import { Component, signal, inject, effect } from '@angular/core'; // Adicionado effect
import { CommonModule, Location } from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {routes} from '../../app.routes';

interface CarouselItem {
  url: string;
  alt: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private location = inject(Location);
  private router = inject(Router);

  carouselImages = signal<CarouselItem[]>([
    { url: 'images/regeneracao.png', alt: 'Maquinário agrícola moderno' },
    { url: 'images/plantacao-soja.png', alt: 'Plantação de soja com tecnologia' },
    { url: 'images/safra-satelite.png', alt: 'Monitoramento de safra por satélite' },
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
}
