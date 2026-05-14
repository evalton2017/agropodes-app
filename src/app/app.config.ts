import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideNgxMask} from 'ngx-mask';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import {loadingInterceptor} from './interceptor/loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNgxMask(),
    MatSnackBarModule,
    provideHttpClient(
      withInterceptors([loadingInterceptor]),
      withFetch()
    ),
    provideRouter(routes), provideClientHydration(withEventReplay())
  ]
};
