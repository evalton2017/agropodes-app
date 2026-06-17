export interface AnaliseClimatica {
  id_gleba: number;
  metadados_solicitacao: {
    latitude_centroide: number;
    longitude_centroide: number;
    janela_meses: number;
    periodo_analisado: string;
  };
  indicadores_acumulados: {
    total_dias_sem_chuva: number;
    dias_com_chuvas_excessivas: number;
    dias_com_chuvas_insuficientes: number;
    maxima_sequencia_dias_secos: number;
  };
  alertas_emitidos: Array<{
    evento: string;
    descricao: string;
  }>;
}
