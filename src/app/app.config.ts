import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

// Seus imports originais
import { routes } from './app.routes';
import { provideNgxMask } from 'ngx-mask';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { loadingInterceptor } from './interceptor/loading-interceptor';

// Importação do arquivo de environment
import { environment } from '../environments/environment';

// Imports atualizados da biblioteca do Keycloak
import Keycloak from 'keycloak-js';
import { includeBearerTokenInterceptor, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG } from 'keycloak-angular';

export const createWithAppConfig = (isBrowser: boolean): ApplicationConfig => {
  // Mantemos apenas o seu interceptor padrão. O interceptor do keycloak será isolado
  const interceptors = [loadingInterceptor];

  if (isBrowser) {
    interceptors.push(includeBearerTokenInterceptor);
  }

  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideZonelessChangeDetection(),
      provideNgxMask(),
      importProvidersFrom(MatSnackBarModule),

      provideHttpClient(
        withFetch(),
        withInterceptors(interceptors)
      ),

      provideRouter(routes),
      provideClientHydration(withEventReplay()),

      // ✅ SOLUÇÃO DO ERRO NG0201: Prover a configuração exigida pelo interceptor
      // Isso impede que o motor do SSR quebre procurando por este Token.
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [
          {
            urlPattern: /^(http|https):\/\/.*$/i, // Altere para a Regex da sua API se necessário
            bearerPrefix: 'Bearer'
          }
        ]
      },

      // Mapeamento explícito do token de injeção do Keycloak
      {
        provide: Keycloak,
        useFactory: () => {
          if (!isBrowser) {
            // Retorna um Mock estruturado para o ambiente Node.js do Servidor
            return {
              init: () => Promise.resolve(false),
              login: () => Promise.resolve(),
              logout: () => Promise.resolve(),
              authenticated: false,
              clearToken: () => {},
              updateToken: () => Promise.resolve(false)
            } as unknown as Keycloak;
          }

          // Instância real executada apenas no Navegador
          return new Keycloak({
            url: environment.keycloakConfig.url,
            realm: environment.keycloakConfig.realm,
            clientId: environment.keycloakConfig.clientId
          });
        }
      },

      provideAppInitializer(() => {
        // No servidor, retornamos imediatamente para não travar o SSR
        if (!isBrowser) return Promise.resolve();

        const keycloak = inject(Keycloak);

        // O Angular precisa que você RETORNE a Promise para pausar a renderização inicial
        return keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: environment.cleanUrl,
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
