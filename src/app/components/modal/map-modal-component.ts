import {Component, OnInit, Inject, AfterViewInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {parse} from 'wellknown';

@Component({
  selector: 'app-map-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Visualização do Mapa</h2>
    <mat-dialog-content>
      <div id="modalMap" style="height: 450px; width: 550px; min-width: 100%;"></div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `
})
export class MapModalComponent implements OnInit, AfterViewInit {
  private map: any;
  private isBrowser: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { wkt: string },
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Isola o Leaflet (que exige obrigatoriamente a 'window') apenas no navegador
    if (this.isBrowser) {
      setTimeout(() => {
        this.initMapAndRender();
      }, 50);
    }
  }

  private async initMapAndRender(): Promise<void> {
    try {
      if (!this.data || !this.data.wkt) {
        console.error('WKT não fornecido ou está nulo.');
        return;
      }

      const sanitizedWkt = this.data.wkt.trim();
      const geojsonFeature = parse(sanitizedWkt);

      if (!geojsonFeature) {
        console.error('Não foi possível converter a string WKT para GeoJSON:', sanitizedWkt);
        return;
      }

      // CORREÇÃO: Importa resolvendo a compatibilidade do módulo ESM / CommonJS (.default)
      const leafletModule = await import('leaflet');
      const L = (leafletModule.default || leafletModule) as any;

      // Garante a correção de caminhos de ícones padrões quebrados pelo build/Webpack no Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'unpkg.com',
        iconUrl: 'unpkg.com',
        shadowUrl: 'unpkg.com',
      });

      // Inicializa o mapa com o container validado
      this.map = L.map('modalMap').setView([0, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      const rawGeojson = geojsonFeature as any;
      let geojsonToRender: any = rawGeojson;

      if (rawGeojson && rawGeojson.type && rawGeojson.type !== 'Feature' && rawGeojson.type !== 'FeatureCollection') {
        geojsonToRender = {
          type: 'Feature',
          geometry: rawGeojson,
          properties: {}
        };
      }

      const layer = L.geoJSON(geojsonToRender, {
        style: {
          color: '#007bff',
          weight: 4,
          opacity: 0.8,
          fillColor: '#007bff',
          fillOpacity: 0.2
        }
      }).addTo(this.map);

      const geometryType = geojsonToRender.geometry ? geojsonToRender.geometry.type : geojsonToRender.type;
      const coordinates = geojsonToRender.geometry ? geojsonToRender.geometry.coordinates : geojsonToRender.coordinates;

      if (geometryType === 'Point' && coordinates) {
        this.map.setView([coordinates[1], coordinates[0]], 15);
      } else {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds);
        }
      }

    } catch (error) {
      console.error('Erro na inicialização do mapa:', error);
    }
  }

}
