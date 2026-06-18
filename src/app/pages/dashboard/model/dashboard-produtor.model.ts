
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
