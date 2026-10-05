export interface KpiRelatorioAnalista {
  sla_medio_dias: number;
  total_contestacoes: number;
  total_deferidas: number;
  total_indeferidas: number;
  total_pendentes: number;
  pct_deferimento: number;
  pct_indeferimento: number;
  area_total_contestada_ha: number;
}

export interface TipologiaConflito {
  tipo: string;
  quantidade: number;
  percentual: number;
}

export interface ProdutividadeAnalista {
  analista: string;
  julgados: number;
}

export interface ItemListagemRelatorio {
  protocolo: string;
  id_contestacao: number;
  codigo_car: string;
  produtor: string;
  alvo: string;
  area_demarcada_ha: number;
  area_detectada_ha: number;
  status: string;
  sla_dias: number;
  data_criacao: string;
}

export interface DashboardAnalistaResponse {
  kpis: KpiRelatorioAnalista;
  tipologia_conflitos: TipologiaConflito[];
  produtividade_analistas: ProdutividadeAnalista[];
  listagem: ItemListagemRelatorio[];
}

export interface FiltrosRelatorioAnalista {
  data_inicio?: string;
  data_fim?: string;
  safra?: string;
  status?: string;
  codigo_car?: string;
}
