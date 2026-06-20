import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GlebaGeometriaResponse} from '../../../model/dashboard-produtor.model';
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
  @Input({required: true}) glebas: GlebaGeometriaResponse[] = [];

  private readonly cdr = inject(ChangeDetectorRef);

  private map: any;
  private geoJsonLayer: any;
  private legendaControl: any;
  private LeafletCore: any;

  private readonly latPadrao = -13.975810;
  private readonly lonPadrao = -59.757567;

  constructor() {
    afterNextRender(async () => {
      await this.inicializarMapaVisualizacao();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && changes['glebas'] && !changes['glebas'].firstChange) {
      this.desenharPoligonosGlebas();
    }
  }

  private async inicializarMapaVisualizacao(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;

      const centro: [number, number] = [this.latPadrao, this.lonPadrao];
      this.map = this.LeafletCore.map('vmg-leaflet-map', {
        center: centro,
        zoom: 4,
        zoomControl: true
      });

      this.LeafletCore.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri',
          maxZoom: 19,
          maxNativeZoom: 18
        }
      ).addTo(this.map);

      this.geoJsonLayer = this.LeafletCore.geoJSON(null, {
        style: (feature: any) => this.obterEstiloPoligono(feature),
        onEachFeature: (feature: any, layer: any) => this.vincularPopupInformativo(feature, layer),
        coordsToLatLng: (coords: [number, number]) => {
          const longitude = coords[0];
          const latitude = coords[1];
          return new this.LeafletCore.LatLng(latitude, longitude);
        }
      }).addTo(this.map);

      this.inicializarControleLegenda();

      if (this.glebas && this.glebas.length > 0) {
        this.desenharPoligonosGlebas();
      }

    } catch (error) {
      console.error('Erro ao inicializar mapa do produtor via afterNextRender:', error);
    }
  }

  private inicializarControleLegenda(): void {
    if (!this.map || !this.LeafletCore) return;

    this.legendaControl = new this.LeafletCore.Control({position: 'bottomleft'});

    this.legendaControl.onAdd = () => {
      // Cria a div injetando a classe CSS do SCSS
      return this.LeafletCore.DomUtil.create('div', 'vmg-map-legend');
    };

    this.legendaControl.addTo(this.map);
  }

  private atualizarHTMLLegenda(): void {
    if (!this.legendaControl) return;

    const container = this.legendaControl.getContainer();
    if (!container) return;

    // CORREÇÃO CRÍTICA: Filtros adaptados para o padrão literal de string da API Python (Upper Case)
    const totalConforme = this.glebas.filter(g => !g.statusVmg || g.statusVmg === 'CONFORME').length;
    const totalAtencao = this.glebas.filter(g => g.statusVmg === 'ATENCAO').length;
    const totalNaoConforme = this.glebas.filter(g => g.statusVmg === 'NAO_CONFORME').length;

    // Monta a estrutura HTML interna mantendo as classes CSS originais de estilização do Agro Brasil
    container.innerHTML = `
    <div class="legend-item">
      <span class="legend-color conforme"></span>
      Conforme (${totalConforme})
    </div>
    <div class="legend-item">
      <span class="legend-color atencao"></span>
      Atenção (${totalAtencao})
    </div>
    <div class="legend-item">
      <span class="legend-color nao-conforme"></span>
      Não Conforme (${totalNaoConforme})
    </div>
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
            // Garante que o status vá rigorosamente em caixa alta
            status: gleba.statusVmg ? gleba.statusVmg.toUpperCase() : 'CONFORME'
          }
        });
      } catch (error) {
        console.error(`Falha ao converter WKT no dashboard:`, error);
      }
    });

    if (recursosGeoJson.length > 0) {
      // 1. Alimenta as feições espaciais na camada GeoJSON primeiro
      this.geoJsonLayer.addData({
        type: 'FeatureCollection',
        features: recursosGeoJson
      } as any);

      // 2. CORREÇÃO CRÍTICA: Aplica a função de estilo LOGO APÓS os dados existirem na camada
      this.geoJsonLayer.setStyle((feature: any) => {
        const statusVmg = feature?.properties?.status;

        if (statusVmg === 'NAO_CONFORME') {
          return {
            color: '#dc2626',       // Borda Vermelha (Inconformidade Crítica)
            fillColor: '#ef4444',   // Preenchimento Vermelho translúcido
            fillOpacity: 0.35,
            weight: 2
          };
        } else if (statusVmg === 'ATENCAO') {
          return {
            color: '#ea580c',       // Borda Laranja
            fillColor: '#f97316',   // Preenchimento Laranja
            fillOpacity: 0.35,
            weight: 2
          };
        } else {
          return {
            color: '#16a34a',       // Borda Verde Agro Brasil
            fillColor: '#22c55e',   // Preenchimento Verde
            fillOpacity: 0.3,
            weight: 2
          };
        }
      });

      // 3. Atualiza os dados de texto da legenda em perfeita sincronia
      this.atualizarHTMLLegenda();

      const limites = this.geoJsonLayer.getBounds();
      if (limites.isValid()) {
        setTimeout(() => {
          this.map.fitBounds(limites, {padding: [30, 30]});
          this.map.invalidateSize();
          this.cdr.detectChanges();
        }, 50);
      }
    }
  }

  private obterEstiloPoligono(feature: any): any {
    const status = feature.properties.status;
    let corBorda = '#16a34a';
    let corPreenchimento = '#22c55e';

    if (status === 'Não conforme' || status === 'Bloqueada') {
      corBorda = '#dc2626';
      corPreenchimento = '#ef4444';
    } else if (status === 'Atenção' || status === 'Em análise') {
      corBorda = '#ea580c';
      corPreenchimento = '#f97316';
    }

    return {
      color: corBorda,
      weight: 2,
      fillColor: corPreenchimento,
      fillOpacity: 0.3,
      dashArray: status === 'Em análise' ? '5, 5' : undefined
    };
  }

  private vincularPopupInformativo(feature: any, layer: any): void {
    const props = feature.properties;
    const conteudoPopup = `
      <div class="vmg-map-popup" style="font-family: 'Inter', sans-serif; font-size: 12px; padding: 4px;">
        <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 13px; font-weight: 700;">Gleba ID: ${props.id_gleba}</h4>
        <p style="margin: 2px 0; color: #475569;"><strong>Cultura:</strong> ${props.cultura}</p>
        <p style="margin: 2px 0; color: #475569;"><strong>Área:</strong> ${Number(props.area).toFixed(2)} ha</p>
        <p style="margin: 2px 0; color: #475569; font-size: 11px; word-break: break-all;"><strong>CAR:</strong> ${props.codigo_car}</p>
        <div style="margin-top: 6px; padding: 4px; border-radius: 4px; text-align: center; font-weight: 700;
                    background-color: ${props.status === 'Conforme' ? '#f0fdf4' : '#fff5f5'};
                    color: ${props.status === 'Conforme' ? '#16a34a' : '#dc2626'};">
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
