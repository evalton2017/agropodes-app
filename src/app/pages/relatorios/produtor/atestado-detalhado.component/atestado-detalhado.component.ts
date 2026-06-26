import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ChangeDetectorRef, inject
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {AtestadoDetalhadoResponse} from '../relatorio-produtor.model';

import * as wktParser from 'terraformer-wkt-parser';
import {RelatorioService} from '../../relatorio.service';

@Component({
  selector: 'app-atestado-detalhado',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './atestado-detalhado.component.html',
  styleUrls: ['./atestado-detalhado.component.scss']
})
export class AtestadoDetalhadoComponent implements OnChanges, AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly relatorioService: RelatorioService = inject(RelatorioService);

  @Input({required: true}) dadosAtestado!: AtestadoDetalhadoResponse;
  @Input({required: true}) gleba!: any;
  public atestado = signal<AtestadoDetalhadoResponse | null>(null);
  public gerandoPdf = signal<boolean>(false);

  private map: any;
  private geoJsonLayer: any;
  private LeafletCore: any;
  private readonly latPadrao = -13.975810;
  private readonly lonPadrao = -59.757567;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dadosAtestado'] && this.dadosAtestado) {
      this.atestado.set(this.dadosAtestado);

      if (isPlatformBrowser(this.platformId) && !changes['dadosAtestado'].firstChange) {
        this.desenharPoligonosGlebas();
      }
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
        zoomControl: true,
        attributionControl: false
      });

      // Camada de Imagem de Satélite do ArcGIS Online (Idêntico à imagem)
      this.LeafletCore.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri',
          maxZoom: 19,
          maxNativeZoom: 18
        }
      ).addTo(this.map);

      this.geoJsonLayer = this.LeafletCore.geoJSON(null, {
        coordsToLatLng: (coords: [number, number]) => {
          return new this.LeafletCore.LatLng(coords[1], coords[0]); // Mapeamento correto: [Lat, Lng]
        }
      }).addTo(this.map);

      if (this.dadosAtestado) {
        this.desenharPoligonosGlebas();
      }

    } catch (error) {
      console.error('Erro ao inicializar mapa satelitário via Leaflet:', error);
    }
  }

  private desenharPoligonosGlebas(): void {
    if (!this.map || !this.geoJsonLayer || !this.dadosAtestado) return;

    this.geoJsonLayer.clearLayers();
    const recursosGeoJson: any[] = [];

    try {
      if (!this.gleba.wkt || this.gleba.wkt.includes('S')) return;

      const geoJsonGeometria = wktParser.parse(this.gleba.wkt);

      recursosGeoJson.push({
        type: 'Feature',
        geometry: geoJsonGeometria,
        properties: {
          id_gleba: this.dadosAtestado.cabecalho.nome_gleba,
          status_vmg: this.dadosAtestado.cabecalho.status_atestado
        }
      });
      this.cdr.detectChanges();
    } catch (error) {
      console.error(`Falha ao converter string WKT no mapa do atestado:`, error);
    }

    if (recursosGeoJson.length > 0) {
      this.geoJsonLayer.addData({
        type: 'FeatureCollection',
        features: recursosGeoJson
      } as any);

      // Aplica a estilização dinâmica com base nas regras de conformidade da Portaria 739/2025
      this.geoJsonLayer.setStyle((feature: any) => {
        const statusVmg = feature?.properties?.status_vmg;

        if (statusVmg === 'REPROVADO' || statusVmg === 'NÃO APTO') {
          return {
            color: '#dc2626',       // Vermelho
            fillColor: '#ef4444',
            fillOpacity: 0.35,
            weight: 2
          };
        } else if (statusVmg === 'PENDENTE' || statusVmg === 'EM ANÁLISE') {
          return {
            color: '#ea580c',       // Laranja
            fillColor: '#f97316',
            fillOpacity: 0.35,
            weight: 2,
            dashArray: '5, 5'
          };
        } else {
          return {
            color: '#16a34a',       // Verde Agro Brasil
            fillColor: '#22c55e',
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

  public copiarTexto(texto: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(texto);
      alert('Informação copiada!');
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  public gerarPdfAtestado(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.gerandoPdf.set(true);
    console.log(this.gleba.id_gleba)

    this.relatorioService.exportarAtestadoPdf(this.gleba.id_gleba)
      .subscribe({
        next: (arquivoBlob: Blob) => {
          const urlBlob = window.URL.createObjectURL(arquivoBlob);
          const gatilhoDownload = document.createElement('a');

          gatilhoDownload.href = urlBlob;
          gatilhoDownload.download = `Atestado_VMG_Gleba_${this.gleba.id_gleba}.pdf`;
          document.body.appendChild(gatilhoDownload);
          gatilhoDownload.click();
          document.body.removeChild(gatilhoDownload);
          window.URL.revokeObjectURL(urlBlob);

          this.gerandoPdf.set(false);
        },
        error: (err) => {
          console.error('Falha ao baixar PDF processado no servidor Python:', err);
          alert('Não foi possível gerar o PDF oficial de auditoria. Tente novamente mais tarde.');
          this.gerandoPdf.set(false);
        }
      });
  }


  get periodoFormatado(): string {
    if (!this.atestado()?.cabecalho.periodo_analisado) return '';

    return this.atestado()!!.cabecalho.periodo_analisado
      .split(' a ')
      .map(data => {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
      })
      .join(' a '); // Junta novamente: "25/10/2026 a 23/06/2026"
  }

}
