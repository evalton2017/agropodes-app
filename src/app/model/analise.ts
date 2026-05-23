import {ImagemTerritorio} from './territorio';


export type StatusAnaliseType = 'EM_ANALISE' | 'APROVADO' | 'REPROVADO';

export const StatusAnaliseLabel: Record<StatusAnaliseType, string> = {
  EM_ANALISE: 'Em Análise',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado'
};

export interface Analise {
  idAnalise: number;
  imagemProdes: ImagemTerritorio;
  latitude: number;
  longitude: number;
  poligono: string;
  poligonoUnificado: string;
  analisado: boolean;
  statusAnalise: StatusAnaliseType;
}
