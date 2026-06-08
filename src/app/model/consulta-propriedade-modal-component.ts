import { Component, inject, signal, effect, viewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { ConsultaCarService } from '../service/consulta-car.service';
import { CarResponse } from '../dto/response/car';
import {parse} from 'wellknown';
import {NgxMaskDirective} from 'ngx-mask';

@Component({
  selector: 'app-consulta-propriedade-modal',
  standalone: true,
  imports: [
    MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,NgxMaskDirective,
    MatButtonModule, MatCardModule, MatProgressSpinnerModule, MatDividerModule,
    MatIconModule, DecimalPipe
  ],
  template: `
    <h2 mat-dialog-title>Consultar Propriedade Rural</h2>

    <mat-dialog-content class="mat-typography">
      <!-- Formulário de Busca -->
      @if (!resultados().length) {
        <form [formGroup]="form" (ngSubmit)="buscar()" class="form-consulta">
          <p class="form-instruction">Preencha ao menos um dos campos abaixo para realizar a localização:</p>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>CPF do Proprietário</mat-label>
            <input matInput formControlName="cpf" placeholder="000.000.000-00">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>CNPJ da Empresa</mat-label>
            <input matInput formControlName="cnpj" placeholder="00.000.000/0000-00">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Código do CAR</mat-label>
            <input matInput formControlName="codigoCar" placeholder="BR-XX-XXXXXXX-XXXX..." [dropSpecialCharacters]="false" [mask]="carMask">
          </mat-form-field>

          @if (erroForm()) {
            <p class="error-msg">{{ erroForm() }}</p>
          }

          <div class="form-actions">
            <button mat-button type="button" mat-dialog-close>Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
              @else { Consultar }
            </button>
          </div>
        </form>
      }

      <!-- Listagem de Resultados Estilo Relatório -->
      @if (resultados().length > 0) {
        <div class="resultados-container">
          <div class="resultados-header">
            <h3>{{ resultados().length }} propriedade(s) encontrada(s)</h3>
            <button mat-stroked-button (click)="limpar()">Nova Consulta</button>
          </div>

          @for (item of resultados(); track item.id) {
            <mat-card class="result-report-card">

              <div class="report-header-wrapper">

                <h3 class="prop-name">{{ item.nomePropriedade || 'Propriedade Sem Nome' }}</h3>
                <div class="car-code-row">
                  <span class="car-label">Código CAR:</span>
                  <strong class="car-value">{{ item.codigoCar }}</strong>
                </div>
              </div>
              <div class="report-status">
                  <span class="status-badge" [attr.data-status]="item.status">
                    {{ item.status }}
                  </span>
              </div>

              <mat-card-content class="report-content-box">
                <div class="report-data-grid">
                  <div class="data-cell">
                    <span class="label">Tema Ambiental</span>
                    <span class="value">[{{ item.cdigoTema }}] {{ item.nomeTema }}</span>
                  </div>
                  <div class="data-cell">
                    <span class="label">Área Informada</span>
                    <span class="value">{{ item.numeroArea | number:'1.1-4' }} ha</span>
                  </div>

                  <!-- CONTEÚDO SUBSTITUÍDO: MAPA NO LUGAR DA STRING TEXTUAL -->
                  @if (item.poligono) {
                    <div class="data-cell full-row">
                      <span class="label"><mat-icon>map</mat-icon> Visualização Geográfica (Mapa)</span>

                      <mat-dialog-content>
                        <div id="modalMap" style="height: 450px; width: 550px; min-width: 100%;"></div>
                      </mat-dialog-content>
                    </div>
                  }
                </div>

                <div class="cadastro-prompt-banner">
                  <mat-icon>info</mat-icon>
                  <span>Para obter maiores informações, faça seu cadastro.</span>
                </div>
              </mat-card-content>

            </mat-card>
          }
        </div>
      }
    </mat-dialog-content>
  `,
  styles: [`
    .form-consulta { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    .form-instruction { color: #555; font-size: 14px; margin-bottom: 12px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .error-msg { color: #d32f2f; font-size: 13px; font-weight: 500; margin: 4px 0; }

    .resultados-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .resultados-header h3 { margin: 0; color: #1b5e20; font-size: 1.3rem; }

    .result-report-card { margin-bottom: 20px; border-left: 5px solid #1b5e20; background: #fafafa; border-radius: 4px; overflow: hidden; }
    .report-content-box { padding: 0 20px 20px 20px !important; }

    .report-header-wrapper { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 20px 14px 20px; gap: 24px; }
    .report-identity { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .prop-name { margin: 0; font-size: 1.3rem; font-weight: 600; color: #212121; }
    .car-code-row { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #424242; }
    .car-label { color: #757575; }
    .car-value { font-family: monospace; letter-spacing: 0.2px; word-break: break-all; }
    .report-status { display: flex; align-items: center; flex-shrink: 0; }

    .status-badge { padding: 6px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background-color: #e0e0e0; color: #424242; }
    .status-badge[data-status="AT"] { background-color: #e8f5e9; color: #2e7d32; }
    .status-badge[data-status="AGUARDANDO ANALISE"] { background-color: #fff3e0; color: #e65100; }
    .status-badge[data-status="PE"] { background-color: #fff3e0; color: #ef6c00; }

    .report-data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 4px; }
    .data-cell { display: flex; flex-direction: column; gap: 4px; }
    .full-row { grid-column: 1 / -1; }
    .label { font-size: 11px; color: #757575; text-transform: uppercase; font-weight: 600; display: flex; align-items: center; gap: 4px; letter-spacing: 0.3px; }
    .value { font-size: 14px; color: #212121; font-weight: 500; }

    /* ESTILO DO MAPA: Garante altura física visível para a renderização do Leaflet */
    .map-container { width: 100%; height: 350px; border-radius: 6px; border: 1px solid #ccc; background-color: #eaeaea; margin-top: 4px; z-index: 1; }

    .cadastro-prompt-banner { display: flex; align-items: center; gap: 10px; margin-top: 20px; padding: 12px 16px; background-color: #e8f5e9; border-radius: 6px; border: 1px solid #c8e6c9; color: #1b5e20; font-size: 13.5px; font-weight: 500; }
    .cadastro-prompt-banner mat-icon { font-size: 20px; width: 20px; height: 20px; color: #2e7d32; }
  `]
})
export class ConsultaPropriedadeModalComponent {
  private dialogRef = inject(MatDialogRef<ConsultaPropriedadeModalComponent>);
  private fb = inject(FormBuilder);
  private service = inject(ConsultaCarService);

  readonly carMask = 'SS-0000000-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  loading = signal(false);
  erroForm = signal<string | null>(null);
  resultados = signal<CarResponse[]>([]);
  private map: any = null;

  form = this.fb.group({
    cpf: [''],
    cnpj: [''],
    codigoCar: ['']
  });

  constructor() {
    // Efeito reativo: Sempre que a lista de resultados mudar e houver dados, inicializa o mapa
    effect(() => {
      const dadosAtuais = this.resultados();
      if (dadosAtuais.length > 0 && dadosAtuais[0].poligono) {
        // Aguarda um ciclo microtask do Angular para o ID "modalMap" ser renderizado na View
        setTimeout(() => {
          this.initMapAndRender(dadosAtuais[0].poligono);
        }, 50);
      }
    });
  }

  buscar() {
    const {cpf, cnpj, codigoCar} = this.form.value;

    if (!cpf?.trim() && !cnpj?.trim() && !codigoCar?.trim()) {
      this.erroForm.set('Preencha pelo menos um campo para realizar a consulta.');
      return;
    }

    this.erroForm.set(null);
    this.loading.set(true);

    this.service.consultaCarPublica({cpf, cnpj, codigoCar}).subscribe({
      next: (res) => {
        this.resultados.set(res);
        this.loading.set(false);
        if (res.length === 0) {
          this.erroForm.set('Nenhuma propriedade foi localizada com os filtros informados.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.erroForm.set('Erro interno ao processar consulta na base AgroProdes.');
      }
    });
  }

  private async initMapAndRender( poligono: string): Promise<void> {
    try {
      if (!poligono || !poligono) {
        console.error('WKT não fornecido ou está nulo.');
        return;
      }

      const sanitizedWkt = poligono.trim();
      const geojsonFeature = parse(sanitizedWkt);

      if (!geojsonFeature) {
        console.error('Não foi possível converter a string WKT para GeoJSON:', sanitizedWkt);
        return;
      }

      // CORREÇÃO: Importa resolvendo a compatibilidade do módulo ESM / CommonJS (.default)
      const leafletModule = await import('leaflet');
      const L = (leafletModule.default || leafletModule) as any;

      // Garante a correção de caminhos de ícones padrões quebrados pelo build/Webpack no Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'unpkg.com',
        iconUrl: 'unpkg.com',
        shadowUrl: 'unpkg.com',
      });

      // Inicializa o mapa com o container validado
      this.map = L.map('modalMap').setView([0, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      const rawGeojson = geojsonFeature as any;
      let geojsonToRender: any = rawGeojson;

      if (rawGeojson && rawGeojson.type && rawGeojson.type !== 'Feature' && rawGeojson.type !== 'FeatureCollection') {
        geojsonToRender = {
          type: 'Feature',
          geometry: rawGeojson,
          properties: {}
        };
      }

      const layer = L.geoJSON(geojsonToRender, {
        style: {
          color: '#007bff',
          weight: 4,
          opacity: 0.8,
          fillColor: '#007bff',
          fillOpacity: 0.2
        }
      }).addTo(this.map);

      const geometryType = geojsonToRender.geometry ? geojsonToRender.geometry.type : geojsonToRender.type;
      const coordinates = geojsonToRender.geometry ? geojsonToRender.geometry.coordinates : geojsonToRender.coordinates;

      if (geometryType === 'Point' && coordinates) {
        this.map.setView([coordinates[1], coordinates[0]], 15);
      } else {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds);
        }
      }

    } catch (error) {
      console.error('Erro na inicialização do mapa:', error);
    }
  }

  limpar() {
    this.resultados.set([]);
    this.form.reset();
  }

}
