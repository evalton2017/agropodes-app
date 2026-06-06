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

  // Aguarda inicialização do Keycloak caso esteja processando o redirecionamento
  if (keycloak.authenticated === undefined
    || (!keycloak.authenticated && (window.location.href.includes('code=')
    || window.location.href.includes('state=')))) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Força o login caso não esteja autenticado
  if (!keycloak.authenticated) {
    await keycloak.login({
      redirectUri: environment.redirectUri
    });
    return false;
  }

  // Recupera as roles configuradas na rota
  const requiredRoles = route.data['roles'] as string[];

  // Se a rota não exigir roles, o acesso é liberado
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Captura as permissões do Keycloak
  const realmRoles = keycloak.realmAccess?.roles || [];
  const resourceRoles = keycloak.resourceAccess
    ? Object.values(keycloak.resourceAccess).flatMap(access => access.roles || [])
    : [];
  
  const hasRequiredRole = requiredRoles.some((role) =>
    realmRoles.includes(role) || resourceRoles.includes(role)
  );

  // Se o usuário não tiver nenhuma das roles necessárias, barra o acesso
  if (!hasRequiredRole) {
    console.log('acesso negado ')
    return router.parseUrl('/acesso-negado');
  }

  return true;
};
