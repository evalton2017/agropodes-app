import { Component, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardProdutorService} from '../../pages/dashboard/service/dashboard-produtor.service';
import {PessoaService} from '../../service/pessoa.service';
import {GlebaGeometriaResponse} from '../../pages/dashboard/model/dashboard-produtor.model';

@Component({
  selector: 'app-dashboard-produtor-gleba-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gleba-cards-container">
      <h3 class="title">Glebas do Produtor</h3>

      @if (carregando()) {
        <div class="loading-state">Carregando glebas...</div>
      } @else if (glebas().length === 0) {
        <div class="empty-state">Nenhuma gleba encontrada para este produtor.</div>
      } @else {
        <div class="cards-grid">
          @for (gleba of glebas(); track gleba.idGleba) {
            <div
              class="gleba-card"
              [class.active]="gleba.idGleba === glebaSelecionadaId()"
              (click)="selecionarGleba(gleba)">
              <div class="card-header">
                <span class="codigo">{{ gleba.idGleba || ('GLB-' + gleba.idGleba) }}</span>
                <span class="status-badge" [class]="gleba.statusVmg.toLowerCase()">
                  {{ gleba.statusVmg || 'EM ANALISE' }}
                </span>
              </div>
              <div class="card-body">
                <h4 class="nome">{{ gleba.nomeGleba || ('Gleba #' + gleba.idGleba) }}</h4>
                <p class="detalhes">
                  <span>🌾 {{ gleba.culturaDeclarada || 'Não Informada' }}</span>
                  <span>📏 {{ gleba.areaHectares }} ha</span>
                </p>
                <p class="municipio">📍 {{ gleba.nomeMunicipio || 'N/A' }}</p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .gleba-cards-container { margin-bottom: 20px; }
    .title { color: #a3e635; font-size: 14px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .gleba-card {
      background: #0d1f14; border: 1px solid #1e3a29; border-radius: 8px; padding: 12px;
      cursor: pointer; transition: all 0.2s ease;
      &:hover { border-color: #00ff66; transform: translateY(-2px); }
      &.active { border-color: #00ff66; background: #132e1d; box-shadow: 0 0 10px rgba(0, 255, 102, 0.2); }
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .codigo { font-weight: bold; font-size: 13px; color: #ffffff; }
    .status-badge {
      font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;
      background: rgba(255, 255, 255, 0.1); color: #ccc;
      &.conforme { background: rgba(0, 255, 102, 0.15); color: #00ff66; }
      &.alerta { background: rgba(255, 170, 0, 0.15); color: #ffaa00; }
    }
    .nome { margin: 0 0 6px 0; font-size: 14px; color: #e2e8f0; }
    .detalhes { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin: 0 0 4px 0; }
    .municipio { font-size: 11px; color: #64748b; margin: 0; }
    .loading-state, .empty-state { color: #64748b; font-size: 13px; padding: 16px; text-align: center; background: #0d1f14; border-radius: 8px; }
  `]
})
export class DashboardProdutorGlebaCardComponent implements OnInit {
  @Output() glebaSelecionadaChange = new EventEmitter<number>();
  @Output() glebaObjetoChange = new EventEmitter<GlebaGeometriaResponse>();

  private readonly produtorService = inject(DashboardProdutorService);
  private readonly pessoaService = inject(PessoaService);

  public glebas = signal<GlebaGeometriaResponse[]>([]);
  public carregando = signal<boolean>(false);
  public glebaSelecionadaId = signal<number | null>(null);

  ngOnInit(): void {
    this.carregarGlebasProdutor();
  }

  private carregarGlebasProdutor(): void {
    const user = this.pessoaService.produtorAtual();
    if (!user || !user.id) return;

    this.carregando.set(true);
    this.produtorService.obterGlebasGeometria(user.id, { estado: 'Todos' }).subscribe({
      next: (res) => {
        const lista = res || [];
        this.glebas.set(lista);
        this.carregando.set(false);

        // Seleciona automaticamente a primeira gleba da lista caso exista
        if (lista.length > 0) {
          this.selecionarGleba(lista[0]);
        }
      },
      error: (err) => {
        console.error('Erro ao buscar glebas do produtor:', err);
        this.carregando.set(false);
      }
    });
  }

  public selecionarGleba(gleba: GlebaGeometriaResponse): void {
    this.glebaSelecionadaId.set(gleba.idGleba);
    this.glebaSelecionadaChange.emit(gleba.idGleba);
    this.glebaObjetoChange.emit(gleba); 
  }

}
