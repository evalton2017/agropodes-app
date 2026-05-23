import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Analise} from '../model/analise';

@Injectable({
  providedIn: 'root',
})
export class AnaliseService {

  constructor(private http: HttpClient) { }

  consultaAnalise(): Observable<Analise[]> {
    return this.http.get<Analise[]>(`${environment.url}/analises`);
  }

}
