import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  afterNextRender,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as wktParser from 'terraformer-wkt-parser';

@Component({
  selector: 'app-contestacao-mapa',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './contestacao-mapa.component.html',
  styleUrls: ['./contestacao-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContestacaoMapaComponent implements OnChanges {
  @Input() geometriaGlebaWkt?: string;
  @Input() conflitos: any[] = [];
  @Output() poligonoDesenhado = new EventEmitter<{ wkt: string; areaHa: number }>();

  private map: any;
  private drawControl: any;
  private drawnItems: any;
  private camadaGlebaReferencia: any;
  private camadasConflitos: any[] = [];
  private LeafletCore: any;

  readonly modoDesenhoAtivo = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      setTimeout(async () => {
        await this.inicializarMapaContestacao();
      }, 50);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const geometriaAlterada = !!changes['geometriaGlebaWkt'];
    const conflitosAlterados = !!changes['conflitos'];

    if ((geometriaAlterada || conflitosAlterados) && this.map) {
      this.atualizarCamadasMapa();

      // 🟢 Força o Leaflet e o navegador a redesenhar o mapa instantaneamente
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize(true);
        }
      }, 50);
    }
  }

  private async inicializarMapaContestacao(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;
      const L = this.LeafletCore;

      await import('leaflet-draw');

      // 🟢 Corrige o bug global do leaflet-draw no Vite/Webpack
      (window as any).type = '';

      const centro: [number, number] = [-15.7801, -47.9292];
      this.map = L.map('contestacaoMap').setView(centro, 13);

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri' }
      ).addTo(this.map);

      this.drawnItems = new L.FeatureGroup();
      this.map.addLayer(this.drawnItems);

      this.drawControl = new L.Control.Draw({
        edit: { featureGroup: this.drawnItems, remove: true },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: '#eab308',
              weight: 3,
              fillColor: '#facc15',
              fillOpacity: 0.3
            },
            drawError: { color: '#e15454', message: 'Interceptações não permitidas' }
          },
          polyline: false, circle: false, rectangle: false, marker: false, circlemarker: false
        }
      });
      this.map.addControl(this.drawControl);

      this.map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        layer.setStyle({
          color: '#eab308',
          weight: 3,
          fillColor: '#facc15',
          fillOpacity: 0.3
        });
        this.drawnItems.clearLayers();
        this.drawnItems.addLayer(layer);
        this.processarGeometriaContestacao(layer);
      });

      // Renderiza imediatamente o estado atual caso a API já tenha respondido
      this.atualizarCamadasMapa();

      requestAnimationFrame(() => {
        this.map?.invalidateSize(true);
      });

    } catch (error) {
      console.error('Erro ao inicializar mapa de contestação:', error);
    }
  }

  private atualizarCamadasMapa(): void {
    if (!this.map || !this.LeafletCore) return;
    const L = this.LeafletCore;

    // 1. Renderiza a Gleba de Referência (AZUL) primeiro (fica embaixo)
    if (this.geometriaGlebaWkt) {
      if (this.camadaGlebaReferencia) {
        this.map.removeLayer(this.camadaGlebaReferencia);
      }

      try {
        const geoJsonGleba: any = wktParser.parse(this.geometriaGlebaWkt);
        this.camadaGlebaReferencia = L.geoJSON(geoJsonGleba, {
          style: {
            color: '#3b82f6',
            weight: 2,
            fillColor: '#60a5fa',
            fillOpacity: 0.1 // Deixa bem transparente para não esconder o que está em cima
          },
          coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
        }).addTo(this.map);

        const bounds = this.camadaGlebaReferencia.getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.error('Erro ao parsear WKT da gleba:', e);
      }
    }

    // 2. Renderiza os Conflitos / PRODES DEPOIS (fica por cima, em Vermelho Destaque)
    this.camadasConflitos.forEach((c: any) => this.map.removeLayer(c));
    this.camadasConflitos = [];

    if (this.conflitos && this.conflitos.length > 0) {
      this.conflitos.forEach(conflito => {
        if (conflito.geometria_wkt) {
          try {
            const geoJsonConflito: any = wktParser.parse(conflito.geometria_wkt);
            const isSelecionado = Boolean(conflito.selecionado);

            const camadaConflito: any = L.geoJSON(geoJsonConflito, {
              style: {
                color: isSelecionado ? '#dc2626' : '#9ca3af',      // Vermelho forte se selecionado
                weight: isSelecionado ? 3.5 : 1,
                fillColor: '#ef4444',
                fillOpacity: isSelecionado ? 0.45 : 0.02          // Preenchimento visível em vermelho
              },
              coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
            }).addTo(this.map);

            // Garante que o conflito fique graficamente por cima da gleba se estiver selecionado
            if (isSelecionado && camadaConflito.bringToFront) {
              camadaConflito.bringToFront();
            }

            this.camadasConflitos.push(camadaConflito);
          } catch (e) {
            console.error('Erro ao parsear WKT do conflito:', e);
          }
        }
      });
    }
  }

  ativarFerramentaDesenho(): void {
    if (!this.map || !this.LeafletCore) return;
    this.modoDesenhoAtivo.set(true);
    const L = this.LeafletCore;
    if (L.Draw && L.Draw.Polygon) {
      const polygonDrawer = new L.Draw.Polygon(this.map, this.drawControl.options.draw.polygon);
      polygonDrawer.enable();
    }
  }

  private processarGeometriaContestacao(layer: any): void {
    const geojson: any = layer.toGeoJSON();
    const coordenadas: any = geojson.geometry.coordinates[0];
    const wktPontos: any = coordenadas.map((c: any) => `${c[0]} ${c[1]}`).join(', ');
    const wktConsolidado = `POLYGON((${wktPontos}))`;

    const L = this.LeafletCore;
    const areaMetrosQuadrados: number = L.GeometryUtil ? L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) : 0;
    const areaHectares: number = areaMetrosQuadrados / 10000;

    this.modoDesenhoAtivo.set(false);
    this.poligonoDesenhado.emit({
      wkt: wktConsolidado,
      areaHa: Number(areaHectares.toFixed(4))
    });
  }

  limparDesenho(): void {
    if (this.drawnItems) {
      this.drawnItems.clearLayers();
    }
    this.modoDesenhoAtivo.set(false);
    this.poligonoDesenhado.emit({ wkt: '', areaHa: 0 });
  }
}
