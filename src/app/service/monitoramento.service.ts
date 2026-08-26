import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonitoramentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.urlProc}/mapa/gleba`;

  /**
   * Obtém o Grid 3D de propriedades do solo por Gleba e Safra opcional.
   */
  public obterGrid3D(idGleba: number, safra?: string): Observable<any> {
    let params = new HttpParams();
    if (safra) {
      params = params.set('safra', safra);
    }

    return this.http.get<any>(`${this.baseUrl}/${idGleba}/grid-3d`, { params });
  }

  /**
   * Obtém o diagnóstico de análise climática por Gleba, Cultura e Safra opcional.
   */
  public obterAnaliseClima(idGleba: number, cultura: string = 'SOJA', safra?: string): Observable<any> {
    let params = new HttpParams().set('cultura', cultura);
    if (safra) {
      params = params.set('safra', safra);
    }

    return this.http.get<any>(`${this.baseUrl}/${idGleba}/analise-clima`, { params });
  }

  /**
   * Obtém os dados do Caderno de Campo filtrados por Gleba e Safra opcional.
   */
  public obterCadernoCampo(idGleba: number, safra?: string): Observable<any> {
    let params = new HttpParams();
    if (safra) {
      params = params.set('safra', safra);
    }

    return this.http.get<any>(`${this.baseUrl}/${idGleba}/caderno-campo`, { params });
  }

  /**
   * Realiza o download do arquivo GeoTIFF das bandas do Sentinel-2.
   */
  public downloadGeotiff(idGleba: number, safra?: string): Observable<Blob> {
    let params = new HttpParams();
    if (safra) {
      params = params.set('safra', safra);
    }

    return this.http.get(`${this.baseUrl}/${idGleba}/download-geotiff`, {
      params,
      responseType: 'blob'
    });
  }
}
