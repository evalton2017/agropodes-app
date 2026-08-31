import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ComplianceCARResponse, NovaContestacaoPropriedadeRequest, Propriedade} from './propriedade.model';
import {environment} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PropriedadeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.urlProc;

  // Consulta pública de compliance por CAR
  consultarComplianceCar(codImovel: string, raioMetros: number = 500): Observable<ComplianceCARResponse> {
    const params = new HttpParams()
      .set('cod_imovel', codImovel)
      .set('raio_metros', raioMetros.toString());

    return this.http.get<ComplianceCARResponse>(`${this.baseUrl}/ambiental/car/compliance`, { params });
  }

  // Lista propriedades cadastradas para o produtor
  listarPropriedadesProdutor(idProdutor: number = 1): Observable<Propriedade[]> {
    return this.http.get<Propriedade[]>(`${this.baseUrl}/propriedades/produtor/${idProdutor}`);
  }

  // Efetiva o cadastro da propriedade no banco de dados
  cadastrarPropriedade(codigoCar: string): Observable<Propriedade> {
    return this.http.post<Propriedade>(`${this.baseUrl}/propriedades/cadastrar`, { codigo_car: codigoCar });
  }

  // Envia contestação referente a uma ou mais detecções selecionadas
  enviarContestacao(payload: NovaContestacaoPropriedadeRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/contestacoes/propriedade`, payload);
  }
}
