import { Component, inject, OnInit, signal, computed, ViewChild, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

// Imports do Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {DominioCultura, GlebaService} from '../../../service/gleba.service';
import {PessoaService} from '../../../service/pessoa.service';
import {CarFeicoesAmbientaisResponse, FiltrosAgricolasResponse, MunicipioResponse} from '../model/gleba.model';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MapaLocalizacaoComponent} from '../../../components/mapa-localizacao.component/mapa-localizacao.component';
import {MapaDelimitacaoComponent} from '../../../components/mapa-delimitacao.component/mapa-delimitacao.component';


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
    MatAutocompleteModule,
    MatCheckboxModule,
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

        // 2. Se o CPF/CNPJ já veio preenchido pelo servidor, limpa validadores complexos
        // e deixa apenas o Required básico para não travar o fluxo
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

  coordenadasCarParsed = computed<[number, number][]>(() => {
    const carResponse = this.dadosCar();
    if (!carResponse || !carResponse.geometria) {
      return [];
    }

    return this.glebaService.parseWktPolygon(carResponse.geometria);
  });

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
      data_estimada_plantio: ['', [Validators.required]]
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

    // Gera as safras de forma dinâmica (ex: 2024/2025, 2025/2026, 2026/2027)
    for (let i = -1; i <= 1; i++) {
      const anoInicio = anoAtual + i;
      const anoFim = anoInicio + 1;
      safras.push(`${anoInicio}/${anoFim}`);
    }
    return safras;
  }


}
