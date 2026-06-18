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
import * as WKT from 'terraformer-wkt-parser';
import {GlebaGeometriaResponse} from '../../../model/dashboard-produtor.model';

@Component({
  selector: 'app-dashboard-produtor-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-produtor-mapa.component.html',
  styleUrls: ['./dashboard-produtor-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // 🟢 Adicionado OnPush conforme seu padrão
})
export class DashboardProdutorMapaComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) glebas: GlebaGeometriaResponse[] = [];

  private cdr = inject(ChangeDetectorRef);

  private map: any;
  private geoJsonLayer: any;
  private LeafletCore: any; // Armazena a instância dinâmica do Leaflet carregada no cliente

  private readonly latPadrao = -13.975810;
  private readonly lonPadrao = -59.757567;

  constructor() {
    // 🛡️ PADRÃO HOMOLOGADO: Garante execução estrita no navegador pós-ssr
    afterNextRender(async () => {
      await this.inicializarMapaVisualizacao();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Só atualiza os polígonos se a instância do mapa já tiver sido criada pelo afterNextRender
    if (this.map && changes['glebas'] && !changes['glebas'].firstChange) {
      this.desenharPoligonosGlebas();
    }
  }

  private async inicializarMapaVisualizacao(): Promise<void> {
    try {
      // Carregamento dinâmico assíncrono do Leaflet idêntico ao seu exemplo
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;

      // Inicializa o mapa com as coordenadas globais padrão do projeto
      const centro: [number, number] = [this.latPadrao, this.lonPadrao];
      this.map = this.LeafletCore.map('vmg-leaflet-map', {
        center: centro,
        zoom: 4,
        zoomControl: true
      });

      // 🟢 CORREÇÃO: String limpa e idêntica ao seu mapa de delimitação que já funciona
      this.LeafletCore.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri',
          maxZoom: 19,
          maxNativeZoom: 18
        }
      ).addTo(this.map);

      // Inicia a camada de coleção de feições geográficas vazia
      this.geoJsonLayer = this.LeafletCore.geoJSON(null, {
        style: (feature: any) => this.obterEstiloPoligono(feature),
        onEachFeature: (feature: any, layer: any) => this.vincularPopupInformativo(feature, layer),

        // Intercepta o array [Lng, Lat] do PostGIS e mapeia para o objeto LatLng correto do Leaflet
        coordsToLatLng: (coords: [number, number]) => {
          const longitude = coords[0];
          const latitude = coords[1];
          return new this.LeafletCore.LatLng(latitude, longitude);
        }
      }).addTo(this.map);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.cdr.detectChanges();
        }
      }, 250);

      // Se os dados PostGIS já tiverem chegado antes do término da renderização do DOM, desenha
      if (this.glebas && this.glebas.length > 0) {
        this.desenharPoligonosGlebas();
      }

    } catch (error) {
      console.error('Erro ao inicializar mapa do produtor via afterNextRender:', error);
    }
  }

  private desenharPoligonosGlebas(): void {
    if (!this.map || !this.geoJsonLayer || !this.glebas || this.glebas.length === 0) return;

    this.geoJsonLayer.clearLayers();
    const recursosGeoJson: any[] = [];

    this.glebas.forEach((gleba) => {
      try {
        if (!gleba.geometria) return;
        const geoJsonGeometria = WKT.parse(gleba.geometria);

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

      const limites = this.geoJsonLayer.getBounds();
      if (limites.isValid()) {
        setTimeout(() => {
          this.map.fitBounds(limites, { padding: [30, 30] });
          this.map.invalidateSize(); // 🟢 Previne o problema do canvas cinza/cortado
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
