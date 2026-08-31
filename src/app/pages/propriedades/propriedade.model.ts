export interface AlertaCAR {
  nome?: string;
  descricao?: string;
  tipo_conflito: string;
  modo_validacao: string;
  intersecta_imovel: boolean;
  area_km2?: number;
  area_ha: number;
}

export interface ComplianceCARResponse {
  cod_imovel: string;
  numero_modulos_fiscais: number;
  area_total_desmatada_ha: number;
  sobreposicao_app_rl: string;
  valor_multa_indenizatoria: number;
  bloqueado: boolean;
  detalhes_alertas: AlertaCAR[];
}

export interface DeteccaoPropriedade {
  id_deteccao: number;
  nome_alerta: string;
  modo_validacao: string;
  tipo_conflito: string;
  intersecta_imovel: boolean;
  area_intersecao_m2: number;
  area_ha: number;
  geom_ocorrencia_wkt?: string;
}

export interface Propriedade {
  id_propriedade: number;
  codigo_car: string;
  area_hectares: number;
  geometria_wkt?: string;
  data_criacao: string;
  total_deteccoes: number;
  area_desmatada_ha: number;
  tem_sobreposicao_app_rl: boolean;
  deteccoes?: DeteccaoPropriedade[];
}

export interface NovaContestacaoPropriedadeRequest {
  id_propriedade: number;
  ids_deteccoes: number[];
  motivo_contestacao: string;
  wkt_demarcado?: string;
}
