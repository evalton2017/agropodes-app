import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  afterNextRender,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DetalhesContestacaoCompleto } from '../../model/contestacao.model';
import * as wktParser from 'terraformer-wkt-parser';

@Component({
  selector: 'app-visualizar-contestacao-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './visualizar-contestacao-modal.component.html',
  styleUrls: ['./visualizar-contestacao-modal.component.scss']
})
export class VisualizarContestacaoModalComponent implements OnChanges {
  @Input({ required: true }) contestacao!: DetalhesContestacaoCompleto;
  @Output() fechar = new EventEmitter<void>();

  private map: any;
  private LeafletCore: any;
  private camadaAlvo: any;
  private camadaContestacao: any;
  private camadaDetectada: any;

  constructor(private cdr: ChangeDetectorRef) {
    afterNextRender(() => {
      setTimeout(async () => {
        await this.inicializarMapaVisualizacao();
      }, 50);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contestacao'] && this.map) {
      this.atualizarCamadasMapa();
    }
  }

  onFechar(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.fechar.emit();
  }

  private async inicializarMapaVisualizacao(): Promise<void> {
    try {
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;
      const L = this.LeafletCore;

      const centro: [number, number] = [-15.7801, -47.9292];
      this.map = L.map('mapa-detalhe-contestacao', {
        zoomControl: true,
        attributionControl: false
      }).setView(centro, 13);

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles © Esri' }
      ).addTo(this.map);

      this.atualizarCamadasMapa();

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize(true);
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao inicializar mapa de detalhes:', error);
    }
  }

  private atualizarCamadasMapa(): void {
    if (!this.map || !this.LeafletCore || !this.contestacao) return;
    const L = this.LeafletCore;
    const boundsGroup = L.featureGroup();

    // 1. Camada da Propriedade / Gleba (AZUL)
    if (this.camadaAlvo) this.map.removeLayer(this.camadaAlvo);
    if (this.contestacao.geometria_alvo_wkt) {
      try {
        const geoJson: any = wktParser.parse(this.contestacao.geometria_alvo_wkt);
        this.camadaAlvo = L.geoJSON(geoJson, {
          style: {
            color: '#3b82f6',
            weight: 2,
            fillColor: '#60a5fa',
            fillOpacity: 0.15
          },
          coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
        }).addTo(this.map);
        boundsGroup.addLayer(this.camadaAlvo);
      } catch (e) {
        console.error('Erro ao renderizar WKT do Alvo:', e);
      }
    }

    // 2. Camada da Área Detectada / Conflito (VERMELHO)
    if (this.camadaDetectada) this.map.removeLayer(this.camadaDetectada);
    if (this.contestacao.poligono_detectado_wkt) {
      try {
        const geoJson: any = wktParser.parse(this.contestacao.poligono_detectado_wkt);
        this.camadaDetectada = L.geoJSON(geoJson, {
          style: {
            color: '#dc2626',
            weight: 3,
            fillColor: '#ef4444',
            fillOpacity: 0.4
          },
          coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
        }).addTo(this.map);
        boundsGroup.addLayer(this.camadaDetectada);
      } catch (e) {
        console.error('Erro ao renderizar WKT Detectado:', e);
      }
    }

    // 3. Camada da Área Contestada Demarcada (AMARELO)
    if (this.camadaContestacao) this.map.removeLayer(this.camadaContestacao);
    if (this.contestacao.poligono_contestacao_wkt) {
      try {
        const geoJson: any = wktParser.parse(this.contestacao.poligono_contestacao_wkt);
        this.camadaContestacao = L.geoJSON(geoJson, {
          style: {
            color: '#eab308',
            weight: 3,
            fillColor: '#facc15',
            fillOpacity: 0.35
          },
          coordsToLatLng: (coords: [number, number]) => new L.LatLng(coords[1], coords[0])
        }).addTo(this.map);
        boundsGroup.addLayer(this.camadaContestacao);
      } catch (e) {
        console.error('Erro ao renderizar WKT Contestação:', e);
      }
    }

    // Traz o polígono de contestação para o topo visual
    if (this.camadaContestacao && this.camadaContestacao.bringToFront) {
      this.camadaContestacao.bringToFront();
    }

    // Centraliza e ajusta o Zoom com base nas geometrias carregadas
    if (boundsGroup.getLayers().length > 0) {
      const bounds = boundsGroup.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }

  obterNomeArquivo(url: string): string {
    if (!url) return 'Documento Anexo';
    const partes = url.split('/');
    return partes[partes.length - 1] || 'Documento Anexo';
  }
}
