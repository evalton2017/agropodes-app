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
  SimpleChanges
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {lastValueFrom, Subscription} from 'rxjs';

import {GlebaGeometriaResponse} from '../../../model/dashboard-produtor.model';
import * as wktParser from 'terraformer-wkt-parser';
import {GlebaService} from '../../../../produtor/service/gleba.service';
import {RasterMetadadosResponse} from '../../../../produtor/model/raster.model';

// 🟢 IMPORTS VMG / CONFORMIDADE PORTARIA SDI/MAPA Nº 739
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {point, polygon} from '@turf/helpers';

@Component({
  selector: 'app-dashboard-produtor-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-produtor-mapa.component.html',
  styleUrls: ['./dashboard-produtor-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProdutorMapaComponent implements OnChanges, OnDestroy {
  @Input({required: true}) glebas: GlebaGeometriaResponse[] = [];
  @Input() idGlebaSelecionada?: number | null;

  public modoVisualizacao: 'NDVI' | 'RGB' = 'NDVI';
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly glebaService = inject(GlebaService);

  private map: any;
  private geoJsonLayer: any;
  private rasterLayer: any;
  private legendaControl: any;
  private LeafletCore: any;

  private metadadosRasterAtivo?: RasterMetadadosResponse;
  private requisicaoMetadadosSub?: Subscription;

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
    if (isPlatformBrowser(this.platformId) && this.map) {
      if (changes['glebas'] || changes['idGlebaSelecionada']) {
        this.limparCamadaRaster();
        this.desenharPoligonosGlebas();
        this.carregarRasterSateliteSafra();
      }
    }
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
          attribution: 'Tiles © Esri | Sentinel-2 L2A | Infraestrutura VMG MAPA 739/2025',
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

      if (this.glebas && this.glebas.length > 0) {
        this.desenharPoligonosGlebas();
        await this.carregarRasterSateliteSafra();
      }

    } catch (error) {
      console.error('Erro ao inicializar mapa Leaflet VMG:', error);
    }
  }

  private async carregarRasterSateliteSafra(): Promise<void> {
    if (!this.map || !this.glebas || this.glebas.length === 0) return;

    if (this.requisicaoMetadadosSub) {
      this.requisicaoMetadadosSub.unsubscribe();
      this.requisicaoMetadadosSub = undefined;
    }

    this.limparCamadaRaster();

    let idRasterTarget: number | string | null = null;
    const glebaAtiva = this.idGlebaSelecionada
      ? this.glebas.find(g => g.idGleba === this.idGlebaSelecionada)
      : this.glebas[0];

    if (glebaAtiva) {
      const rp = glebaAtiva.rasterPeriodo || (glebaAtiva as any).raster_periodo;
      if (rp && (rp.idRaster || rp.id_raster)) {
        idRasterTarget = rp.idRaster || rp.id_raster;
      }
    }

    if (!idRasterTarget) {
      this.metadadosRasterAtivo = undefined;
      this.atualizarHTMLLegenda();
      this.cdr.detectChanges();
      return;
    }

    try {
      this.metadadosRasterAtivo = await lastValueFrom(
        this.glebaService.obterMetadadosRaster(idRasterTarget)
      );

      // 🟢 FORÇA O DESENHO DO GRID COM TIMEOUT PARA AGUARDAR RENDERIZAÇÃO DO LEAFLET
      if (this.metadadosRasterAtivo && glebaAtiva) {
        setTimeout(() => {
          this.renderizarGridMetadadosConforme(this.metadadosRasterAtivo, glebaAtiva);
          this.atualizarHTMLLegenda();
          this.cdr.detectChanges();
        }, 150);
      }

    } catch (err) {
      console.error('Erro ao obter metadados do raster VMG:', err);
      this.metadadosRasterAtivo = undefined;
      this.atualizarHTMLLegenda();
      this.cdr.detectChanges();
    }
  }

  /**
   * Renderização da malha vetorial imutável com tratamento flexível de dados
   */
  private renderizarGridMetadadosConforme(metadados: any, glebaAtiva: GlebaGeometriaResponse): void {
    if (!this.map || !this.LeafletCore || !metadados) return;

    this.limparCamadaRaster();

    // 1. TRATAMENTO E PARSE DO GRID_HEX (JSON STRING OU ARRAY)
    let rawGrid = metadados.grid_hex || metadados.gridHex || metadados.grid;
    if (typeof rawGrid === 'string') {
      try {
        rawGrid = JSON.parse(rawGrid);
      } catch (e) {
        rawGrid = [];
      }
    }

    if (!Array.isArray(rawGrid) || rawGrid.length === 0) {
      console.warn('⚠️ Nenhum ponto válido no grid_hex do raster.');
      return;
    }

    // 2. BUSCA AUTOMÁTICA DOS LIMITES GEOGRÁFICOS (BBOX)
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    const pontosValidos: Array<{ lat: number; lng: number; hex: string; ndvi: number }> = [];

    rawGrid.forEach((item: any) => {
      const lat = Number(item.lat || item.latitude);
      const lng = Number(item.lng || item.longitude || item.lon);
      const saude = item.saude_plantas || item.saudePlantas || item.saude;

      if (!isNaN(lat) && !isNaN(lng) && saude) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;

        pontosValidos.push({
          lat,
          lng,
          hex: saude.hex || saude.color || '#1a9850',
          ndvi: saude.valor_ndvi ?? saude.valorNdvi ?? 0
        });
      }
    });

    if (pontosValidos.length === 0) return;

    // 3. IDENTIFICAÇÃO DINÂMICA DA RESOLUÇÃO DA GRADE DE PIXELS
    // Deduz a resolução (pixel size) pela menor diferença entre coordenadas
    let stepLat = 0.00009; // Fallback ~10m
    let stepLng = 0.00009;

    if (pontosValidos.length > 1) {
      const latsOrdenadas = Array.from(new Set(pontosValidos.map(p => p.lat))).sort((a, b) => a - b);
      const lngsOrdenadas = Array.from(new Set(pontosValidos.map(p => p.lng))).sort((a, b) => a - b);

      if (latsOrdenadas.length > 1) stepLat = Math.abs(latsOrdenadas[1] - latsOrdenadas[0]);
      if (lngsOrdenadas.length > 1) stepLng = Math.abs(lngsOrdenadas[1] - lngsOrdenadas[0]);
    }

    // Dimensoes da imagem raster
    const cols = Math.max(1, Math.round((maxLng - minLng) / stepLng) + 1);
    const rows = Math.max(1, Math.round((maxLat - minLat) / stepLat) + 1);

    // 4. MONTAGEM E DESENHO NO CANVAS HTML5
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas 2D não suportado pelo navegador.');
      return;
    }

    // Desenha cada ponto no pixel correspondente da matriz
    pontosValidos.forEach(p => {
      const x = Math.round((p.lng - minLng) / stepLng);
      // Inverte o Y porque a coordenada 0,0 do Canvas é no canto superior esquerdo
      const y = Math.round((maxLat - p.lat) / stepLat);

      ctx.fillStyle = p.hex;
      ctx.fillRect(x, y, 1, 1);
    });

    // 5. CONVERSÃO DO CANVAS EM PNG EM MEMÓRIA E PROJEÇÃO NO LEAFLET
    const imageUrl = canvas.toDataURL('image/png');

    // Adiciona margem de expansão correspondente a meio pixel para encaixe perfeito nas bordas
    const bounds = this.LeafletCore.latLngBounds(
      [minLat - (stepLat / 2), minLng - (stepLng / 2)],
      [maxLat + (stepLat / 2), maxLng + (stepLng / 2)]
    );

    this.rasterLayer = this.LeafletCore.imageOverlay(imageUrl, bounds, {
      opacity: 0.85,
      interactive: false
    });

    this.rasterLayer.addTo(this.map);

    // Garante que o contorno da gleba fique sobreposto à imagem do raster
    if (this.geoJsonLayer) {
      this.geoJsonLayer.bringToFront();
    }

    this.cdr.detectChanges();
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

    this.legendaControl = new this.LeafletCore.Control({position: 'bottomleft'});
    this.legendaControl.onAdd = () => this.LeafletCore.DomUtil.create('div', 'vmg-map-legend');
    this.legendaControl.addTo(this.map);
  }

  private atualizarHTMLLegenda(): void {
    if (!this.legendaControl) return;

    const container = this.legendaControl.getContainer();
    if (!container) return;

    const totalConforme = this.glebas.filter(g => !g.statusVmg || g.statusVmg === 'CONFORME').length;
    const totalAtencao = this.glebas.filter(g => g.statusVmg === 'ATENCAO').length;
    const totalNaoConforme = this.glebas.filter(g => g.statusVmg === 'NAO_CONFORME').length;

    const dataCaptura = this.metadadosRasterAtivo?.data_captura;

    // 🟢 CORREÇÃO DA MÚLTIPLICAÇÃO DA NUVEM (Exibe a porcentagem real tratada)
    const rawCloud = this.metadadosRasterAtivo?.cloud_cover;
    const cloudCover = rawCloud !== undefined && rawCloud !== null
      ? (rawCloud > 1 ? rawCloud.toFixed(2) : (rawCloud * 100).toFixed(2))
      : null;

    const headerRasterHtml = dataCaptura
      ? `<div class="legend-header-title">📸 Sentinel-2: ${dataCaptura} ${cloudCover !== null ? `(${cloudCover}% nuvens)` : ''}</div>`
      : '';

    container.innerHTML = `
      ${headerRasterHtml}
      <div class="legend-section-title">Status da Gleba</div>
      <div class="legend-item"><span class="legend-color conforme"></span> Conforme (${totalConforme})</div>
      <div class="legend-item"><span class="legend-color atencao"></span> Atenção (${totalAtencao})</div>
      <div class="legend-item"><span class="legend-color nao-conforme"></span> Não Conforme (${totalNaoConforme})</div>

      <div class="legend-divider"></div>

      <div class="legend-section-title">Vigor Vegetativo (NDVI)</div>
      <div class="legend-item"><span class="legend-color ndvi-densa"></span> Vegetação Densa / Lavoura (> 0.55)</div>
      <div class="legend-item"><span class="legend-color ndvi-rala"></span> Vegetação Baixa / Rala (0.30 - 0.55)</div>
      <div class="legend-item"><span class="legend-color ndvi-solo"></span> Solo Exposto (< 0.30)</div>
    `;
  }

  private desenharPoligonosGlebas(): void {
    if (!this.map || !this.geoJsonLayer || !this.glebas || this.glebas.length === 0) return;

    this.geoJsonLayer.clearLayers();

    let glebasParaExibir = this.glebas;

    if (this.idGlebaSelecionada) {
      const encontrada = this.glebas.filter(g => g.idGleba === this.idGlebaSelecionada);
      if (encontrada.length > 0) {
        glebasParaExibir = encontrada;
      }
    }

    const recursosGeoJson: any[] = [];

    glebasParaExibir.forEach((gleba) => {
      try {
        if (!gleba.geometria) return;
        const geoJsonGeometria = wktParser.parse(gleba.geometria);

        recursosGeoJson.push({
          type: 'Feature',
          geometry: geoJsonGeometria,
          properties: {
            id_gleba: gleba.idGleba,
            codigo_car: gleba.codigoCar,
            area: gleba.areaHectares,
            cultura: gleba.culturaDeclarada,
            status: gleba.statusVmg ? gleba.statusVmg.toUpperCase() : 'CONFORME'
          }
        });
      } catch (error) {
        console.error('Erro ao converter WKT:', error);
      }
    });

    if (recursosGeoJson.length > 0) {
      this.geoJsonLayer.addData({
        type: 'FeatureCollection',
        features: recursosGeoJson
      } as any);

      this.geoJsonLayer.setStyle((feature: any) => this.obterEstiloPoligono(feature));
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
        this.cdr.detectChanges();
      }, 100);
    }
  }


  private limparCamadaRaster(): void {
    if (this.rasterLayer && this.map) {
      try {
        if (this.map.hasLayer(this.rasterLayer)) {
          this.map.removeLayer(this.rasterLayer);
        }
      } catch (e) {
        console.warn('Erro ao remover camada raster anterior:', e);
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
    if (this.requisicaoMetadadosSub) {
      this.requisicaoMetadadosSub.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
  }
}
