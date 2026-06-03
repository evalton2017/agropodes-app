import {TerritorioResponse} from './territorio';
import {Analise} from './analise';

export interface Dashboard {
  territorios: TerritorioResponse[];
  analiseProdes: Analise[];
}
