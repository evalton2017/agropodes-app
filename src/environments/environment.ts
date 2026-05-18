import { KeycloakConfig } from 'keycloak-js';

const keycloakConfig: KeycloakConfig = {
  url: 'https://auth.busca-car.api.br',
  realm: 'EKD-TEC',
  clientId: 'agroprodes_app'
};

export const environment = {
  versao: '1.0.0',
  production: true,
  url: 'https://busca-car.api.br/agroprods/api/v1',
  keycloakConfig: keycloakConfig,
  postLogoutRedirectUri: 'https://busca-car.api.br/agroprodes-app/',
  redirectUri: 'https://busca-car.api.br/agroprodes-app/home',
  cleanUrl: 'https://busca-car.api.br/agroprodes-app/silent-check-sso.html',
};
