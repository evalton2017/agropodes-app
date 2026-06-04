import { KeycloakConfig } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
  url: 'https://auth-dev.agroprodes.com.br',
  realm: 'EKD-TEC',
  clientId: 'agroprodes_app'
};

export const environment = {
  versao: '1.0.0',
  production: true,
  url: 'https://dev.agroprodes.com.br/agroprods/api/v1',
  keycloakConfig,
  postLogoutRedirectUri: 'https://dev.agroprodes.com.br/agroprodes-app/',
  redirectUri: 'https://dev.agroprodes.com.br/agroprodes-app/home',
  cleanUrl: 'https://dev.agroprodes.com.br/agroprodes-app/silent-check-sso.html',
};
