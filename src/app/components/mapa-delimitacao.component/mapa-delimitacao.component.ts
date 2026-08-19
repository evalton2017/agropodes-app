import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  signal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {GlebaService} from '../../service/gleba.service';
import * as wktParser from 'terraformer-wkt-parser';

@Component({
  selector: 'app-mapa-delimitacao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './mapa-delimitacao.component.html',
  styleUrls: ['./mapa-delimitacao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapaDelimitacaoComponent implements OnInit, OnChanges {
  private glebaService = inject(GlebaService);
  private cdr = inject(ChangeDetectorRef);

  @Input({required: true}) formWizard!: FormGroup;
  @Input({required: true}) latitudeFoco: string = '-13.975810';
  @Input({required: true}) longitudeFoco: string = '-59.757567';

  // 🟢 Novo Input que recebe a geometria WKT do CAR vinda do componente pai
  @Input() wktGeometriaCar?: string;

  @Output() metricasProcessadas = new EventEmitter<{ area: number; perimetro: number }>();

  private map: any;
  private drawControl: any;
  private drawnItems: any;
  private camadaCarReferencia: any;
  private LeafletCore: any;

  // Signals que alimentam os cards de área do protótipo
  readonly areaCalculada = signal<string>('0,00 ha');
  readonly perimetroCalculado = signal<string>('0,00 m');
  readonly modoDesenhoAtivo = signal<boolean>(false);

  constructor() {
    afterNextRender(async () => {
      await this.inicializarMapaDesenho();
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // Re-desenha a camada do CAR se o Input mudar com o mapa já pronto
    if (changes['wktGeometriaCar'] && this.map) {
      this.desenharPoligonoCarReferencia();
    }
  }

  private async inicializarMapaDesenho(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;
      const L = this.LeafletCore;
      await import('leaflet-draw');

      const centro: [number, number] = [Number(this.latitudeFoco), Number(this.longitudeFoco)];

      // Inicializa o mapa com foco no centróide vindo do Passo 2
      this.map = L.map('drawMap').setView(centro, 15);

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri'
        }
      ).addTo(this.map);

      // Elementos de controle do Leaflet Draw
      this.drawnItems = new L.FeatureGroup();
      this.map.addLayer(this.drawnItems);

      this.drawControl = new L.Control.Draw({
        edit: {featureGroup: this.drawnItems, remove: true},
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: false,
            drawError: {
              color: '#e15454',
              message: 'Interceptações não permitidas'
            }
          },
          polyline: false, circle: false, rectangle: false, marker: false, circlemarker: false
        }
      });
      this.map.addControl(this.drawControl);

      this.map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        this.drawnItems.clearLayers();
        this.drawnItems.addLayer(layer);
        this.processarGeometriaDesenho(layer);
      });

      // 🟢 Desenha a camada do CAR assim que o mapa e a biblioteca estiverem prontos
      this.desenharPoligonoCarReferencia();

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.cdr.detectChanges();
        }
      }, 500);

    } catch (error) {
      console.error('Erro ao inicializar mapa de delimitação:', error);
    }
  }

  /**
   * 🟢 Desenha a geometria do CAR em formato amarelado/pontilhado no fundo
   */
  private desenharPoligonoCarReferencia(): void {
    if (!this.map || !this.wktGeometriaCar || !this.LeafletCore) return;

    // Limpa a camada anterior caso já exista
    if (this.camadaCarReferencia) {
      this.map.removeLayer(this.camadaCarReferencia);
    }

    try {
      const geoJsonGeometria = wktParser.parse(this.wktGeometriaCar);

      this.camadaCarReferencia = this.LeafletCore.geoJSON(geoJsonGeometria, {
        style: {
          color: '#f59e0b',        // Borda Amarela/Dourada em destaque
          weight: 2.5,
          dashArray: '6, 6',       // Estilo pontilhado indicando camada de referência
          fillColor: '#fbbf24',
          fillOpacity: 0.15        // Transparência suave mantendo o satélite visível
        },
        coordsToLatLng: (coords: [number, number]) => {
          return new this.LeafletCore.LatLng(coords[1], coords[0]);
        }
      }).addTo(this.map);

      // Centraliza e enquadra a câmera diretamente nos limites do imóvel do CAR
      const limites = this.camadaCarReferencia.getBounds();
      if (limites.isValid()) {
        this.map.fitBounds(limites, { padding: [30, 30] });
      }

    } catch (error) {
      console.error('Falha ao desenhar WKT do CAR como referência:', error);
    }
  }

  /**
   * Ativa o modo de desenho do polígono simulando o clique no botão lateral
   */
  ativarFerramentaDesenho(): void {
    if (!this.map) return;
    this.modoDesenhoAtivo.set(true);
    const polygonDrawer = new (window as any).L.Draw.Polygon(this.map, this.drawControl.options.draw.polygon);
    polygonDrawer.enable();
  }

  private processarGeometriaDesenho(layer: any): void {
    const geojson = layer.toGeoJSON();
    const coordenadas = geojson.geometry.coordinates[0];
    const wktPontos = coordenadas.map((c: any) => `${c[0]} ${c[1]}`).join(', ');
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
    queueMicrotask(() => {
      this.modoDesenhoAtivo.set(false);
      this.cdr.detectChanges();
    });
  }

  public forcarRecalculoTamanho(): void {
    if (!this.map) return;

    setTimeout(() => {
      this.map.invalidateSize();
      if (this.camadaCarReferencia && this.camadaCarReferencia.getBounds().isValid()) {
        this.map.fitBounds(this.camadaCarReferencia.getBounds(), { padding: [30, 30] });
      } else {
        const centro: [number, number] = [Number(this.latitudeFoco), Number(this.longitudeFoco)];
        this.map.setView(centro, 15);
      }
      this.cdr.detectChanges();
    }, 100);
  }
}
