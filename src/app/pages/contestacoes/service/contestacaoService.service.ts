import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment';
import {ContestacaoPayload, DetalhesConflitosGlebaResponse} from '../model/contestacao.model';


@Injectable({
  providedIn: 'root',
})
export class ContestacaoService {

  constructor(private http: HttpClient) { }

  obterDetalhesConflitosGleba(idGleba: number): Observable<DetalhesConflitosGlebaResponse> {
    return this.http.get<DetalhesConflitosGlebaResponse>(`${environment.urlProc}/contestacoes/gleba/${idGleba}/detalhes-conflitos`);
  }

  cadastrarContestacao(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.urlProc}/contestacoes/`, formData);
  }

}
