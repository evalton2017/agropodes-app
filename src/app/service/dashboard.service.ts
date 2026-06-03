import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {limparParams} from '../shared/service/request-util';
import {TerritorioResponse} from '../model/territorio';
import {environment} from '../../environments/environment';
import {Dashboard} from '../model/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  consultaDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${environment.url}/dashboard`);
  }


}
