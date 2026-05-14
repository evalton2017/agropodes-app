import { Component, OnInit, Inject, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { parse } from 'wellknown';

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

  ngOnInit(): void {}

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
      // 1. Processa o WKT de forma segura e síncrona usando o 'wellknown'
      // O resultado é um objeto GeoJSON nativo válido
      const geojsonFeature = parse(this.data.wkt);

      if (!geojsonFeature) {
        console.error('String WKT inválida ou corrompida.');
        return;
      }

      // 2. Importa o Leaflet dinamicamente apenas no ambiente do cliente (browser)
      const L = await import('leaflet');

      // 3. Inicializa o mapa estrutural
      this.map = L.map('modalMap').setView([0, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      // 4. Desenha a geometria GeoJSON gerada pelo 'wellknown'
      const layer = L.geoJSON(geojsonFeature as any, {
        style: {
          color: '#007bff',
          weight: 4,
          opacity: 0.8,
          fillColor: '#007bff',
          fillOpacity: 0.2
        }
      }).addTo(this.map);

      // 5. Enquadra o zoom do mapa na área da geometria enviada do banco
      const bounds = layer.getBounds();
      this.map.fitBounds(bounds);

      // 6. Previne bugs visuais onde o mapa renderiza em blocos cinzas dentro do modal
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);

    } catch (error) {
      console.error('Erro na inicialização do mapa:', error);
    }
  }
}
