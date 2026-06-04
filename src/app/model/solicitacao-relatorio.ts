import {DetalheCarResponse} from '../dto/response/detalhe-car-response';

export interface SolicitacaoRelatorio {
  id: number;
  consultaCar?: DetalheCarResponse;
  codigoCar?: string;
  usuario?: string;
  relatorio?: string;
  dataCadastro: Date | string;
  dataAtualizacao?: Date | string;
}
