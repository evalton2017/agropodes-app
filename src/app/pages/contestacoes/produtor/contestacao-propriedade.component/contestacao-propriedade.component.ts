import { Component, OnInit, OnDestroy, signal, inject, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import wkt from 'wellknown';

import { ListarPropriedadeComponent } from '../../../propriedades/components/listar-propriedade.component/listar-propriedade.component';
import { CadastrarPropriedadeComponent } from '../../../propriedades/components/cadastrar-propriedade.component/cadastrar-propriedade.component';
import { ContestacaoService } from '../../service/contestacaoService.service';
import { PropriedadeService } from '../../../propriedades/propriedade.service';
import { DeteccaoPropriedade, Propriedade } from '../../../propriedades/propriedade.model';
import { PessoaService } from '../../../../service/pessoa.service';
import { AlertService } from '../../../../components/service/alert.service';

export type ModoViewContestacao = 'LISTA' | 'CADASTRO' | 'CONTESTACAO_DETECOES';

@Component({
  selector: 'app-contestacao-propriedade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ListarPropriedadeComponent,
    CadastrarPropriedadeComponent
  ],
  templateUrl: './contestacao-propriedade.component.html',
  styleUrl: './contestacao-propriedade.component.scss'
})
export class ContestacaoPropriedadeComponent implements OnInit, OnDestroy {
  private contestacaoService = inject(ContestacaoService);
  private propriedadeService = inject(PropriedadeService);
  private pessoaService = inject(PessoaService);
  private alertService = inject(AlertService);

  @ViewChild('mapElement') mapElement!: ElementRef;
  readonly idProdutorLogado = this.pessoaService.idProdutorLogado;

  viewModo = signal<ModoViewContestacao>('LISTA');
  listaPropriedades = signal<Propriedade[]>([]);
  propriedadeSelecionada = signal<Propriedade | null>(null);

  deteccoesSelecionadas = signal<number[]>([]);
  deteccaoFocada = signal<DeteccaoPropriedade | null>(null);

  motivoContestacao = signal<string>('');
  arquivosAnexos = signal<File[]>([]);
  poligonoDesenhadoWkt = signal<string | null>(null);

  loadingCarregamento = signal<boolean>(false);
  loadingEnvio = signal<boolean>(false);
  mensagemSucesso = signal<string | null>(null);

  private map: any = null;
  private imovelLayer: any = null;
  private deteccoesLayersMap = new Map<number, any>();
  private drawnItemsGroup: any = null;
  private LeafletCore: any = null;

