import {GlebeApiResponse} from '../../../dto/response/gleba.response';
import {signal} from '@angular/core';
import {AnaliseClimatica} from '../../../dto/response/analise-climatica';

export interface DetalhamentoAmbiental {
  app?: number;
  banhado?: number;
  manguezal?: number;
  reserva_legal?: number;
  uso_restrito?: number;
  vegetacao_nativa?: number;
}

export interface CarFeicoesAmbientaisResponse {
  status: string;
  descricao_status: string;
  ultima_atualizacao: Date;
  cod_imovel: string;
  nom_imovel: string;
  area_total_declarada_ha: number;
  geometria: string;
  detalhamento_ambiental: DetalhamentoAmbiental;
}

export interface MunicipioResponse {
  codigo_municipio: number;
  nome_municipio: string;
  sigla_uf: string;
  estado: string;
}

export interface ValidarZarcSimplificadoResponse {
  status_validacao: 'CONFORME' | 'INCONFORME';
  mensagem: string;
}


export interface JanelaSugerida {
  decendio: number;
  periodo_sugerido: string;
  risco_pct: number;
}

export interface JanelaGeralZarcResponse {
  cultura: string;
  municipio_ibge: number;
  data_inicio_permitida: string; // Formato ISO "YYYY-MM-DD"
  data_fim_permitida: string;    // Formato ISO "YYYY-MM-DD"
  sugestoes_janelas_plantio: JanelaSugerida[];
  mensagem_auxiliar: string;
}

export interface KpisResumoGlebas {
  totalCadastradas: number;
  totalConformes: number;
  totalEmAnalise: number;
  totalAlertas: number;
  proximaValidacao: string;
}

export interface ItemTabelaGleba {
  idGleba: number;
  codigo: string;
  nomeGleba: string;
  municipio: string;
  culturaDeclarada: string;
  areaHa: number;
  status: 'Conforme' | 'Em analise' | 'Alerta';
  ultimaAtualizacao: string;
  geometria: string;
}

export interface RespostaConsultaGlebasPainel {
  kpis: KpisResumoGlebas;
  glebas: Array<ItemTabelaGleba>;
}

export interface StatusPassos {
  geometria: string;
  consultaCar: string;
  ambiental: string;
  culturaIa: string;
  zarc: string;
  produtividade: string;
  atestado: string;
}

export interface Atividade {
  descricao: string;
  dataHora: string;
  tipo: 'sucesso' | 'info' | 'alerta' | 'erro';
}

export interface InformacoesZarc {
  portaria: string;
  grupoDeRisco: string;
  riscoAdmissivel: string;
  janelaDePlantio: string;
  suaDataEstimada: string;
}

export interface ResumoAnalises {
  ambientalStatus: string;
  ambientalDesc: string;
  culturaIaStatus: string;
  culturaIaDesc: string;
  produtividadeStatus: string;
  produtividadeDesc: string;
  atestadoStatus: string;
  atestadoDesc: string;
}

export interface BlocoPendencias {
  descricao: string;
  recomendacao: string;
}

export interface GlebaData {
  idGleba: number;
  idProdutor: number;
  codigo: string;
  codigoCar: string;
  geometria: string;
  areaHa: number;
  culturaDeclarada: string;
  nomeGleba: string;
  municipio: string;
  status: 'Conforme' | 'Inconforme' | 'Em Analise' | 'Pendência';
  ultimaAtualizacao: string;
  statusPassos: StatusPassos;
  pendencias: BlocoPendencias;
  ultimasAtividades: Atividade[];
  informacoesZarc: InformacoesZarc;
  resumoAnalises: ResumoAnalises;
}


export interface GlebaPainel extends GlebeApiResponse {
  coordenadas: [number, number][];
  indicadores: ReturnType<typeof signal<AnaliseClimatica | null>>;
  carregandoIndicadores: ReturnType<typeof signal<boolean>>;
}

export interface CalculoAreaResponse {
  area_hectares: number;
  perimetro_metros: number;
}

export interface ValidarZarcRequest {
  id_gleba: number;
  municipio_ibge: number;
  cultura: string;
  safra: string;
  volumeDeclaradoComercializar: number;
  dataEstimadaPlantio: string; // Formato YYYY-MM-DD
  dataEstimadaColheita: string; // Formato YYYY-MM-DD
}


export interface DominioCultura {
  id: number;
  codigo: string;
  nome: string;
  grupo: string | null;
  ativo: boolean;
  permite_zarc: boolean;
  data_cadastro: string; // ISO 8601 Timestamp string
}


export interface SafrasGlebaAPIResponse {
  safra_principal: string;
  safras: string[];
}

export interface SafraItem {
  id_safra: string;
  label: string;
  status: string;
  vigente: boolean;
}

