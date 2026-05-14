import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {limparParams} from '../shared/service/request-util';
import {environment} from '../environments/environment';
import {TerritorioResponse} from '../model/territorio';

@Injectable({
  providedIn: 'root',
})
export class TerritorioService {

  constructor(private http: HttpClient) { }

  cadastrarTerritorio(request: TerritorioRequest): Observable<TerritorioResponse> {
    const maparParams = {hash: 'hash'}
    const params = limparParams(request, maparParams);
    return this.http.post<TerritorioResponse>(`${environment.url}/territorio`, params);
  }

  consultaTerritorio(hash: string): Observable<TerritorioResponse> {
    return this.http.get<TerritorioResponse>(`${environment.url}/territorio/imagens?hash=${hash}`);
  }


}
