import {ChangeDetectorRef, Component,  OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ContestacaoService} from '../../service/contestacaoService.service';
import {ConflitoDetalhe, DetalhesConflitosGlebaResponse} from '../../model/contestacao.model';
import {ContestacaoMapaComponent} from '../mapa/contestacao-mapa.component';
import {LoadingService} from '../../../../shared/service/loading.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

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
          console.log('Dados recebidos da API:', res);

          this.dadosGleba = {
            ...res,
            id_gleba: res?.id_gleba ?? this.idGleba,
            safra_recente: res?.safra_recente || '',
            area_total_ha: res?.area_total_ha || 0,
            conflitos_detectados: (res?.conflitos_detectados || []).map((c, index) => ({
              ...c,
              selecionado: index === 0
            }))
          };

          this.carregandoDados = false;
          this.loadingService.hide();

          // Força a atualização da tela imediatamente sem depender do mouse
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao buscar conflitos da gleba', err);
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

  onArquivoSelecionado(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.arquivoSelecionado = file;
    }
  }

  onPoligonoAtualizado(dados: { wkt: string, areaHa: number }): void {
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

    const conflitoSelecionado = this.dadosGleba?.conflitos_detectados.find(c => c.selecionado);

    const formData = new FormData();
    formData.append('id_gleba', this.idGleba.toString());
    formData.append('poligono_contestacao', this.poligonoDesenhadoWkt);
    if (conflitoSelecionado) {
      formData.append('poligono_detectado', conflitoSelecionado.geometria_wkt);
      formData.append('tamanho_area_detectada_ha', conflitoSelecionado.area_ha.toString());
    }
    formData.append('tamanho_area_demarcada_ha', this.areaDemarcadaHa.toString());
    formData.append('descricao_motivo', this.formContestacao.get('descricao_motivo')?.value);
    formData.append('analise_automatica_json', JSON.stringify(this.dadosGleba));

    if (this.arquivoSelecionado) {
      formData.append('imagem', this.arquivoSelecionado);
    }

    this.contestacaoService.cadastrarContestacao(formData).subscribe({
      next: () => {
        this.modalSucesso = true;
        this.modalMensagem = 'Sua contestação foi registrada com sucesso! Você pode acompanhar o andamento desta solicitação diretamente na aba de Análises.';
        this.modalAberto = true;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao cadastrar contestação', err);
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

    // Se foi sucesso, redireciona para a página de contestações
    if (foiSucesso) {
      this.router.navigateByUrl('/contestacao-produtor');
    }
  }
}
