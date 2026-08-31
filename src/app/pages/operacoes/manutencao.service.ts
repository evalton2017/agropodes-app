import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';
import {EmpresaPageResponse} from './manutencao.model';

export interface IModuloRota {
  chaveRota: string;
  nomeModulo: string;
  descricao: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManutencaoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.url}/manutencao-usuarios`;

  listarUsuariosPorEmpresa(empresaId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/empresa/${empresaId}?page=${page}&size=${size}`);
  }

  // Cadastrar Produtor com Keycloak e Contrato (Perfil)
  cadastrarProdutor(dados: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    cpfCnpj: string;
    cnpjEmpresa?: string;
  }, perfilId?: number): Observable<any> {
    const param = perfilId ? `?perfilId=${perfilId}` : '';
    return this.http.post(`${this.baseUrl}/produtor${param}`, dados);
  }

  // Atualizar dados e status do usuário
  atualizarUsuario(id: number, nomeCompleto: string, ativo: boolean, perfilId?: number, empresaId?: number): Observable<any> {
    let params = `?nomeCompleto=${encodeURIComponent(nomeCompleto)}&ativo=${ativo}`;
    if (perfilId) params += `&perfilId=${perfilId}`;
    if (empresaId) params += `&empresaId=${empresaId}`;

    return this.http.put(`${this.baseUrl}/${id}${params}`, {});
  }

  // Cadastrar Empresa (Admin)
  cadastrarEmpresa(empresa: any): Observable<any> {
    const payload = {
      razaoSocial: empresa.razaoSocial,
      cnpj: empresa.cnpj,
      enderecos: empresa.enderecos?.map((e: any) => ({
        cep: e.cep,
        logradouro: e.logradouro,
        numero: e.numero,
        complemento: e.complemento,
        bairro: e.bairro,
        cidade: e.cidade,
        estado: e.estado
      })) || [],
      telefones: empresa.telefones?.map((t: any) => ({
        ddd: t.ddd,
        numero: t.numero,
        tipo: t.tipo || 'COMERCIAL'
      })) || []
    };

    return this.http.post(`${this.baseUrl}/empresas`, payload);
  }

  atualizarEmpresa(id: number, empresa: any): Observable<any> {
    const payload = {
      razaoSocial: empresa.razaoSocial,
      cnpj: empresa.cnpj,
      enderecos: empresa.enderecos?.map((e: any) => ({
        cep: e.cep,
        logradouro: e.logradouro,
        numero: e.numero,
        complemento: e.complemento,
        bairro: e.bairro,
        cidade: e.cidade,
        estado: e.estado
      })) || [],
      telefones: empresa.telefones?.map((t: any) => ({
        ddd: t.ddd,
        numero: t.numero,
        tipo: t.tipo || 'COMERCIAL'
      })) || []
    };

    return this.http.put(`${this.baseUrl}/empresas/${id}`, payload);
  }

  // Listar Perfis (Contratos) - Ajuste para o endpoint do seu projeto se necessário
  listarPerfis(): Observable<any> {
    return this.http.get(`${environment.url}/perfis`);
  }

  listarEmpresasPaginated(page: number = 0, size: number = 10): Observable<EmpresaPageResponse> {
    return this.http.get<EmpresaPageResponse>(`${this.baseUrl}/empresas?page=${page}&size=${size}`);
  }

  buscarEmpresaPorCnpj(cnpj: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/empresas/buscar?cnpj=${cnpj}`);
  }

  cadastrarModulo(modulo: IModuloRota): Observable<any> {
    return this.http.post(`${this.baseUrl}/modulos`, modulo);
  }


}
