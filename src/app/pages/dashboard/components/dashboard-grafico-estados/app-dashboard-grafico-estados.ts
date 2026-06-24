import {Component, effect, ElementRef, inject, PLATFORM_ID, signal, viewChild, ViewEncapsulation} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {finalize} from 'rxjs/operators';
import {DashboardAnalistaService} from '../../service/dashboard-analista.service';
import {DashboardFiltroService} from '../../service/dashboard-filtro.service';
import {DataEstado} from '../../model/dashboard-analista.model';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'dashboard-grafico-estados',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './app-dashboard-grafico-estados.html',
  styleUrls: ['./app-dashboard-grafico-estados.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppDashboardGraficoEstados {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiService = inject(DashboardAnalistaService);
  private readonly filtroService = inject(DashboardFiltroService);

  canvasMapaContainer = viewChild<ElementRef<HTMLDivElement>>('mapaLeaflet');

  public dadosEstados = signal<DataEstado[]>([]);
  public carregando = signal<boolean>(false);
  public erro = signal<boolean>(false);
  private mapaInstance!: any;
  mapInstance: any = null;
  geoJsonLayer: any = null;
  L: any = null;

  private readonly mapaUfsPorExtenso: { [key: string]: string } = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
    'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
    'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
    'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
    'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
    'SE': 'Sergipe', 'TO': 'Tocantins'
  };

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    effect(() => {
      const filtros = this.filtroService.filtrosAtivos();
      this.buscarDados(filtros);
    });
  }

  private buscarDados(filtros: any): void {
    this.carregando.set(true);
    this.erro.set(false);

    this.apiService.obterDashboardDistribuicaoEstado(filtros)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (res) => {
          const dadosMapeados = res?.data.map((item: any) => ({
            estado: item.estado,
            quantidade: item.quantidade
          })) ?? [];

          this.dadosEstados.set(dadosMapeados);
          this.inicializarGraficosEMapa();
        },
        error: (err) => {
          console.error('Erro no widget de estados:', err);
          this.erro.set(true);
        }
      });
  }

  private async inicializarGraficosEMapa(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const refMapa = this.canvasMapaContainer();

    if (refMapa && !this.mapInstance) {
      const leafletModule = await import('leaflet');
      this.L = leafletModule.default || leafletModule;

      this.inicializarMapaLeaflet(refMapa.nativeElement);
    }

    if (this.mapInstance && this.dadosEstados().length > 0) {
      this.atualizarCoresDoMapa(this.dadosEstados());
    }
  }

  private inicializarMapaLeaflet(container: HTMLDivElement): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.mapInstance = this.L.map(container, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false
    }).setView([-15.7801, -47.9292], 4);
    setTimeout(() => {
      this.mapInstance?.invalidateSize();
    }, 100);
  }

  private atualizarCoresDoMapa(dados: DataEstado[]): void {
    fetch('br.json')
      .then(res => res.json())
      .then(geoJsonData => {
        if (this.geoJsonLayer) {
          this.mapInstance?.removeLayer(this.geoJsonLayer);
        }

        this.geoJsonLayer = this.L.geoJSON(geoJsonData, {
          style: (feature: any) => this.estilizarEstado(feature, dados)
        }).addTo(this.mapInstance!);

        const bounds = this.geoJsonLayer.getBounds();
        this.mapInstance?.fitBounds(bounds, { padding: [10, 10] });
      });
  }


  private estilizarEstado(feature: any, dados: DataEstado[]): any {
    // Busca o nome do estado vindo de dentro das propriedades do GeoJSON
    const nomeEstadoGeoJson = feature?.properties?.name || '';

    const normalizar = (texto: string) =>
      texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() : '';

    // 2. Busca o estado conferindo tanto pelo Nome por Extenso quanto por Siglas (Ex: 'MT' ou 'Mato Grosso')
    const dadosEstado = dados.find(d => {
      const estadoApiNormalizado = normalizar(d.estado);
      const nomeGeoJsonNormalizado = normalizar(nomeEstadoGeoJson);

      // Converte a sigla da API para extenso se necessário antes de comparar
      const nomePorExtensoDaSigla = this.mapaUfsPorExtenso[d.estado.toUpperCase()] || '';
      const extensoNormalizado = normalizar(nomePorExtensoDaSigla);

      return estadoApiNormalizado === nomeGeoJsonNormalizado || extensoNormalizado === nomeGeoJsonNormalizado;
    });

    // Cor padrão caso a API não tenha registros do estado
    let corEstado = '#e2f5ec';

    if (dadosEstado) {
      const qtd = dadosEstado.quantidade || 0;

      // Suas regras de validação atualizadas para teste
      if (qtd > 500) {
        corEstado = '#ef4444'; // Vermelho
      } else if (qtd > 100) {
        corEstado = '#f97316'; // Laranja
      } else if (qtd > 20) {
        corEstado = '#eab308'; // Amarelo
      } else {
        corEstado = '#16a34a'; // Verde
      }
    }

    return {
      fillColor: corEstado,
      weight: 1.5,
      opacity: 1,
      color: '#ffffff', // Linhas brancas de divisa
      fillOpacity: 0.85
    };
  }


  public aproximarZoom(): void {
    if (this.mapInstance) {
      this.mapInstance.zoomIn();
    }
  }

  public afastarZoom(): void {
    if (this.mapInstance) {
      this.mapInstance.zoomOut();
    }
  }

  public resetarZoom(): void {
    if (!this.mapInstance) return;
    if (this.geoJsonLayer) {
      const bounds = this.geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        this.mapInstance.fitBounds(bounds, { padding: [10, 10] });
        return;
      }
    }

    this.mapInstance.setView([-15.7801, -47.9292], 4);
  }
}
