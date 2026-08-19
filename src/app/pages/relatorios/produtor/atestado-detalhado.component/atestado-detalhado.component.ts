import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AtestadoDetalhadoResponse } from '../relatorio-produtor.model';
import * as wktParser from 'terraformer-wkt-parser';
import { RelatorioService } from '../../relatorio.service';

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
  private readonly relatorioService = inject(RelatorioService);

  @Input({ required: true }) dadosAtestado!: AtestadoDetalhadoResponse;
  @Input({ required: true }) gleba!: any;

  public atestado = signal<AtestadoDetalhadoResponse | null>(null);
  public gerandoPdf = signal<boolean>(false);

  private map: any;
  private geoJsonLayer: any;
  private LeafletCore: any;
  private readonly latPadrao = -13.975810;
  private readonly lonPadrao = -59.757567;

  ngOnChanges(changes: SimpleChanges): void {
    // Sempre que os dadosAtestado mudarem, atualiza o Signal reativo
    if (changes['dadosAtestado'] && this.dadosAtestado) {
      this.atestado.set(this.dadosAtestado);

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          if (this.map) {
            this.desenharPoligonosGlebas();
          } else {
            this.inicializarMiniMapa();
          }
        }, 100);
      }
    }

    // Se o objeto de gleba mudar, força a re-renderização das geometrias
    if (changes['gleba'] && !changes['gleba'].firstChange) {
      if (isPlatformBrowser(this.platformId) && this.map) {
        setTimeout(() => this.desenharPoligonosGlebas(), 150);
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

      const elMapa = document.getElementById('mini-mapa-gleba-detalhe');
      if (!elMapa) return;

      if (this.map) {
        this.map.remove();
      }

      // Centro inicial temporário (MG)
      this.map = this.LeafletCore.map('mini-mapa-gleba-detalhe', {
        center: [-20.876843, -47.073092],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      // Camada ArcGIS World Imagery
      this.LeafletCore.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri', maxZoom: 19, maxNativeZoom: 18 }
      ).addTo(this.map);

      // 🟢 Garante a conversão [Lng, Lat] (GeoJSON) -> [Lat, Lng] (Leaflet)
      this.geoJsonLayer = this.LeafletCore.geoJSON(null, {
        coordsToLatLng: (coords: [number, number]) => {
          return new this.LeafletCore.LatLng(coords[1], coords[0]);
        }
      }).addTo(this.map);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.desenharPoligonosGlebas();
        }
      }, 200);

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
    }
  }

  private desenharPoligonosGlebas(): void {
    if (!this.map || !this.geoJsonLayer || !this.dadosAtestado) return;

    this.geoJsonLayer.clearLayers();
    const recursosGeoJson: any[] = [];

    try {
      // 1. Extrai a string WKT prioritariamente do bloco informacoes_gerais ou da gleba
      const stringWkt = this.dadosAtestado?.informacoes_gerais?.geometria_wkt ||
        (this.dadosAtestado as any)?.geometria_wkt ||
        this.gleba?.wkt ||
        this.gleba?.geometria ||
        this.dadosAtestado?.informacoes_gerais?.coordenadas_centroide;

      if (!stringWkt) {
        console.warn('Nenhuma geometria WKT encontrada para renderizar no mapa.');
        return;
      }

      // 2. Converte WKT para GeoJSON
      const geoJsonGeometria = wktParser.parse(stringWkt);

      recursosGeoJson.push({
        type: 'Feature',
        geometry: geoJsonGeometria,
        properties: {
          id_gleba: this.dadosAtestado.cabecalho?.nome_gleba,
          status_vmg: this.dadosAtestado.cabecalho?.status_atestado
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao processar WKT da gleba:', error);
    }

    if (recursosGeoJson.length > 0) {
      // 3. Adiciona o polígono à camada com inversão de Coordenadas [Lat, Lng]
      this.geoJsonLayer.addData({
        type: 'FeatureCollection',
        features: recursosGeoJson
      } as any);

      // 4. Estilização dinâmica do Polígono
      this.geoJsonLayer.setStyle((feature: any) => {
        const statusVmg = feature?.properties?.status_vmg;

        if (statusVmg === 'REPROVADO' || statusVmg === 'NÃO APTO') {
          return { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 3 };
        } else if (statusVmg === 'PENDENTE' || statusVmg === 'EM ANÁLISE') {
          return { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.35, weight: 3, dashArray: '6, 6' };
        } else {
          return { color: '#00ff66', fillColor: '#22c55e', fillOpacity: 0.35, weight: 3 };
        }
      });

      // 5. Ajuste de Enquadramento e Zoom Centralizado na Gleba
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          const limites = this.geoJsonLayer.getBounds();

          if (limites.isValid()) {
            // Enquadra o polígono da gleba com margem
            this.map.fitBounds(limites, { padding: [30, 30], maxZoom: 17 });
          } else {
            // Fallback para as coordenadas do centróide de São Sebastião do Paraíso/MG
            this.map.setView([-20.876843, -47.073092], 15);
          }
          this.cdr.detectChanges();
        }
      }, 150);
    }
  }

  public copiarTexto(texto: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(texto);
      alert('Informação copiada!');
    }
  }

  public gerarPdfAtestado(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.gerandoPdf.set(true);

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
          console.error('Falha ao baixar PDF:', err);
          alert('Não foi possível gerar o PDF oficial.');
          this.gerandoPdf.set(false);
        }
      });
  }

  get periodoFormatado(): string {
    const periodo = this.atestado()?.cabecalho?.periodo_analisado;
    if (!periodo) return 'Não informado';

    return periodo
      .split(' a ')
      .map(data => {
        const partes = data.split('-');
        return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
      })
      .join(' a ');
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
