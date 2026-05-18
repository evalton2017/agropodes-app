import { bootstrapApplication } from '@angular/platform-browser';
import { createWithAppConfig } from './app/app.config';
import { App } from './app/app';
import { ApplicationConfig } from '@angular/core';
import { provideNgxMask } from 'ngx-mask';

// Gera a configuração base informando "true" para ativar os recursos do Navegador
const finalConfig = createWithAppConfig(true);

// Mescla os provedores do app.config com as máscaras globais
const serverConfig: ApplicationConfig = {
  providers: [
    provideNgxMask(),
    ...(finalConfig.providers || [])
  ]
};

// Inicializa a aplicação Angular 20 imediatamente de forma síncrona
bootstrapApplication(App, serverConfig)
  .catch((err) => console.error(err));
