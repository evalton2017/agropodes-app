import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {RespostaVerificacaoAgricola} from '../verificacao-agricola.model';
import {environment} from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VerificacaoAgricolaService {
  private readonly http = inject(HttpClient);

  obterVerificacaoAgricola(idGleba: number, safra?: string): Observable<RespostaVerificacaoAgricola> {
    let params = new HttpParams();
    if (safra) {
      params = params.set('safra', safra);
    }
    return this.http.get<RespostaVerificacaoAgricola>(
      `${environment.urlProc}/verificacao-agricola/${idGleba}`,
      { params }
    );
  }
}
