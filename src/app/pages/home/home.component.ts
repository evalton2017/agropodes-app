import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MapNode {
  id: string;
  name: string;
  cx: number;
  cy: number;
}

interface DiagramLink {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface SlideItem {
  title: string;
  value: string;
  status: 'up' | 'down' | 'stable';
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedStateId = signal<string | null>(null);
  networkStatuses = signal<{ [key: string]: string }>({});

  // Controle do Slide reativo
  currentSlideIndex = signal<number>(0);
  private slideIntervalId: any;

  // Dados do pequeno slide superior (Indicadores do Agro)
  slides = signal<SlideItem[]>([
    { title: 'Saca de Soja (PR)', value: 'R$ 138,50', status: 'up', label: '+1.2% nesta semana' },
    { title: 'Previsão do Tempo', value: 'Chuva na Região Sul', status: 'stable', label: 'Favorável ao plantio' },
    { title: 'Fluxo Logístico (SP)', value: 'Alta Capacidade', status: 'up', label: 'Porto de Santos operando 100%' },
    { title: 'Milho Futuro (MT)', value: 'R$ 58,20', status: 'down', label: '-0.5% na abertura' }
  ]);

  brazilRegions = signal<MapNode[]>([
    { id: 'AM', name: 'Região Norte (Manaus)', cx: 255, cy: 180 },
    { id: 'PA', name: 'Região Norte (Belém)', cx: 450, cy: 170 },
    { id: 'CE', name: 'Região Nordeste (Fortaleza)', cx: 645, cy: 175 },
    { id: 'BA', name: 'Região Nordeste (Salvador)', cx: 610, cy: 325 },
    { id: 'MT', name: 'Centro-Oeste (Cuiabá)', cx: 380, cy: 350 },
    { id: 'DF', name: 'Centro-Oeste (Brasília)', cx: 490, cy: 360 },
    { id: 'MG', name: 'Região Sudeste (BH)', cx: 550, cy: 425 },
    { id: 'SP', name: 'Região Sudeste (São Paulo)', cx: 495, cy: 495 },
    { id: 'PR', name: 'Região Sul (Curitiba)', cx: 450, cy: 530 },
    { id: 'RS', name: 'Região Sul (Porto Alegre)', cx: 415, cy: 590 }
  ]);

  diagramLinks = computed<DiagramLink[]>(() => {
    const regions = this.brazilRegions();
    const statuses = this.networkStatuses();
    const links: DiagramLink[] = [];

    for (let i = 0; i < regions.length - 1; i++) {
      const source = regions[i];
      const target = regions[i + 1];
      if (statuses[source.id] !== 'inactive' || statuses[target.id] !== 'inactive') {
        links.push({
          id: `seq-${source.id}-${target.id}`,
          x1: source.cx, y1: source.cy,
          x2: target.cx, y2: target.cy
        });
      }
    }

    const mt = regions.find(r => r.id === 'MT');
    const df = regions.find(r => r.id === 'DF');
    const sp = regions.find(r => r.id === 'SP');

    if (mt && df && (statuses['MT'] !== 'inactive' || statuses['DF'] !== 'inactive')) {
      links.push({ id: 'extra-link-mt-df', x1: mt.cx, y1: mt.cy, x2: df.cx, y2: df.cy });
    }
    if (mt && sp && (statuses['MT'] !== 'inactive' || statuses['SP'] !== 'inactive')) {
      links.push({ id: 'extra-link-mt-sp', x1: mt.cx, y1: mt.cy, x2: sp.cx, y2: sp.cy });
    }

    return links;
  });

  currentStateInfo = computed(() => {
    const id = this.selectedStateId();
    if (!id) return null;
    return {
      ...this.brazilRegions().find(r => r.id === id),
      status: this.networkStatuses()[id]
    };
  });

  ngOnInit() {
    this.initializeNetwork();
    this.simulateLiveNetworkTraffic();
    this.startSlideRotation();
  }

  private initializeNetwork() {
    const initialStatuses: { [key: string]: string } = {};
    this.brazilRegions().forEach(region => {
      initialStatuses[region.id] = 'active';
    });
    this.networkStatuses.set(initialStatuses);
  }

  private simulateLiveNetworkTraffic() {
    setInterval(() => {
      this.networkStatuses.update(current => {
        const updated = { ...current };
        const regions = this.brazilRegions();
        const randomRegion = regions[Math.floor(Math.random() * regions.length)].id;
        const states = ['inactive', 'active', 'alert'];
        updated[randomRegion] = states[Math.floor(Math.random() * states.length)];
        return updated;
      });
    }, 2000);
  }

  // Rotatividade automática do pequeno slide
  private startSlideRotation() {
    this.slideIntervalId = setInterval(() => {
      this.currentSlideIndex.update(index => (index + 1) % this.slides().length);
    }, 4000); // Muda de slide a cada 4 segundos
  }

  setSlide(index: number) {
    this.currentSlideIndex.set(index);
  }

  selectState(id: string) {
    this.selectedStateId.set(id);
  }

  ngOnDestroy() {
    if (this.slideIntervalId) {
      clearInterval(this.slideIntervalId);
    }
  }
}
