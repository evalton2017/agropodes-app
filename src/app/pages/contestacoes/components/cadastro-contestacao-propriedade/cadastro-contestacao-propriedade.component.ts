import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContestacaoService } from '../../service/contestacaoService.service';
import { ContestacaoMapaComponent } from '../mapa/contestacao-mapa.component';
import { LoadingService } from '../../../../shared/service/loading.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {ConflitoDetalhe, DetalhesConflitosPropriedadeResponse} from '../../model/contestacao.model';

@Component({
  selector: 'app-cadastro-contestacao-propriedade',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    ContestacaoMapaComponent
  ],
  templateUrl: './cadastro-contestacao-propriedade.component.html',
  styleUrls: ['./cadastro-contestacao-propriedade.component.scss']
})
export class CadastroContestacaoPropriedadeComponent implements OnInit {
  public idPropriedade!: number;
  public dadosPropriedade?: DetalhesConflitosPropriedadeResponse;
  public carregandoDados: boolean = true;
  public formContestacao!: FormGroup;
  public arquivoSelecionado?: File;
  public poligonoDesenhadoWkt: string = '';
  public areaDemarcadaHa: number = 0;

  // Modal feedback
  public modalAberto: boolean = false;
  public modalSucesso: boolean = false;
  public modalMensagem: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private contestacaoService: ContestacaoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('idPropriedade') || this.route.snapshot.paramMap.get('id');
    this.idPropriedade = Number(paramId);

    this.inicializarFormulario();

    if (this.idPropriedade && !isNaN(this.idPropriedade)) {
      this.carregarDeteccoesPropriedade();
    } else {
      this.carregandoDados = false;
      console.error('ID da propriedade inválido ou não encontrado na rota.');
    }
  }

  private inicializarFormulario(): void {
    this.formContestacao = this.fb.group({
      descricao_motivo: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private carregarDeteccoesPropriedade(): void {
    this.carregandoDados = true;
    this.loadingService.show();

    this.contestacaoService.obterDetalhesConflitosPropriedade(this.idPropriedade)
      .subscribe({
        next: (res) => {
          this.dadosPropriedade = {
            ...res,
            id_propriedade: res?.id_propriedade ?? this.idPropriedade,
            codigo_car: res?.codigo_car || '',
            nome_propriedade: res?.nome_propriedade || 'Propriedade sem Nome',
            area_total_ha: res?.area_total_ha || 0,
            conflitos_detectados: (res?.conflitos_detectados || []).map((c, index) => ({
              ...c,
              selecionado: index === 0
            }))
          };

          this.carregandoDados = false;
          this.loadingService.hide();

          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao buscar detecções da propriedade', err);
          this.carregandoDados = false;
          this.loadingService.hide();
          this.modalSucesso = false;
          this.modalMensagem = 'Erro ao carregar detecções da propriedade.';
          this.modalAberto = true;
          this.cdr.detectChanges();
        }
      });
  }

  onToggleConflito(conflito: ConflitoDetalhe): void {
    conflito.selecionado = !conflito.selecionado;
    if (this.dadosPropriedade) {
      this.dadosPropriedade = {
        ...this.dadosPropriedade,
        conflitos_detectados: [...this.dadosPropriedade.conflitos_detectados]
      };
    }
  }

  onArquivoSelecionado(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.arquivoSelecionado = file;
    }
  }

  onPoligonoAtualizado(dados: { wkt: string; areaHa: number }): void {
    this.poligonoDesenhadoWkt = dados.wkt;
    this.areaDemarcadaHa = dados.areaHa;
  }

  salvarContestacao(): void {
    if (this.formContestacao.invalid || !this.poligonoDesenhadoWkt) {
      this.modalSucesso = false;
      this.modalMensagem = 'Preencha a justificativa detalhadamente e desenhe o polígono de contestação no mapa.';
      this.modalAberto = true;
      this.cdr.detectChanges();
      return;
    }

    const conflitoSelecionado = this.dadosPropriedade?.conflitos_detectados.find(c => c.selecionado);

    const formData = new FormData();
    formData.append('id_propriedade', this.idPropriedade.toString());
    formData.append('poligono_contestacao', this.poligonoDesenhadoWkt);

    if (conflitoSelecionado) {
      formData.append('poligono_detectado', conflitoSelecionado.geometria_wkt);
      formData.append('tamanho_area_detectada_ha', conflitoSelecionado.area_ha.toString());
    }

    formData.append('tamanho_area_demarcada_ha', this.areaDemarcadaHa.toString());
    formData.append('descricao_motivo', this.formContestacao.get('descricao_motivo')?.value);
    formData.append('analise_automatica_json', JSON.stringify(this.dadosPropriedade));

    if (this.arquivoSelecionado) {
      formData.append('documento', this.arquivoSelecionado, this.arquivoSelecionado.name);
    }

    this.contestacaoService.cadastrarContestacaoPropriedade(formData).subscribe({
      next: () => {
        this.modalSucesso = true;
        this.modalMensagem = 'Sua contestação de propriedade foi registrada com sucesso! Você pode acompanhar o andamento desta solicitação na aba de Análises.';
        this.modalAberto = true;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao cadastrar contestação da propriedade', err);
        this.modalSucesso = false;
        const detalheErro = err.error?.detail || err.message || 'Erro desconhecido no servidor';
        this.modalMensagem = `Erro ao registrar contestação: ${detalheErro}`;
        this.modalAberto = true;
        this.cdr.detectChanges();
      }
    });
  }

  fecharModal(): void {
    const foiSucesso = this.modalSucesso;
    this.modalAberto = false;
    this.cdr.detectChanges();

    if (foiSucesso) {
      this.router.navigateByUrl('/acompanhamento-contestacao');
    }
  }
}
