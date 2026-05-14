import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../environments/environment';
import {Observable} from 'rxjs';
import {CarResponse} from '../dto/response/car';
import {limparParams} from '../shared/service/request-util';
import {ProdesResponse} from '../dto/response/prodes-response';

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

}
