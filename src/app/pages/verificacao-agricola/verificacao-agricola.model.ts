export interface ItemSerieTemporalRaster {
  idRaster: number;
  dataCaptura: string;
  cloudCover: number;
  ndviMean: number;
  rasterUrl: string;
}

export interface CardHeaderGleba {
  safra: string;
  statusSafra: string;
  cultura: string;
  areaHa: number;
  municipioUf: string;
  iuIdentificadorUnico: string;
}

export interface ResumoMetricasAgricolas {
  produtividadeScHa: number;
  dataPlantio: string;
  dataColheita: string;
  zarcStatus: string;
  ndviMedio: number;
  chuvaAcumuladaMm: number;
  temperaturaMediaC: number;
  materiaOrganicaPct: number;
  conformidadeSocioambiental: string;
}

export interface RespostaVerificacaoAgricola {
  idGleba: number;
  geometria: string;
  header: CardHeaderGleba;
  metricas: ResumoMetricasAgricolas;
  serieTemporalRasters: ItemSerieTemporalRaster[];
}
