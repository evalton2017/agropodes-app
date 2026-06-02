import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EmailPayload} from '../model/emai';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  constructor(private http: HttpClient) { }


  enviarEmail(payload: EmailPayload): Observable<any> {
    return this.http.post(`${environment.url}/email/enviar`, payload,  { responseType: 'text' });
  }
}