  constructor() {
    effect(() => {
      if (this.viewModo() === 'CONTESTACAO_DETECOES' && this.propriedadeSelecionada()) {
        setTimeout(() => this.inicializarMapa(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.carregarPropriedades();
  }

  ngOnDestroy(): void {
    this.destruirMapa();
  }

  carregarPropriedades(): void {
    const idProdutor = this.idProdutorLogado();
    if (!idProdutor) return;

    this.loadingCarregamento.set(true);

    this.propriedadeService.listarPropriedadesProdutor(idProdutor).subscribe({
      next: (dados) => {
        this.listaPropriedades.set(dados);
        this.loadingCarregamento.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar propriedades:', err);
        this.loadingCarregamento.set(false);
      }
    });
  }

  iniciarFluxoContestacao(prop: Propriedade): void {
    this.propriedadeSelecionada.set(prop);
    this.deteccoesSelecionadas.set([]);
    this.deteccaoFocada.set(null);
    this.motivoContestacao.set('');
    this.arquivosAnexos.set([]);
    this.poligonoDesenhadoWkt.set(null);
    this.mensagemSucesso.set(null);
    this.viewModo.set('CONTESTACAO_DETECOES');
  }

  voltarParaLista(): void {
    this.destruirMapa();
    this.viewModo.set('LISTA');
    this.propriedadeSelecionada.set(null);
    this.carregarPropriedades();
  }

  toggleSelecaoDeteccao(det: DeteccaoPropriedade): void {
    const id = det.id_deteccao;
    const selecionados = [...this.deteccoesSelecionadas()];
    const index = selecionados.indexOf(id);

    if (index > -1) {
      selecionados.splice(index, 1);
    } else {
      selecionados.push(id);
    }

    this.deteccoesSelecionadas.set(selecionados);
    this.atualizarEstiloCamadaMapa(det.id_deteccao);
    this.focarDeteccaoNoMapa(det);
  }

  // 🟢 AJUSTE PRINCIPAL: CARREGAMENTO ASSÍNCRONO E ATRIBUIÇÃO GLOBAL EXPLICITA
  private async inicializarMapa(): Promise<void> {
    if (!this.mapElement || this.map) return;

    try {
      // 1. Importa o módulo core do Leaflet
      const leafletModule = await import('leaflet');
      this.LeafletCore = (leafletModule.default || leafletModule) as any;
      const L = this.LeafletCore;

      // 2. Registra no escopo global ANTES de carregar o leaflet-draw
      (window as any).L = L;
      (window as any).type = '';

      // 3. Importa dinamicamente a extensão de desenho
      await import('leaflet-draw');

      this.map = L.map(this.mapElement.nativeElement, { zoomControl: true }).setView([-12.64, -55.42], 12);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      }).addTo(this.map);

      // 4. PANES EXCLUSIVOS DE SOBREPOSIÇÃO
      this.map.createPane('imovelPane');
      this.map.getPane('imovelPane')!.style.zIndex = '400';

      this.map.createPane('deteccoesPane');
      this.map.getPane('deteccoesPane')!.style.zIndex = '450';

      this.map.createPane('drawnPane');
      this.map.getPane('drawnPane')!.style.zIndex = '500';

      this.drawnItemsGroup = new L.FeatureGroup();
      this.map.addLayer(this.drawnItemsGroup);

      // 5. FERRAMENTA DE DESENHO
      const drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
          polygon: {
            allowIntersection: false,
            shapeOptions: {
              color: '#00bfff',
              fillColor: '#00bfff',
              fillOpacity: 0.5,
              weight: 3,
              pane: 'drawnPane'
            }
          },
          polyline: false,
          circle: false,
          rectangle: false,
          marker: false,
          circlemarker: false
        },
        edit: {
          featureGroup: this.drawnItemsGroup,
          remove: true
        }
      });
      this.map.addControl(drawControl);

      // EVENTOS DE DESENHO
      this.map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        this.drawnItemsGroup.clearLayers();
        this.drawnItemsGroup.addLayer(layer);

        if (layer.bringToFront) {
          layer.bringToFront();
        }

        const geojson = layer.toGeoJSON();
        const wktString = wkt.stringify(geojson.geometry);
        this.poligonoDesenhadoWkt.set(wktString);
      });

      this.map.on(L.Draw.Event.DELETED, () => {
        this.poligonoDesenhadoWkt.set(null);
      });

      const prop = this.propriedadeSelecionada();
      if (!prop) return;

      // 6. CAMADA DO IMÓVEL (VERDE)
      if (prop.geometria_wkt) {
        try {
          const geojsonImovel = wkt.parse(prop.geometria_wkt);
          this.imovelLayer = L.geoJSON(geojsonImovel, {
            pane: 'imovelPane',
            style: { color: '#86efac', weight: 2.5, fillColor: '#86efac', fillOpacity: 0.15 }
          }).addTo(this.map);

          this.map.fitBounds(this.imovelLayer.getBounds(), { padding: [30, 30] });
        } catch (e) {
          console.error('Erro ao processar WKT da propriedade:', e);
        }
      }

      // 7. CAMADA DAS DETECÇÕES
      if (prop.deteccoes && prop.deteccoes.length > 0) {
        prop.deteccoes.forEach((det) => {
          if (det.geom_ocorrencia_wkt) {
            try {
              const geojsonDet = wkt.parse(det.geom_ocorrencia_wkt);
              const isSelected = this.deteccoesSelecionadas().includes(det.id_deteccao);

              const layer = L.geoJSON(geojsonDet, {
                pane: 'deteccoesPane',
                style: {
                  color: isSelected ? '#ffe600' : '#ff4d4d',
                  weight: isSelected ? 3 : 2,
                  fillColor: isSelected ? '#ffe600' : '#ff4d4d',
                  fillOpacity: isSelected ? 0.75 : 0.4
                }
              }).addTo(this.map!);

              if (isSelected) {
                layer.bringToFront();
              }

              layer.on('click', () => this.toggleSelecaoDeteccao(det));
              this.deteccoesLayersMap.set(det.id_deteccao, layer);
            } catch (e) {
              console.error('Erro ao renderizar WKT da detecção:', e);
            }
          }
        });
      }

