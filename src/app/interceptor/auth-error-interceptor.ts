// auth-error.interceptor.ts
import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {catchError, throwError} from 'rxjs';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Identifica o erro 401 retornado pelo backend
      if (error.status === 401) {
        console.warn('Sessão expirada ou inválida (401). Redirecionando para o Keycloak...');

        // Desloga o usuário e limpa a sessão no servidor do Keycloak
        keycloakService.logout(window.location.origin);
      }

      return throwError(() => error);
    })
  );
};
