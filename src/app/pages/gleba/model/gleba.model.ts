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

export interface FiltrosAgricolasResponse {
  safras: string[];
  culturas: string[];
}

export interface CalculoAreaResponse {
  area_hectares: number;
  perimetro_metros: number;
}
