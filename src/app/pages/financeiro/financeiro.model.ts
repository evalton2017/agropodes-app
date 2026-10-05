export interface MultaProdutor {
  id_multa: number;
  id_propriedade: number;
  nome_propriedade?: string;
  codigo_car?: string;
  tipo_infracao: string;
  area_afetada_ha: number;
  valor_base_ha: number;
  valor_total_multa: number;
  status_multa: 'GERADA' | 'PAGA' | 'CONTESTADA' | 'CANCELADA';
  data_geracao: string;
  data_validade?: string;
  detalhes_calculo_json?: any;
  id_pagamento?: number;
}

export interface DetalheMulta {
  id_deteccao: number;
  nome_alerta: string;
  tipo_conflito: string;
  modo_validacao: string;
  area_ha: number;
  valor_base_ha: number;
  is_app_rl: boolean;
  valor_estimado: number;
  fundamentacao_legal: string;
}

export interface SimulacaoMultaResponse {
  id_propriedade: number;
  nome_propriedade: string;
  id_produtor_titular: number;
  total_deteccoes: number;
  valor_total_estimado: number;
  detalhamento_multas: DetalheMulta[];
  prazo_vencimento_dias: number;
  mensagem?: string;
}


export interface Pagamento {
  idPagamento: number;
  idProdutor: number;
  idPropriedade?: number;
  tipoPagamento: string;
  valor: number;
  statusPagamento: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'FALHA';
  metodoPagamento?: string;
  codigoTransacao?: string;
  urlComprovante?: string;
  descricao?: string;
  dataVencimento?: string;
  dataPagamento?: string;
  dataCriacao: string;
}

export interface RequisicaoPagamento {
  idPagamento: number;
  metodoPagamento: 'PIX' | 'CREDITO' | 'DEBITO';
  parcelas?: number;
  dadosCartao?: {
    numero: string;
    nomeTitular: string;
    validade: string;
    cvv: string;
  };
}

export interface DadosCartaoDTO {
  numero: string;
  nomeTitular: string;
  cpfTitular: string;
  validade: string;
  cvv: string;
  bandeira?: string;
}

export interface RequisicaoPagamentoDTO {
  idPagamento: number;
  metodoPagamento: 'PIX' | 'CREDITO' | 'DEBITO';
  parcelas?: number;
  dadosCartao?: DadosCartaoDTO;
}

export interface ComprovanteResponseDTO {
  idComprovante: number;
  idPagamento: number;
  codigoAutenticacao: string;
  metodoPagamento: string;
  statusTransacao: string;
  valorPago: number;
  parcelas: number;
  titularCartao?: string;
  cpfTitularMascarado?: string;
  cartaoMascarado?: string;
  bandeiraCartao?: string;
  pixE2eId?: string;
  pixPayload?: string;
  pixTxid?: string;
  pixExpiracao?: string;
  dataEmissao: string;
}
