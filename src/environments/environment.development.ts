import { KeycloakConfig } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
  url: 'https://auth-dev.agroprodes.com.br',
  realm: 'EKD-TEC',
  clientId: 'agroprodes_app'
};

export const environment = {
  versao: '1.0.0',
  production: false,
  url: 'http://localhost:9090/agroprods/api/v1',
  postLogoutRedirectUri: 'http://localhost:4200/agroprodes-app/',
  keycloakConfig,
  redirectUri:'http://localhost:4200/agroprodes-app/home/',
  cleanUrl: 'http://localhost:4200/agroprodes-app/silent-check-sso.html',
};
