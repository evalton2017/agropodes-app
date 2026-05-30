export interface DetalheCarResponse {
  id: number;
  codigoCar: string;
  statusImovel: string;
  condicaoAnalise: string;
  municipio: string;
  estado: string;
  areaTotalHa: number;
  modulosFiscais: number;
  areaUsoConsolidadoHa: number;
  areaReservaLegalNativaHa: number;
  areaAppTotalHa: number;
  areaSobreposicaoImoveisHa: number;
  areaSobreposicaoAssentamentoHa: number;
  deficitReservaLegalHa: number;
  situacaoReservaLegal: string;
  dataConsulta: string;
}
