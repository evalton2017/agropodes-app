import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComplianceCARResponse, NovaContestacaoPropriedadeRequest, Propriedade } from './propriedade.model';
import { environment } from '../../../environments/environment';

// Interface com o payload detalhado da propriedade
export interface DetalhesPropriedadeResponse {
  id_propriedade: number;
  nome_propriedade: string;
  codigo_car: string;
  area_hectares: number;
  data_criacao: string;
  municipio: string;
  uf: string;
  mapa_base64?: string;
  proprietario:{
    nome: string;
    cpf_cnpj: string;
  },
  legenda_mapa?: Array<{ nome: string; cor_hex: string }>;
  deteccoes: Array<{
    id_deteccao: number;
    alerta: string;
    tipo_conflito: string;
    area_m2: number;
    area_ha: number;
  }>;
}

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

  // 🟢 Obter detalhes completos da propriedade (com mapa renderizado e detecções)
  obterDetalhesPropriedade(idPropriedade: number): Observable<DetalhesPropriedadeResponse> {
    return this.http.get<DetalhesPropriedadeResponse>(`${this.baseUrl}/propriedades/${idPropriedade}/detalhes`);
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
