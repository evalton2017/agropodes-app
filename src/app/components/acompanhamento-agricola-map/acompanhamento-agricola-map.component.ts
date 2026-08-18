import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  ElementRef,
  ViewChild,
  signal,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ItemSerieTemporalRaster } from '../../pages/verificacao-agricola/verificacao-agricola.model';
import { GlebaService } from '../../service/gleba.service';

@Component({
  selector: 'app-acompanhamento-agricola-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      <div #mapContainer class="map-container"></div>

      <div class="timeline-controls" *ngIf="rasters && rasters.length > 0">
        <button class="btn-play" (click)="togglePlay()">
          {{ isPlaying() ? '⏸ Pausar' : '▶ Play Animação' }}
        </button>
        <div class="timeline-info">
          <span class="date-badge" *ngIf="rasterAtivo()">
            📅 {{ rasterAtivo()?.dataCaptura }}
          </span>
          <span class="ndvi-badge" *ngIf="rasterAtivo()">
            🌱 NDVI: {{ rasterAtivo()?.ndviMean | number:'1.2-2' }}
          </span>
        </div>
        <input
          type="range"
          [min]="0"
          [max]="rasters.length - 1"
          [value]="currentIndex()"
          (input)="onSliderChange($event)"
          class="timeline-slider"
        />
      </div>
    </div>
  `,
  styles: [`
    .map-wrapper { position: relative; width: 100%; height: 500px; border-radius: 8px; overflow: hidden; background: #050e09; border: 1px solid #1a3322; }
    .map-container { width: 100%; height: 100%; z-index: 1; }
    .timeline-controls {
      position: absolute; bottom: 12px; left: 12px; right: 12px; z-index: 1000;
      background: rgba(5, 14, 9, 0.92); padding: 10px 16px; border-radius: 6px;
      display: flex; align-items: center; gap: 12px; border: 1px solid #1a3a24;
    }
    .btn-play { background: #00ff66; color: #000; border: none; padding: 6px 14px; font-weight: bold; border-radius: 4px; cursor: pointer; }
    .timeline-info { display: flex; gap: 12px; font-size: 12px; color: #a3e635; font-family: monospace; }
    .timeline-slider { flex: 1; accent-color: #00ff66; cursor: pointer; }
  `]
})
export class AcompanhamentoAgricolaMapComponent implements OnChanges, OnDestroy {
  @Input() geometria?: string;
  @Input() rasters: ItemSerieTemporalRaster[] = [];

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private glebaService = inject(GlebaService);
  private platformId = inject(PLATFORM_ID);

  private L: any;
  private map: any;
  private geoJsonLayer: any;
  private currentImageOverlay: any;
  private timerInterval: any;

  currentIndex = signal<number>(0);
  isPlaying = signal<boolean>(false);
  rasterAtivo = signal<ItemSerieTemporalRaster | null>(null);

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    // 🟢 Executa o Leaflet somente no ambiente do navegador (Client-side)
    if (isPlatformBrowser(this.platformId)) {
      if (!this.L) {
        this.L = await import('leaflet');
      }

      if (changes['geometria'] && this.geometria) {
        this.inicializarMapa();
      }
      if (changes['rasters'] && this.rasters.length > 0) {
        this.currentIndex.set(0);
        this.carregarFrameRaster(0);
      }
    }
  }

  private inicializarMapa(): void {
    if (!this.L || !this.mapContainer) return;

    if (!this.map) {
      this.map = this.L.map(this.mapContainer.nativeElement).setView([-12.5453, -55.7211], 13);
      this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
      }).addTo(this.map);
    }

    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }

    if (this.geometria) {
      const geoJson = this.parseWKT(this.geometria);
      if (geoJson) {
        this.geoJsonLayer = this.L.geoJSON(geoJson, {
          style: { color: '#00ff66', weight: 2, fillOpacity: 0.1 }
        }).addTo(this.map);
        this.map.fitBounds(this.geoJsonLayer.getBounds());
      }
    }
  }

  togglePlay(): void {
    this.isPlaying() ? this.pausar() : this.iniciarPlayer();
  }

  private iniciarPlayer(): void {
    if (this.rasters.length === 0) return;
    this.isPlaying.set(true);
    this.timerInterval = setInterval(() => {
      let nextIndex = this.currentIndex() + 1;
      if (nextIndex >= this.rasters.length) nextIndex = 0;
      this.currentIndex.set(nextIndex);
      this.carregarFrameRaster(nextIndex);
    }, 1200);
  }

  private pausar(): void {
    this.isPlaying.set(false);
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  onSliderChange(event: Event): void {
    const idx = Number((event.target as HTMLInputElement).value);
    this.currentIndex.set(idx);
    this.carregarFrameRaster(idx);
  }

  private carregarFrameRaster(index: number): void {
    const targetRaster = this.rasters[index];
    if (!targetRaster || !this.L) return;
    this.rasterAtivo.set(targetRaster);

    // Remove qualquer overlay de imagem antigo se existir
    if (this.currentImageOverlay) {
      this.map.removeLayer(this.currentImageOverlay);
      this.currentImageOverlay = null;
    }

    // Anima a cor de preenchimento da gleba no mapa com base no valor do NDVI
    if (this.geoJsonLayer) {
      const ndvi = targetRaster.ndviMean || 0;
      const corNdvi = this.getCorEscalaNdvi(ndvi);

      this.geoJsonLayer.setStyle({
        color: '#00ff66',
        weight: 2,
        fillColor: corNdvi,
        fillOpacity: 0.65
      });
    }
  }

// Mapeia o NDVI para uma rampa de cor do desenvolvimento agrícola
  private getCorEscalaNdvi(ndvi: number): string {
    if (ndvi >= 0.55) return '#00ff66'; // Vegetação densa / Pico da Safra (Verde)
    if (ndvi >= 0.40) return '#84cc16'; // Vegetação média / Crescimento (Verde Claro)
    if (ndvi >= 0.28) return '#eab308'; // Início do Plantio / Brotação (Amarelo)
    return '#a16207';                  // Solo Exposto / Pré-Plantio (Marrom)
  }

  private aplicarFallbackNdviNaGleba(ndvi: number): void {
    if (!this.geoJsonLayer) return;

    const corNdvi = this.getCorNdvi(ndvi);

    this.geoJsonLayer.setStyle({
      color: '#00ff66',
      weight: 2,
      fillColor: corNdvi,
      fillOpacity: 0.55
    });
  }

// Escala de cores do NDVI para a animação de crescimento da cultura
  private getCorNdvi(ndvi: number): string {
    if (ndvi >= 0.6) return '#00ff66'; // Vegetação Alta / Solo Coberto (Verde Vivo)
    if (ndvi >= 0.4) return '#84cc16'; // Vegetação Média (Verde Claro)
    if (ndvi >= 0.25) return '#eab308'; // Início do Plantio / Brotação (Amarelo)
    return '#a16207'; // Solo Exposto / Pré-Plantio (Castanho/Marrom)
  }

  private parseWKT(wkt: string): any {
    try {
      const match = wkt.match(/\(\((.*?)\)\)/);
      if (!match) return null;
      const coords = match[1].split(',').map(pair => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return [lng, lat];
      });
      return {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] },
        properties: {}
      };
    } catch {
      return null;
    }
  }

  ngOnDestroy(): void {
    this.pausar();
  }
}
