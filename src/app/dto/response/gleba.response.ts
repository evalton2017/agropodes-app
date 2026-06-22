export interface GlebeApiResponse {
  idGleba: number;
  idProduto: number;
  codigoCar: string;
  geometria: string; // Formato WKT Ex: "POLYGON ((-44.41621... -9.96840...))"
  area_hectares: number;
  data_criacao: string; // ISO String YYYY-MM-DD
  data_estimada_plantio: string; // ISO String YYYY-MM-DD
  cultura_declarada: string;
  statusVmg?: string;
}
