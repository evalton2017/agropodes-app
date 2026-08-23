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
