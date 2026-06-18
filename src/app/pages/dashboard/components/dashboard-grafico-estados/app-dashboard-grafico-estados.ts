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
  mapInstance: any = null; // Trocado para any para evitar erro de tipo sem import estático
  geoJsonLayer: any = null;
  L: any = null; // Armazena a referência global do Leaflet após o import dinâmico

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
    const refMapa = this.canvasMapaContainer();

    if (refMapa && !this.mapInstance) {
      // Destrutura a propriedade default do import dinâmico
      const leafletModule = await import('leaflet');
      this.L = leafletModule.default || leafletModule;

      this.inicializarMapaLeaflet(refMapa.nativeElement);
    }

    if (this.mapInstance && this.dadosEstados().length > 0) {
      this.atualizarCoresDoMapa(this.dadosEstados());
    }
  }

  private inicializarMapaLeaflet(container: HTMLDivElement): void {
    this.mapInstance = this.L.map(container, {
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false
    }).setView([-15.7801, -47.9292], 4); // Centralizado no Brasil

    // Garante que o Leaflet calcule o tamanho do container corretamente
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

        // Ajusta o zoom do mapa automaticamente para enquadrar o Brasil perfeitamente na tela
        const bounds = this.geoJsonLayer.getBounds();
        this.mapInstance?.fitBounds(bounds, { padding: [10, 10] });
      });
  }



  private estilizarEstado(feature: any, dados: DataEstado[]): any {
    const nomeEstadoGeoJson = feature?.properties?.name;

    // Função interna para remover acentos e espaços extras (evita problemas com "Pará" vs "Para")
    const normalizar = (texto: string) =>
      texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() : '';

    // Busca o estado comparando os nomes normalizados
    const dadosEstado = dados.find(d => normalizar(d.estado) === normalizar(nomeEstadoGeoJson));

    // Cor padrão do protótipo caso não ache o estado (Verde institucional bem sutil/claro como padrão base)
    let corEstado = '#e2f5ec';

    if (dadosEstado) {

      const qtd = dadosEstado.quantidade || 0;

      if (qtd > 1000) {
        corEstado = '#ef4444'; // Crítico (Vermelho) - Ex: São Paulo / Sul
      } else if (qtd > 500) {
        corEstado = '#f97316'; // Alerta (Laranja) - Ex: Minas Gerais / Centro
      } else if (qtd > 100) {
        corEstado = '#eab308'; // Atenção (Amarelo) - Ex: Nordeste / GO
      } else {
        corEstado = '#16a34a'; // Normal (Verde) - Menos de 100 ou igual a 0
      }
    }

    return {
      fillColor: corEstado,
      weight: 1.5,          /* Espessura da linha */
      opacity: 1,
      color: '#ffffff',     /* Cor branca para destacar as divisões dos estados */
      fillOpacity: 0.85
    };
  }



  public aproximarZoom(): void {
    if (this.mapaInstance) {
      this.mapaInstance.zoomIn();
    }
  }

  public afastarZoom(): void {
    if (this.mapaInstance) {
      this.mapaInstance.zoomOut();
    }
  }

  public resetarZoom(): void {
    if (this.mapaInstance) {
      // Define a visão padrão centralizada no Brasil (ajuste as coordenadas conforme seu mapa)
      this.mapaInstance.setView([-14.235, -51.925], 4);
    }
  }
}
