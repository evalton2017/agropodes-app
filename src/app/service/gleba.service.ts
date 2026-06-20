import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {GlebeApiResponse} from '../dto/response/gleba.response';
import {environment} from '../../environments/environment';
import {CadastroGlebaResponse} from '../dto/response/cadastro-gleba.response';
import {AnaliseClimatica} from '../dto/response/analise-climatica';
import {
  CarFeicoesAmbientaisResponse, JanelaGeralZarcResponse,
  MunicipioResponse, ValidarZarcSimplificadoResponse
} from '../pages/gleba/model/gleba.model';

export interface GlebaPainel extends GlebeApiResponse {
  coordenadas: [number, number][];
  indicadores: ReturnType<typeof signal<AnaliseClimatica | null>>;
  carregandoIndicadores: ReturnType<typeof signal<boolean>>;
}

export interface CalculoAreaResponse {
  area_hectares: number;
  perimetro_metros: number;
}

export interface ValidarZarcRequest {
  id_gleba: number;
  municipio_ibge: number;
  cultura: string;
  safra: string;
  volumeDeclaradoComercializar: number;
  dataEstimadaPlantio: string; // Formato YYYY-MM-DD
  dataEstimadaColheita: string; // Formato YYYY-MM-DD
}


export interface DominioCultura {
  id: number;
  codigo: string;
  nome: string;
  grupo: string | null;
  ativo: boolean;
  permite_zarc: boolean;
  data_cadastro: string; // ISO 8601 Timestamp string
}

@Injectable({
  providedIn: 'root'
})
export class GlebaService {
  private readonly http = inject(HttpClient);

  /**
   * Passo 1: Busca o número do CAR e retorna o balanço de feições ambientais (SICAR)
   */
  buscarDetalhesCar(numeroCar: string): Observable<CarFeicoesAmbientaisResponse> {
    return this.http.get<CarFeicoesAmbientaisResponse>(
      `${environment.urlProc}/produtor/car/${encodeURIComponent(numeroCar)}`
    );
  }

  /**
   * Passo 2: Busca a lista de municípios para o dropdown de geolocalização
   */
  getMunicipios(): Observable<MunicipioResponse[]> {
    return this.http.get<MunicipioResponse[]>(
      `${environment.urlProc}/produtor/municipios`
    );
  }

  /**
   * Passo 3: Envia o polígono WKT desenhado no mapa para o PostGIS calcular área exata
   */
  calcularAreaGeometria(wktGeometria: string): Observable<CalculoAreaResponse> {
    return this.http.post<CalculoAreaResponse>(
      `${environment.urlProc}/produtor/calcular-area-geometria`,
      { geometria: wktGeometria }
    );
  }

  /**
   * Passo 4: Busca as safras e culturas vigentes para os dropdowns agrícolas
   */
  getFiltrosAgricolas(): Observable<DominioCultura[]> {
    return this.http.get<DominioCultura[]>(
      `${environment.urlProc}/produtor/culturas?ativo=true`
    );
  }

  validarZarcSimplificado(payload: ValidarZarcRequest): Observable<ValidarZarcSimplificadoResponse> {
    return this.http.post<ValidarZarcSimplificadoResponse>(`${environment.urlProc}/produtor/validar-zarc`, payload);
  }

  public obtenerJanelaGeralZarc(cultura: string, municipioIbge: number): Observable<JanelaGeralZarcResponse> {
    const params = new HttpParams()
      .set('cultura', cultura.trim())
      .set('municipio_ibge', municipioIbge.toString());

    return this.http.get<JanelaGeralZarcResponse>(`${environment.urlProc}/produtor/janela-geral`, { params });
  }



  /**
   * Busca os dados da gleba e processa a geometria WKT para coordenadas numéricas.
   */
  getGlebaById(idGleba: number): Observable<GlebeApiResponse & { coordenadas: [number, number][] }> {
    return this.http.get<GlebeApiResponse>(`${environment.urlProc}/produtor/gleba/${idGleba}`).pipe(
      map(response => ({
        ...response,
        coordenadas: this.parseWktPolygon(response.geometria)
      }))
    );
  }

