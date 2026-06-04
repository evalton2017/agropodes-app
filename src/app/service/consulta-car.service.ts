import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CarResponse} from '../dto/response/car';
import {limparParams} from '../shared/service/request-util';
import {ProdesResponse} from '../dto/response/prodes-response';
import {environment} from '../../environments/environment';
import {ElegibilidadeRequest} from '../dto/request/elegibilidade-request';
import {ElegibilidadeResponse} from '../dto/response/elegibilidade';
import {DetalheCarResponse} from '../dto/response/detalhe-car-response';
import {SolicitacaoRelatorio} from '../model/solicitacao-relatorio';

@Injectable({
  providedIn: 'root',
})
export class ConsultaCarService {

  constructor(private http: HttpClient) { }

  consultaCar(filtro: any): Observable<CarResponse[]> {
   const maparParams = {cpf: 'cpf', cnpf: 'cnpf', codigoCar: 'codigoCar'}
    const params = limparParams(filtro, maparParams);
    return this.http.get<CarResponse[]>(`${environment.url}/prods/car`, {params: params});
  }

  consultaProdes(poligono: string): Observable<ProdesResponse[]> {
    const maparParams = {poligono: 'poligono', geometriaValida: 'geometriaValida'}
    const params = limparParams({poligono: poligono, geometriaValida: true}, maparParams);
    return this.http.get<ProdesResponse[]>(`${environment.url}/prods/prodes`, {params: params});
  }

  consultaElegibilidade(request: ElegibilidadeRequest): Observable<ElegibilidadeResponse> {
    return this.http.post<ElegibilidadeResponse>(`${environment.url}/prods/elegibilidade`, request);
  }

  detalharCar(codigoCar: string): Observable<SolicitacaoRelatorio> {
    return this.http.get<SolicitacaoRelatorio>(`${environment.url}/prods/solicitacao-relatorio/${codigoCar}`);
  }

  consultaCarPublica(filtro: any): Observable<CarResponse[]> {
    const maparParams = {cpf: 'cpf', cnpf: 'cnpf', codigoCar: 'codigoCar'}
    const params = limparParams(filtro, maparParams);
    return this.http.get<CarResponse[]>(`${environment.url}/consulta/car`, {params: params});
  }

}
