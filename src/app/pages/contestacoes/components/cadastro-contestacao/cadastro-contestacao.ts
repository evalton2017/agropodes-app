import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContestacaoService } from '../../service/contestacaoService.service';
import { ConflitoDetalhe, DetalhesConflitosGlebaResponse } from '../../model/contestacao.model';
import { ContestacaoMapaComponent } from '../mapa/contestacao-mapa.component';
import { LoadingService } from '../../../../shared/service/loading.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PessoaService } from '../../../../service/pessoa.service';

@Component({
  selector: 'app-cadastro-contestacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    ContestacaoMapaComponent
  ],
  templateUrl: './cadastro-contestacao.component.html',
  styleUrls: ['./cadastro-contestacao.component.scss']
})
export class CadastroContestacaoComponent implements OnInit {
  public idGleba!: number;
  public dadosGleba?: DetalhesConflitosGlebaResponse;
  public carregandoDados: boolean = true;
  public formContestacao!: FormGroup;

  public arquivosAnexos: File[] = [];
  public poligonoDesenhadoWkt: string = '';
  public areaDemarcadaHa: number = 0;

  private readonly pessoaService = inject(PessoaService);
  readonly idProdutorLogado = this.pessoaService.idProdutorLogado;

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
    private router: Router,
  ) {}

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('idGleba') || this.route.snapshot.paramMap.get('id');
    this.idGleba = Number(paramId);

    this.inicializarFormulario();

    if (this.idGleba && !isNaN(this.idGleba)) {
      this.carregarConflitos();
    } else {
      this.carregandoDados = false;
      console.error('ID da gleba inválido ou não encontrado na rota.');
    }
  }

  private inicializarFormulario(): void {
    this.formContestacao = this.fb.group({
      descricao_motivo: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  private carregarConflitos(): void {
    this.carregandoDados = true;
    this.loadingService.show();

    this.contestacaoService.obterDetalhesConflitosGleba(this.idGleba)
      .subscribe({
        next: (res) => {
          // 🟢 FILTRO: Mantém apenas as detecções que possuem sobreposição real na gleba (área > 0)
          const conflitosValidos = (res?.conflitos_detectados || []).filter(
            (c: any) => Number(c.area_ha) > 0
          );

          this.dadosGleba = {
            ...res,
            id_gleba: res?.id_gleba ?? this.idGleba,
            safra_recente: res?.safra_recente || '',
            area_total_ha: res?.area_total_ha || 0,
            conflitos_detectados: conflitosValidos.map((c, index) => ({
              ...c,
              selecionado: index === 0 // Seleciona automaticamente o primeiro conflito real (maior área)
            }))
          };

          this.carregandoDados = false;
          this.loadingService.hide();
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao buscar conflitos da gleba:', err);
          this.carregandoDados = false;
          this.loadingService.hide();
          this.modalSucesso = false;
          this.modalMensagem = 'Erro ao carregar detecções da gleba.';
          this.modalAberto = true;
          this.cdr.detectChanges();
        }
      });
  }

  onToggleConflito(conflito: ConflitoDetalhe): void {
    conflito.selecionado = !conflito.selecionado;
    if (this.dadosGleba) {
      this.dadosGleba = {
        ...this.dadosGleba,
        conflitos_detectados: [...this.dadosGleba.conflitos_detectados]
      };
    }
  }

  onFilesSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const novos = Array.from(event.target.files) as File[];
      this.arquivosAnexos = [...this.arquivosAnexos, ...novos];
    }
  }

  removerArquivo(index: number): void {
    this.arquivosAnexos.splice(index, 1);
  }

  onPoligonoAtualizado(dados: { wkt: string, areaHa: number }): void {
    this.poligonoDesenhadoWkt = dados.wkt;
    this.areaDemarcadaHa = dados.areaHa;
    this.cdr.markForCheck();
  }

  salvarContestacao(): void {
    const conflitoSelecionado = this.dadosGleba?.conflitos_detectados.find(c => c.selecionado);

    // 🟢 Validações: precisa ter justificativa + (detecção selecionada OU desenho no mapa)
    if (this.formContestacao.invalid) {
      this.modalSucesso = false;
      this.modalMensagem = 'Informe detalhadamente a justificativa técnica para a contestação (mínimo de 10 caracteres).';
      this.modalAberto = true;
      return;
    }

    if (!conflitoSelecionado && !this.poligonoDesenhadoWkt) {
      this.modalSucesso = false;
      this.modalMensagem = 'Selecione ao menos uma detecção de conflito ou desenhe o polígono de contestação dentro dos limites da Gleba.';
      this.modalAberto = true;
      return;
    }

    // Define o polígono e a área de envio
    const poligonoFinal = this.poligonoDesenhadoWkt || conflitoSelecionado?.geometria_wkt || this.dadosGleba?.geometria_gleba_wkt || '';
    const areaFinalHa = this.areaDemarcadaHa > 0 ? this.areaDemarcadaHa : (conflitoSelecionado?.area_ha || this.dadosGleba?.area_total_ha || 0);

    const formData = new FormData();
    formData.append('id_gleba', this.idGleba.toString());
    formData.append('poligono_contestacao', poligonoFinal);
    formData.append('tamanho_area_demarcada_ha', areaFinalHa.toString());
    formData.append('descricao_motivo', this.formContestacao.get('descricao_motivo')?.value);

    if (conflitoSelecionado) {
      formData.append('poligono_detectado', conflitoSelecionado.geometria_wkt || '');
      formData.append('tamanho_area_detectada_ha', (conflitoSelecionado.area_ha || 0).toString());
    }

    formData.append('analise_automatica_json', JSON.stringify(this.dadosGleba));

    // Upload dos arquivos comprobatórios
    if (this.arquivosAnexos.length > 0) {
      formData.append('documento', this.arquivosAnexos[0], this.arquivosAnexos[0].name);
    }

    this.contestacaoService.cadastrarContestacao(formData).subscribe({
      next: () => {
        this.modalSucesso = true;
        this.modalMensagem = 'Sua contestação foi registrada com sucesso! Você pode acompanhar o andamento desta solicitação diretamente na aba de Análises.';
        this.modalAberto = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao cadastrar contestação:', err);
        this.modalSucesso = false;
        const detalheErro = err.error?.detail || err.message || 'Erro no servidor';
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
      this.router.navigateByUrl('/contestacao-produtor');
    }
  }
}
