import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';
import {
  ComprovanteResponseDTO,
  MultaProdutor,
  Pagamento,
  RequisicaoPagamento,
  RequisicaoPagamentoDTO,
  SimulacaoMultaResponse
} from './financeiro.model';



@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.urlProc}/financeiro`;
  private readonly urlPagamento = `${environment.url}/pagamentos`;

  simularMultasPropriedade(idPropriedade: number): Observable<SimulacaoMultaResponse> {
    return this.http.get<SimulacaoMultaResponse>(`${this.baseUrl}/simular-multa-propriedade/${idPropriedade}`);
  }

  processarMultasPropriedade(idPropriedade: number, idProdutor: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/processar-multa-propriedade/${idPropriedade}?id_produtor=${idProdutor}`, {});
  }

  listarMultasProdutor(statusMulta?: string): Observable<MultaProdutor[]> {
    let params = new HttpParams();
    if (statusMulta) {
      params = params.set('status_multa', statusMulta);
    }
    return this.http.get<MultaProdutor[]>(`${this.baseUrl}/produtor/multas`, { params });
  }

  obterDetalhesMulta(idMulta: number): Observable<MultaProdutor> {
    return this.http.get<MultaProdutor>(`${this.baseUrl}/multas/${idMulta}`);
  }

  listarPagamentosProdutor(idProdutor: number, status?: string): Observable<Pagamento[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Pagamento[]>(`${this.urlPagamento}/produtor/${idProdutor}`, { params });
  }

  processarPagamento(payload: RequisicaoPagamentoDTO): Observable<ComprovanteResponseDTO> {
    return this.http.post<ComprovanteResponseDTO>(`${this.urlPagamento}/processar`, payload);
  }

  //MOCK Simula o envio de alteração de status via Webhook + RabbitMQ
  simularWebhookMq(codigoTransacao: string, status: string): Observable<void> {
    return this.http.post<void>(`${this.urlPagamento}/mock/webhook-status`, null, {
      params: { codigoTransacao, status }
    });
  }
}
