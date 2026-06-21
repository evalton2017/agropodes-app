import {
  Component,
  Input,
  OnInit,
  signal,
  computed,
  effect,
  afterNextRender,
  inject,
  ChangeDetectorRef, Output, EventEmitter
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {parse} from 'wellknown';
import {MunicipioResponse} from '../../pages/produtor/model/gleba.model';
import {GlebaService} from '../../pages/produtor/service/gleba.service';
import {EstadoBrasileiro, ESTADOS_BRASILEIROS} from '../../shared/model/estados.constants';

@Component({
  selector: 'app-mapa-localizacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  templateUrl: './mapa-localizacao.component.html',
  styleUrls: ['./mapa-localizacao.component.scss']
})
export class MapaLocalizacaoComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  // Inputs obrigatórios vindos do componente pai (CadastroGlebaComponent)
  @Input({required: true}) formWizard!: FormGroup;
  @Input({required: true}) listaMunicipios: MunicipioResponse[] = [];
  @Input() wktGeometriaCar: string | null | undefined = null;
  readonly listaEstados: EstadoBrasileiro[] = ESTADOS_BRASILEIROS;
  @Output() centroideCalculado = new EventEmitter<{ lat: string; lng: string }>();

  private map: any;
  readonly isMapLoaded = signal<boolean>(false);

  // Signals que alimentam o card flutuante do protótipo
  readonly latitudeCentroide = signal<string>('-09.968400');
  readonly longitudeCentroide = signal<string>('-44.416210');
  readonly termoBuscaMunicipio = signal<string>('');
  private glebaService = inject(GlebaService);

  // =========================================================================
  // 🟢 CORREÇÃO DOS ERROS DE COMPILAÇÃO (TS2349 e TS7006)
  // =========================================================================
  municipiosFiltrados = computed(() => {
    const termo = this.termoBuscaMunicipio().toLowerCase().trim();
    const todos = this.listaMunicipios;

    if (!termo || !todos) return todos || [];

    return todos.filter((m: MunicipioResponse) =>
      m.nome_municipio.toLowerCase().includes(termo) ||
      m.sigla_uf.toLowerCase().includes(termo)
    );
  });

  constructor() {
    afterNextRender(async () => {
      await this.initMapAndRender();
    });

    effect(async () => {
      const wkt = this.wktGeometriaCar;
      const mapaPronto = this.isMapLoaded();

      if (mapaPronto && wkt && wkt.trim() !== '') {
        if (this.map) {
          this.map.invalidateSize();
        }
        await this.atualizarFeicoesMapa(wkt);
      }
    });
  }

  ngOnInit(): void {
    this.formWizard.get('codigo_municipio')?.valueChanges.subscribe(codigo => {
      const municipioSelecionado = this.listaMunicipios.find(m => m.codigo_municipio === codigo);
      if (municipioSelecionado) {
        this.formWizard.patchValue({
          estado: municipioSelecionado.sigla_uf,
          bacia_hidrografica: 'Bacia do Parnaíba',
          regiao_planejamento: 'Sul Piauiense'
        });
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Inicializa o mapa base raster usando o Leaflet de forma assíncrona
   */
  private async initMapAndRender(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      const L = (leafletModule.default || leafletModule) as any;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com',
        iconUrl: 'https://unpkg.com',
        shadowUrl: 'https://unpkg.com',
      });

      this.map = L.map('modalMap').setView([0, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.isMapLoaded.set(true);

      if (this.wktGeometriaCar) {
        await this.atualizarFeicoesMapa(this.wktGeometriaCar);
      }

    } catch (error) {
      console.error('Erro na inicialização do mapa Leaflet:', error);
    }
  }

  /**
   * Processa a string WKT, converte para GeoJSON e foca a câmera nas coordenadas
   */
  private async atualizarFeicoesMapa(wkt: string): Promise<void> {
    if (!this.map) return;

    try {
      const sanitizedWkt = wkt.trim();
      const geojsonFeature = parse(sanitizedWkt);

      if (!geojsonFeature) {
        console.error('Não foi possível converter a string WKT para GeoJSON:', sanitizedWkt);
        return;
      }

      const L = (await import('leaflet')).default as any;
      const featureDinamica = geojsonFeature as any;
      let geojsonToRender: any = featureDinamica;

      if (featureDinamica && featureDinamica.type && featureDinamica.type !== 'Feature' && featureDinamica.type !== 'FeatureCollection') {
        geojsonToRender = {
          type: 'Feature',
          geometry: geojsonFeature,
          properties: {}
        };
      }

      this.map.eachLayer((layer: any) => {
        if (!!layer.toGeoJSON) {
          this.map.removeLayer(layer);
        }
      });

      const layer = L.geoJSON(geojsonToRender, {
        style: {
          color: '#2e7d32',
          weight: 3,
          opacity: 0.8,
          fillColor: '#4caf50',
          fillOpacity: 0.2
        }
      }).addTo(this.map);

      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, {padding: [20, 20]});

        const centro = bounds.getCenter();
        this.latitudeCentroide.set(centro.lat.toFixed(6));
        this.longitudeCentroide.set(centro.lng.toFixed(6));

        this.centroideCalculado.emit({
          lat: centro.lat.toFixed(6),
          lng: centro.lng.toFixed(6)
        });

        this.glebaService.geocodificarCentroide(centro.lat, centro.lng).subscribe({
          next: (dadosMunicipio) => {
            this.formWizard.patchValue({
              estado: dadosMunicipio.sigla_uf,
              codigo_municipio: dadosMunicipio.codigo_municipio
            });

            this.formWizard.get('estado')?.disable();
            this.formWizard.get('codigo_municipio')?.disable();

            this.cdr.detectChanges();
          },
          error: (err) => {
            console.warn('Coordenadas fora da malha urbana de match automático. Liberando edição manual.', err);
            // Liberação explícita de segurança caso o polígono caia em região de fronteira zerada
            this.formWizard.get('estado')?.enable();
            this.formWizard.get('codigo_municipio')?.enable();
          }
        });
      }



      this.cdr.detectChanges();

    } catch (error) {
      console.error('Erro ao atualizar feições geométricas no Leaflet:', error);
    }
  }


  recalcularCentroide(): void {
    if (this.wktGeometriaCar) {
      this.atualizarFeicoesMapa(this.wktGeometriaCar);
    }
  }

  public forcarRecalculoZoomEamanho(): void {
    if (!this.map) return;

    setTimeout(() => {
      this.map.invalidateSize();

      if (this.wktGeometriaCar) {
        this.atualizarFeicoesMapa(this.wktGeometriaCar);
      } else {
        this.map.setView([-9.968400, -44.416210], 13);
      }
    }, 150);
  }

  onFiltrarMunicipio(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.termoBuscaMunicipio.set(input.value);
    }
  }

  exibirNome(codigo: number): string {
    if (!codigo) return '';
    const m = this.listaMunicipios.find(item => item.codigo_municipio === codigo);
    return m ? `${m.nome_municipio} - ${m.sigla_uf}` : '';
  }


}
