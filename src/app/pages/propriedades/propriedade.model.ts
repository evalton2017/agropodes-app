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

export interface CadastrarSocioDTO {
  cpf_cnpj: string;
  nome: string;
  email?: string;
  percentual_participacao?: number;
  tipo_vinculo?: string; // 'SOCIO' | 'CO_PROPRIETARIO' | 'ARRENDATARIO'
}

export interface SocioPropriedadeItem {
  id_pessoa: number;
  nome: string;
  cpf_cnpj: string;
  email?: string;
  tipo_vinculo: string;
  percentual_participacao: number;
}

export interface DetalhesPropriedadeResponse {
  id_propriedade: number;
  nome_propriedade: string;
  codigo_car: string;
  area_hectares: number;
  data_criacao: string;
  municipio: string;
  uf: string;
  mapa_base64?: string;
  legenda_mapa?: Array<{ nome: string; cor_hex: string }>;
  proprietario?: {
    nome: string;
    cpf_cnpj: string;
  };
  socios?: SocioPropriedadeItem[];
  deteccoes: Array<{
    id_deteccao: number;
    alerta: string;
    tipo_conflito: string;
    area_m2: number;
    area_ha: number;
  }>;
}
