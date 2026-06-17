import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';

import { Map } from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { PolygonLayer } from '@deck.gl/layers';

import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';

import {GlebeApiResponse} from '../../../dto/response/gleba.response';
import {PessoaService} from '../../../service/pessoa.service';
import {GlebaService} from '../../../service/gleba.service';

type GlebeItem = GlebeApiResponse & { coordenadas: [number, number][] };

@Component({
  selector: 'app-map-3d-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './map-3d-viewer.component.html',
  styleUrls: ['./map-3d-viewer.component.scss']
})
export class Map3DViewerComponent implements OnInit {
  @ViewChild('mapCanvas') mapCanvasElement!: ElementRef;
  private readonly glebeService = inject(GlebaService);
  private readonly pessoaService = inject(PessoaService);

  private maplibreInstance?: any;
  private deckOverlayInstance?: any; // Instância de controle unificado MapboxOverlay

  readonly isMapLoaded = signal<boolean>(false);
  readonly produtor = this.pessoaService.produtorAtual;

  readonly glebesList = signal<GlebeItem[]>([]);
  readonly selectedGlebe = signal<GlebeItem | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly carCode = computed(() => this.selectedGlebe()?.codigo_car ?? 'Não informado');
  readonly totalArea = computed(() => `${this.selectedGlebe()?.area_hectares ?? 0} ha`);
  readonly declaredCrop = computed(() => this.selectedGlebe()?.cultura_declarada ?? 'Não informada');

  readonly dataPlantioTratada = computed(() => {
    const dataRaw = this.selectedGlebe()?.data_estimada_plantio;
    if (!dataRaw) return null;

    if (dataRaw.includes('/')) {
      const [dia, mes, ano] = dataRaw.split('/');
      return `${ano}-${mes}-${dia}`;
    }

    return dataRaw;
  });

  constructor() {
    afterNextRender(async () => {
      await this.inicializarMotores3D();
    });

    effect(async () => {
      const glebaAtiva = this.selectedGlebe();
      const mapaPronto = this.isMapLoaded();

      if (mapaPronto && glebaAtiva && glebaAtiva.coordenadas && glebaAtiva.coordenadas.length > 0) {
        await this.atualizarCamadasMapa(glebaAtiva.coordenadas);
      }
    });
  }

  ngOnInit(): void {
    if (this.produtor()?.id) {
      this.loadGlebasByProdutor(this.produtor()!!.id);
    }
  }

  selecionarGleba(gleba: GlebeItem): void {
    this.selectedGlebe.set(gleba);
  }

  private loadGlebasByProdutor(idProdutor: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.glebeService.getGlebasByProdutorId(idProdutor).subscribe({
      next: (data: GlebeItem[]) => {
        this.isLoading.set(false);
        if (data && data.length > 0) {
          this.glebesList.set(data);
          this.selectedGlebe.set(data[0]);
        } else {
          this.glebesList.set([]);
          this.selectedGlebe.set(null);
        }
      },
      error: (err) => {
        this.errorMessage.set('Falha ao carregar as áreas de produção do produtor.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  private async inicializarMotores3D(): Promise<void> {
    const container = this.mapCanvasElement?.nativeElement;
    if (!container) return;

    try {


      // 1. Inicializa o mapa base raster padrão
      this.maplibreInstance = new Map({
        container: container,
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap'
            }
          },
          layers: [{
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 19
          }]
        },
        center: [-44.41621, -9.96840],
        zoom: 13,
        pitch: 45,
        interactive: true
      });

      // 2. Cria o controle unificado oficial do Deck.gl compatível com v9
      this.deckOverlayInstance = new MapboxOverlay({
        interleaved: true, // Habilita desenho nativo integrado ao ciclo MapLibre
        layers: []
      });

      // 3. Adiciona o controle unificado como plugin nativo do mapa
      this.maplibreInstance.addControl(this.deckOverlayInstance);

      this.maplibreInstance.on('load', () => {
        this.maplibreInstance?.resize();
        this.isMapLoaded.set(true);
      });

    } catch (error) {
      console.error('Erro ao instanciar os motores gráficos no navegador:', error);
    }
  }

  private async atualizarCamadasMapa(coordenadas: any[]): Promise<void> {
    if (!this.maplibreInstance || !this.deckOverlayInstance || !coordenadas || coordenadas.length === 0) return;

    let pontoValido: [number, number] | null = null;

    try {
      if (Array.isArray(coordenadas[0]) && typeof coordenadas[0][0] === 'number') {
        pontoValido = [coordenadas[0][0], coordenadas[0][1]];
      } else if (typeof coordenadas[0] === 'number' && typeof coordenadas[1] === 'number') {
        pontoValido = [coordenadas[0], coordenadas[1]];
      } else if (Array.isArray(coordenadas[0])) {
        const subArray = coordenadas[0];
        if (Array.isArray(subArray[0])) {
          pontoValido = [subArray[0][0], subArray[0][1]];
        }
      }
    } catch (e) {
      console.error('Erro ao varrer estrutura de coordenadas:', e);
    }

    // Validação corrigida acessando explicitamente os índices 0 e 1 da tupla
    if (!pontoValido || isNaN(pontoValido[0]) || isNaN(pontoValido[1])) {
      console.warn('Geometria inválida ou não numérica:', coordenadas);
      return;
    }

    // Movimenta a câmera com foco na fazenda selecionada
    this.maplibreInstance.flyTo({
      center: pontoValido,
      zoom: 14,
      pitch: 50,
      essential: true
    });

    const camadaGleba3D = new PolygonLayer({
      id: 'camada-vmg-gleba-3d',
      data: [{ polygon: coordenadas }],
      getPolygon: (d: any) => d.polygon,
      extruded: true,
      getElevation: 120,
      getFillColor: () => [63, 81, 181, 140],
      getLineColor: () => [255, 255, 255, 255],
      getLineWidth: 3,
      lineWidthMinPixels: 1,
      updateTriggers: {
        getPolygon: [coordenadas]
      }
    });

    this.deckOverlayInstance.setProps({
      layers: [camadaGleba3D]
    });
  }
}
