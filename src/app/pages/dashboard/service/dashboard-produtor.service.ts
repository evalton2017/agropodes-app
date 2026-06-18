import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';
import { FiltrosDashboard } from './dashboard-filtro.service';
import {environment} from '../../../../environments/environment';
import {RespostaDashboardProdutor} from '../model/dashboard-produtor.model';

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
}
