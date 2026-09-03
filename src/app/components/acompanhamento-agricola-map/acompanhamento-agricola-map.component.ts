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
      center: [-47.6796, -20.1652], // Coordenadas aproximadas de Buritizal - SP
      zoom: 17.2,
      pitch: 62, // Perspectiva isométrica em 3D
      bearing: -20,
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
      if (this.rasters && this.rasters.length > 0) {
        this.carregarFrameRaster(0);
      }
    });
  }

  private desenharGeometriaGleba(): void {
    if (!this.map || !this.geometria) return;

    const geojson = this.parseWKTToGeoJSON(this.geometria);
    if (!geojson) return;

    if (this.map.getLayer('gleba-line-layer')) this.map.removeLayer('gleba-line-layer');
    if (this.map.getSource('gleba-source')) this.map.removeSource('gleba-source');

    this.map.addSource('gleba-source', {
      type: 'geojson',
      data: geojson
    });

    // Borda Neon para contorno da gleba
    this.map.addLayer({
      id: 'gleba-line-layer',
      type: 'line',
      source: 'gleba-source',
      paint: {
        'line-color': '#a855f7',
        'line-width': 2.5
      }
    });

    const coords = geojson.geometry.coordinates[0];
    if (coords && coords.length > 0) {
      const centro = this.calcularCentroide(coords);
      this.map.flyTo({
        center: centro,
        zoom: 17.5,
        pitch: 62,
        bearing: -20,
        duration: 1200
      });
    }

    // Gerar e desenhar a grade de Voxels 3D inicial
    this.gerarERenderizarGridVoxels3D();
  }

  /**
   * 🟢 GERA A MALHA DE VOXELS 3D COM BASE NO WKT E ATUALIZA ALTURA/COR SEGUNDO O NDVI ATUAL
   */
  private gerarERenderizarGridVoxels3D(): void {
    if (!this.map || !this.geometria) return;

    const geojson = this.parseWKTToGeoJSON(this.geometria);
    if (!geojson || !geojson.geometry || !geojson.geometry.coordinates) return;

    const coords = geojson.geometry.coordinates[0];
    const lngs = coords.map((c: number[]) => c[0]);
    const lats = coords.map((c: number[]) => c[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Resolução da grade (Ex: matriz 10x10 sobre o talhão)
    const Passos = 10;
    const stepX = (maxLng - minLng) / Passos;
    const stepY = (maxLat - minLat) / Passos;
    const cellRadius = Math.min(stepX, stepY) * 0.45;

    // Obtém o NDVI médio do frame selecionado na linha do tempo
    const raster = this.rasterAtivo();
    const ndviBase = raster ? raster.ndviMean : 0.30;

    const features: any[] = [];

    for (let i = 0; i < Passos; i++) {
      for (let j = 0; j < Passos; j++) {
        const lng = minLng + (i * stepX) + (stepX / 2);
        const lat = minLat + (j * stepY) + (stepY / 2);

        // Verifica se o ponto está dentro do polígono WKT da gleba
        if (this.pontoEstaNoPoligono([lng, lat], coords)) {
          // Variação micro-local para dar relevo e simular manchas de saúde no talhão
          const variacaoLocal = (Math.sin(i * 1.5) * 0.08) + (Math.cos(j * 1.5) * 0.06);
          const ndviVoxel = Math.min(0.95, Math.max(0.05, ndviBase + variacaoLocal));

          const corHex = this.getCorEscalaNdvi(ndviVoxel);

          // Altura do bloco extrudado em metros (0.12 NDVI -> ~5m | 0.56 NDVI -> ~45m)
          const alturaMetros = Math.max(4, ndviVoxel * 80);

          // Polígono quadrado (cubo 3D)
          const polyCoords = [
            [lng - cellRadius, lat - cellRadius],
            [lng + cellRadius, lat - cellRadius],
            [lng + cellRadius, lat + cellRadius],
            [lng - cellRadius, lat + cellRadius],
            [lng - cellRadius, lat - cellRadius]
          ];

          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [polyCoords]
            },
            properties: {
              cor_hex: corHex,
              altura: alturaMetros,
              ndvi_val: ndviVoxel
            }
          });
        }
      }
    }

    this.pontosRenderizados.set(features.length);

    // Atualização da fonte GeoJSON no MapLibre
    if (this.map.getSource('grid-voxels-source')) {
      (this.map.getSource('grid-voxels-source') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features
      });
    } else {
      this.map.addSource('grid-voxels-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      });

      // Camada de Extrusão Tridimensional NATIVA (fill-extrusion)
      this.map.addLayer({
        id: 'grid-voxels-3d-layer',
        type: 'fill-extrusion',
        source: 'grid-voxels-source',
        paint: {
          'fill-extrusion-color': ['get', 'cor_hex'],
          'fill-extrusion-height': ['get', 'altura'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.90
        }
      });
    }
  }

  public carregarFrameRaster(index: number): void {
    const targetRaster = this.rasters[index];
    if (!targetRaster || !this.map) return;

    this.rasterAtivo.set(targetRaster);

    // Re-renderiza o mosaico 3D recalculando a cor e a altura para a nova data selecionada
    if (this.isMapLoaded) {
      this.gerarERenderizarGridVoxels3D();
    }
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
    }, 1000);
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

  public resetarVisao3D(): void {
    if (!this.map) return;
    this.map.easeTo({ pitch: 62, bearing: -20, duration: 800 });
  }

  private getCorEscalaNdvi(ndvi: number): string {
    if (ndvi >= 0.55) return '#00ff66'; // Verde Densa
    if (ndvi >= 0.40) return '#84cc16'; // Verde Média
    if (ndvi >= 0.28) return '#eab308'; // Amarelo Brotação
    return '#a16207'; // Castanho / Solo Exposto
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

  private pontoEstaNoPoligono(point: [number, number], vs: number[][]): boolean {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
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
