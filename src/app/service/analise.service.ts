import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Analise} from '../model/analise';
import {AnaliseClimatica} from '../dto/response/analise-climatica';

@Injectable({
  providedIn: 'root',
})
export class AnaliseService {

  constructor(private http: HttpClient) { }

  consultaAnalise(): Observable<Analise[]> {
    return this.http.get<Analise[]>(`${environment.url}/analises`);
  }

  analiseClimatica(idGleba: number, cultura:string): Observable<AnaliseClimatica> {
    return this.http.get<AnaliseClimatica>(`${environment.urlProc}/mapa/contrato/${idGleba}/analise-clima?cultura=${cultura}`);
  }


}
