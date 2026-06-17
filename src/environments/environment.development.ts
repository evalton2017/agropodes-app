import { KeycloakConfig } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
  url: 'https://auth-dev.agroprodes.com.br',
  realm: 'EKD-TEC',
  clientId: 'agroprodes_app'
};

export const environment = {
  versao: '1.0.0',
  production: false,
  url: 'https://dev.agroprodes.com.br/agroprodes/api/v1',
  urlProc: 'http://localhost:8000/api/v1',
  postLogoutRedirectUri: 'http://localhost:4200/app/',
  keycloakConfig,
  redirectUri:'http://localhost:4200/app/home/',
  cleanUrl: 'http://localhost:4200/app/silent-check-sso.html',
};
