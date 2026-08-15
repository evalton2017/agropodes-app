import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FiltrosDashboard } from './dashboard-filtro.service';
import { environment } from '../../../../environments/environment';
import {
  GlebaGeometriaResponse,
  RespostaConformidadeAmbientalDTO,
  RespostaDashboardProdutor,
  RespostaStatusAtividades,
  ProdutividadeEstimadaResponse,
  ClimaResumoResponse
} from '../model/dashboard-produtor.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardProdutorService {

  private readonly baseUrl = `${environment.urlProc}/dashboard-produtor`;

  constructor(private readonly http: HttpClient) { }

  /**
   * Configura os parâmetros padrão das requisições incluindo o id_gleba quando houver
   */
  private configurarParametrosPadrao(idProdutor: number, filtros: FiltrosDashboard): HttpParams {
    const safraLimpa = filtros?.safra ? filtros.safra.trim() : '2025/2026';
    let params = new HttpParams()
      .set('id_produtor', idProdutor.toString())
      .set('safra', safraLimpa);

    if (filtros?.idGleba) {
      params = params.set('id_gleba', filtros.idGleba.toString());
    }

    return params;
  }

  obterResumoProdutor(idProdutor: number, filtros: FiltrosDashboard): Observable<RespostaDashboardProdutor> {
    const params = this.configurarParametrosPadrao(idProdutor, filtros);

    return this.http.get<RespostaDashboardProdutor>(`${this.baseUrl}/resumo`, { params }).pipe(
      map(dados => ({
        ...dados,
        area_conforme_ha: Number(dados.area_conforme_ha),
        area_total_ha: Number(dados.area_total_ha),
        glebas_monitoradas_pct: Number(dados.glebas_monitoradas_pct),
        conformidade_ambiental_pct: Number(dados.conformidade_ambiental_pct)
      }))
    );
  }

  obterGlebasGeometria(idProdutor: number, filtros: FiltrosDashboard): Observable<GlebaGeometriaResponse[]> {
    const params = this.configurarParametrosPadrao(idProdutor, filtros);
    return this.http.get<GlebaGeometriaResponse[]>(
      `${environment.urlProc}/produtor/${idProdutor}/glebas`,
      { params }
    );
  }

  obterConformidadeAmbiental(idProdutor: number, filtros: FiltrosDashboard): Observable<RespostaConformidadeAmbientalDTO> {
    const params = this.configurarParametrosPadrao(idProdutor, filtros);
    return this.http.get<RespostaConformidadeAmbientalDTO>(`${this.baseUrl}/conformidade-ambiental`, { params });
  }

  obterStatusEAtividades(idProdutor: number, filtros: FiltrosDashboard): Observable<RespostaStatusAtividades> {
    const params = this.configurarParametrosPadrao(idProdutor, filtros);
    return this.http.get<RespostaStatusAtividades>(`${this.baseUrl}/status-atividades`, { params });
  }

  obterProdutividadeEstimada(idProdutor: number, filtros: FiltrosDashboard): Observable<ProdutividadeEstimadaResponse> {
    const params = this.configurarParametrosPadrao(idProdutor, filtros);
    return this.http.get<ProdutividadeEstimadaResponse>(`${this.baseUrl}/produtividade-estimada`, { params });
  }

  obterResumoClimatico(idProdutor: number, filtros: FiltrosDashboard, dias: number = 60): Observable<ClimaResumoResponse> {
    let params = this.configurarParametrosPadrao(idProdutor, filtros);
    params = params.set('dias', dias.toString());
    return this.http.get<ClimaResumoResponse>(`${this.baseUrl}/clima-resumo`, { params });
  }

  obterSafrasDisponiveis(idProdutor: number): Observable<{ safra_principal: string; safras: string[] }> {
    return this.http.get<{ safra_principal: string; safras: string[] }>(
      `${this.baseUrl}/safras-disponiveis`,
      { params: { id_produtor: idProdutor } }
    );
  }
}
