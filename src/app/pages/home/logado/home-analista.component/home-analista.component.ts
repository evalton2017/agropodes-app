import { AfterViewInit, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

// Serviços e Modelos
import { Territorio } from '../../../territorio/consulta-territorio.component/consulta-territorio.component';
import { Analise } from '../../../../model/analise';
import { DashboardService } from '../../../../service/dashboard.service';

export interface DashboardAnalistaData {
  territorios: Territorio[];
  analiseProdes: Analise[];
}

@Component({
  selector: 'home-analista',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './home-analista.component.html',
  styleUrls: ['./home-analista.component.scss']
})
export class HomeAnalistaComponent implements OnInit, AfterViewInit {
  private service = inject(DashboardService);
  private platformId = inject(PLATFORM_ID);

  private map: any;
  private L: any;

  dadosDashboard = signal<DashboardAnalistaData | null>(null);
  carregando = signal<boolean>(true);
  erro = signal<string | null>(null);

  colunasTerritorio: string[] = ['id', 'nomePropriedade', 'numeroCar'];
  colunasAnalise: string[] = ['idAnalise', 'statusAnalise', 'analisado'];

  totalTerritorios = computed(() => this.dadosDashboard()?.territorios.length || 0);
  totalAnalises = computed(() => this.dadosDashboard()?.analiseProdes.length || 0);

  statusContagem = computed(() => {
    const list = this.dadosDashboard()?.analiseProdes || [];
    return {
      emAnalise: list.filter(a => a.statusAnalise === 'EM_ANALISE').length,
      comPendencia: list.filter(a => a.statusAnalise === 'COM_PENDENCIA').length,
      aprovado: list.filter(a => a.statusAnalise === 'APROVADO').length,
      reprovado: list.filter(a => a.statusAnalise === 'REPROVADO').length
    };
  });

  ngOnInit(): void {
    this.service.consultaDashboard().subscribe({
      next: async (res: DashboardAnalistaData) => {
        this.dadosDashboard.set(res);
        this.carregando.set(false); // 1. Desliga o carregando e força o Angular a renderizar a div do mapa

        // 2. Aguarda um ciclo microtask mínimo para o Angular criar o elemento DOM
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.inicializarEPlotarMapa();
          }, 50);
        }
      },
      error: (err) => {
        this.erro.set('Erro ao carregar dados do painel do analista.');
        this.carregando.set(false);
        console.error(err);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      // Carrega o módulo da biblioteca Leaflet dinamicamente no carregamento da página
      this.L = await import('leaflet');
    }
  }

  private inicializarEPlotarMapa(): void {
    if (!this.L || this.map) return; // Evita inicializar duplicado se houver múltiplos disparos

    const mapContainer = document.getElementById('mapa-analista');
    if (!mapContainer) {
      console.warn('Container do mapa ainda não encontrado no DOM.');
      return;
    }

    // Inicializa o mapa efetivamente
    this.map = this.L.map('mapa-analista', {
      center: [-14.235, -51.9253],
      zoom: 4
    });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Plota os polígonos logo após a criação da instância do mapa
    this.plotarPoligonosNoMapa();
  }

  private plotarPoligonosNoMapa(): void {
    if (!this.map || !this.L || !this.dadosDashboard()) return;

    const dados = this.dadosDashboard();

    dados?.territorios.forEach(t => {
      if (t.poligono) {
        try {
          const coordenadas = this.converterWktParaLatLng(t.poligono);

          if (coordenadas.length > 0) {
            this.L.polygon(coordenadas, {
              color: '#3f51b5',
              weight: 3,
              fillColor: '#3f51b5',
              fillOpacity: 0.3
            })
              .addTo(this.map)
              .bindPopup(`<b>Propriedade:</b> ${t.nomePropriedade}<br><b>CAR:</b> ${t.numeroCar}`);
          }
        } catch (e) {
          console.error('Falha ao processar polígono do território ID:', t.id, e);
        }
      }
    });
  }

  private converterWktParaLatLng(wkt: string): any[] {
    try {
      // 1. Tratamento se for um GeoJSON em formato string
      if (wkt.startsWith('{')) {
        const geojson = JSON.parse(wkt);
        // Garante o mapeamento correto de [lng, lat] para [lat, lng] do Leaflet
        return geojson.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
      }

      // 2. Tratamento robusto para WKT (Ex: POLYGON((lng lat, lng lat, ...)))
      // Remove o texto inicial e todos os parênteses da string, deixando apenas os números e vírgulas
      const limpo = wkt.replace(/[a-zA-Z]/g, '').replace(/[\(\)]/g, '').trim();

      // Separa os pontos por vírgula
      const pontosStr = limpo.split(',');

      const coordenadas: any[] = [];

      pontosStr.forEach(ponto => {
        // Limpa espaços extras nas pontas e divide pelo espaço interno entre as coordenadas
        const partes = ponto.trim().split(/\s+/);

        if (partes.length >= 2) {
          const lng = parseFloat(partes[0]);
          const lat = parseFloat(partes[1]);

          // Valida se nenhum dos valores resultou em NaN antes de adicionar
          if (!isNaN(lng) && !isNaN(lat)) {
            coordenadas.push([lat, lng]); // Leaflet espera obrigatoriamente [lat, lng]
          }
        }
      });

      return coordenadas;
    } catch (e) {
      console.error('Erro crítico no parse do WKT:', e);
      return [];
    }
  }
}
