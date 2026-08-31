import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Pessoa } from '../model/pessoa';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private readonly http = inject(HttpClient);

  // Signal que guardará os dados do usuário/produtor logado
  readonly produtorAtual = signal<Pessoa | null>(null);
  readonly carregandoPerfil = signal<boolean>(true);
  readonly erroAoCarregar = signal<boolean>(false);

  // Computed úteis para o Layout e Proteção de Rotas
  readonly perfilUsuario = computed(() => this.produtorAtual()?.perfil?.codigo || null);
  readonly tipoUsuario = computed(() => this.produtorAtual()?.tipo || null);

  // Verifica se o usuário tem acesso a uma rota específica com base nos módulos da API
  readonly rotasPermitidas = computed(() => {
    const modulos = this.produtorAtual()?.modulosPermitidos || [];
    return modulos.map(m => m.chaveRota);
  });

  async carregarProdutorPorKeycloakId(idKeycloak: string): Promise<void> {
    this.carregandoPerfil.set(true);
    this.erroAoCarregar.set(false);

    try {
      const url = `${environment.url}/users/produtor/${idKeycloak}`;
      const dados = await firstValueFrom(this.http.get<Pessoa>(url));
      this.produtorAtual.set(dados);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      this.produtorAtual.set(null);
      this.erroAoCarregar.set(true);
    } finally {
      this.carregandoPerfil.set(false);
    }
  }

  // Método auxiliar para validar no layout se o menu deve aparecer
  possuiAcessoRota(rota: string): boolean {
    const rotas = this.rotasPermitidas();
    if (rotas.length === 0) return true; // Fallback se a API não retornar restrição estrita
    return rotas.includes(rota);
  }

  limparSessao(): void {
    this.produtorAtual.set(null);
    this.carregandoPerfil.set(true);
    this.erroAoCarregar.set(false);
  }
}
