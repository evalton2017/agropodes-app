import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { createWithAppConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const baseAppConfig = createWithAppConfig(false);

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

export const config = mergeApplicationConfig(baseAppConfig, serverConfig);
