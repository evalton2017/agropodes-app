
export interface RespostaDashboardProdutor {
  produtor_nome: string;
  safra_selecionada: string;
  glebas_ativas_total: number;
  glebas_monitoradas_pct: number;
  conformidade_ambiental_pct: number;
  area_conforme_ha: number;
  area_total_ha: number;
  total_municipios: number;
  atestados_emitidos_total: number;
  alertas_total: number;
  proxima_validacao_data: string;
}

export interface GlebaGeometriaResponse {
  id_gleba: number;
  id_produtor: number;
  codigo_car: string;
  geometria: string;
  area_hectares: number;
  data_criacao: string;
  data_estimada_plantio: string;
  cultura_declarada: string;
  status_vmg?: string;
}

export interface ItemStatusPizza {
  status: string;
  quantidade: number;
  percentual: number;
}

export interface AtividadeAgendada {
  tipo_atividade: string;
  descricao: string;
  data_prevista: string;
}

export interface RespostaStatusAtividades {
  status_glebas: {
    total: number;
    detalhes: ItemStatusPizza[];
  };
  proximas_atividades: AtividadeAgendada[];
}

export interface Criterio {
  criterio: string;
  status: string;
  area_ha: number;
  percentual: number;
}

export interface RespostaConformidadeAmbientalDTO {
  id_gleba: number;
  criterios: Criterio[];
  conformidade_geral_pct: number;
}
