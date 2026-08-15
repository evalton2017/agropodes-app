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
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GlebaGeometriaResponse } from '../../../model/dashboard-produtor.model';
import * as wktParser from 'terraformer-wkt-parser';

@Component({
  selector: 'app-dashboard-produtor-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-produtor-mapa.component.html',
  styleUrls: ['./dashboard-produtor-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProdutorMapaComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) glebas: GlebaGeometriaResponse[] = [];

  public modoVisualizacao: 'NDVI' | 'RGB' = 'NDVI';
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  private map: any;
  private geoJsonLayer: any;
  private rasterLayer: any;
  private legendaControl: any;
  private LeafletCore: any;

  // Referências para libs geográficas
  private parseGeorasterFn: any;
  private GeoRasterLayerClass: any;

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
    if (isPlatformBrowser(this.platformId) && this.map && changes['glebas']) {
      this.desenharPoligonosGlebas();
      this.carregarRasterSateliteSafra();
    }
  }

  private async inicializarMapaVisualizacao(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;

      const georasterModule = await import('georaster');
      this.parseGeorasterFn = georasterModule.default || georasterModule;

      const georasterLayerModule = await import('georaster-layer-for-leaflet');
      this.GeoRasterLayerClass = georasterLayerModule.default || georasterLayerModule;

      const centro: [number, number] = [this.latPadrao, this.lonPadrao];
      this.map = this.LeafletCore.map('vmg-leaflet-map', {
        center: centro,
        zoom: 5,
        zoomControl: true
      });

      // Mosaico Base de Satélite (Esri World Imagery)
      this.LeafletCore.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri | Sentinel-2 L2A',
          maxZoom: 19,
          maxNativeZoom: 18
        }
      ).addTo(this.map);

      // Camada de Polígonos das Glebas
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
      console.error('Erro ao inicializar mapa Leaflet / GeoTIFF:', error);
    }
  }

  private async carregarRasterSateliteSafra(): Promise<void> {
    if (!this.map || !this.glebas || this.glebas.length === 0 || !this.parseGeorasterFn) return;

    let urlRasterGeoTiff = '';
    for (const g of this.glebas) {
      const rp = g.rasterPeriodo || (g as any).raster_periodo;
      if (rp && (rp.rasterUrl || rp.raster_url)) {
        urlRasterGeoTiff = rp.rasterUrl || rp.raster_url;
        break;
      }
    }

    if (!urlRasterGeoTiff) {
      this.atualizarHTMLLegenda();
      return;
    }

    try {
      if (this.rasterLayer) {
        this.map.removeLayer(this.rasterLayer);
        this.rasterLayer = null;
      }

      // 1. Download do GeoTIFF
      const timestamp = new Date().getTime();
      const urlComCacheBust = urlRasterGeoTiff.includes('?')
        ? `${urlRasterGeoTiff}&_t=${timestamp}`
        : `${urlRasterGeoTiff}?_t=${timestamp}`;

      const arrayBuffer = await this.http
        .get(urlComCacheBust, { responseType: 'arraybuffer' })
        .toPromise();

      if (!arrayBuffer || arrayBuffer.byteLength === 0) return;

      // 2. Parse do GeoTIFF
      const georasterParsed = await this.parseGeorasterFn(arrayBuffer);

      // 3. OBRIGATÓRIO: Garante transparência na camada de contorno GeoJSON
      if (this.geoJsonLayer) {
        this.geoJsonLayer.setStyle({
          fill: false,
          fillColor: 'transparent',
          fillOpacity: 0,
          color: '#16a34a',
          weight: 3
        });
      }

      // 4. Mapeamento dinâmico do Raster no Leaflet
      this.rasterLayer = new this.GeoRasterLayerClass({
        georaster: georasterParsed,
        opacity: 0.88,
        resolution: 256,
        pixelValuesToColorFn: (values: any) => {
          if (!values || !Array.isArray(values)) return null;

          // --- CASO 1: GeoTIFF de 3 Bandas (RGB de 0 a 255) ---
          if (values.length >= 3) {
            let r = typeof values[0] === 'number' ? values[0] : values[0]?.[0] || 0;
            let g = typeof values[1] === 'number' ? values[1] : values[1]?.[0] || 0;
            let b = typeof values[2] === 'number' ? values[2] : values[2]?.[0] || 0;

            r = Math.round(r);
            g = Math.round(g);
            b = Math.round(b);

            // Pixels de fundo / NoData (0,0,0) ficam transparentes
            if ((r === 0 && g === 0 && b === 0) || isNaN(r)) {
              return null;
            }

            return `rgba(${r}, ${g}, ${b}, 0.88)`;
          }

          // --- CASO 2: GeoTIFF de 1 Banda (Valores brutos de NDVI ou Float) ---
          let val = typeof values[0] === 'number' ? values[0] : values[0]?.[0];

          if (val === undefined || val === null || isNaN(val) || val === 0) {
            return null; // Sem dados / Fora do recorte
          }

          // Normalização caso os valores venham em escala 0..255 ou -1.0..+1.0
          let ndvi = val;
          if (val > 2.0) {
            ndvi = (val - 128) / 128.0; // Mapeia byte para faixa -1 a +1
          }

          // RENDERIZAÇÃO DA PALETA NDVI CONFORME A LEGENDA
          if (ndvi < 0.20) {
            return 'rgba(185, 28, 28, 0.88)';  // Solo Exposto (Vermelho)
          } else if (ndvi >= 0.20 && ndvi < 0.50) {
            return 'rgba(234, 179, 8, 0.88)';  // Vegetação Rala / Inicial (Amarelo)
          } else {
            return 'rgba(22, 163, 74, 0.88)';   // Vegetação Densa / Lavoura (Verde)
          }
        }
      });

      this.rasterLayer.addTo(this.map);

      if (this.geoJsonLayer) {
        this.geoJsonLayer.bringToFront();
      }

      this.atualizarHTMLLegenda();
      this.cdr.detectChanges();

    } catch (err) {
      console.error('Erro ao renderizar GeoTIFF no Leaflet:', err);
      this.atualizarHTMLLegenda();
    }
  }

  private obterEstiloPoligono(feature: any): any {
    const statusVmg = feature?.properties?.status;
    let corBorda = '#16a34a'; // Verde

    if (statusVmg === 'NAO_CONFORME') {
      corBorda = '#dc2626'; // Vermelho
    } else if (statusVmg === 'ATENCAO') {
      corBorda = '#ea580c'; // Laranja
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

    const totalConforme = this.glebas.filter(g => !g.statusVmg || g.statusVmg === 'CONFORME').length;
    const totalAtencao = this.glebas.filter(g => g.statusVmg === 'ATENCAO').length;
    const totalNaoConforme = this.glebas.filter(g => g.statusVmg === 'NAO_CONFORME').length;

    const glebaComRaster = this.glebas.find(g => g.rasterPeriodo?.dataCaptura);
    const dataCaptura = glebaComRaster?.rasterPeriodo?.dataCaptura;

    const headerRasterHtml = dataCaptura
      ? `<div class="legend-header-title">📸 Sentinel-2: ${dataCaptura}</div>`
      : '';

    container.innerHTML = `
      ${headerRasterHtml}
      <div class="legend-section-title">Status da Gleba</div>
      <div class="legend-item"><span class="legend-color conforme"></span> Conforme (${totalConforme})</div>
      <div class="legend-item"><span class="legend-color atencao"></span> Atenção (${totalAtencao})</div>
      <div class="legend-item"><span class="legend-color nao-conforme"></span> Não Conforme (${totalNaoConforme})</div>

      <div class="legend-divider"></div>

      <div class="legend-section-title">Vigor Vegetativo (NDVI)</div>
      <div class="legend-item"><span class="legend-color ndvi-densa"></span> Vegetação Densa / Lavoura</div>
      <div class="legend-item"><span class="legend-color ndvi-rala"></span> Vegetação Baixa / Rala</div>
      <div class="legend-item"><span class="legend-color ndvi-solo"></span> Solo Exposto</div>
    `;
  }

  private desenharPoligonosGlebas(): void {
    if (!this.map || !this.geoJsonLayer || !this.glebas || this.glebas.length === 0) return;

    this.geoJsonLayer.clearLayers();
    const recursosGeoJson: any[] = [];

    this.glebas.forEach((gleba) => {
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
        console.error(`Falha ao converter WKT no dashboard:`, error);
      }
    });

    if (recursosGeoJson.length > 0) {
      this.geoJsonLayer.addData({
        type: 'FeatureCollection',
        features: recursosGeoJson
      } as any);

      this.geoJsonLayer.setStyle((feature: any) => this.obterEstiloPoligono(feature));

      // 🟢 ATUALIZA A LEGENDA LOGO APÓS DESENHAR OS POLÍGONOS
      this.atualizarHTMLLegenda();

      const limites = this.geoJsonLayer.getBounds();
      if (limites.isValid()) {
        setTimeout(() => {
          this.map.fitBounds(limites, { padding: [30, 30] });
          this.map.invalidateSize();
          this.cdr.detectChanges();
        }, 50);
      }
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
    if (this.map) {
      this.map.remove();
    }
  }
}
