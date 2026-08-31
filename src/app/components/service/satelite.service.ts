import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SateliteService {
  private readonly http = inject(HttpClient);


  obterTileUrlRaster(geometriaGeoJson: any, safra?: string, indice: 'NDVI' | 'RGB' = 'NDVI'): Observable<any> {
    return this.http.post(`${environment.urlProc}/satelite/tile-url`, {
      geometria_geojson: geometriaGeoJson,
      safra,
      indice
    });
  }
}
