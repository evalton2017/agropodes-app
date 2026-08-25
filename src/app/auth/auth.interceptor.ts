// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { AuthAlertService } from './auth-alert.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authAlertService = inject(AuthAlertService);
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Verifica se é erro 401 (Unauthorized) ou 403 dependendo da sua API
      if (error.status === 401) {
        // Executa apenas no navegador (proteção SSR)
        if (isPlatformBrowser(platformId)) {
          authAlertService.handleSessionExpired();
        }
      }
      return throwError(() => error);
    })
  );
};
