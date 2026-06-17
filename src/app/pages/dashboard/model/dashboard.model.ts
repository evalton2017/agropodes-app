export interface FiltrosDashboard {
  safra?: string;
  data_inicio?: string;
  data_fim?: string;
  estado?: string;
  municipio_ibge?: number;
}

export interface KpiItem {
  valor_atual: number;
  variacao_percentual: number;
}

export interface KpisDashboard {
  contratos: KpiItem;
  glebas_monitoradas: KpiItem;
  area_total: KpiItem;
  alertas_ativos: KpiItem;
  atestados_emitidos: KpiItem;
}

export interface DataEstado {
  estado: string;
  quantidade: number;

}

export interface DataCultura {
  cultura: string;
  quantidade: number;
  percentual?: number;
}

export interface GraficoData {
  sucesso: boolean;
  data: DataEstado[]
}

export interface CulturaData {
  sucesso: boolean;
  data:DataCultura[]
}

export interface AlertaCritico {
  tipo_alerta: string;
  quantidade: number;
}

export interface AnaliseItem {
  tipo: string;
  descricao: string;
  data: string;
}

export interface ApiResponse {
  sucesso: boolean;
  data: AnaliseItem[];
}

export interface UltimoAtestado {
  codigo_gleba: string;
  produtor: string;
  municipio: string;
  data: string;
  area_ha: number;
}

export interface Heatmap {
  latitude: number;
  longitude: number;
  status: string;
}


export interface DadosAnaliseIA {
  acuracia_media: number;
  variacao_acuracia: number;
  total_glebas_analisadas: number;
  data_ultima_analise: string;
  top_culturas: PizzaCultura[];
  produtividade_media_sacas: number;
  area_estimada_ha: number;
  volume_estimado_sacas: number;
  evolucao_produtividade: EvolucaoMensal[];
  resumo_climatico: ResumoClimatico
}

export interface PizzaCultura {
  nome: string;
  percentual: number;
  cor?: string; // Ex: '#4caf50', '#ffc107', '#9c27b0'
}

export interface EvolucaoMensal {
  mes: string;
  valor: number;
}

export interface EventoClimatico {
  evento: 'Veranico' | 'Dias sem chuva' | 'Excesso de chuva' | 'Chuva acumulada' | 'Granizo' | 'Geada' | 'Vento forte' | 'Velocidade do vento';
  municipio: string;
  data: string;
  impacto: 'Alto' | 'Médio' | 'Baixo';
  glebas_afetadas: number;
}


export interface ResumoClimatico {
  chuva_acumulada_mm: number;
  variacao_chuva_pct: number;
  temp_media_celsius: number;
  variacao_temp_celsius: number;
  dias_sem_chuva: number;
  variacao_dias_sem_chuva: number;
  vel_vento_kmh: number;
  variacao_vel_vento: number;
}

export interface EtapaProcesso {
  etapa: string;
  detalhe: string;
  data: string; // Formato: "YYYY-MM-DD HH:mm:ss"
}
