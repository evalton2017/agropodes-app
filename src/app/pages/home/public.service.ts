import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ResultadoComplianceCAR} from '../model/compliance-car.model';
import {environment} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.urlProc}`;

  obterCompliancePorCar(codCar: string): Observable<ResultadoComplianceCAR> {
    return this.http.get<ResultadoComplianceCAR>(`${this.baseUrl}/ambiental/car/compliance?cod_imovel=${encodeURIComponent(codCar)}`);
  }
}
