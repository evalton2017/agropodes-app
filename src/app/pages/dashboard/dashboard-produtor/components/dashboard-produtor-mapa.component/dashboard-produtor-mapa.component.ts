import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GlebaGeometriaResponse} from '../../../model/dashboard-produtor.model';

@Component({
  selector: 'app-dashboard-produtor-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-produtor-mapa.component.html',
  styleUrls: ['./dashboard-produtor-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProdutorMapaComponent implements OnChanges, OnDestroy {

  @Input({required: true})
  glebas: GlebaGeometriaResponse[] = [];

  private map: any;
  private geoJsonLayer: any;
  private L: any;

  private readonly latPadrao = -13.975810;
  private readonly lonPadrao = -59.757567;

  constructor() {
    afterNextRender(async () => {
      await this.inicializarMapa();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.map &&
      changes['glebas']
    ) {
      this.desenharGlebas();
    }
  }

  private async inicializarMapa(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.L = leafletModule.default || leafletModule;
      this.map = this.L.map('vmg-leaflet-map', {
        center: [this.latPadrao, this.lonPadrao],
        zoom: 4,
        zoomControl: true
      });

      this.L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri',
          maxZoom: 19,
          maxNativeZoom: 18
        }
      ).addTo(this.map);

      this.geoJsonLayer = this.L.geoJSON(null, {
        style: (feature: any) => this.obterEstilo(feature),
        onEachFeature: (feature: any, layer: any) =>          this.criarPopup(feature, layer),

        coordsToLatLng: (coords: [number, number]) => {

          return this.L.latLng(coords[1], coords[0]);

        }

      }).addTo(this.map);

      setTimeout(() => {

        this.map.invalidateSize(true);

        this.desenharGlebas();

      }, 500);

    } catch (e) {

      console.error(e);

    }

  }

  private desenharGlebas(): void {

    if (!this.map || !this.geoJsonLayer) {

      return;

    }

    this.geoJsonLayer.clearLayers();

    if (!this.glebas || this.glebas.length === 0) {

      this.map.setView(
        [

          this.latPadrao,

          this.lonPadrao

        ],

        4
      );

      return;

    }

    const features: any[] = [];

    this.glebas.forEach(gleba => {

      if (!gleba.geometria) {

        return;

      }

      try {

        const geometry = gleba.geometria;

        features.push({

          type: 'Feature',

          geometry,

          properties: {

            id_gleba: gleba.id_gleba,

            codigo_car: gleba.codigo_car,

            area: gleba.area_hectares,

            cultura: gleba.cultura_declarada,

            status: gleba.status_vmg ?? 'Conforme'

          }

        });

      } catch (e) {

        console.error("Erro ao converter WKT", e);

      }

    });

    this.geoJsonLayer.addData({

      type: 'FeatureCollection',

      features

    });

    const bounds = this.geoJsonLayer.getBounds();

    if (!bounds.isValid()) {

      return;

    }

    if (this.glebas.length === 1) {

      const centro = bounds.getCenter();

      this.map.setView(
        [

          centro.lat,

          centro.lng

        ],

        16
      );

    } else {

      this.map.fitBounds(
        bounds,

        {

          padding: [40, 40],

          maxZoom: 15

        }
      );

    }

    setTimeout(() => {

      this.map.invalidateSize(true);

    }, 100);

  }

  private obterEstilo(feature: any): any {

    const status = feature.properties.status;

    switch (status) {

      case 'Não conforme':

      case 'Bloqueada':

        return {

          color: '#dc2626',

          weight: 2,

          fillColor: '#ef4444',

          fillOpacity: 0.35

        };

      case 'Atenção':

      case 'Em análise':

        return {

          color: '#ea580c',

          weight: 2,

          fillColor: '#f97316',

          fillOpacity: 0.35,

          dashArray: '5,5'

        };

      default:

        return {

          color: '#15803d',

          weight: 2,

          fillColor: '#22c55e',

          fillOpacity: 0.35

        };

    }

  }

  private criarPopup(feature: any, layer: any): void {

    const p = feature.properties;

    layer.bindPopup(`

      <div style="font-family:Inter;padding:8px;min-width:220px;">

        <h4 style="margin:0 0 8px 0;">
          Gleba ${p.id_gleba}
        </h4>

        <b>Cultura:</b> ${p.cultura}<br>

        <b>Área:</b> ${Number(p.area).toFixed(2)} ha<br>

        <b>CAR:</b><br>

        <small>${p.codigo_car}</small>

        <hr>

        <b>Status:</b>

        ${p.status}

      </div>

    `);

  }

  ngOnDestroy(): void {

    if (this.map) {

      this.map.remove();

    }

  }

}
