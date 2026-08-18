// app/dashboard-produtor/components/dashboard-gleba-detalhe/dashboard-gleba-detalhe.component.ts
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import * as L from 'leaflet';
import wellknown from 'wellknown';
import * as wktParser from 'terraformer-wkt-parser';
import {GlebaData} from '../../model/gleba.model';


@Component({
  selector: 'app-gleba-detalhe',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './gleba-detalhe.html',
  styleUrls: ['./gleba-detalhe.scss']
})
export class GlebaDetalheComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) gleba!: GlebaData;

  // Injeção do token do ciclo de plataforma para identificar se estamos no Servidor ou no Navegador
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  private map: any; // Tipado como 'any' para não exigir o import estático do Leaflet no topo
  private geoJsonLayer: any;
  private idMapaUnico = `mini-mapa-gleba-detalhe`;
  private LeafletCore: any;
  private readonly latPadrao = -13.975810;
  private readonly lonPadrao = -59.757567;

  ngOnChanges(changes: SimpleChanges): void {
    // Só tenta manipular o mapa se estiver rodando no navegador do cliente
    if (isPlatformBrowser(this.platformId) && changes['gleba'] && !changes['gleba'].firstChange) {
      this.atualizarMapaGeometria();
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.inicializarMiniMapa();
  }

  private async inicializarMiniMapa(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;

      const centro: [number, number] = [this.latPadrao, this.lonPadrao];
      this.map = this.LeafletCore.map('mini-mapa-gleba-detalhe', {
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
      //  onEachFeature: (feature: any, layer: any) => this.vincularPopupInformativo(feature, layer),
        coordsToLatLng: (coords: [number, number]) => {
          const longitude = coords[0];
          const latitude = coords[1];
          return new this.LeafletCore.LatLng(latitude, longitude);
        }
      }).addTo(this.map);

      if (this.gleba) {
        this.desenharPoligonosGlebas();
      }

    } catch (error) {
      console.error('Erro ao inicializar mapa do produtor via afterNextRender:', error);
    }
  }

  private atualizarMapaGeometria(): void {
    if (!this.map || !this.gleba.idGleba) return;

    this.geoJsonLayer.clearLayers();
    try {
      const geoJsonData = wellknown.parse(this.gleba.geometria);
      this.geoJsonLayer.addData(geoJsonData as any);

      const limites = this.geoJsonLayer.getBounds();
      if (limites.isValid()) {
        this.map.fitBounds(limites, { padding: [15, 15] });
      }
    } catch (e) {
      console.error('Erro ao processar WKT no mini-mapa:', e);
    }
  }

  public copiarCar(codigoCar: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(codigoCar);
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

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private desenharPoligonosGlebas(): void {
    if (!this.map || !this.geoJsonLayer || !this.gleba ) return;

    this.geoJsonLayer.clearLayers();
    const recursosGeoJson: any[] = [];

      try {
        if (!this.gleba.geometria) return;
        const geoJsonGeometria = wktParser.parse(this.gleba.geometria);

        recursosGeoJson.push({
          type: 'Feature',
          geometry: geoJsonGeometria,
          properties: {
            id_gleba: this.gleba.idGleba,
            codigo_car: this.gleba.codigoCar,
            cultura: this.gleba.culturaDeclarada,
          }
        });
      } catch (error) {
        console.error(`Falha ao converter WKT no dashboard:`, error);
      }

    if (recursosGeoJson.length > 0) {
      // 1. Alimenta as feições espaciais na camada GeoJSON primeiro
      this.geoJsonLayer.addData({
        type: 'FeatureCollection',
        features: recursosGeoJson
      } as any);

      // 2. CORREÇÃO CRÍTICA: Aplica a função de estilo LOGO APÓS os dados existirem na camada
      this.geoJsonLayer.setStyle((feature: any) => {
        const statusVmg = feature?.properties?.status;

        if (statusVmg === 'NAO_CONFORME') {
          return {
            color: '#dc2626',       // Borda Vermelha (Inconformidade Crítica)
            fillColor: '#ef4444',   // Preenchimento Vermelho translúcido
            fillOpacity: 0.35,
            weight: 2
          };
        } else if (statusVmg === 'ATENCAO') {
          return {
            color: '#ea580c',       // Borda Laranja
            fillColor: '#f97316',   // Preenchimento Laranja
            fillOpacity: 0.35,
            weight: 2
          };
        } else {
          return {
            color: '#16a34a',       // Borda Verde Agro Brasil
            fillColor: '#22c55e',   // Preenchimento Verde
            fillOpacity: 0.3,
            weight: 2
          };
        }
      });

      const limites = this.geoJsonLayer.getBounds();
      if (limites.isValid()) {
        setTimeout(() => {
          this.map.fitBounds(limites, {padding: [30, 30]});
          this.map.invalidateSize();
          this.cdr.detectChanges();
        }, 50);
      }
    }
  }

  public obterClasseNo(status: string): string {
    if (!status) return 'todo';
    switch (status.toUpperCase()) {
      case 'CONCLUIDO': return 'done';
      case 'EM_ANDAMENTO': return 'working';
      case 'FORA_ZARC': return 'alert-node'; // Vermelho/Alerta para erros agroclimáticos
      case 'PENDENTE':
      default: return 'todo';
    }
  }

  public obterIconeNo(status: string): string {
    if (!status) return 'radio_button_unchecked';
    switch (status.toUpperCase()) {
      case 'CONCLUIDO': return 'check_circle';
      case 'EM_ANDAMENTO': return 'schedule';
      case 'FORA_ZARC': return 'gpp_bad'; // Ícone de bloqueio/inconformidade
      case 'PENDENTE':
      default: return 'radio_button_unchecked';
    }
  }

  public obterTextoNo(status: string): string {
    if (!status) return 'Pendente';
    switch (status.toUpperCase()) {
      case 'CONCLUIDO': return 'Concluído';
      case 'EM_ANDAMENTO': return 'Em andamento';
      case 'FORA_ZARC': return 'Fora ZARC';
      case 'PENDENTE':
      default: return 'Pendente';
    }
  }

  public obterClasseConector(statusAtual: string, proximoStatus: string): string {
    if (!statusAtual || !proximoStatus) return 'todo';

    const atual = statusAtual.toUpperCase();
    const proximo = proximoStatus.toUpperCase();

    if (atual === 'CONCLUIDO' && proximo === 'CONCLUIDO') return 'done';
    if (atual === 'CONCLUIDO' && proximo === 'EM_ANDAMENTO') return 'in-progress';
    if (atual === 'FORA_ZARC' || proximo === 'FORA_ZARC') return 'alert-line'; // Linha de fluxo vermelha
    return 'todo';
  }

}
