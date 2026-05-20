import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

export const keycloakTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);

  // Define quais URLs devem receber o token (Ex: apenas chamadas para sua API)
  const securedRoutes = ['/api/v1'];
  const isSecuredRoute = securedRoutes.some(url => req.url.includes(url));

  // Se o usuário estiver logado e a rota for protegida, adiciona o token
  if (keycloakService.isLoggedIn() && isSecuredRoute) {
    const token = keycloakService.getKeycloakInstance().token;

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }
  }

  // Caso contrário, continua com a requisição original modificada
  return next(req);
};
