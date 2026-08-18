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
  AfterViewInit,
  PLATFORM_ID,
  DestroyRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ItemSerieTemporalRaster } from '../../pages/verificacao-agricola/verificacao-agricola.model';
import { GlebaService } from '../../service/gleba.service';
import { MonitoramentoService } from '../../service/monitoramento.service';
import * as maplibregl from 'maplibre-gl';

export interface LegendaNdviItem {
  rotulo: string;
  intervalo: string;
  corHex: string;
}

@Component({
  selector: 'app-acompanhamento-agricola-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acompanhamento-agricola-map.component.html',
  styleUrls: ['./acompanhamento-agricola-map.component.scss']
})
export class AcompanhamentoAgricolaMapComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() idGleba?: number;
  @Input() geometria?: string;
  @Input() rasters: ItemSerieTemporalRaster[] = [];

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private readonly glebaService = inject(GlebaService);
  private readonly monitoramentoService = inject(MonitoramentoService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private map!: maplibregl.Map;
  private isMapLoaded = false;
  private timerInterval: any;

  public currentIndex = signal<number>(0);
  public isPlaying = signal<boolean>(false);
  public rasterAtivo = signal<ItemSerieTemporalRaster | null>(null);
  public pontosRenderizados = signal<number>(0);
  public dadosGrid3D = signal<any | null>(null);

  // Legenda oficial de Saúde Vegetal (NDVI)
  public readonly legendaNdvi: LegendaNdviItem[] = [
    { rotulo: 'Vegetação Densa / Lavoura', intervalo: '> 0.55', corHex: '#00ff66' },
    { rotulo: 'Vegetação Média / Crescimento', intervalo: '0.40 - 0.55', corHex: '#84cc16' },
    { rotulo: 'Início do Plantio / Brotação', intervalo: '0.28 - 0.39', corHex: '#eab308' },
    { rotulo: 'Solo Exposto / Pré-Plantio', intervalo: '< 0.28', corHex: '#a16207' }
  ];

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.inicializarMapa3D();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (isPlatformBrowser(this.platformId) && this.isMapLoaded) {
      if (changes['geometria'] && this.geometria) {
        this.desenharGeometriaGleba();
      }
      if (changes['idGleba'] && this.idGleba) {
        this.carregarGrid3D();
      }
      if (changes['rasters'] && this.rasters.length > 0) {
        this.currentIndex.set(0);
        this.carregarFrameRaster(0);
      }
    }
  }

  private inicializarMapa3D(): void {
    if (!this.mapContainer) return;

    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: {
        version: 8,
        sources: {
          'esri-imagery': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '&copy; Esri | Sentinel-2'
          }
        },
        layers: [
          {
            id: 'esri-imagery-layer',
            type: 'raster',
            source: 'esri-imagery',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [-47.073755, -20.876035],
      zoom: 15.5,
      pitch: 58, // 🟢 Perspectiva 3D Inclina a Câmera
      bearing: -20, // 🟢 Rotação de Ângulo Tridimensional
      maxPitch: 85
    });

    this.map.addControl(new maplibregl.NavigationControl({
      showCompass: true,
      visualizePitch: true
    }), 'top-right');

    this.map.on('load', () => {
      this.isMapLoaded = true;
      if (this.geometria) {
        this.desenharGeometriaGleba();
      }
      if (this.idGleba) {
        this.carregarGrid3D();
      }
      if (this.rasters && this.rasters.length > 0) {
        this.carregarFrameRaster(0);
      }
    });
  }

  public carregarGrid3D(): void {
    if (!this.idGleba) return;

    this.monitoramentoService.obterGrid3D(this.idGleba)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dadosGrid3D.set(res);
          this.renderizarGridPontos3D();
        },
        error: (err) => {
          console.warn('Grid 3D não retornado para a gleba, mantendo visualização por polígono:', err);
        }
      });
  }

  private desenharGeometriaGleba(): void {
    if (!this.map || !this.geometria) return;

    const geojson = this.parseWKTToGeoJSON(this.geometria);
    if (!geojson) return;

    if (this.map.getLayer('gleba-polygon-layer')) this.map.removeLayer('gleba-polygon-layer');
    if (this.map.getLayer('gleba-line-layer')) this.map.removeLayer('gleba-line-layer');
    if (this.map.getSource('gleba-source')) this.map.removeSource('gleba-source');

    this.map.addSource('gleba-source', {
      type: 'geojson',
      data: geojson
    });

    // Camada de Preenchimento Translúcido
    this.map.addLayer({
      id: 'gleba-polygon-layer',
      type: 'fill',
      source: 'gleba-source',
      paint: {
        'fill-color': '#00ff66',
        'fill-opacity': 0.35
      }
    });

    // Camada de Borda Verde Neon
    this.map.addLayer({
      id: 'gleba-line-layer',
      type: 'line',
      source: 'gleba-source',
      paint: {
        'line-color': '#00ff66',
        'line-width': 2.5
      }
    });

    // Voa com câmera 3D até o centroide do polígono
    const coords = geojson.geometry.coordinates[0];
    if (coords && coords.length > 0) {
      const centro = this.calcularCentroide(coords);
      this.map.flyTo({
        center: centro,
        zoom: 16,
        pitch: 58,
        bearing: -20,
        duration: 1200
      });
    }
  }

  private renderizarGridPontos3D(): void {
    const dados = this.dadosGrid3D();
    if (!dados || !this.map) return;

    const listaElementos = dados.grid_propriedades || dados.pontos_grid || dados.grid;
    if (!Array.isArray(listaElementos) || listaElementos.length === 0) return;

    const features = listaElementos.map((item: any) => ({
      type: 'Feature' as const, // 🟢 Força o tipo literal 'Feature'
      geometry: {
        type: 'Point' as const, // 🟢 Força o tipo literal 'Point'
        coordinates: [Number(item.lng || item.longitude), Number(item.lat || item.latitude)]
      },
      properties: {
        cor_hex: item.saude_plantas?.hex || item.hex || '#00ff66',
        ndvi_val: item.saude_plantas?.valor_ndvi || item.ndvi || 0.8
      }
    }));

    const geojson = {
      type: 'FeatureCollection' as const, // 🟢 Força o tipo literal 'FeatureCollection'
      features
    };

    this.pontosRenderizados.set(features.length);

    if (this.map.getLayer('grid-3d-circles')) this.map.removeLayer('grid-3d-circles');
    if (this.map.getSource('grid-3d-source')) this.map.removeSource('grid-3d-source');

    this.map.addSource('grid-3d-source', {
      type: 'geojson',
      data: geojson
    });

    this.map.addLayer({
      id: 'grid-3d-circles',
      type: 'circle',
      source: 'grid-3d-source',
      paint: {
        'circle-radius': 4.5,
        'circle-color': ['get', 'cor_hex'],
        'circle-opacity': 0.88,
        'circle-stroke-width': 0.4,
        'circle-stroke-color': '#ffffff'
      }
    });
  }

  public togglePlay(): void {
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

  public onSliderChange(event: Event): void {
    const idx = Number((event.target as HTMLInputElement).value);
    this.currentIndex.set(idx);
    this.carregarFrameRaster(idx);
  }

  private carregarFrameRaster(index: number): void {
    const targetRaster = this.rasters[index];
    if (!targetRaster || !this.map) return;
    this.rasterAtivo.set(targetRaster);

    const ndvi = targetRaster.ndviMean || 0;
    const corNdvi = this.getCorEscalaNdvi(ndvi);

    // Atualiza dinamicamente a cor da gleba no tempo
    if (this.map.getLayer('gleba-polygon-layer')) {
      this.map.setPaintProperty('gleba-polygon-layer', 'fill-color', corNdvi);
      this.map.setPaintProperty('gleba-polygon-layer', 'fill-opacity', 0.65);
    }
  }

  public resetarVisao3D(): void {
    if (!this.map) return;
    this.map.easeTo({ pitch: 58, bearing: -20, duration: 800 });
  }

  private getCorEscalaNdvi(ndvi: number): string {
    if (ndvi >= 0.55) return '#00ff66';
    if (ndvi >= 0.40) return '#84cc16';
    if (ndvi >= 0.28) return '#eab308';
    return '#a16207';
  }

  private parseWKTToGeoJSON(wkt: string): any {
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

  private calcularCentroide(coords: number[][]): [number, number] {
    let sumLng = 0, sumLat = 0;
    coords.forEach(c => {
      sumLng += c[0];
      sumLat += c[1];
    });
    return [sumLng / coords.length, sumLat / coords.length];
  }

  ngOnDestroy(): void {
    this.pausar();
    if (this.map) {
      this.map.remove();
    }
  }
}
