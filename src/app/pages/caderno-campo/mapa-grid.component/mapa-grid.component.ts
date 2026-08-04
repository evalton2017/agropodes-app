import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
  signal,
  effect,
  ElementRef,
  ViewChild,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import {MonitoramentoService} from '../../../service/monitoramento.service';

@Component({
  selector: 'app-mapa-grid-3d',
  standalone: true, // 🟢 GARANTE QUE É STANDALONE (Resolve o NG2012)
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule
  ],
  // 🟢 USAR 'template' EM VEZ DE 'templateUrl' (Resolve o NG2008)
  template: `
    <div class="mapa-grid-card">
      <div class="mapa-header">
        <div>
          <h3 class="mapa-titulo">Mapa Interativo 3D - Propriedades do Solo</h3>
          <span class="mapa-sub">CRS EPSG:4326 | Portaria MAPA 3.7</span>
        </div>

        <mat-button-toggle-group
          [ngModel]="camadaAtiva()"
          (ngModelChange)="camadaAtiva.set($event)"
          aria-label="Camada do Solo"
        >
          <mat-button-toggle value="saude_plantas">Saúde (NDVI)</mat-button-toggle>
          <mat-button-toggle value="nitrogenio">Nitrogênio (N)</mat-button-toggle>
          <mat-button-toggle value="materia_organica">M.O.</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div class="canvas-3d-container">
        @if (carregando()) {
          <div class="loading-grid">
            <mat-spinner diameter="32"></mat-spinner>
            <span>Carregando malha espacial EPSG:4326...</span>
          </div>
        }

        <div #mapaElement class="mapa-leaflet-viewport" [class.hidden]="carregando()"></div>

        <div class="overlay-info">
          <mat-icon>layers</mat-icon>
          <span>Pontos Renderizados: <strong>{{ dadosGrid()?.total_pontos_grid || 0 }}</strong></span>
          <span class="divider">|</span>
          <span>Camada: <strong class="uppercase">{{ camadaAtiva() }}</strong></span>
        </div>

        <div class="legenda-hex">
          <span class="legenda-item"><i class="cor-verde"></i> Alto</span>
          <span class="legenda-item"><i class="cor-amarelo"></i> Médio</span>
          <span class="legenda-item"><i class="cor-vermelho"></i> Baixo</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./mapa-grid.component.scss']
})
export class MapaGrid3dComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) idContrato!: number;
  @ViewChild('mapaElement') mapaElement!: ElementRef<HTMLDivElement>;

  private readonly monitoramentoService = inject(MonitoramentoService);
  private readonly platformId = inject(PLATFORM_ID);

  public dadosGrid = signal<any | null>(null);
  public camadaAtiva = signal<'saude_plantas' | 'nitrogenio' | 'materia_organica'>('saude_plantas');
  public carregando = signal<boolean>(false);

  private map?: any;
  private gridLayerGroup?: any;
  private geojsonLayer?: any;
  private L?: any;

  constructor() {
    effect(() => {
      const dados = this.dadosGrid();
      const camada = this.camadaAtiva();
      if (dados && this.map && this.L) {
        this.renderizarMalhaEspacial(dados, camada);
      }
    });
  }

  ngOnInit(): void {
    if (this.idContrato) {
      this.carregarGrid(this.idContrato);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      const leafletModule = await import('leaflet');
      this.L = leafletModule.default || leafletModule;

      this.inicializarMapa();
    }
  }
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa(): void {
    if (!this.mapaElement?.nativeElement || !this.L?.map) return;
    this.map = this.L.map(this.mapaElement.nativeElement, {
      center: [-14.235, -51.925],
      zoom: 4,
      zoomControl: true
    });

    this.L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
      }
    ).addTo(this.map);

    this.gridLayerGroup = this.L.layerGroup().addTo(this.map);

    if (this.dadosGrid()) {
      this.renderizarMalhaEspacial(this.dadosGrid()!, this.camadaAtiva());
    }
  }

  private carregarGrid(id: number): void {
    this.carregando.set(true);
    this.monitoramentoService.obterGrid3D(id)
      .subscribe({
        next: (res) => {
          this.dadosGrid.set(res);
          this.carregando.set(false);
          setTimeout(() => {
            if (this.map && this.L) {
              this.map.invalidateSize();
              this.renderizarMalhaEspacial(res, this.camadaAtiva());
            }
          }, 100);
        },
        error: (err) => {
          console.error('Erro ao buscar Grid 3D:', err);
          this.carregando.set(false);
        }
      });
  }

  private renderizarMalhaEspacial(dados: any, camada: 'saude_plantas' | 'nitrogenio' | 'materia_organica'): void {
    if (!this.map || !this.L || !this.gridLayerGroup) return;

    // Limpa camadas anteriores
    this.gridLayerGroup.clearLayers();
    if (this.geojsonLayer) {
      this.map.removeLayer(this.geojsonLayer);
    }

    // 1. Renderiza o Polígono do Talhão com fundo transparente
    if (dados.geometria_delimitada) {
      this.geojsonLayer = this.L.geoJSON(dados.geometria_delimitada, {
        style: {
          color: '#38bdf8',
          weight: 3,
          fillColor: 'transparent',
          fillOpacity: 0
        }
      }).addTo(this.map);

      const bounds = this.geojsonLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [20, 20] });
      }
    }

    // 2. Renderiza os Pontos da Malha Espacial (HEX)
    const pontos = dados.grid_propriedades || [];
    pontos.forEach((ponto: any) => {
      const prop = ponto[camada];
      if (!ponto.lat || !ponto.lng || !prop) return;

      const corHex = prop.hex || '#1a9850';

      // 🟢 AJUSTE DE VISIBILIDADE: Raio de 5px e sem linha de borda
      const circle = this.L.circleMarker([ponto.lat, ponto.lng], {
        radius: 5,               // Raio visível para zoom de talhão
        fillColor: corHex,
        color: corHex,
        weight: 0,               // Remove a borda preta/transparente
        opacity: 1,
        fillOpacity: 0.9,        // Opacidade alta para destacar sobre o satélite
        pane: 'markerPane'       // Força ficar no topo da camada de imagem
      });

      circle.bindTooltip(
        `<strong>Lat/Lng:</strong> ${ponto.lat.toFixed(5)}, ${ponto.lng.toFixed(5)}<br/>
       <strong>Atributo:</strong> ${camada.replace('_', ' ').toUpperCase()}<br/>
       <strong>Valor:</strong> ${prop.valor_ndvi ?? prop.valor_kg_ha ?? prop.valor_porcentagem}<br/>
       <strong>HEX:</strong> ${corHex}`,
        { direction: 'top' }
      );

      this.gridLayerGroup.addLayer(circle);
    });
  }
}
