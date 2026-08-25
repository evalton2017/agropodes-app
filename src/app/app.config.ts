import { ApplicationConfig, provideZonelessChangeDetection, provideAppInitializer, inject,  importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideNgxMask } from 'ngx-mask';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { loadingInterceptor } from './interceptor/loading-interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { environment } from '../environments/environment';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import Keycloak from 'keycloak-js';
import {
  includeBearerTokenInterceptor,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  createInterceptorCondition,
  IncludeBearerTokenCondition
} from 'keycloak-angular';
import {authInterceptor} from './auth/auth.interceptor';

registerLocaleData(localePt);

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^(http|https):\/\/.*$/i,
  bearerPrefix: 'Bearer'
});

export const createWithAppConfig = (isBrowser: boolean): ApplicationConfig => {

  const interceptors = [loadingInterceptor, includeBearerTokenInterceptor,authInterceptor];

  if (isBrowser) {
    interceptors.push(includeBearerTokenInterceptor);
  }

  return {
    providers: [
      provideZonelessChangeDetection(),
      provideNgxMask(),
      importProvidersFrom(MatSnackBarModule),
      provideNativeDateAdapter(),
      { provide: LOCALE_ID, useValue: 'pt-BR' },
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

        return keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: environment.cleanUrl,
          checkLoginIframe: false,
          messageReceiveTimeout: 5000,
          enableLogging: true,
          useNonce: false,
          pkceMethod: 'S256'
        })
          .then((authenticated) => {
            console.log(`Keycloak inicializado com sucesso. Autenticado: ${authenticated}`);
          })
          .catch(error => {
            console.error('Falha na inicialização do Keycloak:', error);
          });
      })

    ]
  };
};