      requestAnimationFrame(() => {
        this.map?.invalidateSize(true);
      });

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
    }
  }

  private atualizarEstiloCamadaMapa(idDeteccao: number): void {
    const layer = this.deteccoesLayersMap.get(idDeteccao);
    if (layer) {
      const isSelected = this.deteccoesSelecionadas().includes(idDeteccao);

      layer.setStyle({
        color: isSelected ? '#ffe600' : '#ff4d4d',
        weight: isSelected ? 3.5 : 2,
        fillColor: isSelected ? '#ffe600' : '#ff4d4d',
        fillOpacity: isSelected ? 0.75 : 0.4
      });

      if (isSelected) {
        layer.bringToFront();
      }
    }
  }

  focarDeteccaoNoMapa(det: DeteccaoPropriedade): void {
    this.deteccaoFocada.set(det);
    const layer = this.deteccoesLayersMap.get(det.id_deteccao);

    if (layer && this.map) {
      this.map.fitBounds(layer.getBounds(), { maxZoom: 16, padding: [40, 40] });
      layer.bringToFront();
    }
  }

  private destruirMapa(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.imovelLayer = null;
      this.deteccoesLayersMap.clear();
      if (this.drawnItemsGroup) {
        this.drawnItemsGroup.clearLayers();
      }
    }
  }

  onFilesSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const novolarquivos = Array.from(event.target.files) as File[];
      this.arquivosAnexos.update(atuais => [...atuais, ...novolarquivos]);
    }
  }

  removerArquivo(index: number): void {
    this.arquivosAnexos.update(list => list.filter((_, i) => i !== index));
  }

  enviarContestacao(): void {
    const prop = this.propriedadeSelecionada();
    const idsDeteccoes = this.deteccoesSelecionadas();
    const motivo = this.motivoContestacao();

    if (!prop || !motivo.trim()) return;

    this.loadingEnvio.set(true);

    const deteccaoSelecionada = prop.deteccoes?.find(
      d => idsDeteccoes.includes(d.id_deteccao)
    );

    const poligonoWkt =
      this.poligonoDesenhadoWkt() ||
      deteccaoSelecionada?.geom_ocorrencia_wkt ||
      prop.geometria_wkt ||
      '';

    const areaHa =
      deteccaoSelecionada?.area_ha ||
      prop.area_desmatada_ha ||
      prop.area_hectares ||
      0.0;

    const formData = new FormData();
    formData.append('id_propriedade', prop.id_propriedade.toString());
    formData.append('poligono_contestacao', poligonoWkt);
    formData.append('tamanho_area_demarcada_ha', areaHa.toString());
    formData.append('descricao_motivo', motivo);

    if (deteccaoSelecionada?.geom_ocorrencia_wkt) {
      formData.append('poligono_detectado', deteccaoSelecionada.geom_ocorrencia_wkt);
    }
    if (deteccaoSelecionada?.area_ha) {
      formData.append('tamanho_area_detectada_ha', deteccaoSelecionada.area_ha.toString());
    }

    const arquivos = this.arquivosAnexos();
    if (arquivos && arquivos.length > 0) {
      formData.append('documento', arquivos[0], arquivos[0].name);
    }

    this.contestacaoService.cadastrarContestacaoPropriedade(formData).subscribe({
      next: () => {
        this.loadingEnvio.set(false);
        this.mensagemSucesso.set('Contestação cadastrada com sucesso!');
        setTimeout(() => this.voltarParaLista(), 2000);
      },
      error: (err) => {
        console.error('Erro 422 ao cadastrar contestação:', err);
        this.loadingEnvio.set(false);
        this.alertService.error(err.message);
      }
    });
  }
}
