export type StatusAtestado = 'APTO' | 'EM ANÁLISE' | 'NÃO APTO' | 'RASCUNHO';
export type TipoFaseLinhaTempo = 'Plantio' | 'Desenvolvimento' | 'Colheita' | 'Auditoria';
export type TipoEventoLinhaTempo = 'Estimado' | 'Realizado' | 'Pendente';


export interface CardGleba {
  nome_gleba: string;
  cultura_principal: string;
  safra: string;
  periodo_analisado: string;
  status_atestado: 'APTO' | 'EM ANÁLISE' | 'NÃO APTO' | 'RASCUNHO';
  data_emissao_atestado: string | Date;
  area_hectares: number;
}

export interface ResumoConformidade {
  ambiental_conforme: boolean;
  agricola_conforme: boolean;
  boas_praticas_conforme: boolean;
  zarc_conforme: boolean;
  produtividade_conforme: boolean;
  produtividade_estimada_sacas: number;
  produtividade_declarada_sacas: number;
}

export interface InformacoesGleba {
  municipio_uf: string;
  codigo_car: string;
  coordenadas_centroide: string;
  data_cadastro: string | Date;
}

export interface EventoLinhaTempo {
  fase: string;
  data_evento: string | Date;
  tipo: string;
}

export interface MetricasProdutividade {
  declarado_sacas_ha: number;
  estimado_ia_sacas_ha: number;
  referencia_regional_sacas_ha: number;
}

export interface DadosAtestado {
  codigo_atestado: string;
  orgao_emissor: string;
  metodo_validacao: string;
  validade_inicio: string | Date;
  validade_fim: string | Date;
  hash_documento_blockchain: string;
}

export interface AtestadoDetalhadoResponse {
  cabecalho: CardGleba;
  conformidade: ResumoConformidade;
  informacoes_gerais: InformacoesGleba;
  linha_tempo_safra: EventoLinhaTempo[];
  produtividade: MetricasProdutividade;
  metadados_atestado: DadosAtestado;
}

export interface GlebaItemLista {
  id_gleba: number;
  codigo_identificador: string; // Ex: GLB-001
  nome_gleba: string;
  area_hectares: number;
  status_atestado: 'APTO' | 'EM ANÁLISE' | 'NÃO APTO' | 'RASCUNHO';
  data_emissao_atestado: string | Date | null;
}

