export interface ConflitoDetalhe {
  tipo_mapa739: string;
  tipo_cmn_5268: string;
  localizacao_alerta: string;
  area_ha: number;
  area_km2: number;
  bioma?: string;
  geometria_wkt: string;
  selecionado?: boolean;
}

export interface DetalhesConflitosGlebaResponse {
  id_gleba: number;
  safra_recente: string;
  geometria_gleba_wkt: string;
  area_total_ha: number;
  conflitos_detectados: ConflitoDetalhe[];
}

export interface ContestacaoPayload {
  id_gleba: number;
  poligono_contestacao: string; // WKT desenhado pelo produtor
  poligono_detectado?: string; // WKT original do conflito
  tamanho_area_demarcada_ha: number;
  tamanho_area_detectada_ha?: number;
  descricao_motivo: string;
  analise_automatica_json?: any;
}

export interface DetalhesConflitosPropriedadeResponse {
  id_propriedade: number;
  codigo_car: string;
  nome_propriedade?: string;
  area_total_ha: number;
  geometria_propriedade_wkt: string;
  conflitos_detectados: ConflitoDetalhe[];
}

export interface ContestacaoItemAcompanhamento {
  id_contestacao: number;
  id_propriedade?: number | null;
  id_gleba?: number | null;
  codigo_car?: string | null;
  nome_alvo: string;
  status_contestacao: string;
  data_criacao: string;
  data_atualizacao: string;
  tem_parecer: boolean;
  permite_cancelar: boolean;
  permite_relatorio: boolean;
}

export interface LegendaCamada {
  chave: string;
  nome: string;
  cor_hex: string;
  visivel: boolean;
}

export interface DetalhesContestacaoCompleto {
  id_contestacao: number;
  id_propriedade?: number | null;
  id_gleba?: number | null;
  codigo_car?: string | null;
  nome_alvo: string;
  tamanho_area_demarcada_ha: number;
  tamanho_area_detectada_ha?: number | null;
  descricao_motivo: string;
  status_contestacao: string;
  parecer_analista?: string | null;
  data_criacao: string;
  data_atualizacao: string;
  geometria_alvo_wkt: string;
  poligono_contestacao_wkt: string;
  poligono_detectado_wkt?: string | null;
  documentos_anexados: string[];
  legenda_mapa: LegendaCamada[];
}
