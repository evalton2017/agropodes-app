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
import { lastValueFrom } from 'rxjs';

import { GlebaGeometriaResponse } from '../../../model/dashboard-produtor.model';
import * as wktParser from 'terraformer-wkt-parser';
import {GlebaService} from '../../../../produtor/service/gleba.service';
import {RasterMetadadosResponse} from '../../../../produtor/model/raster.model';

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
  private readonly glebaService = inject(GlebaService);

  private map: any;
  private geoJsonLayer: any;
  private rasterLayer: any;
  private legendaControl: any;
  private LeafletCore: any;

  private parseGeorasterFn: any;
  private GeoRasterLayerClass: any;

  private metadadosRasterAtivo?: RasterMetadadosResponse;

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
      this.LeafletCore = leafletModule.default || leafletModule;

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

    let idRasterTarget: number | string | null = null;

    // Extrai o ID do raster associado às glebas
    for (const g of this.glebas) {
      const rp = g.rasterPeriodo || (g as any).raster_periodo;
      if (rp && (rp.idRaster || rp.id_raster)) {
        idRasterTarget = rp.idRaster || rp.id_raster;
        break;
      }
    }

    // Limpeza da camada raster anterior
    if (this.rasterLayer) {
      if (this.map.hasLayer(this.rasterLayer)) {
        this.map.removeLayer(this.rasterLayer);
      }
      this.rasterLayer = null;
    }

    if (!idRasterTarget) {
      this.metadadosRasterAtivo = undefined;
      this.atualizarHTMLLegenda();
      this.cdr.detectChanges();
      return;
    }

    try {
      // 🟢 PASSO 1 VIA SERVICE: Obter Metadados puros + Hash SHA-256
      this.metadadosRasterAtivo = await lastValueFrom(
        this.glebaService.obterMetadadosRaster(idRasterTarget)
      );

      // 🟢 PASSO 2 VIA SERVICE: Download do ArrayBuffer do GeoTIFF
      const arrayBuffer = await lastValueFrom(
        this.glebaService.downloadRasterArrayBuffer(idRasterTarget)
      );

      if (!arrayBuffer || arrayBuffer.byteLength === 0) return;

      // 🟢 PASSO 3: Parse e Renderização do Raster no Leaflet
      const georasterParsed = await this.parseGeorasterFn(arrayBuffer);

      if (this.geoJsonLayer) {
        this.geoJsonLayer.setStyle({
          fill: false,
          fillColor: 'transparent',
          fillOpacity: 0,
          color: '#16a34a',
          weight: 3
        });
      }

      this.rasterLayer = new this.GeoRasterLayerClass({
        georaster: georasterParsed,
        opacity: 0.88,
        resolution: 256,
        pixelValuesToColorFn: (values: any) => {
          if (!values || !Array.isArray(values)) return null;

          let val = typeof values[0] === 'number' ? values[0] : values[0]?.[0];

          // Trata pixels sem dados/transparentes
          if (val === undefined || val === null || isNaN(val) || val === 0) return null;

          // 🟢 Normaliza se o valor do GeoTIFF vier em Digital Numbers (0..10000) ou Byte (0..255)
          let ndvi = val;
          if (val > 2.0 && val <= 255) {
            ndvi = (val - 128) / 128.0;
          } else if (val > 255) {
            ndvi = val / 10000.0;
          }

          // 🟢 Com o NDVI correto de 0.4314, o pixel cairá na faixa de Vegetação Moderada / Em Desenvolvimento
          if (ndvi < 0.15) {
            return '#d73027'; // Solo Exposto (Vermelho)
          } else if (ndvi >= 0.15 && ndvi < 0.35) {
            return '#fee08b'; // Vegetação Rala / Baixa (Amarelo)
          } else if (ndvi >= 0.35 && ndvi < 0.45) {
            return '#a6d96a'; // Vegetação Moderada (Verde Claro) -> FAIXA CORRETA PARA 0.4314
          } else {
            return '#1a9850'; // Lavoura Densa (Verde Escuro)
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
      console.error('Erro ao buscar metadados/raster via GlebaService:', err);
      this.metadadosRasterAtivo = undefined;
      this.atualizarHTMLLegenda();
      this.cdr.detectChanges();
    }
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

    const totalConforme = this.glebas.filter(g => !g.statusVmg || g.statusVmg === 'CONFORME').length;
    const totalAtencao = this.glebas.filter(g => g.statusVmg === 'ATENCAO').length;
    const totalNaoConforme = this.glebas.filter(g => g.statusVmg === 'NAO_CONFORME').length;

    // Exibe a data de captura e nuvens vindas da API de metadados
    const dataCaptura = this.metadadosRasterAtivo?.data_captura;
    const cloudCover = this.metadadosRasterAtivo?.cloud_cover !== undefined
      ? (this.metadadosRasterAtivo.cloud_cover * 100).toFixed(2)
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
