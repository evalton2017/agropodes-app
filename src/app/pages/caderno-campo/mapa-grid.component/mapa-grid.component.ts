import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  signal,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import * as maplibregl from 'maplibre-gl';
import {MonitoramentoService} from '../../../service/monitoramento.service';


@Component({
  selector: 'app-mapa-grid-3d',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './mapa-grid.component.html',
  styleUrls: ['./mapa-grid.component.scss']
})
export class MapaGrid3dComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() idContrato!: number;
  @Input() set glebaId(val: number) { if (val) this.idContrato = val; }
  @Input() set idGleba(val: number) { if (val) this.idContrato = val; }

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  private readonly monitoramentoService = inject(MonitoramentoService);
  private readonly destroyRef = inject(DestroyRef);

  private map!: maplibregl.Map;
  public camadaAtiva = signal<'saude_plantas' | 'nitrogenio' | 'materia_organica'>('saude_plantas');
  public carregandoGrid = signal<boolean>(false);
  public pontosRenderizados = signal<number>(0);
  public dadosGrid3D = signal<any | null>(null);

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.inicializarMapa3D();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['idContrato'] || changes['glebaId'] || changes['idGleba']) && this.idContrato) {
      if (this.map && this.map.isStyleLoaded()) {
        this.carregarDadosGrid();
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
            attribution: '&copy; Esri'
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
      center: [-47.033962, -14.225032],
      zoom: 15.5,
      pitch: 55, // 🟢 Inclinação 3D da Câmera
      bearing: -25, // 🟢 Rotação de Perspectiva 3D
      maxPitch: 85
    });

    this.map.addControl(new maplibregl.NavigationControl({
      showCompass: true,
      visualizePitch: true
    }), 'top-right');

    this.map.on('load', () => {
      if (this.idContrato) {
        this.carregarDadosGrid();
      }
    });
  }

  public carregarDadosGrid(): void {
    if (!this.idContrato) return;

    this.carregandoGrid.set(true);

    this.monitoramentoService.obterGrid3D(this.idContrato)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dadosGrid3D.set(res);
          this.renderizarCamadaGrid3D();
          this.carregandoGrid.set(false);
        },
        error: (err) => {
          console.error('Erro ao buscar Grid 3D na API:', err);
          this.carregandoGrid.set(false);
        }
      });
  }

  public alterarCamada(camada: 'saude_plantas' | 'nitrogenio' | 'materia_organica'): void {
    this.camadaAtiva.set(camada);
    if (this.dadosGrid3D()) {
      this.renderizarCamadaGrid3D();
    }
  }

  private extrairGeoJSONValido(dados: any): any {
    if (!dados) return null;

    // Captura o array exato fornecido pelo backend
    const listaElementos = dados.grid_propriedades || dados.pontos_grid || dados.grid;

    if (!Array.isArray(listaElementos) || listaElementos.length === 0) {
      console.warn('Array grid_propriedades não localizado na resposta:', dados);
      return null;
    }

    // Mapeia cada ponto extraindo coordenadas e as cores HEX aninhadas
    const features = listaElementos.map((item: any) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(item.lng), Number(item.lat)]
        },
        properties: {
          // Extrai as cores HEX aninhadas conforme a camada ativa
          saude_plantas_hex: item.saude_plantas?.hex || '#10b981',
          nitrogenio_hex: item.nitrogenio?.hex || '#abdda4',
          materia_organica_hex: item.materia_organica?.hex || '#d8b365',

          // Preserva valores numéricos para possíveis tooltips no mapa
          valor_ndvi: item.saude_plantas?.valor_ndvi,
          valor_n: item.nitrogenio?.valor_kg_ha,
          valor_mo: item.materia_organica?.valor_porcentagem
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features: features
    };
  }

  /**
   * Renderiza os 4.038 pontos no MapLibre 3D aplicando a cor aninhada correspondente
   */
  private renderizarCamadaGrid3D(): void {
    const dados = this.dadosGrid3D();
    if (!dados || !this.map) return;

    // Converte os dados estruturados do backend para GeoJSON FeatureCollection
    const geojson = this.extrairGeoJSONValido(dados);

    if (!geojson || !geojson.features || geojson.features.length === 0) {
      this.pontosRenderizados.set(0);
      return;
    }

    // Atualiza o contador no badge
    this.pontosRenderizados.set(geojson.features.length);

    // Ajusta o foco da câmera do mapa para o centroide da área
    const primeiraFeature = geojson.features[0];
    if (primeiraFeature?.geometry?.coordinates) {
      const coords = primeiraFeature.geometry.coordinates;
      this.map.flyTo({
        center: [coords[0], coords[1]],
        zoom: 15.8,
        pitch: 55, // 🟢 Inclinação Tridimensional
        bearing: -20, // 🟢 Perspectiva da Câmera
        duration: 1200
      });
    }

    const aplicarRenderizacao = () => {
      // Limpa camadas pré-existentes
      if (this.map.getLayer('grid-3d-circles')) this.map.removeLayer('grid-3d-circles');
      if (this.map.getSource('grid-3d-source')) this.map.removeSource('grid-3d-source');

      this.map.addSource('grid-3d-source', {
        type: 'geojson',
        data: geojson
      });

      const camadaAtiva = this.camadaAtiva(); // 'saude_plantas', 'nitrogenio' ou 'materia_organica'
      const chaveHex = `${camadaAtiva}_hex`;

      // Aplica a camada de círculos coloridos dinâmicos no mapa 3D
      this.map.addLayer({
        id: 'grid-3d-circles',
        type: 'circle',
        source: 'grid-3d-source',
        paint: {
          'circle-radius': 4.5,
          'circle-color': ['get', chaveHex], // 🟢 Busca diretamente a chave mapeada
          'circle-opacity': 0.85,
          'circle-stroke-width': 0.3,
          'circle-stroke-color': '#ffffff'
        }
      });
    };

    if (this.map.isStyleLoaded()) {
      aplicarRenderizacao();
    } else {
      this.map.once('styledata', () => aplicarRenderizacao());
    }
  }

  public resetarVisao3D(): void {
    if (!this.map) return;
    this.map.easeTo({ pitch: 55, bearing: -25, duration: 800 });
  }
}
