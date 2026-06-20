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

  private configurarParametrosPadrao(idProdutor: number, filtros: FiltrosDashboard): HttpParams {
    const safraLimpa = filtros?.safra ? filtros.safra.trim() : '2025/2026';
    return new HttpParams()
      .set('id_produtor', idProdutor.toString())
      .set('safra', safraLimpa);
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

  obterGlebasGeometria(idProdutor: number): Observable<GlebaGeometriaResponse[]> {
    return this.http.get<GlebaGeometriaResponse[]>(`${environment.urlProc}/produtor/${idProdutor}/glebas`);
  }

  obterConformidadeAmbiental(idProdutor: number, filtros: FiltrosDashboard): Observable<RespostaConformidadeAmbientalDTO> {
    const params = this.configurarParametrosPadrao(idProdutor, filtros);
    return this.http.get<RespostaConformidadeAmbientalDTO>(`${this.baseUrl}/conformidade-ambiental`, { params });
  }

  obterStatusEAtividades(idProdutor: number, filtros: FiltrosDashboard): Observable<RespostaStatusAtividades> {
    const params = this.configurarParametrosPadrao(idProdutor, filtros);
    return this.http.get<RespostaStatusAtividades>(`${this.baseUrl}/status-atividades`, { params });
  }

  /**
   * Consome os dados consolidados de capacidade produtiva e evolução calculados por IA
   */
  obterProdutividadeEstimada(idProdutor: number, filtros: FiltrosDashboard): Observable<ProdutividadeEstimadaResponse> {
    const params = this.configurarParametrosPadrao(idProdutor, filtros);
    return this.http.get<ProdutividadeEstimadaResponse>(`${this.baseUrl}/produtividade-estimada`, { params });
  }

  /**
   * Retorna as séries e variações climatológicas interpoladas das estações do INMET
   */
  obterResumoClimatico(idProdutor: number, filtros: FiltrosDashboard, dias: number = 60): Observable<ClimaResumoResponse> {
    let params = this.configurarParametrosPadrao(idProdutor, filtros);
    params = params.set('dias', dias.toString());
    return this.http.get<ClimaResumoResponse>(`${this.baseUrl}/resumo-climatico`, { params });
  }
}
