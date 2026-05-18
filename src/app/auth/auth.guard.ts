import { inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {

  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const keycloak = inject(Keycloak);

  // CORREÇÃO CRÍTICA PARA ZONELESS: Aguarda um ciclo microtask para garantir que o .init() do app.config terminou
  if (keycloak.authenticated === undefined || (!keycloak.authenticated && (window.location.href.includes('code=') || window.location.href.includes('state=')))) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Se mesmo após o processamento inicial o usuário não estiver autenticado, aí sim força o login
  if (!keycloak.authenticated) {
    await keycloak.login({
      redirectUri: environment.redirectUri
    });
    return false;
  }


  const requiredRoles = route.data['roles'] as string[];
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Captura as permissões vindas do token decodificado do Keycloak
  const realmRoles = keycloak.realmAccess?.roles || [];
  const resourceRoles = keycloak.resourceAccess
    ? Object.values(keycloak.resourceAccess).flatMap(access => access.roles || [])
    : [];

  const hasRequiredRole = requiredRoles.every((role) =>
    realmRoles.includes(role) || resourceRoles.includes(role)
  );

  if (!hasRequiredRole) {
    // IMPORTANTE: Ajuste o caminho do access-denied para incluir sua baseHref
    return router.parseUrl('/agroprodes-app/access-denied');
  }

  return true;
};
