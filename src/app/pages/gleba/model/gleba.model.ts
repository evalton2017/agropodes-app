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
  cod_imovel: string;
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


