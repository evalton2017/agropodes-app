import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtestadoDetalhadoResponse } from './produtor/relatorio-produtor.model';
import { environment } from '../../../environments/environment';
import {DashboardAnalistaResponse, FiltrosRelatorioAnalista} from '../model/relatorio-contestacao.model';

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

  obterDetalhesAtestadoPorGleba(idGleba: number): Observable<AtestadoDetalhadoResponse> {
    return this.http.get<AtestadoDetalhadoResponse>(
      `${environment.urlProc}/relatorio/gleba/${idGleba}/atestado-detalhes`
    );
  }

  exportarAtestadoPdf(idGleba: number): Observable<Blob> {
    return this.http.get(
      `${environment.urlProc}/relatorio/gleba/${idGleba}/exportar-pdf`,
      { responseType: 'blob' }
    );
  }

  /**
   * 🟢 NOVO: Busca as métricas e consolidado do Dashboard de Relatórios do Analista
   */
  obterDashboardAnalista(filtros?: FiltrosRelatorioAnalista): Observable<DashboardAnalistaResponse> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.data_inicio) params = params.set('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params = params.set('data_fim', filtros.data_fim);
      if (filtros.safra) params = params.set('safra', filtros.safra);
      if (filtros.status) params = params.set('status', filtros.status);
      if (filtros.codigo_car) params = params.set('codigo_car', filtros.codigo_car);
    }

    return this.http.get<DashboardAnalistaResponse>(
      `${environment.urlProc}/relatorio/analista/dashboard`,
      { params }
    );
  }

  /**
   * 🟢 NOVO: Exporta o PDF oficial assinado da contestação do analista
   */
  exportarContestacaoPdf(idContestacao: number): Observable<Blob> {
    return this.http.get(
      `${environment.urlProc}/relatorio/contestacao/${idContestacao}/exportar-pdf`,
      { responseType: 'blob' }
    );
  }
}
