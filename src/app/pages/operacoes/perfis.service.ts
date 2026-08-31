import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class PerfisService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.url}/perfis-modulos`;

  listarPerfisComModulos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/perfis`);
  }

  listarTodosModulos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/modulos`);
  }

  associarModuloPerfil(perfilId: number, moduloIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/associar`, { perfilId, moduloIds });
  }
}
