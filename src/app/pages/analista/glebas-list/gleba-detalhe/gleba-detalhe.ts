import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import {DashboardAnalistaService} from '../../../dashboard/service/dashboard-analista.service';
import * as L from 'leaflet';

export interface GlebaDetalheDTO {
  id_gleba: number;
  codigo_gleba: string;
  produtor: string;
  cpf_cnpj: string;
  car_codigo: string;
  municipio: string;
  uf: string;
  area_ha: number;
  cultura_declarada: string;
  status_conformidade: 'Conforme' | 'Pendente' | 'Com Conflito';

  // Sensoriamento Remoto & IA
  ndvi_medio: number;
  evi_medio: number;
  veranico_dias: number;

  // Cruzamentos Geospaciais
  conflito_prodes: boolean;
  conflito_socioambiental: boolean;
  unidade_conservacao: boolean;
  terra_indigena: boolean;
  geojson_geometria: string;

  // Ledger
  ultimo_hash_ledger?: string;
  data_ultima_auditoria?: string;
}

@Component({
  selector: 'app-gleba-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './gleba-detalhe.html',
  styleUrls: ['./gleba-detalhe.scss']
})
export class AppGlebaDetalheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(DashboardAnalistaService);

  public detalhe = signal<GlebaDetalheDTO | null>(null);
  public carregando = signal<boolean>(true);
  public idGleba: number = 0;

  @ViewChild('mapaElement') mapaElement!: ElementRef;
  private mapInstance?: L.Map;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idGleba = Number(idParam);
      this.carregarDetalhes();
    } else {
      this.voltar();
    }
  }

  private carregarDetalhes(): void {
    this.carregando.set(true);
    this.apiService.obterDetalheGleba(this.idGleba)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res: GlebaDetalheDTO) => {
          this.detalhe.set(res);
          setTimeout(() => {
            if (res?.geojson_geometria) {
              this.inicializarMapaGeometria(res.geojson_geometria);
            }
          }, 0);
        },
        error: (err) => {
          console.error('Erro ao carregar detalhamento da gleba:', err);
          this.detalhe.set(null);
        }
      });
  }

  private inicializarMapaGeometria(geojsonStr?: string): void {
    if (!this.mapaElement || !geojsonStr) return;

    if (this.mapInstance) {
      this.mapInstance.remove();
    }

    // Inicializa o mapa com camada de imagem de satélite (Esri World Imagery)
    this.mapInstance = L.map(this.mapaElement.nativeElement, {
      zoomControl: true
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri, Maxar, Earthstar Geographics'
    }).addTo(this.mapInstance);

    try {
      const geojson = JSON.parse(geojsonStr);
      const camadaGleba = L.geoJSON(geojson, {
        style: {
          color: '#22c55e',
          weight: 3,
          fillColor: '#16a34a',
          fillOpacity: 0.35
        }
      }).addTo(this.mapInstance);

      // Ajusta o enquadramento do zoom automaticamente para os limites da gleba
      this.mapInstance.fitBounds(camadaGleba.getBounds(), { padding: [20, 20] });
    } catch (e) {
      console.error('Erro ao renderizar GeoJSON no mapa:', e);
    }
  }

  public emitirAtestado(): void {
    if (!confirm('Confirma a emissão do Atestado de Conformidade e registro da hash no Ledger?')) return;
    this.carregando.set(true);
    this.apiService.emitirAtestadoConformidade(this.idGleba)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => {
          alert('Atestado emitido e registrado no Ledger imutável com sucesso!');
          this.carregarDetalhes();
        },
        error: (err) => alert(`Erro ao emitir atestado: ${err?.error?.detail || 'Erro interno.'}`)
      });
  }

  public voltar(): void {
    this.router.navigate(['/glebas']);
  }

  protected obterClasseBadge(status?: string): string {
    switch (status) {
      case 'Conforme': return 'sucesso';
      case 'Pendente': return 'alerta';
      case 'Com Conflito': return 'critico';
      default: return 'padrao';
    }
  }
}
