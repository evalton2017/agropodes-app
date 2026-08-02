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
import {AtestadoDTO} from '../components/dashboard-atestados/dashboard-atestados';

export interface EventoClimaticoDTO {
  evento: 'Veranico' | 'Excesso de chuva' | 'Granizo' | 'Geada' | 'Vento forte';
  municipio: string;
  data: string;
  impacto: 'Alto' | 'Médio' | 'Baixo';
  glebas_afetadas: number;
}

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

  obterIaResumoClimatico(filtros: FiltrosDashboard): Observable<ResumoClimatico[]> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<ResumoClimatico[]>(`${this.baseUrl}/resumo-climatico`, { params });
  }

  public obterUltimosAtestados(filtros: FiltrosDashboard): Observable<AtestadoDTO[]> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<AtestadoDTO[]>(`${this.baseUrl}/ultimos-atestados`, { params });
  }

  public obterEventosClimaticosRecentes(filtros: FiltrosDashboard): Observable<EventoClimaticoDTO[]> {
    const params = this.obterParametrosFiltro(filtros);
    return this.http.get<EventoClimaticoDTO[]>(`${this.baseUrl}/eventos-climaticos`, { params });
  }

  obterTimelineGleba(idGleba: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/timeline/${idGleba}`);
  }

}
