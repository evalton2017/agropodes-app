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
import { CommonModule } from '@angular/common';
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

  private cdr = inject(ChangeDetectorRef);

  private map: any;
  private geoJsonLayer: any;
  private legendaControl: any; // 🟢 Control da legenda adicionado
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

      // 🟢 Cria a instância do controle da legenda nativa no canto inferior esquerdo
      this.inicializarControleLegenda();

      if (this.glebas && this.glebas.length > 0) {
        this.desenharPoligonosGlebas();
      }

    } catch (error) {
      console.error('Erro ao inicializar mapa do produtor via afterNextRender:', error);
    }
  }

  // 🟢 Método para instanciar a estrutura do controle no mapa
  private inicializarControleLegenda(): void {
    if (!this.map || !this.LeafletCore) return;

    this.legendaControl = new this.LeafletCore.Control({ position: 'bottomleft' });

    this.legendaControl.onAdd = () => {
      // Cria a div injetando a classe CSS do SCSS
      return this.LeafletCore.DomUtil.create('div', 'vmg-map-legend');
    };

    this.legendaControl.addTo(this.map);
  }

  // 🟢 Método responsável por contar e redesenhar os valores na tela
  private atualizarHTMLLegenda(): void {
    if (!this.legendaControl) return;

    const container = this.legendaControl.getContainer();
    if (!container) return;

    // Normalização dos contadores baseada na sua lógica de cores/estilo
    const totalConforme = this.glebas.filter(g => !g.status_vmg || g.status_vmg === 'Conforme').length;
    const totalAtencao = this.glebas.filter(g => g.status_vmg === 'Atenção' || g.status_vmg === 'Em análise').length;
    const totalNaoConforme = this.glebas.filter(g => g.status_vmg === 'Não conforme' || g.status_vmg === 'Bloqueada').length;

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
            id_gleba: gleba.id_gleba,
            codigo_car: gleba.codigo_car,
            area: gleba.area_hectares,
            cultura: gleba.cultura_declarada,
            status: gleba.status_vmg || 'Conforme'
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

      // 🟢 Atualiza os dados de texto da legenda sempre que o mapa plotar as feições
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
