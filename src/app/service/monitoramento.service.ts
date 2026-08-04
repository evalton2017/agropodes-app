import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonitoramentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.urlProc}/mapa/contrato`;

  public obterGrid3D(idContrato: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idContrato}/grid-3d`);
  }

  public obterAnaliseClima(idContrato: number, cultura: string = 'SOJA'): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idContrato}/analise-clima`, {
      params: { cultura }
    });
  }

  public obterCadernoCampo(idContrato: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idContrato}/caderno-campo`);
  }
}
