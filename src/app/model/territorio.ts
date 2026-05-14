export interface ImagemTerritorio {
  imageUrl: string;
  chave: string;
  dataCadastro: string;
}

export interface TerritorioResponse {
  hashTransacao: string;
  numeroCar: string;
  nomePropriedade: string;
  poligono: string;
  dataCadastro: string;
  dataAtualizacao: string;
  imagens: ImagemTerritorio[];
}
