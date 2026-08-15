
export interface DetalhamentoAmbiental {
  reserva_legal: any;
}

export interface ImovelAmbiental {
  status: string;
  descricao_status: string;
  ultima_atualizacao: Date;
  cod_imovel: string;
  nom_imovel: string;
  area_total_declarada_ha: number;
  geometria: string;
  detalhamento_ambiental: DetalhamentoAmbiental;
}
