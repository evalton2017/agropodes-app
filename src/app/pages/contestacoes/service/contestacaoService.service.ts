import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment';
import {
  ContestacaoItemAcompanhamento,
  ContestacaoPayload,
  DetalhesConflitosGlebaResponse,
  DetalhesConflitosPropriedadeResponse, DetalhesContestacaoCompleto
} from '../model/contestacao.model';


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

  /**
   * Busca as detecções e dados espaciais de uma propriedade pelo ID
   */
  obterDetalhesConflitosPropriedade(idPropriedade: number): Observable<DetalhesConflitosPropriedadeResponse> {
    return this.http.get<DetalhesConflitosPropriedadeResponse>(`${environment.urlProc}/propriedades/${idPropriedade}`);
  }

  /**
   * Envia o formulário (FormData) com o polígono desenhado e imagem anexada da propriedade
   */
  cadastrarContestacaoPropriedade(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.urlProc}/contestacoes/propriedade`, formData);
  }

  listarAcompanhamento(idProdutor: number): Observable<ContestacaoItemAcompanhamento[]> {
    return this.http.get<ContestacaoItemAcompanhamento[]>(`${environment.urlProc}/contestacoes/acompanhamento/produtor/${idProdutor}`);
  }

  obterDetalhesContestacao(idContestacao: number): Observable<DetalhesContestacaoCompleto> {
    return this.http.get<DetalhesContestacaoCompleto>(`${environment.urlProc}/contestacoes/detalhes/${idContestacao}`);
  }

  cancelarContestacao(idContestacao: number): Observable<any> {
    return this.http.put<any>(`${environment.urlProc}/contestacoes/cancelar/${idContestacao}`, {});
  }

  downloadRelatorioPdf(idContestacao: number): Observable<Blob> {
    return this.http.get(`${environment.urlProc}/relatorio/contestacao/${idContestacao}/exportar-pdf`, {
      responseType: 'blob'
    });
  }
}
