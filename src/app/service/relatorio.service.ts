import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {SolicitacaoRelatorio} from '../model/solicitacao-relatorio';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {

  constructor(private http: HttpClient) { }

  solicitarRelatorio(codigoCar: string): Observable<SolicitacaoRelatorio> {
    return this.http.get<SolicitacaoRelatorio>(`${environment.url}/relatorios/solicitacao-relatorio/${codigoCar}`);
  }

  detalharCar(): Observable<SolicitacaoRelatorio[]> {
    return this.http.get<SolicitacaoRelatorio[]>(`${environment.url}/consulta/detalhe-car`);
  }

  baixarRelatorio(id: number): Observable<Blob> {
    return this.http.get(`${environment.url}/relatorios/detalhe-car/${id}`, {
      responseType: 'blob'
    });
  }
}
