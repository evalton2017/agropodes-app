import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {
  AlertaCritico,
  CulturaData,
  EventoClimatico,
  FiltrosDashboard,
  GraficoData,
  KpisDashboard, ResumoClimatico,
  UltimoAtestado,
} from '../model/dashboard-analista.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardAnalistaService {

  private readonly baseUrl = `${environment.urlProc}/dashboard`;

  constructor(private readonly http: HttpClient) { }

  private obterParametrosFiltro(filtros: FiltrosDashboard): HttpParams {
    let params = new HttpParams();
    const safraLimpa = filtros?.safra ? filtros.safra.trim() : '2025/2026';
    params = params.set('safra', safraLimpa);
    if (filtros?.estado && filtros.estado !== 'Todos') {
      params = params.set('estado', filtros.estado.trim());
    } else {
      params = params.set('estado', 'Todos');
    }
    return params;
  }

  obterDashboardKbpis(filtros: FiltrosDashboard): Observable<KpisDashboard> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<KpisDashboard>(`${this.baseUrl}/consolidado`, { params });
  }

  obterDashboardDistribuicaoEstado(filtros: FiltrosDashboard): Observable<GraficoData> {
    return this.http.get<GraficoData>(`${this.baseUrl}/grafico/estados?safra=${filtros.safra}`);
  }

  obterDashboardCultura(filtros: FiltrosDashboard): Observable<CulturaData> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<CulturaData>(`${this.baseUrl}/grafico/culturas?safra=${filtros.safra}`, { params });
  }

  obterDashboardAlertas(): Observable<AlertaCritico[]> {
    return this.http.get<AlertaCritico[]>(`${this.baseUrl}/alertas`);
  }

  obterIaAnaliseAmbiental(filtros: FiltrosDashboard): Observable<any> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<any>(`${this.baseUrl}/analise-ambiental`, { params });
  }

  obterIaClassificacaoCulturas(filtros: FiltrosDashboard): Observable<any> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<any>(`${this.baseUrl}/ia-classificacao`, { params });
  }

  obterIaProdutividadeEstimada(filtros: FiltrosDashboard): Observable<any> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<any>(`${this.baseUrl}/produtividade-estimada`, { params });
  }

  obterIaResumoClimatico(filtros: FiltrosDashboard): Observable<ResumoClimatico> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<ResumoClimatico>(`${this.baseUrl}/resumo-climatico`, { params });
  }

  obterDashboardAtestados(): Observable<UltimoAtestado[]> {
    return this.http.get<UltimoAtestado[]>(`${this.baseUrl}/atestados`);
  }

  obterHeatmap(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/heatmap`);
  }

  getEventosClimaticos(): Observable<EventoClimatico[]> {
    return this.http.get<EventoClimatico[]>(`${this.baseUrl}/eventos-climaticos`);
  }

  getUltimosAtestados(): Observable<UltimoAtestado[]> {
    return this.http.get<UltimoAtestado[]>(`${this.baseUrl}/ultimos-atestados`);
  }

  obterTimelineGleba(idGleba: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/timeline/${idGleba}`);
  }

}
