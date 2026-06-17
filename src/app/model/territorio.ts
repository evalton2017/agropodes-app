export interface ImagemTerritorio {
  id?: number;
  imageUrl: string;
  chave: string;
  dataCadastro: string;
  poligono?: string;
}

export interface TerritorioResponse {
  id: number;
  hashTransacao: string;
  numeroCar: string;
  nomePropriedade: string;
  poligono: string;
  dataCadastro: string;
  dataAtualizacao: string;
  imagens: ImagemTerritorio[];
}
