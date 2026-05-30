import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {UsuarioKeycloak} from '../dto/request/usuario-keycloak';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  constructor(private http: HttpClient) { }

  cadastrar(usuario: UsuarioKeycloak): Observable<any> {
    return this.http.post<any>(`${environment.url}/users/register`, usuario);
  }

}
