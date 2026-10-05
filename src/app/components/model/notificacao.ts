export type TipoEntidadeNotificacao =
  | 'GLEBA'
  | 'PROPRIEDADE'
  | 'PAGAMENTO'
  | 'CONTESTACAO'
  | 'ALERTA_AMBIENTAL'
  | 'SISTEMA';

export interface PayloadExtraNotificacao {
  id_pagamento?: number;
  id_propriedade?: number;
  codigo_transacao?: string;
  valor?: number;
  area_ha?: number;
  rota_front?: string;
  [key: string]: any;
}

export interface Notificacao {
  idNotificacao: number;
  idUsuario: number;
  titulo: string;
  mensagem: string;
  tipoNotificacao: string;
  tipoEntidade: TipoEntidadeNotificacao;
  idEntidade: number;
  payloadExtra?: PayloadExtraNotificacao | string;
  lida: boolean;
  status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';
  dataCriacao: string;
  dataAtualizacao?: string;
  dataLeitura?: string;
}
