import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // equivale à cidade
  uf: string;          // equivale ao estado
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  private readonly http = inject(HttpClient);

  consultarCep(cep: string): Observable<ViaCepResponse | null> {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return new Observable(observer => observer.next(null));
    }

    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(
      map(res => (res && !res.erro) ? res : null)
    );
  }
}
