// produtor.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {Pessoa} from '../model/pessoa';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private readonly http = inject(HttpClient);

  // Signal que guardará os dados do produtor logado
  readonly produtorAtual = signal<Pessoa | null>(null);
  readonly carregandoPerfil = signal<boolean>(true);
  readonly erroAoCarregar = signal<boolean>(false);

  async carregarProdutorPorKeycloakId(idKeycloak: string): Promise<void> {
    this.carregandoPerfil.set(true);
    this.erroAoCarregar.set(false);

    try {
      const url = `${environment.url}/users/produtor/${idKeycloak}`;
      const dados = await firstValueFrom(this.http.get<Pessoa>(url));
      this.produtorAtual.set(dados);
    } catch (error) {
      console.error('Erro ao buscar dados do produtor:', error);
      this.produtorAtual.set(null);
      this.erroAoCarregar.set(true);
    } finally {
      this.carregandoPerfil.set(false); // Garante que desliga o loading sempre
    }
  }

  limparSessao(): void {
    this.produtorAtual.set(null);
    this.carregandoPerfil.set(true);
  }
}
