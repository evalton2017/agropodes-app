import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {GlebeApiResponse} from '../../../dto/response/gleba.response';
import {environment} from '../../../../environments/environment';
import {CadastroGlebaResponse} from '../../../dto/response/cadastro-gleba.response';
import {AnaliseClimatica} from '../../../dto/response/analise-climatica';
import {
  CalculoAreaResponse,
  CarFeicoesAmbientaisResponse, DominioCultura, GlebaData, GlebaPainel, JanelaGeralZarcResponse,
  MunicipioResponse, RespostaConsultaGlebasPainel, ValidarZarcRequest, ValidarZarcSimplificadoResponse
} from '../model/gleba.model';
import {GlebaItem} from '../../dashboard/model/dashboard-produtor.model';



@Injectable({
  providedIn: 'root'
})
export class GlebaService {
  private readonly http = inject(HttpClient);

  buscarDetalhesCar(numeroCar: string): Observable<CarFeicoesAmbientaisResponse> {
    return this.http.get<CarFeicoesAmbientaisResponse>(
      `${environment.urlProc}/produtor/car/${encodeURIComponent(numeroCar)}`
    );
  }

  geocodificarCentroide(lat: number, lon: number): Observable<MunicipioResponse> {
    return this.http.get<MunicipioResponse>(
      `${environment.urlProc}/produtor/geocodificar-centroide?lat=${lat}&lon=${lon}`
    );
  }

  getMunicipios(): Observable<MunicipioResponse[]> {
    return this.http.get<MunicipioResponse[]>(
      `${environment.urlProc}/produtor/municipios`
    );
  }

  calcularAreaGeometria(wktGeometria: string): Observable<CalculoAreaResponse> {
    return this.http.post<CalculoAreaResponse>(
      `${environment.urlProc}/produtor/calcular-area-geometria`,
      { geometria: wktGeometria }
    );
  }

  getFiltrosAgricolas(): Observable<DominioCultura[]> {
    return this.http.get<DominioCultura[]>(
      `${environment.urlProc}/produtor/culturas?ativo=true`
    );
  }

  validarZarcSimplificado(payload: ValidarZarcRequest): Observable<ValidarZarcSimplificadoResponse> {
    return this.http.post<ValidarZarcSimplificadoResponse>(`${environment.urlProc}/produtor/validar-zarc`, payload);
  }

  public obtenerJanelaGeralZarc(cultura: string, municipioIbge: number, safra: string): Observable<JanelaGeralZarcResponse> {
    const params = new HttpParams()
      .set('cultura', cultura.trim())
      .set('municipio_ibge', municipioIbge.toString())
      .set('safra', safra.toString());

    return this.http.get<JanelaGeralZarcResponse>(`${environment.urlProc}/produtor/janela-geral`, { params });
  }

  obterPainelGerencialGlebas(idProdutor: number, safra: string): Observable<RespostaConsultaGlebasPainel> {
    const params = new HttpParams()
      .set('id_produtor', idProdutor.toString())
      .set('safra', safra.trim());

    return this.http.get<RespostaConsultaGlebasPainel>(`${environment.urlProc}/produtor/${idProdutor}/consulta-glebas`, { params });
  }

  consultarGlebaProdutor(idProdutor: number): Observable<GlebaItem[]> {
    const params = new HttpParams();
    params.set('id_produtor', idProdutor.toString())
    return this.http.get<GlebaItem[]>(`${environment.urlProc}/produtor/${idProdutor}/glebas`, { params });
  }

  getGlebaById(idGleba: number): Observable<GlebeApiResponse & { coordenadas: [number, number][] }> {
    return this.http.get<GlebeApiResponse>(`${environment.urlProc}/produtor/gleba/${idGleba}`).pipe(
      map(response => ({
        ...response,
        coordenadas: this.parseWktPolygon(response.geometria)
      }))
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

  cadastrarGleba(gleba: any): Observable<CadastroGlebaResponse> {
    return this.http.post<CadastroGlebaResponse>(
      `${environment.urlProc}/produtor/cadastrar-gleba`,
      gleba
    );
  }

  obterDetalheLaudoGleba(idGleba: number): Observable<GlebaData> {
    return this.http.get<GlebaData>(`${environment.urlProc}/gleba/${idGleba}/laudo-detalhado`);
  }


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




}
