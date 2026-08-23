import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ImovelAmbiental} from '../dto/response/car';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConsultaCarService {

  constructor(private http: HttpClient) { }


  consultaCarNacional(codigoCar: string): Observable<ImovelAmbiental> {
    return this.http.get<ImovelAmbiental>(`${environment.urlProc}/produtor/car/${codigoCar}`);
  }



}
