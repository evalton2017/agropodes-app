import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtestadoDetalhadoResponse } from './produtor/relatorio-produtor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private readonly http = inject(HttpClient);

  obterSafrasPorGleba(idGleba: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${environment.urlProc}/relatorio/gleba/${idGleba}/safras`
    );
  }

  obterAtestadoPorGlebaESafra(idGleba: number, safra?: string): Observable<AtestadoDetalhadoResponse> {
    let params = new HttpParams();
    if (safra) {
      params = params.set('safra', safra);
    }

    return this.http.get<AtestadoDetalhadoResponse>(
      `${environment.urlProc}/relatorio/gleba/${idGleba}/atestado-detalhes`,
      { params }
    );
  }

  /**
   * Busca os metadados JSON do atestado para renderização na tela.
   */
  obterDetalhesAtestadoPorGleba(idGleba: number): Observable<AtestadoDetalhadoResponse> {
    return this.http.get<AtestadoDetalhadoResponse>(
      `${environment.urlProc}/relatorio/gleba/${idGleba}/atestado-detalhes`
    );
  }

  /**
   * Dispara a requisição ao backend Python para compilar e fazer o streaming do PDF oficial VMG.
   * Utiliza 'blob' como responseType para capturar o fluxo de dados binários do arquivo.
   *
   * @param idGleba Identificador único da gleba analisada
   */
  exportarAtestadoPdf(idGleba: number): Observable<Blob> {
    return this.http.get(
      `${environment.urlProc}/relatorio/gleba/${idGleba}/exportar-pdf`,
      { responseType: 'blob' }
    );
  }
}
