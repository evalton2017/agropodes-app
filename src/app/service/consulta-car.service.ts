import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ImovelAmbiental} from '../dto/response/car';
import {limparParams} from '../shared/service/request-util';
import {ProdesResponse} from '../dto/response/prodes-response';
import {environment} from '../../environments/environment';
import {ElegibilidadeRequest} from '../dto/request/elegibilidade-request';
import {ElegibilidadeResponse} from '../dto/response/elegibilidade';

@Injectable({
  providedIn: 'root',
})
export class ConsultaCarService {

  constructor(private http: HttpClient) { }

  consultaProdes(poligono: string): Observable<ProdesResponse[]> {
    const maparParams = {poligono: 'poligono', geometriaValida: 'geometriaValida'}
    const params = limparParams({poligono: poligono, geometriaValida: true}, maparParams);
    return this.http.get<ProdesResponse[]>(`${environment.url}/prods/prodes`, {params: params});
  }

  consultaCarNacional(codigoCar: string): Observable<ImovelAmbiental> {
    return this.http.get<ImovelAmbiental>(`${environment.urlProc}/produtor/car/${codigoCar}`);
  }



}
