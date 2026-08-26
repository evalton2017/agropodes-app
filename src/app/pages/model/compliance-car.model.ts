export interface AlertaCAR {
  descricao?: string;
  nome?: string;
  area_ha: number;
  area_formatada?: string;
  intersecta_imovel: boolean;
}

export interface ResultadoComplianceCAR {
  cod_imovel: string;
  numero_modulos_fiscais: number;
  area_total_desmatada_ha: number;
  sobreposicao_app_rl: string;
  valor_multa_indenizatoria: number;
  bloqueado?: boolean;
  detalhes_alertas: AlertaCAR[];
}
