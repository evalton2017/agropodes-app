import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule, formatDate} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';

// Imports do Material
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PessoaService} from '../../../service/pessoa.service';
import {
  CarFeicoesAmbientaisResponse,
  DominioCultura,
  JanelaGeralZarcResponse,
  MunicipioResponse, ValidarZarcSimplificadoResponse,
} from '../../model/gleba.model';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MapaLocalizacaoComponent} from '../../../components/mapa-localizacao.component/mapa-localizacao.component';
import {MapaDelimitacaoComponent} from '../../../components/mapa-delimitacao.component/mapa-delimitacao.component';
import {MatIconModule} from '@angular/material/icon';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ModalConfirmacaoCarComponent} from '../modal/modal-confirmacao-car.component';
import {GlebaService} from '../../../service/gleba.service';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';

export interface ZarcSuccessResponse {
  status_validacao: string;
  mensagem: string;
  sugestoes_janelas_plantio?: any[];
}

@Component({
  selector: 'app-cadastro-gleba-gleba',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MapaLocalizacaoComponent,
    MapaDelimitacaoComponent,
    NgxMatSelectSearchModule
  ],
  templateUrl: './cadastro-gleba.component.html',
  styleUrls: ['./cadastro-gleba.component.scss']
})
export class CadastroGlebaComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(MapaLocalizacaoComponent) mapaFilho!: MapaLocalizacaoComponent;
  @ViewChild(MapaDelimitacaoComponent) mapaDesenhoFilho!: MapaDelimitacaoComponent;

  public filtroCulturaCtrl = new FormControl('');
  public culturaFiltroTexto = signal<string>('');

  public statusZarc = signal<ValidarZarcSimplificadoResponse | null>(null);
  private readonly destroyRef = inject(DestroyRef);
  public decendioSelecionado = signal<number | null>(null);
  public sugestoesZarcDisponiveis = signal<JanelaGeralZarcResponse | null>(null);
  public carregandoSugestoes = signal<boolean>(false);
  public readonly anoAtual = new Date().getFullYear();

  private readonly fb = inject(FormBuilder);
  private readonly glebaService = inject(GlebaService);
  private readonly pessoaService = inject(PessoaService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);

  passoAtual = signal<number>(1);
  carregando = signal<boolean>(false);
  erroMensagem = signal<string | null>(null);


  produtor = computed(() => this.pessoaService.produtorAtual());
  readonly latitudeCentroide = signal<string>('-13.975810');
  readonly longitudeCentroide = signal<string>('-59.757567');
  public listaSafras: string[] = [];

  dadosCar = signal<CarFeicoesAmbientaisResponse | null>(null);
  listaMunicipios = signal<MunicipioResponse[]>([]);
  filtrosAgricolas = signal<DominioCultura[] | null>([]);
  areaCalculadaMapa = signal<{ area_hectares: number; perimetro_metros: number } | null>(null);

  formWizard!: FormGroup;

  public culturasFiltradas = computed(() => {
    const termo = this.culturaFiltroTexto().toLowerCase().trim();
    const listaOriginal = this.filtrosAgricolas() || [];

    if (!termo) {
      return listaOriginal;
    }

    return listaOriginal.filter(c => c.nome.toLowerCase().includes(termo));
  });

  constructor() {
    effect(() => {
      const produtor = this.pessoaService.produtorAtual();
      this.listaSafras = this.gerarListaSafras();

      if (produtor && this.formWizard) {
        const cpfCnpjCtrl = this.formWizard.get('cpf_cnpj');
        const proprietarioCtrl = this.formWizard.get('proprietario');

        // 1. Atualiza os valores do formulário
        this.formWizard.patchValue({
          proprietario: produtor.nome,
          cpf_cnpj: produtor.cpfCnpj
        });

        if (produtor.cpfCnpj) {
          cpfCnpjCtrl?.setValidators([Validators.required]);
          cpfCnpjCtrl?.updateValueAndValidity();
        }

        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    this.filtroCulturaCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valor => {
        this.culturaFiltroTexto.set(valor || '');
      });

    this.inicializarFormularioBase();
    this.carregarDadosIniciais();
  }


  private inicializarFormularioBase(): void {
    const produtorAtual = this.produtor();

    this.formWizard = this.fb.group({
      nome_gleba: ['Plantação Soja 2026', [Validators.required, Validators.maxLength(150)]],
      nome_propriedade: [{value: '', disabled: true}],
      codigo_interno: ['FBV-01'],
      matricula_transcricao: ['12.345'],
      numero_car: ['', [Validators.required]],
      cpf_cnpj: ['', [Validators.required]],
      proprietario: ['', [Validators.required]],
      codigo_municipio: [null, [Validators.required]],
      bioma: ['Cerrado'],
      bacia_hidrografica: [''],
      regiao_planejamento: [''],
      estado: ['PI', [Validators.required]],
      geometria: ['', [Validators.required]],
      cultura_declarada: ['', [Validators.required]],

      // 🟢 NOVO CONTROLE: Armazena o rótulo sanitizado para o .pkl ('CAFÉ', 'SOJA', etc.)
      cultura_declarada_ia: [''],

      safra: ['', [Validators.required]],
      volume_declarado_comercializar: new FormControl(0, [Validators.required, Validators.min(0)]),
      data_estimada_plantio: new FormControl('', Validators.required),
      data_estimada_colheita: new FormControl({value: '', disabled: false}, Validators.required),
    });

    this.formWizard.get('data_estimada_plantio')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valorPlantio => {
        if (valorPlantio) {
          const dataColheitaObjeto = this.calcularDataColheitaAutomatica(valorPlantio);
          if (dataColheitaObjeto) {
            const colheitaFormatada = formatDate(dataColheitaObjeto, 'dd/MM/yyyy', 'pt-BR');
            this.formWizard.get('data_estimada_colheita')?.setValue(colheitaFormatada, {emitEvent: false});
          }
        }
      });
  }

  // 2. Método acionado no evento (selectionChange) do mat-select de culturas
  public aoSelecionarCultura(culturaObjeto: DominioCultura): void {
    if (!culturaObjeto) return;

    // Seta simultaneamente o nome de exibição e a tag da IA
    this.formWizard.patchValue({
      cultura_declarada: culturaObjeto.nome,
      cultura_declarada_ia: culturaObjeto.nome_ia || culturaObjeto.nome
    });

    this.carregarSugestoesZarc();
  }

  // 3. Injeção no envio do payload final
  finalizarCadastro(): void {
    const produtorAtual = this.produtor();
    if (!produtorAtual || !produtorAtual.id || this.formWizard.invalid) return;

    this.carregando.set(true);

    const formValues = this.formWizard.getRawValue();

    const payload = {
      ...formValues,
      id_produtor: produtorAtual.id,
      cultura_declarada: formValues.cultura_declarada,
      cultura_declarada_ia: formValues.cultura_declarada_ia, // 🟢 ENVIADO PARA A REQUISICAOGLEBA (API)
      data_estimada_plantio: this.converterData(formValues.data_estimada_plantio),
      data_estimada_colheita: this.converterData(formValues.data_estimada_colheita),
      area_hectares: this.areaCalculadaMapa()?.area_hectares || 0,
      ip_origem: '127.0.0.1',
      dispositivo_token: 'angular_ssr_token_2026'
    };

    this.glebaService.cadastrarGleba(payload).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erroMensagem.set(err.error?.detail || 'Erro ao registrar.');
      }
    });
  }

  get isPasso1Valido(): boolean {
    const nomeGlebaValid = this.formWizard.get('nome_gleba')?.valid ?? false;
    const numeroCarValid = this.formWizard.get('numero_car')?.valid ?? false;
    const cpfCnpjValid = this.formWizard.get('cpf_cnpj')?.valid ?? false;
    return nomeGlebaValid && numeroCarValid && cpfCnpjValid;
  }

  get isPasso2Valido(): boolean {
    const control = this.formWizard.get('codigo_municipio');
    if (!control) return false;
    return control.valid || control.disabled;
  }

  get isPasso4Valido(): boolean {
    if (!this.formWizard) return false;

    const cultura = this.formWizard.get('cultura_declarada')?.value;
    const safra = this.formWizard.get('safra')?.value;
    const plantio = this.formWizard.get('data_estimada_plantio')?.value;
    const colheita = this.formWizard.get('data_estimada_colheita')?.value;

    // Se for cultura isenta de ZARC (Reflorestamento/Silvicultura), valida apenas a presença dos dados principais
    if (this.verificarCulturaIsentaZarc(cultura)) {
      return !!(cultura && safra && plantio && colheita);
    }

    // Para outras culturas, exige também a escolha da janela/decêndio ZARC
    return !!(cultura && safra && plantio && colheita && this.decendioSelecionado());
  }

  private carregarDadosIniciais(): void {
    this.glebaService.getMunicipios().subscribe({
      next: (res) => this.listaMunicipios.set(res),
      error: () => this.erroMensagem.set('Erro ao carregar lista de municípios.')
    });

    this.glebaService.getFiltrosAgricolas().subscribe({
      next: (res) => this.filtrosAgricolas.set(res),
      error: () => this.erroMensagem.set('Erro ao carregar parâmetros agrícolas.')
    });
  }

  validarPasso1(): void {
    const numeroCar = this.formWizard.get('numero_car')?.value;
    if (!numeroCar || !this.isPasso1Valido) return;

    this.carregando.set(true);
    this.erroMensagem.set(null);

    this.glebaService.buscarDetalhesCar(numeroCar).subscribe({
      next: (res: CarFeicoesAmbientaisResponse) => {
        this.carregando.set(false);

        // Preenche o nome da propriedade atualizado no formulário
        if (res.nom_imovel) {
          this.formWizard.get('nome_propriedade')?.setValue(res.nom_imovel);
        }

        // Verifica se o status do CAR é Ativo (Pode ser 'AT', 'ATIVO', 'PENDENTE' dependendo do órgão)
        const statusUpper = (res.status || '').toUpperCase();
        const statusValidos = ['AT', 'ATIVO', 'PENDENTE'];
        const podeAvancar = statusValidos.includes(statusUpper);

        // Abre o Modal de Confirmação antes de prosseguir
        const dialogRef = this.dialog.open(ModalConfirmacaoCarComponent, {
          width: '600px',
          disableClose: true,
          data: {
            dadosCar: res,
            podeAvancar: podeAvancar
          }
        });

        dialogRef.afterClosed().subscribe((confirmado: boolean) => {
          if (confirmado && podeAvancar) {
            // Seta o objeto de retorno no signal e avança
            this.dadosCar.set(res as any);
            this.avancarPasso();
          } else if (!podeAvancar) {
            this.erroMensagem.set(
              `Atenção: O CAR ${res.cod_imovel} está com status "${res.status}". Regularize os dados junto ao órgão ambiental para prosseguir.`
            );
          }
        });
      },
      error: (err) => {
        this.carregando.set(false);
        this.erroMensagem.set(err.error?.detail || 'Erro ao validar e consultar CAR nas bases oficiais.');
      }
    });
  }


  calcularGeometriaPostGis(): void {
    const wkt = this.formWizard.get('geometria')?.value;
    this.carregando.set(true);

    this.glebaService.calcularAreaGeometria(wkt).subscribe({
      next: (res) => {
        this.areaCalculadaMapa.set(res);
        this.carregando.set(false);
        this.avancarPasso();
      },
      error: () => {
        this.carregando.set(false);
        this.erroMensagem.set('Falha ao processar cálculo geométrico.');
      }
    });
  }

  converterData(dataBR: string): string {
    // Separa o dia, mês e ano
    const [dia, mes, ano] = dataBR.split('/');

    // Retorna no formato yyyy-mm-dd
    return `${ano}-${mes}-${dia}`;
  }

  avancarPasso(): void {
    this.passoAtual.update(p => p + 1);
    setTimeout(() => {
      this.stepper.next();
      this.executarSincronizacaoMapa();
    });
  }

  voltarPasso(): void {
    if (this.passoAtual() > 1) {
      this.passoAtual.update(p => p - 1);
      setTimeout(() => {
        this.stepper.previous();
        this.executarSincronizacaoMapa();
      });
    }
  }

  private executarSincronizacaoMapa(): void {
    setTimeout(() => {
      const index = this.stepper.selectedIndex;

      if (index === 1 && this.mapaFilho) {
        this.mapaFilho.forcarRecalculoZoomEamanho();
      }

      if (index === 2 && this.mapaDesenhoFilho) {
        this.mapaDesenhoFilho.forcarRecalculoTamanho();
      }

      this.cdr.detectChanges();
    }, 200);
  }

  onPassoAnimacaoConcluida(): void {
    if (this.stepper && this.stepper.selectedIndex === 1 && this.mapaFilho) {
      this.mapaFilho.forcarRecalculoZoomEamanho();
    }
  }

  public atualizarCoordenadasDoCentroide(lat: string, lng: string): void {
    this.latitudeCentroide.set(lat);
    this.longitudeCentroide.set(lng);
    this.cdr.detectChanges();
  }

  readonly areaFormatadaRevisao = computed(() => {
    const dados = this.areaCalculadaMapa();
    return dados ? `${dados.area_hectares.toLocaleString('pt-BR', {minimumFractionDigits: 2})} ha` : '0,00 ha';
  });

  readonly perimetroFormatadoRevisao = computed(() => {
    const dados = this.areaCalculadaMapa();
    return dados ? `${dados.perimetro_metros.toLocaleString('pt-BR', {minimumFractionDigits: 2})} m` : '0,00 m';
  });

  public definirMetricasCalculadasPostGis(areaHa: number, perimetroM: number): void {
    this.areaCalculadaMapa.set({
      area_hectares: areaHa,
      perimetro_metros: perimetroM
    });
    this.cdr.detectChanges();
  }

  private gerarListaSafras(): string[] {
    const anoAtual = new Date().getFullYear(); // 2026
    const safras: string[] = [];
    // Restringe para gerar apenas safras passadas e a corrente (sem anos futuros)
    for (let i = -4; i <= 0; i++) {
      const anoInicio = anoAtual + i;
      const anoFim = anoInicio + 1;
      safras.push(`${anoInicio}/${anoFim}`);
    }
    return safras;
  }

  public calcularDataColheitaAutomatica(dataPlantio: any): Date | null {
    if (!dataPlantio) return null;

    let dataObj: Date;

    // 🌟 CORREÇÃO CRÍTICA: Se a data for uma string (formato dd/mm/aaaa), reconstrói o objeto Date nativo
    if (typeof dataPlantio === 'string') {
      const partes = dataPlantio.split('/');
      if (partes.length === 3) {
        const dia = Number(partes[0]);
        const mes = Number(partes[1]) - 1; // Meses em JavaScript começam em 0
        const ano = Number(partes[2]);
        dataObj = new Date(ano, mes, dia);
      } else {
        // Tenta um fallback caso venha no padrão ISO (aaaa-mm-dd)
        dataObj = new Date(dataPlantio);
      }
    } else {
      // Se já for uma instância de Date nativa (comportamento antigo)
      dataObj = dataPlantio;
    }

    // Validação de segurança antes de extrair o tempo
    if (isNaN(dataObj.getTime())) {
      console.warn('⚠️ Formato de data inválido recebido para o cálculo automático de colheita.');
      return null;
    }

    // Exemplo de lógica padrão: Somar 4 meses (120 dias) para estimar a colheita
    const dataColheita = new Date(dataObj.getTime());
    dataColheita.setMonth(dataColheita.getMonth() + 4);

    return dataColheita;
  }

  public carregarSugestoesZarc(): void {
    const cultura = this.formWizard.get('cultura_declarada')?.value;
    const municipio = this.formWizard.get('codigo_municipio')?.value || 0;
    const safra = this.formWizard.get('safra')?.value;

    if (!cultura) return;

    if (this.verificarCulturaIsentaZarc(cultura)) {
      this.sugestoesZarcDisponiveis.set(null);
      this.carregandoSugestoes.set(false);

      // Ajusta o volume automaticamente para 0 caso esteja em branco
      if (!this.formWizard.get('volume_declarado_comercializar')?.value) {
        this.formWizard.get('volume_declarado_comercializar')?.setValue(0);
      }

      const anoAtual = new Date().getFullYear();
      this.formWizard.get('data_estimada_plantio')?.setValue(`01/10/${anoAtual}`);
      this.formWizard.get('data_estimada_colheita')?.setValue(`01/10/${anoAtual + 5}`);

      // Força a revalidação do formulário para liberar o botão imediatamente
      this.formWizard.get('volume_declarado_comercializar')?.updateValueAndValidity();
      this.formWizard.get('data_estimada_plantio')?.updateValueAndValidity();
      this.formWizard.get('data_estimada_colheita')?.updateValueAndValidity();
      this.cdr.detectChanges();
      return;
    }

    // Reseta a seleção anterior se alterar a cultura ou safra
    this.decendioSelecionado.set(null);
    this.formWizard.get('data_estimada_plantio')?.setValue('');
    this.formWizard.get('data_estimada_colheita')?.setValue('');

    if (!cultura || !safra) return;

    this.carregandoSugestoes.set(true);
    this.glebaService.obtenerJanelaGeralZarc(cultura, Number(municipio), safra)
      .subscribe({
        next: (resposta) => {
          this.sugestoesZarcDisponiveis.set(resposta);
          this.carregandoSugestoes.set(false);
        },
        error: () => {
          this.sugestoesZarcDisponiveis.set(null);
          this.carregandoSugestoes.set(false);
        }
      });
  }

  /**
   * 2. Calcula as datas dinamicamente com base no ANO DA SAFRA selecionada
   */
  public selecionarJanelaObrigatoria(janela: any): void {
    const safraSelecionada = this.formWizard.get('safra')?.value; // Ex: "2025/2026"
    const anoAtual = new Date().getFullYear(); // 2026

    let anoInicioSafra = anoAtual;
    if (safraSelecionada) {
      const numerosSafra = safraSelecionada.replace(/[^0-9/]/g, '');
      const anoBaseStr = numerosSafra.split('/')[0];
      if (anoBaseStr) {
        anoInicioSafra = parseInt(anoBaseStr, 10);
      }
    }

    // Trava regulatória: Se a safra iniciada for maior que o ano atual, bloqueia
    if (anoInicioSafra > anoAtual) {
      this.erroMensagem.set("Não é permitido selecionar janelas de plantio para safras futuras.");
      return;
    }

    const mesIdx = Math.floor((janela.decendio - 1) / 3);
    const subDecendio = (janela.decendio - 1) % 3;

    let diaPlantio = 5;
    if (subDecendio === 1) diaPlantio = 15;
    if (subDecendio === 2) diaPlantio = 25;

    let anoVigente = anoInicioSafra;
    if (janela.decendio <= 9) {
      anoVigente = anoInicioSafra + 1;
    }

    const dataPlantioObj = new Date(anoVigente, mesIdx, diaPlantio);
    const dataColheitaObj = new Date(anoVigente, mesIdx + 4, diaPlantio);

    // 🟢 TRAVA CRÍTICA: Se a data calculada ultrapassar a data atual do sistema, impede o preenchimento
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataPlantioObj > hoje) {
      this.erroMensagem.set("A data de plantio calculada não pode ser uma data futura.");
      return;
    }

    this.erroMensagem.set(null);
    const dataPlantioExibicao = formatDate(dataPlantioObj, 'dd/MM/yyyy', 'pt-BR');
    const dataColheitaExibicao = formatDate(dataColheitaObj, 'dd/MM/yyyy', 'pt-BR');

    this.decendioSelecionado.set(janela.decendio);
    this.formWizard.get('data_estimada_plantio')?.setValue(dataPlantioExibicao);
    this.formWizard.get('data_estimada_colheita')?.setValue(dataColheitaExibicao);

    this.statusZarc.set(null);
  }

  public verificarCulturaIsentaZarc(cultura: string): boolean {
    if (!cultura) return false;
    const termosIsentos = ['reflorestamento', 'eucalipto', 'pinus', 'silvicultura', 'floresta', 'restauração'];
    return termosIsentos.some(termo => cultura.toLowerCase().includes(termo));
  }



  /**
   * 2. Método acionado no clique do botão final 'Revisar Cadastro'
   */
  public executarEnvioFinalCadastro(): void {
    if (this.formWizard.invalid) return;

    const valores = this.formWizard.value;
    const safraSelecionada = valores.safra || ''; // Ex: "2026/2027"

    // 🟢 Extrai corretamente o ano inicial da safra (ex: 2026)
    const anoInicioSafra = parseInt(safraSelecionada.split('/')[0], 10) || new Date().getFullYear();

    // 🟢 Trava regulatória para impedir safras futuras
    if (anoInicioSafra > new Date().getFullYear()) {
      this.erroMensagem.set("Não é permitido cadastrar ou auditar safras futuras. Selecione uma safra vigente ou passada.");
      return;
    }

    const codigoIbgeMunicipio = this.formWizard.get('codigo_municipio')?.value || 0;

    // Função interna para converter o formato brasileiro "dd/MM/yyyy" para o padrão ISO "YYYY-MM-DD"
    const converterBrParaIso = (dataBr: string): string => {
      if (!dataBr) return '';
      const partes = dataBr.split('/');
      if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
      }
      return dataBr;
    };

    const payloadValidacao = {
      id_gleba: 0,
      municipio_ibge: Number(codigoIbgeMunicipio),
      cultura: valores.cultura_declarada ? valores.cultura_declarada.trim() : '',
      safra: safraSelecionada.trim(),
      volumeDeclaradoComercializar: Number(valores.volume_declarado_comercializar) || 0,
      dataEstimadaPlantio: converterBrParaIso(valores.data_estimada_plantio),
      dataEstimadaColheita: converterBrParaIso(valores.data_estimada_colheita)
    };

    this.glebaService.validarZarcSimplificado(payloadValidacao)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.statusZarc.set(resposta);
          if (resposta.status_validacao === 'CONFORME') {
            this.avancarPasso();
          }
        },
        error: (err) => {
          this.statusZarc.set({
            status_validacao: 'INCONFORME',
            mensagem: err.error?.detail?.mensagem || 'Erro ao processar validação no servidor.'
          });
        }
      });
  }

}
