export interface RasterMetadadosResponse {
  id_raster: number;
  id_gleba: number;
  data_captura: string;
  raster_url: string;
  hash_sha256: string;
  geom: string;
  cloud_cover: number;
  ndvi_mean: number;
  ndvi_std: number;
  evi_mean: number;
  evi_std: number;
  savi_mean: number;
  savi_std: number;
}
