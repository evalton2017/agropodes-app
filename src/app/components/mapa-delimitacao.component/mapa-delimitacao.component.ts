import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  afterNextRender,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { GlebaService } from '../../service/gleba.service';
import * as wktParser from 'terraformer-wkt-parser';

@Component({
  selector: 'app-mapa-delimitacao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './mapa-delimitacao.component.html',
  styleUrls: ['./mapa-delimitacao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapaDelimitacaoComponent implements OnChanges {
  private glebaService = inject(GlebaService);
  private cdr = inject(ChangeDetectorRef);

  @Input({required: true}) formWizard!: FormGroup;
  @Input({required: true}) latitudeFoco: string = '-13.975810';
  @Input({required: true}) longitudeFoco: string = '-59.757567';

  @Input() wktGeometriaImovel?: string;
  @Input() wktGeometriaPlantio?: string;

  @Output() metricasProcessadas = new EventEmitter<{ area: number; perimetro: number }>();

  private map: any;
  private drawControl: any;
  private drawnItems: any;
  private camadaImovelReferencia: any;
  private camadaPlantioReferencia: any;
  private LeafletCore: any;

  readonly areaCalculada = signal<string>('0,00 ha');
  readonly perimetroCalculado = signal<string>('0,00 m');
  readonly modoDesenhoAtivo = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      setTimeout(async () => {
        await this.inicializarMapaDesenho();
      }, 50);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const imovelAlterado = !!changes['wktGeometriaImovel'];
    const plantioAlterado = !!changes['wktGeometriaPlantio'];

    if ((imovelAlterado || plantioAlterado) && this.map) {
      this.atualizarCamadasMapa();
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize(true);
        }
      }, 50);
    }
  }

  private async inicializarMapaDesenho(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;
      const L = this.LeafletCore;

      await import('leaflet-draw');
      (window as any).type = '';

      const centro: [number, number] = [Number(this.latitudeFoco), Number(this.longitudeFoco)];
      this.map = L.map('drawMap').setView(centro, 13);

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
              color: '#3b82f6',
              weight: 3,
              fillColor: '#60a5fa',
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
          color: '#3b82f6',
          weight: 3,
          fillColor: '#60a5fa',
          fillOpacity: 0.3
        });
        this.drawnItems.clearLayers();
        this.drawnItems.addLayer(layer);
        this.processarGeometriaDesenho(layer);
      });

      this.atualizarCamadasMapa();

      requestAnimationFrame(() => {
        this.map?.invalidateSize(true);
      });

    } catch (error) {
      console.error('Erro ao inicializar mapa de delimitação:', error);
    }
  }

  private atualizarCamadasMapa(): void {
    if (!this.map || !this.LeafletCore) return;
    const L = this.LeafletCore;

    const grupoBounds = L.featureGroup();

    // 1. Renderiza a Área Total do Imóvel (VERDE)
    if (this.wktGeometriaImovel) {
      if (this.camadaImovelReferencia) {
        this.map.removeLayer(this.camadaImovelReferencia);
      }
      try {
        const geoJsonImovel: any = wktParser.parse(this.wktGeometriaImovel);
        this.camadaImovelReferencia = L.geoJSON(geoJsonImovel, {
          style: {
            color: '#16a34a',
            weight: 2,
            fillColor: '#22c55e',
            fillOpacity: 0.12
          },
          coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
        }).addTo(this.map);

        grupoBounds.addLayer(this.camadaImovelReferencia);
      } catch (e) {
        console.error('Erro ao parsear WKT do imóvel:', e);
      }
    }

    // 2. Renderiza a Produtividade Agrícola / Plantio ( AMARELO)
    if (this.wktGeometriaPlantio) {
      if (this.camadaPlantioReferencia) {
        this.map.removeLayer(this.camadaPlantioReferencia);
      }
      try {
        const geoJsonPlantio: any = wktParser.parse(this.wktGeometriaPlantio);
        this.camadaPlantioReferencia = L.geoJSON(geoJsonPlantio, {
          style: {
            color: '#eab308',
            weight: 2.5,
            dashArray: '5, 5',
            fillColor: '#facc15',
            fillOpacity: 0.25
          },
          coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
        }).addTo(this.map);

        grupoBounds.addLayer(this.camadaPlantioReferencia);
      } catch (e) {
        console.error('Erro ao parsear WKT do plantio:', e);
      }
    }

    // Enquadra a câmera abrangendo as geometrias carregadas
    if (grupoBounds.getLayers().length > 0) {
      const limites = grupoBounds.getBounds();
      if (limites.isValid()) {
        this.map.fitBounds(limites, { padding: [40, 40] });
      }
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

  private processarGeometriaDesenho(layer: any): void {
    const geojson: any = layer.toGeoJSON();
    const coordenadas: any = geojson.geometry.coordinates[0];
    const wktPontos: any = coordenadas.map((c: any) => `${c[0]} ${c[1]}`).join(', ');
    const wktConsolidado = `POLYGON((${wktPontos}))`;

    setTimeout(() => {
      this.formWizard.get('geometria')?.setValue(wktConsolidado, { emitEvent: true });
      this.cdr.markForCheck();
    }, 0);

    this.glebaService.calcularAreaGeometria(wktConsolidado).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.areaCalculada.set(`${res.area_hectares.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ha`);
          this.perimetroCalculado.set(`${res.perimetro_metros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m`);
          this.modoDesenhoAtivo.set(false);

          this.metricasProcessadas.emit({
            area: res.area_hectares,
            perimetro: res.perimetro_metros
          });

          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  limparDesenho(): void {
    if (this.drawnItems) {
      this.drawnItems.clearLayers();
    }
    this.formWizard.get('geometria')?.setValue('');
    this.areaCalculada.set('0,00 ha');
    this.perimetroCalculado.set('0,00 m');
    this.modoDesenhoAtivo.set(false);
    this.cdr.detectChanges();
  }

  public forcarRecalculoTamanho(): void {
    if (!this.map) return;
    setTimeout(() => {
      this.map.invalidateSize(true);
      if (this.camadaImovelReferencia && this.camadaImovelReferencia.getBounds().isValid()) {
        this.map.fitBounds(this.camadaImovelReferencia.getBounds(), { padding: [40, 40] });
      }
      this.cdr.detectChanges();
    }, 150);
  }
}
