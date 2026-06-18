import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';
import { FiltrosDashboard } from './dashboard-filtro.service';
import {environment} from '../../../../environments/environment';
import {
  GlebaGeometriaResponse, RespostaConformidadeAmbientalDTO,
  RespostaDashboardProdutor,
  RespostaStatusAtividades
} from '../model/dashboard-produtor.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardProdutorService {

  private readonly baseUrl = `${environment.urlProc}/dashboard-produtor`;

  constructor(private readonly http: HttpClient) { }

  obterResumoProdutor(idProdutor: number, filtros: FiltrosDashboard): Observable<RespostaDashboardProdutor> {
    let params = new HttpParams().set('idProdutor', idProdutor.toString());
    const safraLimpa = filtros?.safra ? filtros.safra.trim() : '2025/2026';
    params = params.set('safra', safraLimpa);

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

  // Endpoint 1: Mapa (Camada Geográfica)
  obterGlebasGeometria(idProdutor: number): Observable<GlebaGeometriaResponse[]> {
    return this.http.get<GlebaGeometriaResponse[]>(`${environment.urlProc}/produtor/${idProdutor}/glebas`);
  }

  // Endpoint 2: Tabela de Critérios
  obterConformidadeAmbiental(idProdutor: number, filtros: FiltrosDashboard): Observable<RespostaConformidadeAmbientalDTO> {
    let params = new HttpParams().set('idProdutor', idProdutor.toString()).set('safra', filtros.safra || '2025/2026');
    return this.http.get<RespostaConformidadeAmbientalDTO>(`${this.baseUrl}/conformidade-ambiental`, { params });
  }

  // Endpoint 3: Pizza & Atividades
  obterStatusEAtividades(idProdutor: number, filtros: FiltrosDashboard): Observable<RespostaStatusAtividades> {
    let params = new HttpParams().set('idProdutor', idProdutor.toString()).set('safra', filtros.safra || '2025/2026');
    return this.http.get<RespostaStatusAtividades>(`${this.baseUrl}/status-atividades`, { params });
  }
}