  /**
   * Passo 5: Envia o payload consolidado final do formulário para salvar nos esquemas
   */
  cadastrarGleba(gleba: any): Observable<CadastroGlebaResponse> {
    return this.http.post<CadastroGlebaResponse>(
      `${environment.urlProc}/produtor/cadastrar-gleba`,
      gleba
    );
  }

  getGlebasByProdutorId(idProdutor: number): Observable<(GlebeApiResponse & { coordenadas: [number, number][] })[]> {
    return this.http.get<GlebeApiResponse[]>(`${environment.urlProc}/produtor/${idProdutor}/glebas`).pipe(
      map((response: GlebeApiResponse[]) => {
        return response.map(gleba => ({
          ...gleba,
          coordenadas: this.parseGeometriaHexOuWkt(gleba.geometria)
        }));
      })
    );
  }

  getGlebasByProdutorIdPanel(idProdutor: number): Observable<GlebaPainel[]> {
    return this.http.get<GlebeApiResponse[]>(`${environment.urlProc}/produtor/${idProdutor}/glebas`).pipe(
      map((response: GlebeApiResponse[]): GlebaPainel[] => {
        const lista = Array.isArray(response) ? response : [response];

        return lista.map(gleba => ({
          ...gleba,
          coordenadas: this.parseGeometriaHexOuWkt(gleba.geometria),
          indicadores: signal<AnaliseClimatica | null>(null),
          carregandoIndicadores: signal<boolean>(false)
        }));
      })
    );
  }

  // =====================================================================
  // 🗺️ PARSERS ESPACIAIS
  // =====================================================================

  public parseWktPolygon(wkt: string): [number, number][] {
    try {
      if (!wkt) return [];

      const cleanString = wkt
        .replace(/[A-Z]+\s*/i, '') // Remove o texto descritivo da feição
        .replace(/[\(\)]/g, '')    // Remove absolutamente todos os parênteses ( ( ( ) ) )
        .trim();
      const coordinatePairs = cleanString.split(',');

      return coordinatePairs.map(pair => {
        const [lng, lat] = pair.trim().split(/\s+/).map(Number);
        return [lng, lat] as [number, number]; // Retorna [Longitude, Latitude] puro
      });
    } catch (error) {
      console.error('Erro ao converter geometria WKT:', error);
      return [];
    }
  }

  private parseGeometriaHexOuWkt(geometria: string): [number, number][] {
    if (!geometria) return [];

    try {
      if (/^[0-9A-Fa-f]+$/.test(geometria.trim())) {
        return this.parseEwkbHex(geometria.trim());
      }

      const coordinateString = geometria
        .replace(/POLYGON\s*\(\s*\(\s*/i, '')
        .replace(/\s*\)\s*\)\s*$/, '');

      return coordinateString.split(',').map(pair => {
        const [lng, lat] = pair.trim().split(/\s+/).map(Number);
        return [lng, lat] as [number, number];
      });
    } catch (e) {
      console.error('Erro ao processar campo geométrico:', e);
      return [];
    }
  }

  private parseEwkbHex(hex: string): [number, number][] {
    const coordenadas: [number, number][] = [];
    try {
      const bytes = hex.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16));
      const view = new DataView(new Uint8Array(bytes).buffer);

      for (let i = 0; i < view.byteLength - 8; i += 8) {
        const val1 = view.getFloat64(i, true);
        const val2 = view.getFloat64(i + 8, true);

        if (val1 < -30 && val1 > -60 && val2 < -3 && val2 > -25) {
          coordenadas.push([val1, val2]);
          i += 8;
        }
      }
    } catch (err) {
      console.error('Erro no parser binário Hex:', err);
    }
    return coordenadas;
  }

  geocodificarCentroide(lat: number, lon: number): Observable<MunicipioResponse> {
    return this.http.get<MunicipioResponse>(
      `${environment.urlProc}/produtor/geocodificar-centroide?lat=${lat}&lon=${lon}`
    );
  }


}
