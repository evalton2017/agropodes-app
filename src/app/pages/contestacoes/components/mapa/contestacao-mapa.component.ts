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
  private geoJsonGlebaObj: any = null;
  private camadasConflitos: any[] = [];
  private LeafletCore: any;

  readonly modoDesenhoAtivo = signal<boolean>(false);
  readonly areaGlebaHa = signal<number>(0);
  readonly areaDesenhadaHa = signal<number>(0);
  readonly erroValidacaoGleba = signal<string | null>(null);

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
              color: '#00bfff',
              weight: 3,
              fillColor: '#00bfff',
              fillOpacity: 0.4
            },
            drawError: { color: '#e15454', message: 'Interceptações não permitidas' }
          },
          polyline: false, circle: false, rectangle: false, marker: false, circlemarker: false
        }
      });
      this.map.addControl(this.drawControl);

      this.map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        this.processarEValidarGeometriaContestacao(layer);
      });

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

    // 1. Renderiza o Limite da Gleba (Fundo em Verde/Azul Transparente)
    if (this.geometriaGlebaWkt) {
      if (this.camadaGlebaReferencia) {
        this.map.removeLayer(this.camadaGlebaReferencia);
      }

      try {
        this.geoJsonGlebaObj = wktParser.parse(this.geometriaGlebaWkt);
        this.camadaGlebaReferencia = L.geoJSON(this.geoJsonGlebaObj, {
          style: {
            color: '#86efac',
            weight: 2.5,
            fillColor: '#86efac',
            fillOpacity: 0.12
          },
          coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
        }).addTo(this.map);

        const bounds = this.camadaGlebaReferencia.getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.error('Erro ao processar WKT da Gleba:', e);
      }
    }

    // 2. Renderiza os Polígonos das Detecções / Conflitos
    this.camadasConflitos.forEach((c: any) => this.map.removeLayer(c));
    this.camadasConflitos = [];

    if (this.conflitos && this.conflitos.length > 0) {
      this.conflitos.forEach(conflito => {
        // Renderiza apenas se possuir a geometria WKT válida
        if (conflito.geometria_wkt && conflito.geometria_wkt.trim() !== '') {
          try {
            const geoJsonConflito: any = wktParser.parse(conflito.geometria_wkt);
            const isSelecionado = Boolean(conflito.selecionado);

            const camadaConflito: any = L.geoJSON(geoJsonConflito, {
              style: {
                color: isSelecionado ? '#ffe600' : '#ff4d4d',
                weight: isSelecionado ? 3.5 : 2,
                fillColor: isSelecionado ? '#ffe600' : '#ff4d4d',
                fillOpacity: isSelecionado ? 0.75 : 0.45
              },
              coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
            }).addTo(this.map);

            // 🟢 Traz o polígono selecionado para a frente e centraliza no mapa
            if (isSelecionado && camadaConflito.bringToFront) {
              camadaConflito.bringToFront();
              const boundsConflito = camadaConflito.getBounds();
              if (boundsConflito.isValid()) {
                this.map.fitBounds(boundsConflito, { maxZoom: 16, padding: [50, 50] });
              }
            }

            this.camadasConflitos.push(camadaConflito);
          } catch (e) {
            console.error('Erro ao processar WKT do conflito:', e);
          }
        }
      });
    }
  }

  private processarEValidarGeometriaContestacao(layer: any): void {
    if (!this.camadaGlebaReferencia) return;

    const boundsGleba = this.camadaGlebaReferencia.getBounds();
    const boundsDesenho = layer.getBounds();

    // Valida se todo o polígono desenhado está contido no limite geográfico da Gleba
    const contidoNaGleba = boundsGleba.contains(boundsDesenho);

    if (!contidoNaGleba) {
      this.erroValidacaoGleba.set('Atenção: O polígono de contestação precisa estar totalmente DENTRO da área da Gleba.');
      this.drawnItems.clearLayers();
      this.areaDesenhadaHa.set(0);
      this.poligonoDesenhado.emit({ wkt: '', areaHa: 0 });
      return;
    }

    // Se válido, confirma o polígono
    this.erroValidacaoGleba.set(null);
    layer.setStyle({
      color: '#00bfff',
      weight: 3,
      fillColor: '#00bfff',
      fillOpacity: 0.4
    });

    this.drawnItems.clearLayers();
    this.drawnItems.addLayer(layer);

    const geoJsonDesenho = layer.toGeoJSON();
    const coordenadas: any = geoJsonDesenho.geometry.coordinates[0];
    const wktPontos: any = coordenadas.map((c: any) => `${c[0]} ${c[1]}`).join(', ');
    const wktConsolidado = `POLYGON((${wktPontos}))`;

    const L = this.LeafletCore;
    const areaM2: number = L.GeometryUtil ? L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) : 0;
    const areaHa = Number((areaM2 / 10000).toFixed(4));

    this.areaDesenhadaHa.set(areaHa);
    this.modoDesenhoAtivo.set(false);

    this.poligonoDesenhado.emit({
      wkt: wktConsolidado,
      areaHa: areaHa
    });
  }

  ativarFerramentaDesenho(): void {
    if (!this.map || !this.LeafletCore) return;
    this.modoDesenhoAtivo.set(true);
    this.erroValidacaoGleba.set(null);
    const L = this.LeafletCore;
    if (L.Draw && L.Draw.Polygon) {
      const polygonDrawer = new L.Draw.Polygon(this.map, this.drawControl.options.draw.polygon);
      polygonDrawer.enable();
    }
  }

  limparDesenho(): void {
    if (this.drawnItems) {
      this.drawnItems.clearLayers();
    }
    this.modoDesenhoAtivo.set(false);
    this.areaDesenhadaHa.set(0);
    this.erroValidacaoGleba.set(null);
    this.poligonoDesenhado.emit({ wkt: '', areaHa: 0 });
  }
}
