import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import * as wktParser from 'terraformer-wkt-parser';
import { GlebaGeometriaResponse } from '../../pages/dashboard/model/dashboard-produtor.model';
import {GlebaService} from '../../service/gleba.service';
import {RasterMetadadosResponse} from '../../pages/model/raster.model';


@Component({
  selector: 'app-dashboard-produtor-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-produtor-mapa.component.html',
  styleUrls: ['./dashboard-produtor-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProdutorMapaComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) idGleba: number | undefined;
  @Input() safra: string | undefined;

  public carregando = signal<boolean>(false);
  public modoVisualizacao: 'NDVI' | 'RGB' = 'NDVI';

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly glebaService = inject(GlebaService);

  private map: any;
  private geoJsonLayer: any;
  private rasterLayer: any;
  private legendaControl: any;
  private LeafletCore: any;

  private glebaAtiva?: GlebaGeometriaResponse;
  private metadadosRasterAtivo?: RasterMetadadosResponse;
  private dadosSub?: Subscription;

  private readonly latPadrao = -13.975810;
  private readonly lonPadrao = -59.757567;

  constructor() {
    afterNextRender(async () => {
      if (isPlatformBrowser(this.platformId)) {
        await this.inicializarMapaVisualizacao();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (isPlatformBrowser(this.platformId)) {
      // Dispara a atualização se o idGleba OU a safra mudarem
      if ((changes['idGleba'] || changes['safra']) && this.idGleba) {
        this.carregarEDesenharGleba();
      }
    }
  }

  private carregarEDesenharGleba(): void {
    if (!this.idGleba) return;

    if (this.dadosSub) {
      this.dadosSub.unsubscribe();
    }

    this.carregando.set(true);
    this.limparCamadaRaster();

    if (this.geoJsonLayer) {
      this.geoJsonLayer.clearLayers();
    }

    // 1. Busca o laudo detalhado que contém a geometria e dados de safra
    this.dadosSub = this.glebaService.obterDetalheLaudoGleba(Number(this.idGleba), this.safra).subscribe({
      next: (laudo: any) => {
        if (!laudo || !laudo.geometria) {
          console.warn(`⚠️ Nenhuma geometria WKT encontrada para a Gleba #${this.idGleba}`);
          this.carregando.set(false);
          this.cdr.detectChanges();
          return;
        }

        this.glebaAtiva = {
          idGleba: laudo.id_gleba,
          geometria: laudo.geometria,
          codigoCar: laudo.codigo_car,
          areaHectares: laudo.area_ha,
          culturaDeclarada: laudo.cultura_declarada,
          statusVmg: laudo.status
        } as any;

        // Desenha o polígono verde no mapa
        this.desenharPoligonoGleba(this.glebaAtiva!);

        // 2. Extrai o ID do raster ou faz a busca do raster ativo da safra
        const idRasterTarget = laudo.id_raster || laudo.idRaster || this.extrairIdRaster(laudo);

        if (idRasterTarget) {
          this.carregarEMostrarRaster(idRasterTarget);
        } else {
          // Fallback: Busca o raster vinculado à gleba e safra
          this.buscarRasterPorGlebaESafra(Number(this.idGleba), this.safra);
        }
      },
      error: (err) => {
        console.error(`❌ Erro ao buscar laudo da Gleba #${this.idGleba}:`, err);
        this.carregando.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Busca os metadados do grid do raster e renderiza o Canvas no mapa
   */
  private carregarEMostrarRaster(idRaster: number | string): void {
    this.glebaService.obterMetadadosRaster(idRaster).subscribe({
      next: (metadados) => {
        this.metadadosRasterAtivo = metadados;
        if (this.glebaAtiva) {
          this.renderizarGridMetadadosConforme(metadados, this.glebaAtiva);
        }
        this.atualizarHTMLLegenda();
        this.carregando.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erro ao obter metadados do raster:', err);
        this.metadadosRasterAtivo = undefined;
        this.atualizarHTMLLegenda();
        this.carregando.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Fallback para localizar o ID do raster quando não vem na raiz do laudo
   */
  private buscarRasterPorGlebaESafra(idGleba: number, safra?: string): void {
    // Chamada de apoio do seu serviço de glebas/rasters
    this.glebaService.obterDetalheLaudoGleba(idGleba, safra).subscribe({
      next: (rasters: any) => {
        const rasterAtivo = Array.isArray(rasters) ? rasters[0] : rasters;
        const idRaster = rasterAtivo?.id_raster || rasterAtivo?.id;

        if (idRaster) {
          this.carregarEMostrarRaster(idRaster);
        } else {
          console.warn('⚠️ Nenhum raster disponível para esta safra.');
          this.carregando.set(false);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.carregando.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  private async inicializarMapaVisualizacao(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.LeafletCore = leafletModule.default || leafletModule;

      const centro: [number, number] = [this.latPadrao, this.lonPadrao];
      this.map = this.LeafletCore.map('vmg-leaflet-map', {
        center: centro,
        zoom: 5,
        zoomControl: true
      });

      this.LeafletCore.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri | Sentinel-2 L2A',
          maxZoom: 19,
          maxNativeZoom: 18
        }
      ).addTo(this.map);

      this.geoJsonLayer = this.LeafletCore.geoJSON(null, {
        style: (feature: any) => this.obterEstiloPoligono(feature),
        onEachFeature: (feature: any, layer: any) => this.vincularPopupInformativo(feature, layer),
        coordsToLatLng: (coords: [number, number]) => new this.LeafletCore.LatLng(coords[1], coords[0])
      }).addTo(this.map);

      this.inicializarControleLegenda();

      if (this.idGleba) {
        this.carregarEDesenharGleba();
      }
    } catch (error) {
      console.error('Erro ao inicializar mapa Leaflet:', error);
    }
  }

  private desenharPoligonoGleba(gleba: GlebaGeometriaResponse): void {
    if (!this.map || !this.geoJsonLayer || !gleba?.geometria) return;

    try {
      const geoJsonGeometria = wktParser.parse(gleba.geometria);

      const feature = {
        type: 'Feature',
        geometry: geoJsonGeometria,
        properties: {
          id_gleba: gleba.idGleba,
          codigo_car: gleba.codigoCar,
          area: gleba.areaHectares,
          cultura: gleba.culturaDeclarada,
          status: gleba.statusVmg ? gleba.statusVmg.toUpperCase() : 'CONFORME'
        }
      };

      this.geoJsonLayer.addData(feature as any);
      this.geoJsonLayer.setStyle((f: any) => this.obterEstiloPoligono(f));
      this.atualizarHTMLLegenda();

      setTimeout(() => {
        this.map.invalidateSize();
        const limites = this.geoJsonLayer.getBounds();

        if (limites && limites.isValid()) {
          this.map.flyToBounds(limites, {
            padding: [50, 50],
            maxZoom: 16,
            duration: 1.0
          });
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao converter WKT do polígono:', error);
    }
  }

  private renderizarGridMetadadosConforme(metadados: any, glebaAtiva: GlebaGeometriaResponse): void {
    if (!this.map || !this.LeafletCore || !metadados || !glebaAtiva?.geometria) return;

    this.limparCamadaRaster();

    let rawGrid = metadados.grid_hex || metadados.gridHex || metadados.grid;
    if (typeof rawGrid === 'string') {
      try { rawGrid = JSON.parse(rawGrid); } catch (e) { rawGrid = []; }
    }

    if (!Array.isArray(rawGrid) || rawGrid.length === 0) return;

    // 1. Extrai vértices da geometria WKT
    let polygonCoords: Array<[number, number]> = [];
    try {
      const geoJsonGeometria: any = wktParser.parse(glebaAtiva.geometria);

      if (geoJsonGeometria) {
        const rawCoords = geoJsonGeometria.type === 'Polygon'
          ? geoJsonGeometria.coordinates[0]
          : (geoJsonGeometria.coordinates ? geoJsonGeometria.coordinates[0][0] : []);

        if (Array.isArray(rawCoords)) {
          polygonCoords = rawCoords.map((c: [number, number]) => [c[1], c[0]]);
        }
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível extrair coordenadas WKT para a máscara:', e);
    }

    // 🟢 2. Calcula os limites do Bounding Box usando a GEOMETRIA DO WKT (em vez do grid)
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    if (polygonCoords.length > 0) {
      polygonCoords.forEach(coord => {
        const pLat = coord[0];
        const pLng = coord[1];
        if (pLat < minLat) minLat = pLat;
        if (pLat > maxLat) maxLat = pLat;
        if (pLng < minLng) minLng = pLng;
        if (pLng > maxLng) maxLng = pLng;
      });
    }

    // 3. Processa os pontos do grid_hex para extrair as cores
    const pontosValidos: Array<{ lat: number; lng: number; hex: string }> = [];

    rawGrid.forEach((item: any) => {
      const lat = Number(item.lat ?? item.latitude);
      const lng = Number(item.lng ?? item.longitude ?? item.lon);
      const saude = item.saude_plantas || item.saudePlantas || item.saude;
      const corHex = saude?.hex || item.hex || item.color || '#a6d96a';

      if (!isNaN(lat) && !isNaN(lng)) {
        // Caso a WKT falhe por algum motivo, usa os pontos como fallback
        if (polygonCoords.length === 0) {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        }
        pontosValidos.push({ lat, lng, hex: corHex });
      }
    });

    if (pontosValidos.length === 0) return;

    const latDiff = maxLat - minLat || 0.0001;
    const lngDiff = maxLng - minLng || 0.0001;

    const cols = 100;
    const rows = 100;

    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, cols, rows);

      // 🟢 4. MÁSCARA CANVAS (ctx.clip) alinhada exatamente às bordas WKT
      if (polygonCoords.length > 0) {
        ctx.beginPath();
        polygonCoords.forEach((coord, idx) => {
          const pLat = coord[0];
          const pLng = coord[1];

          const x = ((pLng - minLng) / lngDiff) * (cols - 1);
          const y = ((maxLat - pLat) / latDiff) * (rows - 1);

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        ctx.clip(); // Corta rigorosamente no perímetro da linha verde
      }

      // 🟢 5. Blocos com dimensionamento ajustado para fundir os pontos sem deixar frestas
      const cellWidth = Math.ceil(cols / 8);
      const cellHeight = Math.ceil(rows / 5);

      pontosValidos.forEach(p => {
        let x = Math.floor(((p.lng - minLng) / lngDiff) * (cols - 1));
        let y = Math.floor(((maxLat - p.lat) / latDiff) * (rows - 1));

        x = Math.max(0, Math.min(cols - 1, x));
        y = Math.max(0, Math.min(rows - 1, y));

        ctx.fillStyle = p.hex;
        ctx.fillRect(x - Math.floor(cellWidth / 2), y - Math.floor(cellHeight / 2), cellWidth, cellHeight);
      });

      try {
        const imageUrl = canvas.toDataURL('image/png');

        // 🟢 6. Bounds sobrepostos cravados nos limites reais da geometria da gleba
        const bounds = this.LeafletCore.latLngBounds(
          [minLat, minLng],
          [maxLat, maxLng]
        );

        this.rasterLayer = this.LeafletCore.imageOverlay(imageUrl, bounds, {
          opacity: 0.85,
          interactive: false
        }).addTo(this.map);

        if (this.geoJsonLayer) {
          this.geoJsonLayer.bringToFront();
        }
      } catch (err) {
        console.error('Erro ao renderizar imagem do raster:', err);
      }
    }
  }

  
  /**
   * Recorta o Canvas sobreposto para alinhar estritamente ao desenho vetorial do Leaflet
   */
  private aplicarMascaraPoligono(): void {
    try {
      if (!this.rasterLayer || !this.geoJsonLayer) return;

      const element = this.rasterLayer.getElement();
      if (!element) return;

      // Obtém as coordenadas dos vértices desenhados pela camada GeoJSON no mapa
      const layers = this.geoJsonLayer.getLayers();
      if (!layers || layers.length === 0) return;

      const latLngs = layers[0].getLatLngs()[0];
      if (!Array.isArray(latLngs)) return;

      // Converte coordenadas geográficas (lat/lng) para pixels relativos à tela
      const polygonPixels = latLngs.map((ll: any) => {
        const point = this.map.latLngToContainerPoint(ll);
        const overlayPoint = this.map.latLngToContainerPoint(this.rasterLayer.getBounds().getNorthWest());
        return `${point.x - overlayPoint.x}px ${point.y - overlayPoint.y}px`;
      });

      // Aplica o recorte via CSS clip-path
      element.style.clipPath = `polygon(${polygonPixels.join(', ')})`;
    } catch (e) {
      console.warn('Não foi possível aplicar o clip-path no raster:', e);
    }
  }

  private extrairIdRaster(gleba: any): number | string | null {
    const rp = gleba?.rasterPeriodo || gleba?.raster_periodo || gleba?.raster;
    return rp?.idRaster ?? rp?.id_raster ?? rp?.id ?? gleba?.idRaster ?? gleba?.id_raster ?? null;
  }

  private obterEstiloPoligono(feature: any): any {
    const statusVmg = feature?.properties?.status;
    let corBorda = '#16a34a';

    if (statusVmg === 'NAO_CONFORME') {
      corBorda = '#dc2626';
    } else if (statusVmg === 'ATENCAO') {
      corBorda = '#ea580c';
    }

    return {
      color: corBorda,
      weight: 3,
      fill: false,
      fillColor: 'transparent',
      fillOpacity: 0,
      stroke: true
    };
  }

  private inicializarControleLegenda(): void {
    if (!this.map || !this.LeafletCore) return;

    this.legendaControl = new this.LeafletCore.Control({ position: 'bottomleft' });
    this.legendaControl.onAdd = () => this.LeafletCore.DomUtil.create('div', 'vmg-map-legend');
    this.legendaControl.addTo(this.map);
  }

  private atualizarHTMLLegenda(): void {
    if (!this.legendaControl) return;

    const container = this.legendaControl.getContainer();
    if (!container) return;

    const dataCaptura = this.metadadosRasterAtivo?.data_captura;
    const rawCloud = this.metadadosRasterAtivo?.cloud_cover;
    const cloudCover = rawCloud !== undefined && rawCloud !== null
      ? (rawCloud > 1 ? rawCloud.toFixed(2) : (rawCloud * 100).toFixed(2))
      : null;

    const headerRasterHtml = dataCaptura
      ? `<div class="legend-header-title">📸 Sentinel-2: ${dataCaptura} ${cloudCover !== null ? `(${cloudCover}% nuvens)` : ''}</div>`
      : '';

    container.innerHTML = `
      ${headerRasterHtml}
      <div class="legend-section-title">Vigor Vegetativo (NDVI)</div>
      <div class="legend-item"><span class="legend-color ndvi-densa"></span> Vegetação Densa / Lavoura (> 0.55)</div>
      <div class="legend-item"><span class="legend-color ndvi-rala"></span> Vegetação Baixa / Rala (0.30 - 0.55)</div>
      <div class="legend-item"><span class="legend-color ndvi-solo"></span> Solo Exposto (< 0.30)</div>
    `;
  }

  private limparCamadaRaster(): void {
    if (this.rasterLayer && this.map) {
      try {
        if (this.map.hasLayer(this.rasterLayer)) {
          this.map.removeLayer(this.rasterLayer);
        }
      } catch (e) {
        console.warn('Erro ao remover camada raster:', e);
      }
      this.rasterLayer = null;
    }
  }

  private vincularPopupInformativo(feature: any, layer: any): void {
    const props = feature.properties;
    const isConforme = props.status === 'CONFORME';

    const conteudoPopup = `
      <div class="vmg-map-popup" style="font-family: 'Inter', sans-serif; font-size: 12px; padding: 4px;">
        <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 13px; font-weight: 700;">Gleba ID: ${props.id_gleba}</h4>
        <p style="margin: 2px 0; color: #475569;"><strong>Cultura:</strong> ${props.cultura}</p>
        <p style="margin: 2px 0; color: #475569;"><strong>Área:</strong> ${Number(props.area).toFixed(2)} ha</p>
        <p style="margin: 2px 0; color: #475569; font-size: 11px; word-break: break-all;"><strong>CAR:</strong> ${props.codigo_car}</p>
        <div style="margin-top: 6px; padding: 4px; border-radius: 4px; text-align: center; font-weight: 700;
                    background-color: ${isConforme ? '#f0fdf4' : '#fff5f5'};
                    color: ${isConforme ? '#16a34a' : '#dc2626'};">
          Status: ${props.status}
        </div>
      </div>
    `;
    layer.bindPopup(conteudoPopup);
  }

  ngOnDestroy(): void {
    if (this.dadosSub) {
      this.dadosSub.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
  }
}
