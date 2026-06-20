
export interface DetalhamentoAmbiental {
  reserva_legal: any;
}

export interface ImovelAmbiental {
  status: string;
  cod_imovel: string;
  area_total_declarada_ha: number;
  geometria: string;
  detalhamento_ambiental: DetalhamentoAmbiental;
}
