import {ImagemTerritorio} from './territorio';


export type StatusAnaliseType = 'EM_ANALISE' | 'COM_PENDENCIA' | 'APROVADO' | 'REPROVADO';

export const StatusAnaliseLabel: Record<StatusAnaliseType, string> = {
  EM_ANALISE: 'Em Análise',
  COM_PENDENCIA: 'Com Pendência',
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
  imageUrl: string;
  statusAnalise: StatusAnaliseType;
}
