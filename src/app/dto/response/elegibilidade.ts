import {ProdesResponse} from './prodes-response';

export interface ElegibilidadeResponse {
   codigoCar: number;
   elegivel: boolean;
   nomePropriedade: string;
   prodes: ProdesResponse []

}
