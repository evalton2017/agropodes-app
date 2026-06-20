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
import {DominioCultura, GlebaService} from '../../../service/gleba.service';
import {PessoaService} from '../../../service/pessoa.service';
import {
  CarFeicoesAmbientaisResponse, JanelaGeralZarcResponse,
  JanelaSugerida,
  MunicipioResponse, ValidarZarcSimplificadoResponse
} from '../model/gleba.model';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MapaLocalizacaoComponent} from '../../../components/mapa-localizacao.component/mapa-localizacao.component';
import {MapaDelimitacaoComponent} from '../../../components/mapa-delimitacao.component/mapa-delimitacao.component';
import {MatIconModule} from '@angular/material/icon';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {debounceTime} from 'rxjs';

export interface ZarcSuccessResponse {
  status_validacao: string;
  mensagem: string;
  sugestoes_janelas_plantio?: any[];
}

@Component({
  selector: 'app-cadastro-gleba',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MapaLocalizacaoComponent,
    MapaDelimitacaoComponent
  ],
  templateUrl: './cadastro-gleba.component.html',
  styleUrls: ['./cadastro-gleba.component.scss']
})
export class CadastroGlebaComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(MapaLocalizacaoComponent) mapaFilho!: MapaLocalizacaoComponent;
  @ViewChild(MapaDelimitacaoComponent) mapaDesenhoFilho!: MapaDelimitacaoComponent;

  public statusZarc = signal<ValidarZarcSimplificadoResponse | null>(null);
  private destroyRef = inject(DestroyRef);
  public decendioSelecionado = signal<number | null>(null);
  public sugestoesZarcDisponiveis = signal<JanelaGeralZarcResponse | null>(null);
  public carregandoSugestoes = signal<boolean>(false);

  private readonly CICLO_CULTURAS_DIAS: Record<string, number> = {
    'SOJA': 120,
    'MILHO': 135,
    'FEIJÃO': 90,
    'ARROZ': 130
  };


  private fb = inject(FormBuilder);
  private glebaService = inject(GlebaService);
  private pessoaService = inject(PessoaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

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
    this.inicializarFormularioBase();
    this.carregarDadosIniciais();
  }


  private inicializarFormularioBase(): void {
    const produtorAtual = this.produtor();

    this.formWizard = this.fb.group({
      nome_gleba: ['Fazenda Boa Vista', [Validators.required, Validators.maxLength(150)]],
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
      safra: ['', [Validators.required]],
      volume_declarado_comercializar: new FormControl('', [Validators.required, Validators.min(1)]),
      data_estimada_plantio: new FormControl('', Validators.required),
      data_estimada_colheita: new FormControl({ value: '', disabled: false }, Validators.required),
    });

    this.formWizard.get('data_estimada_plantio')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valorPlantio => {
        if (valorPlantio) {
          const dataColheitaObjeto = this.calcularDataColheitaAutomatica(valorPlantio);
          if (dataColheitaObjeto) {
            // Formata de volta para String brasileira para não quebrar o input readonly
            const colheitaFormatada = formatDate(dataColheitaObjeto, 'dd/MM/yyyy', 'pt-BR');

            // O { emitEvent: false } evita loops infinitos de escuta no formulário
            this.formWizard.get('data_estimada_colheita')?.setValue(colheitaFormatada, { emitEvent: false });
          }
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
    const fields = ['cultura_declarada', 'safra', 'data_estimada_plantio'];
    return fields.every(field => this.formWizard.get(field)?.valid);
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
      next: (res) => {
        this.dadosCar.set(res);
        this.carregando.set(false);
        this.avancarPasso();
      },
      error: (err) => {
        this.carregando.set(false);
        this.erroMensagem.set(err.error?.detail || 'Erro ao validar CAR.');
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

  finalizarCadastro(): void {
    const produtorAtual = this.produtor();
    if (!produtorAtual || !produtorAtual.id || this.formWizard.invalid) return;

    this.carregando.set(true);

    const payload = {
      ...this.formWizard.getRawValue(),
      id_produtor: produtorAtual.id,
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
    return dados ? `${dados.area_hectares.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ha` : '0,00 ha';
  });

  readonly perimetroFormatadoRevisao = computed(() => {
    const dados = this.areaCalculadaMapa();
    return dados ? `${dados.perimetro_metros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m` : '0,00 m';
  });

  public definirMetricasCalculadasPostGis(areaHa: number, perimetroM: number): void {
    this.areaCalculadaMapa.set({
      area_hectares: areaHa,
      perimetro_metros: perimetroM
    });
    this.cdr.detectChanges();
  }

  private gerarListaSafras(): string[] {
    const anoAtual = new Date().getFullYear();
    const safras: string[] = [];
    for (let i = -1; i <= 1; i++) {
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
    const municipio = this.formWizard.get('municipio_ibge')?.value || 3550308;

    if (!cultura) return;

    this.carregandoSugestoes.set(true);
    this.glebaService.obtenerJanelaGeralZarc(cultura, Number(municipio))
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

  public selecionarJanelaObrigatoria(janela: any): void {
    const anoVigente = 2026;
    const mesIdx = Math.floor((janela.decendio - 1) / 3);
    const subDecendio = (janela.decendio - 1) % 3;

    let diaPlantio = 5;
    if (subDecendio === 1) diaPlantio = 15;
    if (subDecendio === 2) diaPlantio = 25;

    // Criamos as instâncias reais de objeto Date nativo
    const dataPlantioObj = new Date(anoVigente, mesIdx, diaPlantio);
    const dataColheitaObj = new Date(anoVigente, mesIdx + 4, diaPlantio); // +4 meses automático

    // Formata visualmente em padrão BR (dd/MM/yyyy) para o input readonly da tela
    const dataPlantioExibicao = formatDate(dataPlantioObj, 'dd/MM/yyyy', 'pt-BR');
    const dataColheitaExibicao = formatDate(dataColheitaObj, 'dd/MM/yyyy', 'pt-BR');

    // Atualiza o Signal visual
    this.decendioSelecionado.set(janela.decendio);

    // Alimenta os campos do formulário Angular
    this.formWizard.get('data_estimada_plantio')?.setValue(dataPlantioExibicao);
    this.formWizard.get('data_estimada_colheita')?.setValue(dataColheitaExibicao);

    this.statusZarc.set(null);
  }

  /**
   * 2. Método acionado no clique do botão final 'Revisar Cadastro'
   */
  public executarEnvioFinalCadastro(): void {
    if (this.formWizard.invalid) return;

    const codigoIbgeMunicipio = this.formWizard.get('municipio_ibge')?.value || 3550308;
    const valores = this.formWizard.value;

    // Função interna para converter o formato brasileiro "dd/MM/yyyy" para o padrão ISO "YYYY-MM-DD"
    const converterBrParaIso = (dataBr: string): string => {
      if (!dataBr) return '';
      const partes = dataBr.split('/');
      if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`; // Retorna "YYYY-MM-DD"
      }
      return dataBr;
    };

    // Montagem do payload convertendo as chaves para camelCase e as datas para o padrão do Pydantic
    const payloadValidacao = {
      id_gleba: 0,
      municipio_ibge: Number(codigoIbgeMunicipio),
      cultura: valores.cultura_declarada ? valores.cultura_declarada.trim() : '',
      safra: valores.safra ? valores.safra.trim() : '2025/2026',
      volumeDeclaradoComercializar: Number(valores.volume_declarado_comercializar) || 0,

      // 🌟 CORREÇÃO DO ERRO DO PYDANTIC: Enviando em formato ISO sem caracteres inválidos
      dataEstimadaPlantio: converterBrParaIso(valores.data_estimada_plantio),
      dataEstimadaColheita: converterBrParaIso(valores.data_estimada_colheita)
    };

    // Dispara a chamada HTTP limpa para o serviço
    this.glebaService.validarZarcSimplificado(payloadValidacao)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.statusZarc.set(resposta);
          if (resposta.status_validacao === 'CONFORME') {
            this.avancarPasso(); // Avança de etapa se estiver OK
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
