/**
 * Define os tipos de propriedades do solo suportadas pelo sistema 3D.
 */
export type SoilPropertyType = 'MATERIA_ORGANICA' | 'SAUDE_PLANTAS' | 'NITROGENIO';

/**
 * Representa uma cor hexadecimal válida (Ex: #FF5733).
 * Garante em tempo de compilação que strings genéricas não quebrem o Grid HEX.
 */
export type HexColor = `#${string}`;

/**
 * Representa um ponto geográfico individual no padrão CRS EPSG:4326.
 */
export interface GeoPoint {
  readonly latitude: number;
  readonly longitude: number;
}

/**
 * Estrutura de um ponto amostral do Grid gerado pelo SGBDOR.
 * Alinhado ao requisito 3.7 (valores equivalentes HEX preenchidos no grid por Lat/Lng).
 */
export interface SoilGridPoint extends GeoPoint {
  readonly value: number;       // Valor absoluto medido (ex: % de M.O. ou índice NDVI)
  readonly hexColor: HexColor;   // Cor HEX correspondente na escala para renderização no Deck.gl
}

/**
 * Resposta estruturada do backend Python para uma propriedade específica da Gleba.
 */
export interface SoilPropertyData {
  readonly property: SoilPropertyType;
  readonly lastUpdated: string; // ISO Date
  readonly grid: readonly SoilGridPoint[]; // Lista imutável de pontos do grid
}

/**
 * Modelo para a escala de cores (Legenda do Mapa).
 * Mapeia faixas de valores para cores HEX específicas.
 */
export interface ColorScaleRange {
  readonly min: number;
  readonly max: number;
  readonly hexColor: HexColor;
  readonly label: string; // Ex: "Baixo", "Ideal", "Crítico"
}
