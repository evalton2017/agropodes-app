import { ApplicationConfig, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { provideNgxMask } from 'ngx-mask';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { loadingInterceptor } from './interceptor/loading-interceptor';

import { environment } from '../environments/environment';

import Keycloak from 'keycloak-js';
import {
  includeBearerTokenInterceptor,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  createInterceptorCondition,
  IncludeBearerTokenCondition
} from 'keycloak-angular';

// 1. Gera a condição mapeada obrigatória para as versões modernas da biblioteca
const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^(http|https):\/\/.*$/i,
  bearerPrefix: 'Bearer'
});

export const createWithAppConfig = (isBrowser: boolean): ApplicationConfig => {

  const interceptors = [loadingInterceptor, includeBearerTokenInterceptor];

  if (isBrowser) {
    interceptors.push(includeBearerTokenInterceptor);
  }

  return {
    providers: [
      // provideBrowserGlobalErrorListeners foi removido (Gerencie erros com o ErrorHandler nativo do Angular)
      provideZonelessChangeDetection(),
      provideNgxMask(),
      importProvidersFrom(MatSnackBarModule),

      provideHttpClient(
        withFetch(),
        withInterceptors(interceptors)
      ),

      provideRouter(routes),
      provideClientHydration(withEventReplay()),

      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [urlCondition]
      },

      {
        provide: Keycloak,
        useFactory: () => {
          if (!isBrowser) {
            return {
              init: () => Promise.resolve(false),
              login: () => Promise.resolve(),
              logout: () => Promise.resolve(),
              authenticated: false,
              clearToken: () => {},
              updateToken: () => Promise.resolve(false)
            } as unknown as Keycloak;
          }

          return new Keycloak({
            url: environment.keycloakConfig.url,
            realm: environment.keycloakConfig.realm,
            clientId: environment.keycloakConfig.clientId
          });
        }
      },

      provideAppInitializer(() => {
        if (!isBrowser) return Promise.resolve();

        const keycloak = inject(Keycloak);

        const baseFolder = window.location.pathname.startsWith('/agroprodes-app')
          ? '/agroprodes-app'
          : '';

        return keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: `${window.location.origin}${baseFolder}/silent-check-sso.html`,
          checkLoginIframe: false
        })
          .then((authenticated) => {
            console.log(`Keycloak inicializado. Autenticado: ${authenticated}`);
          })
          .catch(error => {
            console.error('Falha na inicialização do Keycloak:', error);
          });
      })
    ]
  };
};
